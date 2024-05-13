const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

console.log('Сервер запущен на порту 3000');

wss.on('connection', function connection(ws) {
  console.log('Новое соединение установлено');

  ws.on('message', function incoming(message) {
    //console.log(`Получено сообщение: ${message}`);
    // Простой пересыл сообщений всем подключенным клиентам
    wss.clients.forEach(async function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
        
        //client.send(message);
        console.log(`Переслано сообщение: ${message}`);
        //console.log('Сообщение было переслано другим клиентам');
      }
    });
  });

  ws.on('close', function close() {
    console.log('Соединение закрыто');
  });

  ws.on('error', function error(err) {
    console.error(`Произошла ошибка: ${err.message}`);
  });
});

wss.on('error', function error(err) {
  console.error(`Ошибка на сервере: ${err.message}`);
});
