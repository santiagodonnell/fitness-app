(function (window, $) {
  'use strict';

  // Configuración del confeti
  var CONFETTI_CONFIG = {
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: [
      '#FF6B35', '#FF8C42', '#28A745', '#20C997', '#FFC107', '#FFCA2C', 
      '#6F42C1', '#E83E8C', '#FF1744', '#00BCD4', '#4CAF50', '#FF9800',
      '#9C27B0', '#F44336', '#2196F3', '#FFEB3B', '#795548', '#607D8B'
    ]
  };

  // Función para crear partículas de confeti
  function createConfettiParticle() {
    var colors = CONFETTI_CONFIG.colors;
    var color = colors[Math.floor(Math.random() * colors.length)];
    
    // Diferentes formas de confeti
    var shapes = ['square', 'circle', 'triangle', 'star'];
    var shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    return {
      x: Math.random() * window.innerWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * 4 + 3,
      size: Math.random() * 8 + 4, // Partículas más pequeñas: 4-12px en lugar de 8-20px
      color: color,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      shape: shape,
      opacity: 1,
      fadeSpeed: Math.random() * 0.015 + 0.003,
      glow: Math.random() > 0.5 // Algunas partículas tendrán brillo
    };
  }

  // Función para dibujar una partícula
  function drawParticle(ctx, particle) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation * Math.PI / 180);
    ctx.globalAlpha = particle.opacity;
    
    // Efecto de brillo para algunas partículas
    if (particle.glow) {
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    ctx.fillStyle = particle.color;
    
    switch (particle.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.lineTo(-particle.size / 2, particle.size / 2);
        ctx.lineTo(particle.size / 2, particle.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        drawStar(ctx, 0, 0, particle.size / 2, particle.size / 4, 5);
        ctx.fill();
        break;
      default: // square
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    }
    
    ctx.restore();
  }
  
  // Función para dibujar una estrella
  function drawStar(ctx, cx, cy, outerRadius, innerRadius, points) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var angle = (i * Math.PI) / points;
      var radius = i % 2 === 0 ? outerRadius : innerRadius;
      var x = cx + Math.cos(angle) * radius;
      var y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }

  // Función principal para lanzar confeti
  function launchConfetti() {
    // Crear canvas para el confeti
    var $canvas = $('<canvas>')
      .attr('id', 'confetti-canvas')
      .css({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      });
    
    $('body').append($canvas);
    
    var canvas = $canvas[0];
    var ctx = canvas.getContext('2d');
    
    // Ajustar tamaño del canvas
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    $(window).on('resize', resizeCanvas);
    
    // Crear partículas desde la parte superior de la pantalla
    var particles = [];
    for (var i = 0; i < CONFETTI_CONFIG.particleCount; i++) {
      var particle = createConfettiParticle();
      // Distribuir partículas en la parte superior de la pantalla
      particle.x = Math.random() * window.innerWidth;
      particle.y = -20 - Math.random() * 50; // Desde arriba de la pantalla
      particles.push(particle);
    }
    
    // Función de animación
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      var activeParticles = 0;
      
      particles.forEach(function(particle) {
        // Actualizar posición
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        
        // Aplicar gravedad
        particle.vy += 0.1;
        
        // Reducir opacidad gradualmente
        particle.opacity -= particle.fadeSpeed;
        
        // Dibujar partícula si está en pantalla y visible
        if (particle.y < canvas.height && particle.x > 0 && particle.x < canvas.width && particle.opacity > 0) {
          drawParticle(ctx, particle);
          activeParticles++;
        }
      });
      
      // Continuar animación si hay partículas activas
      if (activeParticles > 0) {
        requestAnimationFrame(animate);
      } else {
        // Limpiar cuando termine la animación
        $canvas.remove();
        $(window).off('resize', resizeCanvas);
      }
    }
    
    // Iniciar animación
    animate();
  }

  // Función para lanzar confeti desde una posición específica
  function launchConfettiFromElement($element) {
    var elementRect = $element[0].getBoundingClientRect();
    var centerX = elementRect.left + elementRect.width / 2;
    var centerY = elementRect.top + elementRect.height / 2;
    
    // Crear múltiples puntos de origen desde más arriba para un efecto más natural
    var origins = [
      { x: centerX, y: centerY - 100 }, // Punto central más arriba
      { x: centerX - 80, y: centerY - 120 }, // Izquierda arriba
      { x: centerX + 80, y: centerY - 120 }, // Derecha arriba
      { x: centerX - 60, y: centerY - 80 }, // Izquierda centro-arriba
      { x: centerX + 60, y: centerY - 80 }, // Derecha centro-arriba
      { x: centerX - 40, y: centerY - 140 }, // Izquierda más arriba
      { x: centerX + 40, y: centerY - 140 }  // Derecha más arriba
    ];
    
    // Crear canvas para el confeti
    var $canvas = $('<canvas>')
      .attr('id', 'confetti-canvas')
      .css({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      });
    
    $('body').append($canvas);
    
    var canvas = $canvas[0];
    var ctx = canvas.getContext('2d');
    
    // Ajustar tamaño del canvas
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    $(window).on('resize', resizeCanvas);
    
    // Crear partículas desde múltiples puntos de origen
    var particles = [];
    var particlesPerOrigin = Math.floor(CONFETTI_CONFIG.particleCount / origins.length);
    
    origins.forEach(function(origin, originIndex) {
      for (var i = 0; i < particlesPerOrigin; i++) {
        var particle = createConfettiParticle();
        particle.x = origin.x;
        particle.y = origin.y;
        // Variar la velocidad según el punto de origen para crear un efecto más natural
        particle.vx += (originIndex - 3) * 1.5;
        particle.vy += Math.random() * 2 - 1; // Velocidad vertical aleatoria
        particles.push(particle);
      }
    });
    
    // Agregar algunas partículas extra para completar el total
    while (particles.length < CONFETTI_CONFIG.particleCount) {
      var particle = createConfettiParticle();
      particle.x = centerX;
      particle.y = centerY - 100; // También desde arriba
      particles.push(particle);
    }
    
    // Función de animación
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      var activeParticles = 0;
      
      particles.forEach(function(particle) {
        // Actualizar posición
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        
        // Aplicar gravedad
        particle.vy += 0.1;
        
        // Reducir opacidad gradualmente
        particle.opacity -= particle.fadeSpeed;
        
        // Dibujar partícula si está en pantalla y visible
        if (particle.y < canvas.height && particle.x > 0 && particle.x < canvas.width && particle.opacity > 0) {
          drawParticle(ctx, particle);
          activeParticles++;
        }
      });
      
      // Continuar animación si hay partículas activas
      if (activeParticles > 0) {
        requestAnimationFrame(animate);
      } else {
        // Limpiar cuando termine la animación
        $canvas.remove();
        $(window).off('resize', resizeCanvas);
      }
    }
    
    // Iniciar animación
    animate();
  }

  // Exportar funciones
  window.launchConfetti = launchConfetti;
  window.launchConfettiFromElement = launchConfettiFromElement;

})(window, jQuery);
