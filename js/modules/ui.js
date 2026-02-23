(function (window, $) {
  'use strict';

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
    // Asegurar que el modal no herede tamaños previos
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

})(window, jQuery);


