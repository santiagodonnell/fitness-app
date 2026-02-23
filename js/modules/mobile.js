(function ($) {
  'use strict';

  // Elementos del menú móvil
  const $menuToggle = $('#menu-toggle');
  const $mobileNav = $('#mobile-nav');
  const $mobileNavOverlay = $('#mobile-nav-overlay');
  const $mobileNavClose = $('#mobile-nav-close');
  const $mobileTabs = $('.mobile-tab');

  // Función para abrir el menú móvil
  function openMobileNav() {
    $mobileNav.addClass('is-active');
    $mobileNavOverlay.addClass('is-active');
    $('body').addClass('nav-open');
  }

  // Función para cerrar el menú móvil
  function closeMobileNav() {
    $mobileNav.removeClass('is-active');
    $mobileNavOverlay.removeClass('is-active');
    $('body').removeClass('nav-open');
  }

  // Event listeners
  $menuToggle.on('click', function(e) {
    e.preventDefault();
    openMobileNav();
  });

  $mobileNavClose.on('click', function(e) {
    e.preventDefault();
    closeMobileNav();
  });

  $mobileNavOverlay.on('click', function(e) {
    if (e.target === this) {
      closeMobileNav();
    }
  });

  // Cerrar menú con la tecla Escape
  $(document).on('keydown', function(e) {
    if (e.key === 'Escape' && $mobileNav.hasClass('is-active')) {
      closeMobileNav();
    }
  });

  // Event listener para tabs móviles
  $mobileTabs.on('click', function(e) {
    e.preventDefault();
    const href = $(this).attr('href');
    if (href) {
      window.location.hash = href;
    }
    // Cerrar menú después de hacer clic
    closeMobileNav();
  });

  // Sincronizar estado activo basado en el hash de la URL
  function syncActiveState() {
    const hash = window.location.hash || '#sec-rutina';
    const $targetTab = $(`.tab[href="${hash}"]`);
    const $targetMobileTab = $(`.mobile-tab[href="${hash}"]`);
    
    if ($targetTab.length) {
      // Actualizar tabs de escritorio
      $('.tab').removeClass('is-active');
      $targetTab.addClass('is-active');
      
      // Actualizar tabs móviles
      $('.mobile-tab').removeClass('is-active');
      $targetMobileTab.addClass('is-active');
    }
  }

  // Escuchar cambios en el hash de la URL
  $(window).on('hashchange', function() {
    syncActiveState();
  });

  // Inicializar estado activo al cargar la página
  $(document).ready(function() {
    syncActiveState();
  });

})(jQuery);
