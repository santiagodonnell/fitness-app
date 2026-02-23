(function (window, $) {
  'use strict';

  var API = {
    data: 'api/data.php',
    progreso: 'api/progreso.php',
    chatHistory: 'api/chat_history.php',
    aiChat: 'api/ai_chat.php'
  };

  function apiGetJSON(url, data) {
    return $.ajax({ url: url, method: 'GET', data: data || {}, dataType: 'json', cache: false });
  }

  function apiSendJSON(url, method, payload) {
    return $.ajax({ url: url, method: method, data: JSON.stringify(payload || {}), contentType: 'application/json; charset=utf-8', dataType: 'json' });
  }

  window.API = API;
  window.apiGetJSON = apiGetJSON;
  window.apiSendJSON = apiSendJSON;

})(window, jQuery);


