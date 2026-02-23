<?php
$cssVersion = filemtime('assets/css/styles.css');
$jsVersion = filemtime('js/app.js');
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fitness Tracker</title>
  <link rel="stylesheet" href="assets/css/styles.css?v=<?= $cssVersion; ?>">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0">

</head>
<body>
  <header class="app-header">
    <button class="menu-toggle" id="menu-toggle" aria-label="Abrir menú">
      <span class="material-symbols-outlined">menu</span>
    </button>
    <h1>Fitness Tracker</h1>
  </header>

  <main class="app-container">
    <nav class="tabs" aria-label="Secciones" id="tabs">
      <a href="#sec-rutina" class="tab is-active" data-target="#sec-rutina">Musculación</a>
      <a href="#sec-cardio" class="tab" data-target="#sec-cardio">Cardio</a>
      <a href="#sec-progresion" class="tab" data-target="#sec-progresion">Progresión</a>
      <a href="#sec-notas" class="tab" data-target="#sec-notas">Nutrición</a>
      <a href="#sec-asistente" class="tab" data-target="#sec-asistente">Asistente</a>
    </nav>
    <section class="filters is-hidden" aria-label="Filtros" id="filters-section">
      <div class="filters-row">
        <label for="filter-dia">Día</label>
        <select id="filter-dia" name="dia">
          <option value="">Todos</option>
        </select>

        <label for="filter-buscar">Buscar ejercicio</label>
        <input id="filter-buscar" type="text" placeholder="Ej: press, remo..." autocomplete="off" />

        <div id="loader" class="loader is-hidden" role="status" aria-live="polite">
          <span class="sr-only">Cargando...</span>
        </div>
      </div>
    </section>

    <section class="grid">
      <article class="card" id="sec-rutina">
        <h2>Rutina</h2>
        <div id="rutina-contenido"></div>
      </article>

      <article class="card is-hidden" id="sec-cardio">
        <h2>Cardio</h2>
        <div id="cardio-contenido"></div>
      </article>

      <article class="card is-hidden" id="sec-progresion">
        <h2>Progresión (3 meses)</h2>
        <div id="progresion-contenido"></div>
      </article>

      <article class="card is-hidden" id="sec-notas">
        <h2>Notas nutricionales</h2>
        <div id="notas-contenido"></div>
      </article>

      <article class="card is-hidden" id="sec-asistente">
        <div class="assistant-grid">
          <aside class="chat-history">
            <div class="panel-header">
              <span id="history-header-title">Historial <span id="history-count" class="muted">(0)</span></span>
              <button id="chat-clear" type="button" class="btn btn-danger">Limpiar</button>
            </div>
            <div id="history-list" class="history-list" aria-live="polite"></div>
          </aside>
          <div id="chat" class="chat">
            <div class="panel-header"><span>Asistente</span><button id="chat-new" type="button" class="btn btn-primary">Nuevo chat</button></div>
            <div id="chat-log" class="chat-log" aria-live="polite"></div>
            <form id="chat-form" class="chat-form" autocomplete="off">
              <textarea id="chat-input" rows="1" placeholder="Escribe tu objetivo, límites, equipo disponible..." required></textarea>
              <button id="chat-send" type="submit" class="btn btn-primary">Enviar</button>
            </form>
          </div>
        </div>
      </article>
    </section>
  </main>

  <div id="modal" class="modal is-hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-backdrop" data-modal-close></div>
    <div class="modal-content" role="document">
      <div class="modal-handle" aria-hidden="true"></div>
      <header class="modal-header">
        <h3 id="modal-title">Progreso</h3>
        <button type="button" class="modal-close" aria-label="Cerrar" data-modal-close><span class="material-symbols-outlined">close</span></button>
      </header>
      <div class="modal-body" id="modal-body"></div>
    </div>
  </div>

  <div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>

  <!-- Menú móvil -->
  <div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>
  <nav class="mobile-nav" id="mobile-nav">
    <div class="mobile-nav-header">
      <h2>Menú</h2>
      <button class="mobile-nav-close" id="mobile-nav-close" aria-label="Cerrar menú">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="mobile-nav-content">
      <a href="#sec-rutina" class="mobile-tab is-active" data-target="#sec-rutina">Musculación</a>
      <a href="#sec-cardio" class="mobile-tab" data-target="#sec-cardio">Cardio</a>
      <a href="#sec-progresion" class="mobile-tab" data-target="#sec-progresion">Progresión</a>
      <a href="#sec-notas" class="mobile-tab" data-target="#sec-notas">Nutrición</a>
      <a href="#sec-asistente" class="mobile-tab" data-target="#sec-asistente">Asistente</a>
    </div>
  </nav>

  <script src="js/jquery.4.0.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="js/modules/api.js"></script>
  <script src="js/modules/ui.js"></script>
  <script src="js/modules/progreso.js"></script>
  <script src="js/modules/rutina.js"></script>
  <script src="js/modules/charts.js"></script>
  <script src="js/modules/data.js"></script>
  <script src="js/modules/chat.js"></script>
  <script src="js/modules/bootstrap.js"></script>
  <script src="js/modules/mobile.js"></script>
  <script src="js/modules/confetti.js"></script>
  <script src="js/app.js?v=<?= $jsVersion; ?>"></script>
</body>
</html>