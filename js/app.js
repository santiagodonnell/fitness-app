(function ($) {
  'use strict';

  const $modal = $('#modal');
  let activeChart = null;

  // Loader gestionado en data.js

  // API helpers migrados a js/modules/api.js (API, apiGetJSON, apiSendJSON)

  // Funciones de charts están en js/modules/charts.js

  // Helpers de progreso están en js/modules/progreso.js

  // Render y utilidades de rutina están en js/modules/rutina.js

  // UI helpers migrados a js/modules/ui.js (openModal, closeModal, showToast)
  // Wrapper local para limpiar recursos del chart antes de cerrar modal
  function closeModal() {
    if (activeChart) { try { activeChart.destroy(); } catch (e) {} activeChart = null; }
    if (window.closeModal) { window.closeModal(); }
  }
  $modal.on('click', '[data-modal-close]', closeModal);
  $(document).on('keydown', function (e) { const key = e.key || e.keyCode; if (key === 'Escape' || key === 'Esc' || key === 27) { if (!$modal.hasClass('is-hidden')) { e.preventDefault(); closeModal(); } } });

  // --- Progreso ---
  function buildProgresoForm(dia, ejercicio, defaultSeriesCount) {
    const hoy = new Date();
    const iso = hoy.toISOString().slice(0, 10);
    const $form = $('<form>').addClass('form-grid').attr('id', 'form-progreso');

    const $row1 = $('<div>').addClass('form-row');
    $row1.append('<label for="prog-fecha">Fecha</label>');
    $row1.append($('<input>').attr({ id: 'prog-fecha', type: 'date', required: true, value: iso }));

    const setsDefault = Math.max(1, parseInt(defaultSeriesCount || '1', 10) || 1);

    const $setsContainer = $('<div>').addClass('sets-list');
    renderSetRows($setsContainer, setsDefault);

    const $row4 = $('<div>').addClass('form-row');
    $row4.append('<label for="prog-notas">Notas (opcional)</label>');
    $row4.append($('<textarea>').attr({ id: 'prog-notas', rows: 3 }));

    const $actions = $('<div>').addClass('form-actions');
    const $cancel = $('<button>').addClass('btn btn-secondary').attr('type', 'button').text('Cancelar').on('click', closeModal);
    const $save = $('<button>').addClass('btn btn-primary').attr('type', 'submit').text('Guardar');
    $actions.append($cancel, $save);

    $form.append($row1, $setsContainer, $row4, $actions);

    $form.on('submit', function (e) {
      e.preventDefault();
      const series = collectSeriesFromForm($form);
      const payload = {
        dia: dia,
        ejercicio: ejercicio,
        fecha: $('#prog-fecha').val(),
        series: series,
        notas: ($('#prog-notas').val() || '').trim() || null
      };
      const $btn = $(this).find('button[type="submit"]');
      $btn.prop('disabled', true);
      apiSendJSON(API.progreso, 'POST', payload).done(function () {
        showToast('Progreso guardado', 'success');
        closeModal();
      }).fail(function () {
        showToast('No se pudo guardar el progreso', 'error');
      }).always(function () { $btn.prop('disabled', false); });
    });

    return $form;
  }

  $(document).on('click', '.btn-progreso', function () {
    const dia = $(this).data('dia');
    const ejercicio = $(this).data('ejercicio');
    const seriesCount = $(this).data('series');
    const $content = $('<div>');
    $content.append($('<p>').addClass('subtle').text(dia + ' · ' + ejercicio));
    const $form = buildProgresoForm(dia, ejercicio, seriesCount);
    $content.append($form);
    openModal('Progreso', $content);
  });

  // Charts movidos a js/modules/charts.js

  $(document).on('click', '.btn-chart', function () {
    const dia = $(this).data('dia');
    const ejercicio = $(this).data('ejercicio');
    const $content = buildChartContent(dia, ejercicio);
    openModal('Visualización gráfica', $content);
  });

  // Tabla de progreso movida a js/modules/charts.js

  $(document).on('click', '.btn-tabla', function () {
    const dia = $(this).data('dia');
    const ejercicio = $(this).data('ejercicio');
    const $content = buildTablaContent(dia, ejercicio);
    openModal('Progreso (tabla)', $content);
  });

  // Demostración local (imagen/GIF) desde assets/images/{media_url}
  $(document).on('click', '.btn-demo', function () {
    const media = ($(this).data('media') || '').trim();
    const ejercicio = ($(this).data('ejercicio') || '').trim();
    if (!media) { showToast('Sin archivo de demostración configurado', 'error'); return; }
    const src = 'assets/images/' + media;
    const $content = $('<div>');
    $content.append($('<p>').addClass('subtle').text(ejercicio));
    // Detección simple por extensión
    const isVideo = /\.(mp4|webm|ogg)$/i.test(media);
    if (isVideo) {
      const $video = $('<video>').addClass('demo-media').attr({ controls: true, playsinline: true, autoplay: true, loop: true }).css({ borderRadius: '10px' });
      $video.append($('<source>').attr('src', src));
      $content.append($video);
    } else {
      const $img = $('<img>').addClass('demo-media').attr('src', src).css({ borderRadius: '10px' });
      $content.append($img);
    }
    openModal('Demostración', $content);
  });

  // (El modal de Referencia fue retirado y se elimina soporte a ExerciseDB por medios locales)

  // Editar registro
  $(document).on('click', '.btn-edit', function () {
    const id = $(this).data('id');
    apiGetJSON(API.progreso, { id: id }).done(function (res) {
      const it = res.item;
      const $content = $('<div>');
      $content.append($('<p>').addClass('subtle').text(it.dia + ' · ' + it.ejercicio));
      const $form = buildProgresoForm(it.dia, it.ejercicio, (it.series || []).length);
      // Prefill
      $('#prog-fecha', $form).val(it.fecha || '');
      if (Array.isArray(it.series)) {
        const count = Math.max(1, it.series.length);
        const $container = $form.find('.sets-list');
        renderSetRows($container, count);
        prefillSetsInForm($form, it.series);
      }
      if (it.notas) { $('#prog-notas', $form).val(it.notas); }

      // Override submit to PUT
      $form.off('submit').on('submit', function (e) {
        e.preventDefault();
        const series = collectSeriesFromForm($form);
        const payload = {
          id: id,
          dia: it.dia,
          ejercicio: it.ejercicio,
          fecha: $('#prog-fecha').val(),
          series: series,
          notas: ($('#prog-notas').val() || '').trim() || null
        };
        const $btn = $(this).find('button[type="submit"]');
        $btn.prop('disabled', true);
        apiSendJSON(API.progreso, 'PUT', payload)
          .done(function () { showToast('Progreso actualizado', 'success'); closeModal(); })
          .fail(function () { showToast('No se pudo actualizar', 'error'); })
          .always(function () { $btn.prop('disabled', false); });
      });

      $content.append($form);
      openModal('Editar progreso', $content);
    }).fail(function () {
      showToast('No se pudo cargar el registro', 'error');
    });
  });

  // Eliminar registro
  $(document).on('click', '.btn-del', function () {
    const id = $(this).data('id');
    const $content = $('<div>');
    $content.append('<p>¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.</p>');
    const $actions = $('<div>').addClass('form-actions');
    const $cancel = $('<button>').addClass('btn-secondary').attr('type', 'button').text('Cancelar').on('click', closeModal);
    const $confirm = $('<button>').addClass('btn btn-danger').attr('type', 'button').text('Eliminar').on('click', function () {
      $.ajax({ url: API.progreso + '?id=' + encodeURIComponent(id), method: 'DELETE', dataType: 'json' })
        .done(function () { showToast('Eliminado', 'success'); closeModal(); })
        .fail(function () { showToast('No se pudo eliminar', 'error'); });
    });
    $actions.append($cancel, $confirm);
    $content.append($actions);
    openModal('Eliminar progreso', $content);
  });

  // Notas movido a rutina.js

  // populateDiasSelect movido a rutina.js

  // fetchData movido a data.js

  // applyFilters movido a data.js

  // Preferencia del usuario: filtrado dinámico con loader
  // Poblamos el select inicialmente con todos los días
  $(function () { /* vacío */ });
})(jQuery);


