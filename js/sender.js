const ws = new WebSocket('ws://77.222.38.116:3000');

let localStream;
let localConnection;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };
// Получение медиапотока с вебкамеры
navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 1280, height: 720 } })
    .then(stream => {
        document.getElementById('localVideo').srcObject = stream;
        localStream = stream;
        startConnection();
    })
    .catch(error => console.error('Ошибка доступа к медиа: ', error));

const configuration = {

        "iceServers": [{ "urls": "stun:stun.1.google.com:19302" }]
};
// Функция для начала процесса подключения
function startConnection() {
    localConnection = new RTCPeerConnection(configuration);

    // Добавление треков в соединение
    localStream.getTracks().forEach(track => {
        localConnection.addTrack(track, localStream);
    });

    // Обработка кандидатов ICE
    localConnection.onicecandidate = function(event) {
        if (event.candidate) {
            sendMessage({type: 'candidate', candidate: event.candidate});
        }
    };

    // Создание оффера и отправка через WebSocket
    localConnection.createOffer(offerOptions)
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => sendMessage({type: 'offer', offer: localConnection.localDescription}));
}

// Функция для отправки сообщений через WebSocket
function sendMessage(message) {
    //console.log(message)
    ws.send(JSON.stringify(message));
}

ws.onmessage = async function(message) {
    // const data = JSON.parse(message.data);
    const text = await message.data.text(); // Преобразуем Blob в текст
    const data = JSON.parse(text);
    console.log(data)
    switch(data.type) {
        case 'answer':
            handleAnswer(data.answer);
            break;
        case 'candidate':
            handleCandidate(data.candidate);
            break;
        // Другие типы сообщений могут быть обработаны здесь
    }
};

function handleAnswer(answer) {
    localConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleCandidate(candidate) {
    localConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
