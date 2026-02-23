<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$filePath = __DIR__ . '/../data/progresos.json';

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
    if (!file_exists($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') return [];
    $json = json_decode($raw, true);
    return is_array($json) ? $json : [];
}

function writeJsonFile($path, $data) {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    $fp = fopen($path, 'c+');
    if (!$fp) return false;
    try {
        if (!flock($fp, LOCK_EX)) { fclose($fp); return false; }
        ftruncate($fp, 0);
        rewind($fp);
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        fwrite($fp, $json);
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    } catch (Throwable $e) {
        try { fclose($fp); } catch (Throwable $e2) {}
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';
    $dia = isset($_GET['dia']) ? trim($_GET['dia']) : '';
    $ejercicio = isset($_GET['ejercicio']) ? trim($_GET['ejercicio']) : '';
    $items = readJsonFile($filePath);
    if ($id !== '') {
        $found = null;
        foreach ($items as $it) {
            if (($it['id'] ?? '') === $id) { $found = $it; break; }
        }
        if ($found === null) {
            respond(404, ['ok' => false, 'error' => 'No encontrado']);
        }
        respond(200, ['ok' => true, 'item' => $found]);
    }
    if ($dia !== '' && $ejercicio !== '') {
        $items = array_values(array_filter($items, function ($it) use ($dia, $ejercicio) {
            return ($it['dia'] ?? '') === $dia && ($it['ejercicio'] ?? '') === $ejercicio;
        }));
    }
    respond(200, ['ok' => true, 'items' => $items]);
}

if ($method === 'POST') {
    $payload = readRequestJson();
    if ($payload === null) { respond(400, ['ok' => false, 'error' => 'JSON inválido']); }
    $dia = trim($payload['dia'] ?? '');
    $ejercicio = trim($payload['ejercicio'] ?? '');
    $fecha = trim($payload['fecha'] ?? '');
    $series = $payload['series'] ?? null; // arreglo de {n, peso, reps}
    $notas = $payload['notas'] ?? null;

    $hasValidSeries = is_array($series) && count($series) > 0;
    if ($dia === '' || $ejercicio === '' || $fecha === '' || !$hasValidSeries) { respond(422, ['ok' => false, 'error' => 'Campos requeridos faltantes']); }

    $items = readJsonFile($filePath);
    $items[] = [
        'id' => uniqid('prog_', true),
        'dia' => $dia,
        'ejercicio' => $ejercicio,
        'fecha' => $fecha,
        'series' => array_values(array_map(function ($s) {
            return [
                'n' => isset($s['n']) ? intval($s['n']) : null,
                'peso' => isset($s['peso']) ? floatval($s['peso']) : null,
                'reps' => isset($s['reps']) ? intval($s['reps']) : null,
                'descanso' => isset($s['descanso']) ? intval($s['descanso']) : null,
                'rpe' => isset($s['rpe']) ? intval($s['rpe']) : null,
            ];
        }, $series)),
        'notas' => $notas !== null ? strval($notas) : null,
        'created_at' => date('c')
    ];
    if (!writeJsonFile($filePath, $items)) { respond(500, ['ok' => false, 'error' => 'Error al guardar']); }
    respond(200, ['ok' => true]);
}

if ($method === 'PUT') {
    $payload = readRequestJson();
    if ($payload === null) { respond(400, ['ok' => false, 'error' => 'JSON inválido']); }
    $id = trim($payload['id'] ?? '');
    if ($id === '') { respond(422, ['ok' => false, 'error' => 'ID requerido']); }
    $dia = trim($payload['dia'] ?? '');
    $ejercicio = trim($payload['ejercicio'] ?? '');
    $fecha = trim($payload['fecha'] ?? '');
    $series = $payload['series'] ?? null;
    $notas = $payload['notas'] ?? null;
    $hasValidSeries = is_array($series) && count($series) > 0;
    if ($dia === '' || $ejercicio === '' || $fecha === '' || !$hasValidSeries) { respond(422, ['ok' => false, 'error' => 'Campos requeridos faltantes']); }
    $items = readJsonFile($filePath);
    $updated = false;
    foreach ($items as &$it) {
        if (($it['id'] ?? '') === $id) {
            $it['dia'] = $dia;
            $it['ejercicio'] = $ejercicio;
            $it['fecha'] = $fecha;
            $it['series'] = array_values(array_map(function ($s) {
                return [
                    'n' => isset($s['n']) ? intval($s['n']) : null,
                    'peso' => isset($s['peso']) ? floatval($s['peso']) : null,
                    'reps' => isset($s['reps']) ? intval($s['reps']) : null,
                    'descanso' => isset($s['descanso']) ? intval($s['descanso']) : null,
                    'rpe' => isset($s['rpe']) ? intval($s['rpe']) : null,
                ];
            }, $series));
            $it['notas'] = $notas !== null ? strval($notas) : null;
            $it['updated_at'] = date('c');
            $updated = true;
            break;
        }
    }
    if (!$updated) { respond(404, ['ok' => false, 'error' => 'No encontrado']); }
    if (!writeJsonFile($filePath, $items)) { respond(500, ['ok' => false, 'error' => 'Error al guardar']); }
    respond(200, ['ok' => true]);
}

if ($method === 'DELETE') {
    $payload = readRequestJson();
    $id = '';
    if (is_array($payload)) { $id = trim($payload['id'] ?? ''); }
    if ($id === '') { $id = isset($_GET['id']) ? trim($_GET['id']) : ''; }
    if ($id === '') { respond(422, ['ok' => false, 'error' => 'ID requerido']); }
    $items = readJsonFile($filePath);
    $newItems = array_values(array_filter($items, function ($it) use ($id) { return ($it['id'] ?? '') !== $id; }));
    if (count($items) === count($newItems)) {
        respond(404, ['ok' => false, 'error' => 'No encontrado']);
    }
    if (!writeJsonFile($filePath, $newItems)) { respond(500, ['ok' => false, 'error' => 'Error al guardar']); }
    respond(200, ['ok' => true]);
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido']);

