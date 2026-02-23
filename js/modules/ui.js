(function (window, $) {
  'use strict';

  function formatDateDDMMYYYY(str) {
    if (!str || typeof str !== 'string') return str || '';
    var s = str.trim();
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:T(\d{1,2}):(\d{1,2}))?/);
    if (m) {
      var d = m[3].padStart(2, '0'), mo = m[2].padStart(2, '0'), y = m[1];
      var out = d + '/' + mo + '/' + y;
      if (m[4] != null && m[5] != null) { out += ' ' + m[4].padStart(2, '0') + ':' + m[5].padStart(2, '0'); }
      return out;
    }
    return s;
  }

  function showToast(message, type) {
    var $t = $('<div>').addClass('toast').addClass(type || '');
    
    // Para notificaciones de éxito, agregar un ícono de celebración
    if (type === 'success') {
      $t.html('<span class="material-symbols-outlined" style="margin-right: 8px; vertical-align: middle;">celebration</span>' + message);
    } else {
      $t.text(message);
    }
    
    $('#toast-container').append($t);
    setTimeout(function () { $t.fadeOut(200, function(){ $t.remove(); }); }, 4000); // Un poco más de tiempo para las notificaciones
  }

  function openModal(title, contentNode) {
    $('#modal .modal-content').removeClass('small');
    $('#modal-title').text(title || '');
    $('#modal-body').empty().append(contentNode);
    $('#modal').removeClass('is-hidden');
  }

  function closeModal() {
    $('#modal').addClass('is-hidden');
    $('#modal-body').empty();
  }

  window.showToast = showToast;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.formatDateDDMMYYYY = formatDateDDMMYYYY;

})(window, jQuery);


