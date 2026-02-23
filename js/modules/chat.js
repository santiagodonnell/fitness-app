(function (window, $) {
  'use strict';

  // Render básico de markdown seguro para el chat
  function renderAssistant(md) {
    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    function formatInline(s) {
      var out = escapeHtml(s);
      out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
      out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return out;
    }
    var lines = String(md).split(/\r?\n/);
    var html = []; var inCode = false; var listType = null;
    function closeList(){ if (listType) { html.push(listType === 'ol' ? '</ol>' : '</ul>'); listType = null; } }
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      if (/^```/.test(raw)) { if (!inCode) { inCode = true; html.push('<pre><code>'); } else { inCode = false; html.push('</code></pre>'); } continue; }
      if (inCode) { html.push(escapeHtml(raw)); continue; }
      if (/^\s*$/.test(raw)) { closeList(); continue; }
      var h = raw.match(/^(#{1,6})\s+(.*)$/);
      if (h) { closeList(); var lvl = h[1].length; html.push('<h' + lvl + '>' + formatInline(h[2]) + '</h' + lvl + '>'); continue; }
      if (/^---+$/.test(raw)) { closeList(); html.push('<hr/>'); continue; }
      var m = raw.match(/^\s*[-*]\s+(.*)$/);
      if (m) { if (listType !== 'ul') { closeList(); html.push('<ul>'); listType = 'ul'; } html.push('<li>' + formatInline(m[1]) + '</li>'); continue; }
      m = raw.match(/^\s*\d+\.\s+(.*)$/);
      if (m) { if (listType !== 'ol') { closeList(); html.push('<ol>'); listType = 'ol'; } html.push('<li>' + formatInline(m[1]) + '</li>'); continue; }
      closeList(); html.push('<p>' + formatInline(raw) + '</p>');
    }
    closeList();
    return html.join('\n');
  }

  function appendMsg(role, text) {
    var $chatLog = $('#chat-log');
    var $msg = $('<div>').addClass('chat-msg').addClass(role);
    if (role === 'assistant') { $msg.append($('<div>').addClass('chat-bubble').html(renderAssistant(text))); }
    else { $msg.append($('<div>').addClass('chat-bubble').text(text)); }
    $chatLog.append($msg);
    $chatLog.scrollTop($chatLog.prop('scrollHeight'));
  }

  // Indicador de escritura del asistente
  var $typingMsg = null;
  function showAssistantTyping() {
    var $chatLog = $('#chat-log');
    var $msg = $('<div>').addClass('chat-msg').addClass('assistant').attr('data-typing', '1');
    var $bubble = $('<div>').addClass('chat-bubble');
    var $dots = $('<span>').addClass('typing-dots').append('<span></span><span></span><span></span>');
    $bubble.append($dots); $msg.append($bubble); $chatLog.append($msg);
    $chatLog.scrollTop($chatLog.prop('scrollHeight'));
    return $msg;
  }
  function hideAssistantTyping() { if ($typingMsg && $typingMsg.remove) { $typingMsg.remove(); } $typingMsg = null; }

  // Typewriter de respuestas del asistente
  var typewriterTimer = null;
  function typeAssistantMarkdown(fullText, opts) {
    var options = $.extend({ intervalMs: 15, chunkSize: 3 }, opts || {});
    var $chatLog = $('#chat-log');
    var $msg = $('<div>').addClass('chat-msg').addClass('assistant');
    var $bubble = $('<div>').addClass('chat-bubble');
    $msg.append($bubble); $chatLog.append($msg); $chatLog.scrollTop($chatLog.prop('scrollHeight'));
    if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
    var text = String(fullText || ''); var i = 0; var dfd = $.Deferred();
    typewriterTimer = setInterval(function(){ i = Math.min(i + options.chunkSize, text.length); var partial = text.slice(0, i); $bubble.html(renderAssistant(partial)); $chatLog.scrollTop($chatLog.prop('scrollHeight')); if (i >= text.length) { clearInterval(typewriterTimer); typewriterTimer = null; dfd.resolve(); } }, options.intervalMs);
    return dfd.promise();
  }

  function updateHistoryCount(n) { $('#history-count').text('(' + (n || 0) + ')'); }

  function loadHistory() {
    $.getJSON(API.chatHistory).done(function (res) {
      var $historyList = $('#history-list');
      $historyList.empty();
      var items = (res && res.items) ? res.items : [];
      updateHistoryCount(items.length);
      var list = items.slice().sort(function(a,b){ var ta = (a.updated_at || a.created_at || ''); var tb = (b.updated_at || b.created_at || ''); return ta < tb ? 1 : (ta > tb ? -1 : 0); });
      list.forEach(function(it, idx){
        var preview = (it.user || '').slice(0, 80);
        var $item = $('<div>').addClass('history-item').data('entry', it);
        var $row = $('<div>').css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' });
        var $txtWrap = $('<div>');
        var $preview = $('<div>').text(preview);
        var created = it.created_at || ''; var ts = '';
        try { ts = created ? (new Date(created)).toLocaleString() : ''; } catch (e) { ts = created.replace('T',' ').replace('Z',''); }
        var $date = $('<div>').addClass('history-date').text(ts);
        $txtWrap.append($preview, $date);
        var $trash = $('<button>').addClass('trash-btn').attr('type','button').html('<span class="material-symbols-outlined">delete</span>');
        $trash.on('click', function(e){ e.stopPropagation(); confirmDeleteItem(it.id); });
        $row.append($txtWrap, $trash);
        $item.append($row);
        $historyList.append($item);
        if (idx === 0 && window.nextHistoryShouldAnimate) { setTimeout(function(){ $item.addClass('is-new'); }, 0); }
      });
      window.nextHistoryShouldAnimate = false;
    });
  }

  function confirmModal(title, message, onConfirm) {
    var $content = $('<div>');
    $content.append($('<div>').addClass('panel-header').text(title));
    $content.append($('<p>').text(message));
    var $actions = $('<div>').addClass('form-actions');
    var $cancel = $('<button>').addClass('btn btn-secondary').attr('type','button').text('Cancelar').on('click', window.closeModal || function(){});
    var $ok = $('<button>').addClass('btn btn-danger').attr('type','button').text('Confirmar').on('click', function(){ (window.closeModal || function(){})(); onConfirm && onConfirm(); });
    $actions.append($cancel,$ok); $content.append($actions);
    window.openModal && openModal('Confirmación', $content);
  }

  function confirmDeleteItem(id){
    confirmModal('Eliminar elemento','¿Deseas eliminar este mensaje del historial?', function(){
      $.ajax({ url: API.chatHistory + '?id='+encodeURIComponent(id), method:'DELETE' })
        .done(function(){ loadHistory(); window.showToast && showToast('Elemento eliminado','success'); })
        .fail(function(){ window.showToast && showToast('No se pudo eliminar el elemento','error'); });
    });
  }

  $(function(){
    var $chatForm = $('#chat-form');
    var $chatInput = $('#chat-input');
    var $chatLog = $('#chat-log');
    var $chatSend = $('#chat-send');
    var activeThread = null; // arreglo de {role, content}
    var startingNewChat = false;
    var placeholderHistoryId = null;
    window.nextHistoryShouldAnimate = false;

    // Auto-grow hasta 6 líneas
    $chatInput.on('input', function () {
      this.style.height = 'auto';
      var max = parseFloat(getComputedStyle(this).lineHeight) * 6 + 16; // padding approx
      var next = Math.min(this.scrollHeight, max);
      this.style.height = next + 'px';
    });

    // Cargar historial sólo si estamos en la sección Asistente al iniciar
    if ((window.location.hash || '#sec-rutina') === '#sec-asistente') { loadHistory(); }

    // Click en item del historial
    $(document).on('click', '.history-item', function () {
      var it = $(this).data('entry'); if (!it) return;
      $chatLog.empty();
      if (Array.isArray(it.messages) && it.messages.length) {
        it.messages.forEach(function(m){ if (m && (m.role === 'user' || m.role === 'assistant') && m.content) { appendMsg(m.role, m.content); } });
      } else {
        if (it.user) appendMsg('user', it.user);
        if (it.assistant) appendMsg('assistant', it.assistant);
      }
      activeThread = [];
      if (Array.isArray(it.messages) && it.messages.length) {
        it.messages.forEach(function(m){ if (m && (m.role === 'user' || m.role === 'assistant') && m.content) { activeThread.push({ role: m.role, content: m.content }); } });
      } else {
        if (it.user) activeThread.push({ role: 'user', content: it.user });
        if (it.assistant) activeThread.push({ role: 'assistant', content: it.assistant });
      }
      startingNewChat = false;
      placeholderHistoryId = it.id;
    });

    // Nuevo chat: limpia el log y reinicia estado
    $('#chat-new').on('click', function(){ $chatLog.empty(); $chatInput.val('').trigger('input').focus(); startingNewChat = true; placeholderHistoryId = null; });

    // Limpiar historial (confirmación)
    $('#chat-clear').on('click', function(){ confirmModal('Limpiar historial','¿Deseas eliminar todo el historial de chat?', function(){ $.ajax({ url: API.chatHistory, method:'DELETE', data: JSON.stringify({clear:true}), contentType:'application/json' }).done(function(){ loadHistory(); window.showToast && showToast('Historial eliminado','success'); }).fail(function(){ window.showToast && showToast('No se pudo limpiar el historial','error'); }); }); });

    // Submit
    $chatForm.on('submit', function (e) {
      e.preventDefault();
      var text = ($chatInput.val() || '').trim(); if (!text) return;
      appendMsg('user', text);
      $chatInput.val(''); $chatInput.trigger('input');
      $chatSend.prop('disabled', true);
      function runAi(wasNew){
        $typingMsg = showAssistantTyping();
        $.ajax({ url: API.aiChat + '?insecure=1', method: 'POST', data: JSON.stringify({ message: text, context: activeThread || [] }), contentType: 'application/json; charset=utf-8', dataType: 'json' })
          .done(function (res) {
            if (res && res.ok) {
              hideAssistantTyping();
              typeAssistantMarkdown(res.reply || '').always(function(){ $chatSend.prop('disabled', false); });
              if (Array.isArray(activeThread)) { activeThread.push({ role: 'user', content: text }); activeThread.push({ role: 'assistant', content: res.reply || '' }); }
              if (wasNew && placeholderHistoryId) {
                $.ajax({ url: API.chatHistory + '?id=' + encodeURIComponent(placeholderHistoryId), method: 'DELETE' })
                  .always(function(){
                    $.ajax({ url: API.chatHistory, method: 'POST', data: JSON.stringify({ user_message: text, assistant_reply: res.reply || '' }), contentType: 'application/json; charset=utf-8', dataType: 'json' })
                      .done(function(respNew){ if (respNew && respNew.id) { placeholderHistoryId = respNew.id; } })
                      .always(function(){ loadHistory(); });
                  });
              } else {
                if (placeholderHistoryId) {
                  $.ajax({ url: API.chatHistory, method: 'PUT', data: JSON.stringify({ id: placeholderHistoryId, assistant_reply: res.reply || '' }), contentType: 'application/json; charset=utf-8', dataType: 'json' })
                    .always(function(){ loadHistory(); });
                } else {
                  $.ajax({ url: API.chatHistory, method: 'POST', data: JSON.stringify({ user_message: text, assistant_reply: res.reply || '' }), contentType: 'application/json; charset=utf-8' })
                    .always(function(){ $.getJSON(API.chatHistory).done(function (res2) { var items2 = (res2 && res2.items) ? res2.items : []; var last2 = items2.length ? items2[items2.length - 1] : null; if (last2) { placeholderHistoryId = last2.id; } }).always(function(){ loadHistory(); }); });
                }
              }
            } else { hideAssistantTyping(); appendMsg('assistant', 'No pude generar una respuesta ahora.'); $chatSend.prop('disabled', false); }
          })
          .fail(function (xhr) {
            hideAssistantTyping();
            if (xhr && xhr.status === 429) {
              var retry = 5;
              try { var data = JSON.parse(xhr.responseText || '{}'); if (data && data.retry_after) retry = parseInt(data.retry_after, 10) || retry; } catch (e) {}
              window.showToast && showToast('Se alcanzó el límite de peticiones. Intenta en ' + retry + 's.', 'error');
              setTimeout(function () { $chatSend.prop('disabled', false); }, retry * 1000);
              return;
            }
            appendMsg('assistant', 'Hubo un error al contactar al asistente.');
            $chatSend.prop('disabled', false);
          });
      }

      if (startingNewChat) {
        var wasNew = true;
        $.ajax({ url: API.chatHistory, method: 'POST', data: JSON.stringify({ user_message: text }), contentType: 'application/json; charset=utf-8', dataType: 'json' })
          .done(function(resp){ if (resp && resp.id) { placeholderHistoryId = resp.id; } window.nextHistoryShouldAnimate = true; loadHistory(); })
          .always(function(){ startingNewChat = false; runAi(wasNew); });
      } else {
        if (Array.isArray(activeThread) && activeThread.length && placeholderHistoryId) {
          $.ajax({ url: API.chatHistory, method: 'PUT', data: JSON.stringify({ id: placeholderHistoryId, user_message: text }), contentType: 'application/json; charset=utf-8', dataType: 'json' })
            .always(function(){ runAi(false); });
        } else { runAi(false); }
      }
    });
  });

  // Exponer para app.js
  window.loadHistory = loadHistory;

})(window, jQuery);


