<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$filePath = __DIR__ . '/../data/chat_history.json';

// --- Utilidades comunes ---
function respond($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function readRequestJson() {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    return is_array($payload) ? $payload : null;
}

function readJsonFile($path) {
    if (!file_exists($path)) return [];
    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') return [];
    $json = json_decode($raw, true);
    return is_array($json) ? $json : [];
}

function writeJsonFile($path, $data) {
    $dir = dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0777, true);
    $fp = fopen($path, 'c+');
    if (!$fp) return false;
    if (!flock($fp, LOCK_EX)) { fclose($fp); return false; }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $items = readJsonFile($filePath);
    respond(200, ['ok' => true, 'items' => $items]);
}

if ($method === 'POST') {
    $payload = readRequestJson();
    if ($payload === null) { respond(400, ['ok' => false, 'error' => 'JSON inválido']); }
    $user = trim($payload['user_message'] ?? '');
    $assistant = trim($payload['assistant_reply'] ?? '');
    $ts = date('c');
    if ($user === '' && $assistant === '') { respond(422, ['ok' => false, 'error' => 'Mensajes vacíos']); }
    $items = readJsonFile($filePath);
    $newId = uniqid('chat_', true);
    $items[] = [
        'id' => $newId,
        'created_at' => $ts,
        'user' => $user,
        'assistant' => $assistant
    ];
    if (!writeJsonFile($filePath, $items)) { respond(500, ['ok' => false, 'error' => 'No se pudo guardar historial']); }
    respond(200, ['ok' => true, 'id' => $newId]);
}

if ($method === 'DELETE') {
    // DELETE ?id=...  o  body {clear:true}
    $items = readJsonFile($filePath);
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';
    $payload = readRequestJson();
    if (is_array($payload) && isset($payload['clear']) && $payload['clear'] === true) {
        if (!writeJsonFile($filePath, [])) { respond(500, ['ok' => false, 'error' => 'No se pudo limpiar historial']); }
        respond(200, ['ok' => true]);
    }
    if ($id === '') { respond(422, ['ok' => false, 'error' => 'Falta id']); }
    $new = array_values(array_filter($items, function($it) use ($id){ return ($it['id'] ?? '') !== $id; }));
    if (!writeJsonFile($filePath, $new)) { respond(500, ['ok' => false, 'error' => 'No se pudo eliminar elemento']); }
    respond(200, ['ok' => true]);
}

$methodPut = ($method === 'PUT');
if ($methodPut) {
    $payload = readRequestJson();
    if ($payload === null) { respond(400, ['ok' => false, 'error' => 'JSON inválido']); }
    $id = isset($payload['id']) ? trim($payload['id']) : '';
    $user = isset($payload['user_message']) ? trim($payload['user_message']) : '';
    $assistant = isset($payload['assistant_reply']) ? trim($payload['assistant_reply']) : '';
    if ($id === '') { respond(422, ['ok' => false, 'error' => 'Falta id']); }
    $items = readJsonFile($filePath);
    $found = false;
    foreach ($items as &$it) {
        if (($it['id'] ?? '') !== $id) continue;
        $found = true;
        // Asegurar estructura de mensajes
        if (!isset($it['messages']) || !is_array($it['messages'])) {
            $it['messages'] = [];
            $u0 = isset($it['user']) ? trim($it['user']) : '';
            $a0 = isset($it['assistant']) ? trim($it['assistant']) : '';
            if ($u0 !== '') { $it['messages'][] = ['role' => 'user', 'content' => $u0]; }
            if ($a0 !== '') { $it['messages'][] = ['role' => 'assistant', 'content' => $a0]; }
        }
        if ($user !== '') { $it['messages'][] = ['role' => 'user', 'content' => $user]; }
        if ($assistant !== '') { $it['messages'][] = ['role' => 'assistant', 'content' => $assistant]; }
        $it['updated_at'] = date('c');
        break;
    }
    unset($it);
    if (!$found) { respond(404, ['ok' => false, 'error' => 'ID no encontrado']); }
    if (!writeJsonFile($filePath, $items)) { respond(500, ['ok' => false, 'error' => 'No se pudo actualizar historial']); }
    respond(200, ['ok' => true]);
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido']);


