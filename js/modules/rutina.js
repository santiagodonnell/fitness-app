(function (window, $) {
  'use strict';

  function option(value, text) { return $('<option>').attr('value', value).text(text); }
  function createList(items) { var $ul = $('<ul>'); items.forEach(function(t){ $ul.append($('<li>').text(t)); }); return $ul; }

  function renderRutina(dias) {
    var $rutina = $('#rutina-contenido');
    $rutina.empty();
    var keys = Object.keys(dias || {});
    if (keys.length === 0) { $rutina.append($('<p>').text('No hay resultados para los filtros aplicados.')); return; }
    keys.forEach(function(dia){
      var info = dias[dia] || {};
      var $wrapper = $('<div>').addClass('dia');
      
      // Agregar header del día con progreso
      var $diaHeader = $('<div>').addClass('dia-header');
      $diaHeader.append($('<h3>').text(dia));
      
      // Agregar indicador de progreso
      var $progressContainer = $('<div>').addClass('progress-container');
      var $progressBar = $('<div>').addClass('progress-bar');
      var $progressFill = $('<div>').addClass('progress-fill').css('width', '0%');
      var $progressText = $('<span>').addClass('progress-text').text('0%');
      $progressBar.append($progressFill);
      $progressContainer.append($progressText, $progressBar);
      
      // Agregar botón de reset
      var $resetButton = $('<button>')
        .addClass('reset-progress-btn')
        .attr('type', 'button')
        .attr('aria-label', 'Resetear progreso de ' + dia)
        .html('<span class="material-symbols-outlined">refresh</span>');
      
      $progressContainer.append($resetButton);
      $diaHeader.append($progressContainer);
      
      $wrapper.append($diaHeader);
      
      // Agregar chips de grupos musculares
      if (info.grupos_musculares && info.grupos_musculares.length) {
        var $chips = $('<div>').addClass('chips');
        info.grupos_musculares.forEach(function(g){ $chips.append($('<span>').addClass('chip').text(g)); });
        $wrapper.append($chips);
      }
      
      if (Array.isArray(info.ejercicios)) {
        var $ejerciciosContainer = $('<div>').addClass('ejercicios-cards');
        
        info.ejercicios.forEach(function(ej){
          var $card = $('<div>').addClass('ejercicio-card');
          
          // Checkbox para marcar ejercicio completado
          var $checkbox = $('<input>')
            .attr('type', 'checkbox')
            .addClass('ejercicio-checkbox')
            .attr('id', 'ej-' + dia.replace(/\s+/g, '-') + '-' + (ej.nombre || '').replace(/\s+/g, '-'));
          
          var $cardContent = $('<div>').addClass('card-content');
          
          // Nombre del ejercicio
          var $ejercicioNombre = $('<h4>').addClass('ejercicio-nombre').text(ej.nombre || '');
          
          // Series y reps
          var seriesText = ej.series != null ? ej.series : '';
          var repsText = ej.reps || '';
          var $seriesReps = $('<p>').addClass('series-reps').text(seriesText + ' series × ' + repsText + ' reps');
          
          $cardContent.append($ejercicioNombre, $seriesReps);
          
          // Menú de acciones
          var $menu = $('<div>').addClass('menu-acciones');
          var $trigger = $('<button>')
            .addClass('menu-trigger')
            .attr('type', 'button')
            .attr('aria-haspopup', 'true')
            .attr('aria-expanded', 'false')
            .attr('aria-label', 'Abrir menú de acciones para ' + (ej.nombre || 'este ejercicio'))
            .html('<span class="material-symbols-outlined">more_vert</span>');
          var $dropdown = $('<div>').addClass('menu-dropdown').attr('role', 'menu');
          var $miProg = $('<button>')
            .addClass('menu-item btn-progreso')
            .attr('type', 'button')
            .attr('data-dia', dia)
            .attr('data-ejercicio', ej.nombre || '')
            .attr('data-series', ej.series != null ? ej.series : '')
            .attr('aria-label', 'Registrar progreso de ' + (ej.nombre || 'este ejercicio'))
            .text('Progreso');
          var $miChart = $('<button>')
            .addClass('menu-item btn-chart')
            .attr('type', 'button')
            .attr('data-dia', dia)
            .attr('data-ejercicio', ej.nombre || '')
            .attr('data-series', ej.series != null ? ej.series : '')
            .attr('aria-label', 'Ver gráfica de ' + (ej.nombre || 'este ejercicio'))
            .text('Visualización gráfica');
          var $miTabla = $('<button>')
            .addClass('menu-item btn-tabla')
            .attr('type', 'button')
            .attr('data-dia', dia)
            .attr('data-ejercicio', ej.nombre || '')
            .attr('data-series', ej.series != null ? ej.series : '')
            .attr('aria-label', 'Ver tabla de progreso de ' + (ej.nombre || 'este ejercicio'))
            .text('Tabla');
          $dropdown.append($miProg, $miChart, $miTabla);
          var media = (ej.media_url || '').trim();
          if (media) {
            var $miDemo = $('<button>')
              .addClass('menu-item btn-demo')
              .attr('type', 'button')
              .attr('data-ejercicio', ej.nombre || '')
              .attr('data-media', media)
              .attr('aria-label', 'Ver demostración de ' + (ej.nombre || 'este ejercicio'))
              .text('Demostración');
            $dropdown.append($miDemo);
          }
          $menu.append($trigger, $dropdown);
          
          $card.append($checkbox, $cardContent, $menu);
          $ejerciciosContainer.append($card);
        });
        
        $wrapper.append($ejerciciosContainer);
      }
      $rutina.append($wrapper);
    });
  }

  function renderCardio(cardio) {
    var $cardio = $('#cardio-contenido');
    $cardio.empty();
    var dias = Object.keys(cardio || {});
    if (!dias.length) return;
    var items = dias.map(function(d){ return d + ': ' + cardio[d]; });
    $cardio.append(createList(items));
  }

  function renderProgresion(progresion) {
    var $progresion = $('#progresion-contenido');
    $progresion.empty();
    var fases = Object.keys(progresion || {});
    if (!fases.length) return;
    var $table = $('<table>').addClass('tabla-progresion');
    $table.append('<colgroup><col class="col-fase"/><col class="col-duracion"/><col class="col-peso"/><col class="col-seriesreps"/><col class="col-otros"/></colgroup>');
    $table.append('<thead><tr><th>Fase</th><th>Duración</th><th>Peso</th><th>Series/Reps</th><th>Otros</th></tr></thead>');
    var $tbody = $('<tbody>');
    fases.forEach(function(fase){
      var f = progresion[fase] || {};
      var otros = [];
      Object.keys(f).forEach(function(k){ if (['duracion','peso','series_reps'].indexOf(k) === -1) { otros.push(k + ': ' + f[k]); } });
      var $tr = $('<tr>');
      $tr.append($('<td>').text(fase));
      $tr.append($('<td>').text(f.duracion || ''));
      $tr.append($('<td>').text(f.peso || ''));
      $tr.append($('<td>').text(f.series_reps || ''));
      $tr.append($('<td>').text(otros.join(' | ')));
      $tbody.append($tr);
    });
    $table.append($tbody);
    var $wrap = $('<div>').addClass('table-wrapper');
    $wrap.append($table);
    $progresion.append($wrap);
  }

  function renderNotas(notas) {
    var $notas = $('#notas-contenido');
    $notas.empty();
    if (!notas) return;
    if (notas.registro) { $notas.append($('<p>').text(notas.registro)); }
    if (notas.alimentacion) {
      var a = notas.alimentacion;
      var items = [];
      if (a.proteina) items.push('Proteína: ' + a.proteina);
      if (a.carbohidratos) items.push('Carbohidratos: ' + a.carbohidratos);
      if (a.grasas) items.push('Grasas: ' + a.grasas);
      if (a.deficit) items.push('Déficit: ' + a.deficit);
      $notas.append(createList(items));
    }
  }

  function populateDiasSelect(dias) {
    var $dia = $('#filter-dia');
    $dia.empty();
    $dia.append(option('', 'Todos'));
    Object.keys(dias || {}).forEach(function(d){ $dia.append(option(d, d)); });
  }

  // Menú de acciones y demostración
  $(function(){
    function closeAllMenus(){
      $('.menu-acciones.is-open').each(function(){
        $(this).removeClass('is-open');
        $(this).find('.menu-trigger').attr('aria-expanded', 'false');
      });
    }
    $(document).on('click', '.menu-trigger', function(e){
      e.preventDefault();
      e.stopPropagation();
      var $menu = $(this).closest('.menu-acciones');
      var $dd = $menu.find('.menu-dropdown');
      var $btnProg = $dd.find('.btn-progreso');
      var dia = $btnProg.data('dia');
      var ejercicio = ($btnProg.data('ejercicio') || '').trim();
      var series = $btnProg.data('series');
      var media = ($dd.find('.btn-demo').data('media') || '').trim();

      // Construir contenido del modal de acciones
      var $content = $('<div>').addClass('modal-actions');
      var $bProg = $('<button>')
        .addClass('menu-action btn-progreso')
        .attr({ type: 'button' })
        .attr('data-dia', dia)
        .attr('data-ejercicio', ejercicio)
        .attr('data-series', series)
        .text('Progreso');
      var $bChart = $('<button>')
        .addClass('menu-action btn-chart')
        .attr({ type: 'button' })
        .attr('data-dia', dia)
        .attr('data-ejercicio', ejercicio)
        .text('Visualización gráfica');
      var $bTabla = $('<button>')
        .addClass('menu-action btn-tabla')
        .attr({ type: 'button' })
        .attr('data-dia', dia)
        .attr('data-ejercicio', ejercicio)
        .text('Tabla');
      $content.append($bProg, $bChart, $bTabla);
      if (media) {
        var $bDemo = $('<button>')
          .addClass('menu-action btn-demo')
          .attr({ type: 'button' })
          .attr('data-ejercicio', ejercicio)
          .attr('data-media', media)
          .text('Demostración');
        $content.append($bDemo);
      }

      // Abrir modal pequeño centrado con título "Acciones: {ejercicio}"
      window.openModal && openModal('ACCIONES: ' + ejercicio, $content);
      $('#modal .modal-content').addClass('small');

      // Asegurar que el dropdown quede cerrado si estaba abierto
      closeAllMenus();
    });
    $(document).on('click', '.menu-dropdown', function(e){ e.stopPropagation(); });
    $(document).on('click', '.menu-dropdown .menu-item', function(){ closeAllMenus(); });
    $(document).on('click', function(){ closeAllMenus(); });
    $(document).on('keydown', function(e){ var key = e.key || e.keyCode; if (key === 'Escape' || key === 'Esc' || key === 27) { closeAllMenus(); } });

    // Demostración local (imagen/GIF) desde assets/images/{media_url}
    $(document).on('click', '.btn-demo', function(){
      var media = ($(this).data('media') || '').trim();
      var ejercicio = ($(this).data('ejercicio') || '').trim();
      if (!media) { window.showToast && showToast('Sin archivo de demostración configurado', 'error'); return; }
      var src = 'assets/images/' + media;
      var $content = $('<div>');
      $content.append($('<p>').addClass('subtle').text(ejercicio));
      var isVideo = /(\.mp4|\.webm|\.ogg)$/i.test(media);
      if (isVideo) {
        var $video = $('<video>').addClass('demo-media').attr({ controls: true, playsinline: true, autoplay: true, loop: true }).css({ borderRadius: '10px' });
        $video.append($('<source>').attr('src', src));
        $content.append($video);
      } else {
        var $img = $('<img>').addClass('demo-media').attr('src', src).css({ borderRadius: '10px' });
        $content.append($img);
      }
      window.openModal && openModal('Demostración', $content);
    });
  });

  // Funcionalidad para checkboxes y progreso con persistencia
  $(function(){
    // Clave para localStorage
    var STORAGE_KEY = 'fitness_progress';
    
    // Función para obtener progreso guardado
    function getStoredProgress() {
      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        console.warn('Error al cargar progreso:', e);
        return {};
      }
    }
    
    // Función para guardar progreso
    function saveProgress(progress) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.warn('Error al guardar progreso:', e);
      }
    }
    
    // Función para obtener ID único del ejercicio
    function getExerciseId($checkbox) {
      var $card = $checkbox.closest('.ejercicio-card');
      var $dia = $card.closest('.dia');
      var dia = $dia.find('.dia-header h3').text();
      var ejercicio = $card.find('.ejercicio-nombre').text();
      return dia + '|' + ejercicio;
    }
    
    // Función para obtener ID del día
    function getDayId($dia) {
      return $dia.find('.dia-header h3').text();
    }
    
    // Manejar cambios en los checkboxes
    $(document).on('change', '.ejercicio-checkbox', function(){
      var $checkbox = $(this);
      var $card = $checkbox.closest('.ejercicio-card');
      var isChecked = $checkbox.is(':checked');
      
      // Aplicar clase completed si está marcado
      if (isChecked) {
        $card.addClass('completed');
      } else {
        $card.removeClass('completed');
      }
      
      // Guardar estado en localStorage
      var progress = getStoredProgress();
      var exerciseId = getExerciseId($checkbox);
      progress[exerciseId] = isChecked;
      saveProgress(progress);
      
      // Actualizar progreso del día
      updateDayProgress($card);
    });
    
    // Función para actualizar el progreso del día
    function updateDayProgress($card) {
      var $dia = $card.closest('.dia');
      var $progressFill = $dia.find('.progress-fill');
      var $progressText = $dia.find('.progress-text');
      
      var totalEjercicios = $dia.find('.ejercicio-checkbox').length;
      var ejerciciosCompletados = $dia.find('.ejercicio-checkbox:checked').length;
      var porcentaje = totalEjercicios > 0 ? Math.round((ejerciciosCompletados / totalEjercicios) * 100) : 0;
      
      // Obtener porcentaje anterior para detectar si llegó al 100%
      var porcentajeAnterior = parseInt($progressText.text()) || 0;
      
      // Actualizar barra de progreso
      $progressFill.css('width', porcentaje + '%');
      $progressText.text(porcentaje + '%');
      
      // Cambiar color según el progreso
      if (porcentaje === 100) {
        $progressFill.css('background', 'linear-gradient(90deg, #28a745, #20c997)');
        
        // Lanzar confeti si acabamos de llegar al 100%
        if (porcentajeAnterior < 100) {
          // Agregar clase de celebración al día
          $dia.addClass('completed');
          
          // Agregar efecto de pulso a la barra de progreso
          $progressFill.addClass('completed');
          
          // Pequeño delay para que se vea el cambio de color primero
          setTimeout(function() {
            window.launchConfettiFromElement && window.launchConfettiFromElement($dia);
            
            // Efecto de vibración sutil en el día completado
            $dia.css('animation', 'none');
            $dia[0].offsetHeight; // Trigger reflow
            $dia.css('animation', 'celebration-vibrate 0.5s ease-in-out');
          }, 300);
          
          // Remover clases de animación después de un tiempo
          setTimeout(function() {
            $dia.removeClass('completed');
            $progressFill.removeClass('completed');
          }, 3000);
          
          // Mostrar notificación de éxito
          var dayName = getDayId($dia);
          if (window.showToast) {
            setTimeout(function() {
              window.showToast('¡Felicidades! Has completado todos los ejercicios de ' + dayName, 'success');
            }, 1000);
          }
        }
      } else if (porcentaje >= 50) {
        $progressFill.css('background', 'linear-gradient(90deg, #ffc107, #ffca2c)');
      } else {
        $progressFill.css('background', 'linear-gradient(90deg, #ff6b35, #ff8c42)');
      }
    }
    
    // Función para resetear progreso de un día
    function resetDayProgress($dia) {
      var dayId = getDayId($dia);
      var progress = getStoredProgress();
      
      // Desmarcar todos los checkboxes del día
      $dia.find('.ejercicio-checkbox').each(function(){
        var $checkbox = $(this);
        var exerciseId = getExerciseId($checkbox);
        $checkbox.prop('checked', false);
        $checkbox.closest('.ejercicio-card').removeClass('completed');
        
        // Remover del progreso guardado
        delete progress[exerciseId];
      });
      
      // Guardar progreso actualizado
      saveProgress(progress);
      
      // Actualizar visualización
      updateDayProgress($dia.find('.ejercicio-card').first());
    }
    
    // Event listener para botón de reset
    $(document).on('click', '.reset-progress-btn', function(){
      var $dia = $(this).closest('.dia');
      var dayName = getDayId($dia);
      
      // Crear contenido del modal de confirmación
      var $content = $('<div>').addClass('reset-confirmation');
      $content.append(
        $('<p>').text('¿Estás seguro de que quieres resetear el progreso de ' + dayName + '?'),
        $('<p>').addClass('warning-text').text('Esta acción no se puede deshacer.')
      );
      
      // Crear botones del modal
      var $buttons = $('<div>').addClass('modal-actions');
      var $cancelBtn = $('<button>')
        .addClass('btn btn-secondary')
        .text('Cancelar')
        .on('click', function(){
          window.closeModal && closeModal();
        });
      var $confirmBtn = $('<button>')
        .addClass('btn btn-danger')
        .text('Resetear progreso')
        .on('click', function(){
          resetDayProgress($dia);
          window.closeModal && closeModal();
        });
      
      $buttons.append($cancelBtn, $confirmBtn);
      $content.append($buttons);
      
      // Abrir modal de confirmación
      window.openModal && openModal('Confirmar reset de progreso', $content);
    });
    
    // Función para cargar progreso guardado
    function loadStoredProgress() {
      var progress = getStoredProgress();
      
      $('.ejercicio-checkbox').each(function(){
        var $checkbox = $(this);
        var exerciseId = getExerciseId($checkbox);
        
        if (progress[exerciseId]) {
          $checkbox.prop('checked', true);
          $checkbox.closest('.ejercicio-card').addClass('completed');
        }
      });
      
      // Actualizar progreso de todos los días
      $('.dia').each(function(){
        var $dia = $(this);
        updateDayProgress($dia.find('.ejercicio-card').first());
      });
    }
    
    // Inicializar progreso al cargar la página
    function initializeProgress() {
      loadStoredProgress();
    }
    
    // Llamar inicialización después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(initializeProgress, 100);
  });

  // Exportar
  window.renderRutina = renderRutina;
  window.renderCardio = renderCardio;
  window.renderProgresion = renderProgresion;
  window.renderNotas = renderNotas;
  window.populateDiasSelect = populateDiasSelect;

})(window, jQuery);


