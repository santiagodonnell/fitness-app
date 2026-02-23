(function (window, $) {
  'use strict';

  function renderSetRows($container, numSets) {
    var count = Math.max(1, parseInt(numSets || '1', 10) || 1);
    $container.empty();
    for (var i = 1; i <= count; i++) {
      var $card = $('<div>').addClass('set-card');
      var $head = $('<div>').addClass('set-head').text('Serie ' + i);
      var $fields = $('<div>').addClass('set-fields');
      var $peso = $('<div>').addClass('form-row');
      $peso.append($('<label>').attr('for', 'set-peso-' + i).text('Peso (kg)'));
      $peso.append($('<input>').attr({ id: 'set-peso-' + i, type: 'number', step: '0.5', min: '0' }));
      var $reps = $('<div>').addClass('form-row');
      $reps.append($('<label>').attr('for', 'set-reps-' + i).text('Repeticiones'));
      $reps.append($('<input>').attr({ id: 'set-reps-' + i, type: 'number', min: '0' }));
      var $desc = $('<div>').addClass('form-row');
      $desc.append($('<label>').attr('for', 'set-descanso-' + i).text('Descanso (seg)'));
      $desc.append($('<input>').attr({ id: 'set-descanso-' + i, type: 'number', min: '0', step: '5', value: '90' }));
      var $rpe = $('<div>').addClass('form-row');
      $rpe.append($('<label>').attr('for', 'set-rpe-' + i).text('RPE (1-10)'));
      var $select = $('<select>').attr({ id: 'set-rpe-' + i });
      $select.append($('<option>').attr('value', '').text('RPE'));
      for (var r = 1; r <= 10; r++) { $select.append($('<option>').attr('value', String(r)).text(String(r))); }
      $rpe.append($select);
      $fields.append($peso, $reps, $desc, $rpe);
      $card.append($head, $fields);
      $container.append($card);
    }
  }

  function collectSeriesFromForm($form) {
    var count = $('.set-card', $form).length;
    var series = [];
    for (var i = 1; i <= count; i++) {
      var pesoVal = $('#set-peso-' + i, $form).val();
      var repsVal = $('#set-reps-' + i, $form).val();
      var descansoVal = $('#set-descanso-' + i, $form).val();
      var rpeVal = $('#set-rpe-' + i, $form).val();
      if ((pesoVal || '') !== '' || (repsVal || '') !== '' || (descansoVal || '') !== '' || (rpeVal || '') !== '') {
        series.push({
          n: i,
          peso: (pesoVal || '') === '' ? null : parseFloat(pesoVal),
          reps: (repsVal || '') === '' ? null : parseInt(repsVal, 10),
          descanso: (descansoVal || '') === '' ? null : parseInt(descansoVal, 10),
          rpe: (rpeVal || '') === '' ? null : parseInt(rpeVal, 10)
        });
      }
    }
    return series;
  }

  function prefillSetsInForm($form, seriesArr) {
    if (!Array.isArray(seriesArr)) return;
    seriesArr.forEach(function(s){
      if (!s || typeof s.n === 'undefined') return;
      var idx = s.n;
      if (typeof s.peso !== 'undefined' && s.peso !== null) { $('#set-peso-' + idx, $form).val(s.peso); }
      if (typeof s.reps !== 'undefined' && s.reps !== null) { $('#set-reps-' + idx, $form).val(s.reps); }
      if (typeof s.descanso !== 'undefined' && s.descanso !== null) { $('#set-descanso-' + idx, $form).val(s.descanso); }
      if (typeof s.rpe !== 'undefined' && s.rpe !== null) { $('#set-rpe-' + idx, $form).val(String(s.rpe)); }
    });
  }

  function buildProgresoForm(dia, ejercicio, defaultSeriesCount) {
    var hoy = new Date();
    var iso = hoy.toISOString().slice(0, 10);
    var $form = $('<form>').addClass('form-grid').attr('id', 'form-progreso');
    var $row1 = $('<div>').addClass('form-row');
    $row1.append('<label for="prog-fecha">Fecha</label>');
    $row1.append($('<input>').attr({ id: 'prog-fecha', type: 'date', required: true, value: iso }));
    var setsDefault = Math.max(1, parseInt(defaultSeriesCount || '1', 10) || 1);
    var $setsContainer = $('<div>').addClass('sets-list');
    renderSetRows($setsContainer, setsDefault);
    var $row4 = $('<div>').addClass('form-row');
    $row4.append('<label for="prog-notas">Notas (opcional)</label>');
    $row4.append($('<textarea>').attr({ id: 'prog-notas', rows: 3 }));
    var $actions = $('<div>').addClass('form-actions');
    var $cancel = $('<button>').addClass('btn btn-secondary').attr('type', 'button').text('Cancelar').on('click', window.closeModal || function(){});
    var $save = $('<button>').addClass('btn btn-primary').attr('type', 'submit').text('Guardar');
    $actions.append($cancel, $save);
    $form.append($row1, $setsContainer, $row4, $actions);
    return $form;
  }

  // Exportar helpers de progreso
  window.renderSetRows = renderSetRows;
  window.collectSeriesFromForm = collectSeriesFromForm;
  window.prefillSetsInForm = prefillSetsInForm;
  window.buildProgresoForm = buildProgresoForm;

})(window, jQuery);


