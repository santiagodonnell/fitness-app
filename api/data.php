<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// En esta primera iteración, leemos desde data/data.json.
// Más adelante se reemplazará por consultas MySQL.
$dataPath = __DIR__ . '/../data/data.json';

if (!file_exists($dataPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se encuentra data.json']);
    exit;
}

$raw = file_get_contents($dataPath);
$json = json_decode($raw, true);
if ($json === null) {
    http_response_code(500);
    echo json_encode(['error' => 'JSON inválido']);
    exit;
}

// Filtros básicos por query string: dia, q (texto en nombre de ejercicio)
$dia = isset($_GET['dia']) ? trim($_GET['dia']) : '';
$q = isset($_GET['q']) ? mb_strtolower(trim($_GET['q']), 'UTF-8') : '';

$response = $json; // estructura completa por defecto

// Si hay filtros, aplicarlos sobre la sección de rutina
if ($dia !== '' || $q !== '') {
    if (!isset($json['rutina']['dias']) || !is_array($json['rutina']['dias'])) {
        echo json_encode($json);
        exit;
    }

    $dias = $json['rutina']['dias'];

    // Filtrar por día específico si se pasa
    if ($dia !== '') {
        $diasFiltrados = [];
        if (isset($dias[$dia])) {
            $diasFiltrados[$dia] = $dias[$dia];
        }
        $dias = $diasFiltrados;
    }

    // Filtrar por búsqueda textual en ejercicios
    if ($q !== '') {
        $dias = array_filter($dias, function ($infoDia) use ($q) {
            if (!isset($infoDia['ejercicios'])) return false;
            $match = false;
            foreach ($infoDia['ejercicios'] as $ej) {
                $nombre = isset($ej['nombre']) ? mb_strtolower($ej['nombre'], 'UTF-8') : '';
                if ($nombre !== '' && mb_strpos($nombre, $q, 0, 'UTF-8') !== false) {
                    $match = true;
                    break;
                }
            }
            return $match;
        });
        // Si se filtra por texto, también reducimos la lista de ejercicios por día
        foreach ($dias as $k => $infoDia) {
            $ejercicios = isset($infoDia['ejercicios']) ? $infoDia['ejercicios'] : [];
            $dias[$k]['ejercicios'] = array_values(array_filter($ejercicios, function ($ej) use ($q) {
                $nombre = isset($ej['nombre']) ? mb_strtolower($ej['nombre'], 'UTF-8') : '';
                return $nombre !== '' && mb_strpos($nombre, $q, 0, 'UTF-8') !== false;
            }));
        }
    }

    $response['rutina']['dias'] = $dias;
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

