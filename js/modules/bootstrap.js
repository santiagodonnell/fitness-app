(function (window, $) {
  'use strict';

  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  $(function () {
    var $tabs = $('#tabs');
    var $filters = $('#filters-section');

    function resizeAssistant() {
      var $grid = $('#sec-asistente .assistant-grid');
      if (!$grid.length) return;
      var rectTop = $grid[0].getBoundingClientRect().top;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var available = Math.max(240, vh - rectTop - 30);
      $grid.css('height', available + 'px');
      $('#sec-asistente .chat').css('height', available + 'px');
      $('#sec-asistente .chat-history').css('height', available + 'px');
    }

    function activateByHash() {
      var hash = window.location.hash || '#sec-rutina';
      var $targetTab = $tabs.find('a.tab[href="' + hash + '"]');
      if ($targetTab.length) {
        $tabs.find('a.tab').removeClass('is-active');
        $targetTab.addClass('is-active');
        ['#sec-rutina','#sec-cardio','#sec-progresion','#sec-notas','#sec-asistente'].forEach(function(sel){ $(sel).addClass('is-hidden'); });
        $(hash).removeClass('is-hidden');
        if (hash === '#sec-rutina') { $filters.removeClass('is-hidden'); } else { $filters.addClass('is-hidden'); }
        if (hash === '#sec-asistente') { setTimeout(resizeAssistant, 0); }
      }
    }

    $tabs.on('click', 'a.tab', function (e) {
      e.preventDefault();
      var href = $(this).attr('href');
      if (href) { window.location.hash = href; }
    });
    $(window).on('hashchange', function(){
      activateByHash();
      resizeAssistant();
      var hash = window.location.hash || '#sec-rutina';
      if (hash === '#sec-asistente' && window.loadHistory) { window.loadHistory(); }
    });
    $(window).on('resize', resizeAssistant);
    activateByHash();
  });

})(window, jQuery);


