<?php
require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// Configuración: obtener OPENAI_API_KEY desde Config/env()
$apiKey = Config::env('OPENAI_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Falta OPENAI_API_KEY en el entorno']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'JSON inválido']);
    exit;
}

$userMsg = trim($payload['message'] ?? '');
$context = isset($payload['context']) && is_array($payload['context']) ? $payload['context'] : [];
if ($userMsg === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Mensaje vacío']);
    exit;
}

// Prompt del sistema: español, fitness, planes según requisitos
$systemPrompt = 'Eres un entrenador personal virtual. Hablas en español claro y conciso. '
    . 'Pide la información faltante (objetivo, experiencia, disponibilidad, equipo, lesiones) si no está clara. '
    . 'Devuelve planes semanales con sesiones, series/reps, RPE sugerido y progresión. '
    . 'Incluye calentamiento y movilidad cuando aplique.';

// Construir mensajes con contexto opcional
$messages = [ [ 'role' => 'system', 'content' => $systemPrompt ] ];
if (!empty($context)) {
    foreach ($context as $m) {
        $r = isset($m['role']) ? $m['role'] : '';
        $c = isset($m['content']) ? $m['content'] : '';
        if (($r === 'user' || $r === 'assistant') && $c !== '') {
            $messages[] = [ 'role' => $r, 'content' => $c ];
        }
    }
}
// Mensaje actual del usuario
$messages[] = [ 'role' => 'user', 'content' => $userMsg ];

$reqBody = [
    'model' => 'gpt-4o-mini',
    'messages' => $messages,
    'temperature' => 0.6
];

// Llamada con reintentos y backoff si 429
$insecure = (isset($_GET['insecure']) && $_GET['insecure'] === '1') || getenv('INSECURE_SSL') === '1';
$attempts = 0;
$maxAttempts = 3;
$lastStatus = 0;
$lastErr = '';
$retryAfter = 0;
$body = null;

while ($attempts < $maxAttempts) {
    $attempts++;
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ],
        CURLOPT_POSTFIELDS => json_encode($reqBody),
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HEADER => true,
    ]);
    if ($insecure) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    }
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $hsize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);

    $lastStatus = (int)$status;
    $lastErr = $err;

    if ($resp === false) {
        // Error de transporte, intentar de nuevo con backoff corto
        sleep($attempts); // 1s, 2s
        continue;
    }

    $headersRaw = substr($resp, 0, $hsize);
    $bodyRaw = substr($resp, $hsize);
    if ($status === 429) {
        // Extraer Retry-After si existe
        $retryAfter = 0;
        foreach (explode("\r\n", $headersRaw) as $line) {
            if (stripos($line, 'Retry-After:') === 0) {
                $val = trim(substr($line, strlen('Retry-After:')));
                if (is_numeric($val)) { $retryAfter = (int)$val; }
                break;
            }
        }
        if ($attempts >= $maxAttempts) { break; }
        sleep(max(2 * $attempts, $retryAfter));
        continue;
    }

    if ($status >= 200 && $status < 300) {
        $body = $bodyRaw;
        break;
    }

    // Otros errores
    if ($attempts >= $maxAttempts) { break; }
    sleep($attempts);
}

if ($body === null) {
    if ($lastStatus === 429) {
        http_response_code(429);
        echo json_encode([
            'ok' => false,
            'error' => 'Rate limit alcanzado. Intenta nuevamente en unos segundos.',
            'retry_after' => max($retryAfter, 2)
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Fallo llamando a OpenAI', 'status' => $lastStatus, 'detail' => $lastErr], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$data = json_decode($body, true);
$text = $data['choices'][0]['message']['content'] ?? '';
echo json_encode(['ok' => true, 'reply' => $text], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

