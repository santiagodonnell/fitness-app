(function (window, $) {
  'use strict';

  function showLoader() { $('#loader').removeClass('is-hidden'); }
  function hideLoader() { $('#loader').addClass('is-hidden'); }

  function fetchData(params) {
    showLoader();
    return apiGetJSON(API.data, params || {}).always(hideLoader);
  }

  function applyFilters() {
    var params = {
      dia: ($('#filter-dia').val() || '').trim(),
      q: ($('#filter-buscar').val() || '').trim()
    };
    fetchData(params).done(function (data) {
      var dias = (data.rutina && data.rutina.dias) ? data.rutina.dias : {};
      window.renderRutina && renderRutina(dias);
      window.renderCardio && renderCardio(data.cardio || {});
      window.renderProgresion && renderProgresion(data.progresion || {});
      window.renderNotas && renderNotas(data.notas || {});
    }).fail(function () { window.showToast && showToast('No se pudieron aplicar los filtros', 'error'); });
  }

  $(function(){
    // Carga inicial
    fetchData({}).done(function (data) {
      var dias = (data.rutina && data.rutina.dias) ? data.rutina.dias : {};
      window.populateDiasSelect && populateDiasSelect(dias);
      window.renderRutina && renderRutina(dias);
      window.renderCardio && renderCardio(data.cardio || {});
      window.renderProgresion && renderProgresion(data.progresion || {});
      window.renderNotas && renderNotas(data.notas || {});
    }).fail(function () { window.showToast && showToast('Error al cargar datos iniciales', 'error'); });

    // Eventos de filtros
    $('#filter-dia').on('change', applyFilters);
    var debounceTimer;
    $('#filter-buscar').on('input', function(){ clearTimeout(debounceTimer); debounceTimer = setTimeout(applyFilters, 300); });
  });

  window.applyFilters = applyFilters;
  window.fetchData = fetchData;

})(window, jQuery);


