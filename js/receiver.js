const ws = new WebSocket('ws://77.222.38.116:3000');

let localConnection;
const configuration = {

    "iceServers": [{ "urls": "stun:stun.1.google.com:19302" }]
};
// Функция для начала процесса подключения
function startConnection() {
    //console.log('Начало подключения');
    localConnection = new RTCPeerConnection(configuration);
    //
    // localConnection.addEventListener('track', gotRemoteStream);
    
    // function gotRemoteStream(e){
    //     if (remoteVideo.srcObject !== e.streams[0]) {
    //         console.log('тест трэк аддэвент', e.streams[0])
    //         remoteVideo.srcObject = e.streams[0];
    //       }
    // }
    //
    // Обработчик трека, полученного через WebRTC
    localConnection.ontrack = function(event) {
        //console.log('Получен трек через WebRTC');
        if (event.streams && event.streams[0]) {
            //console.log(event.streams[0])
            document.getElementById('remoteVideo').srcObject = event.streams[0];
        }
    };

    // Обработка кандидатов ICE
    localConnection.onicecandidate = function(event) {
        //console.log('Обработка кандидата ICE');
        if (event.candidate) {
            //console.log(`Отправка кандидата ICE: ${event.candidate.candidate}`);
            sendMessage({type: 'candidate', candidate: event.candidate});
        }
    };

    // Создание оффера не требуется, так как этот клиент является приемником
}

// Функция для отправки сообщений через WebSocket
function sendMessage(message) {
    //console.log(`Отправка сообщения через WebSocket: ${JSON.stringify(message)}`);
    ws.send(JSON.stringify(message));
}

ws.onmessage = async function(message) {
    //console.log(`Получено сообщение через WebSocket: ${message.data}`);
    //const data = message.data;
    const text = await message.data.text(); // Преобразуем Blob в текст
    const data = JSON.parse(text);
    console.log(data)
    //const data = JSON.parse(message.data);

    switch(data.type) {
        case 'offer':
            //console.log('Обработка предложения (offer)');
            handleOffer(data.offer);
            break;
        case 'candidate':
            //console.log('Обработка кандидата ICE');
            handleCandidate(data.candidate);
            break;
        // Другие типы сообщений могут быть обработаны здесь
    }
};

function handleOffer(offer) {
    //console.log('Установка удаленного описания из предложения');
    localConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => {
            //console.log('Создание ответа');
            return localConnection.createAnswer();
        })
        .then(answer => {
            //console.log('Установка локального описания из ответа');
            return localConnection.setLocalDescription(answer);
        })
        .then(() => {
            //console.log('Отправка ответа');
            sendMessage({type: 'answer', answer: localConnection.localDescription});
        });
}

function handleCandidate(candidate) {
    //console.log(`Добавление кандидата ICE: ${candidate.candidate}`);
    localConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Начинаем подключение при загрузке страницы
window.onload = () => {
    //console.log('Страница загружена. Начинаем подключение.');
    startConnection();
};
