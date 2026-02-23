(function (window, $) {
  'use strict';

  function sortByDate(items) {
    var arr = Array.isArray(items) ? items.slice() : [];
    arr.sort(function(a,b){ return a.fecha > b.fecha ? 1 : -1; });
    return arr;
  }

  function epley1RM(peso, reps) {
    if (peso == null) return null;
    var r = reps == null ? 1 : Math.max(1, reps);
    return +(peso * (1 + r / 30)).toFixed(2);
  }

  function buildDatasets(items, maxSets, metric) {
    var datasets = [];
    for (var s = 1; s <= maxSets; s++) {
      var data = items.map(function(it){
        if (Array.isArray(it.series)) {
          var found = it.series.find(function(x){ return (x.n || 0) === s; }) || it.series[s-1];
          if (!found) return null;
          return metric === 'rm' ? epley1RM(found.peso, found.reps) : found.peso;
        }
        if (s === 1) { return metric === 'rm' ? epley1RM(it.peso, it.reps) : it.peso; }
        return null;
      });
      var hue = 210 + (s - 1) * 30;
      datasets.push({
        label: (metric === 'rm' ? '1RM' : 'Set') + ' ' + s,
        data: data,
        fill: false,
        borderColor: 'hsl(' + hue + ', 70%, 40%)',
        backgroundColor: 'hsl(' + hue + ', 70%, 60%)',
        tension: 0.2,
        pointRadius: 3
      });
    }
    return datasets;
  }

  function buildChartContent(dia, ejercicio) {
    var $wrap = $('<div>');
    $wrap.append($('<p>').addClass('subtle').text(dia + ' · ' + ejercicio));
    var $cw = $('<div>').addClass('chart-wrapper');
    var $canvas = $('<canvas>').attr('id', 'chart-progreso');
    $cw.append($canvas);
    $wrap.append($cw);
    var $selector = $('<div>').css({ display: 'flex', gap: '8px', marginTop: '8px' });
    var $pesoBtn = $('<button>').addClass('btn btn-secondary').text('Peso');
    var $rmBtn = $('<button>').addClass('btn btn-secondary').text('1RM (Epley)');
    $selector.append($pesoBtn, $rmBtn);
    $wrap.append($selector);

    apiGetJSON(API.progreso, { dia: dia, ejercicio: ejercicio }).done(function (res) {
      var items = sortByDate((res && res.items) ? res.items : []);
      var labels = items.map(function(it){ return it.fecha; });
      var maxSets = 0;
      items.forEach(function(it){ if (Array.isArray(it.series)) maxSets = Math.max(maxSets, it.series.length); else if (typeof it.peso !== 'undefined') maxSets = Math.max(maxSets, 1); });
      var datasets = buildDatasets(items, maxSets, 'peso');
      var ctx = document.getElementById('chart-progreso').getContext('2d');
      if (window.activeChart) { try { window.activeChart.destroy(); } catch (e) {} }
      window.activeChart = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: datasets }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'nearest', intersect: false }, scales: { y: { beginAtZero: false } } } });
      function rebuild(metric) { window.activeChart.data.datasets = buildDatasets(items, maxSets, metric); window.activeChart.update(); }
      $pesoBtn.on('click', function(){ rebuild('peso'); });
      $rmBtn.on('click', function(){ rebuild('rm'); });
    }).fail(function(){ window.showToast && showToast('No se pudo cargar el progreso', 'error'); });

    return $wrap;
  }

  function buildTablaContent(dia, ejercicio) {
    var $wrap = $('<div>');
    $wrap.append($('<p>').addClass('subtle').text(dia + ' · ' + ejercicio));
    var $tw = $('<div>').addClass('table-wrapper');
    var $table = $('<table>').addClass('tabla-progresion');
    $table.append('<thead><tr id="thead-row"><th>Fecha</th></tr></thead>');
    var $tbody = $('<tbody>');
    $table.append($tbody);
    $tw.append($table);
    $wrap.append($tw);

    apiGetJSON(API.progreso, { dia: dia, ejercicio: ejercicio }).done(function (res) {
      var items = sortByDate((res && res.items) ? res.items : []);
      var maxSets = 0;
      items.forEach(function(it){ if (Array.isArray(it.series)) maxSets = Math.max(maxSets, it.series.length); else if (typeof it.peso !== 'undefined') maxSets = Math.max(maxSets, 1); });
      var $theadRow = $table.find('#thead-row');
      for (var s = 1; s <= maxSets; s++) { $theadRow.append('<th>Set ' + s + ' (kg)</th>'); }
      $theadRow.append('<th>RPE</th><th>Descanso</th><th>Acciones</th><th>Notas</th>');
      if (!items.length) { var colspan = 1 + maxSets + 4; $tbody.append('<tr><td colspan="' + colspan + '">Sin registros</td></tr>'); return; }
      items.forEach(function(it){
        var $tr = $('<tr>');
        $tr.append($('<td>').text(it.fecha || ''));
        var rpeVals = []; var descansoVals = [];
        for (var s = 1; s <= maxSets; s++) {
          var peso = '';
          if (Array.isArray(it.series)) {
            var found = it.series.find(function(x){ return (x.n || 0) === s; }) || it.series[s-1];
            if (found && typeof found.peso !== 'undefined') { peso = found.peso + (found.reps != null ? ' (' + found.reps + 'r)' : ''); }
            if (found && found.rpe != null) { rpeVals.push('S' + s + ':' + String(found.rpe)); }
            if (found && found.descanso != null) { descansoVals.push('S' + s + ':' + String(found.descanso) + 's'); }
          } else if (typeof it.peso !== 'undefined' && s === 1) {
            peso = it.peso + (it.reps != null ? ' (' + it.reps + 'r)' : '');
          }
          $tr.append($('<td>').text(peso));
        }
        $tr.append($('<td>').text(rpeVals.join(' | ')));
        $tr.append($('<td>').text(descansoVals.join(' | ')));
        var $acciones = $('<td>');
        var $edit = $('<button>').addClass('btn btn-secondary btn-edit').attr('type', 'button').attr('aria-label', 'Editar registro del ' + (it.fecha || '')).text('Editar').data('id', it.id);
        var $del = $('<button>').addClass('btn btn-danger btn-del').attr('type', 'button').attr('aria-label', 'Eliminar registro del ' + (it.fecha || '')).text('Eliminar').data('id', it.id);
        $acciones.append($('<div>').addClass('acciones').append($edit, $del));
        $tr.append($acciones);
        $tr.append($('<td>').text(it.notas || ''));
        $tbody.append($tr);
      });
    }).fail(function(){ window.showToast && showToast('No se pudo cargar el progreso', 'error'); });

    return $wrap;
  }

  window.buildChartContent = buildChartContent;
  window.buildTablaContent = buildTablaContent;

})(window, jQuery);


