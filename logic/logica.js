const socket = io("/");
const docVideoGrid = document.getElementById('video-grid');
//console.log(docVideoGrid);
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    //port: 3000
    port: '443'
})

let streaming;
let usuarioID;

const miVideo = document.createElement('video');
miVideo.muted = true;

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    streaming = stream;
    aggStreaming(miVideo, stream);
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            aggStreaming(video, userVideoStream)
        })
    })

    socket.on("user-connected", usuarioId => {
        console.log("user connected " + usuarioId);
        setTimeout(function () {
            nuevoUsuarioConectado(usuarioId, stream);
        }, 1000)
    })

    let mensaje = $("input");

    $('html').keydown((e) => {
        if (e.which == 13 && mensaje.val().length !== 0) {
            console.log(mensaje.val());
            socket.emit('message', mensaje.val());
            mensaje.val('');
        }
    });

    socket.on('createMessage', mensaje => {
        console.log("El servidor mandó: " + mensaje);
        $("ul").append(`<li class="mensajes"><b>${usuarioID}:</b><br/>${mensaje}</li>`);
        barraScroll();
    })

})

socket.on('user-disconnected', usuarioId =>{
    if(peers[usuarioId]) {
        peers[usuarioId].close()
    }
})

myPeer.on('open', iD => {
    console.log("ID sala - " + SALA_ID)
    console.log("ID usuario - " + iD);
    usuarioID = iD;
    socket.emit('join-room', SALA_ID, iD);
})

const nuevoUsuarioConectado = (usuarioId, stream) => {
    console.log("usuario conectado - " + usuarioId)
    const call = myPeer.call(usuarioId, stream)
    const video = document.createElement('video')
    call.on('stream', videoUsuario => {
        aggStreaming(video, videoUsuario);
    })
    call.on('close', () =>{
        video.remove()
    })

    peers[usuarioId] = call;
}


const aggStreaming = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    docVideoGrid.append(video);
}

const barraScroll = () => {
    let scroll = $('.main__mensajes__ventana');
    scroll.scrollTop(scroll.prop("scrollHeight"));
}

const autoSilenciar = () => {
    console.log(streaming)
    const enabled = streaming.getAudioTracks()[0].enabled;
    if (enabled) {
        streaming.getAudioTracks()[0].enabled = false;
        setNoSilenciarMicrofono();
    } else {
        setSilenciarMicrofono();
        streaming.getAudioTracks()[0].enabled = true;
    }
}

const setNoSilenciarMicrofono = () => {
    const html = `<i class="fas fa-microphone-alt-slash" id="silenciar"></i> 
    <span>Hablar</span>`;
    document.querySelector('.main__silenciar__boton').innerHTML = html;
}

const setSilenciarMicrofono = () => {
    const html = `<i class="fas fa-microphone-alt"></i>
     <span>Silenciar</span>`;
    document.querySelector('.main__silenciar__boton').innerHTML = html;
}

const detenerVideo = () => {
    const enabled = streaming.getVideoTracks()[0].enabled;
    if (enabled) {
        streaming.getVideoTracks()[0].enabled = false;
        setMostrarVideo();
    } else {
        setDetenerVideo();
        streaming.getVideoTracks()[0].enabled = true;
    }
}

const setDetenerVideo = () => {
    const html = `<i class="fas fa-camera"></i>
    <span>Detener video</span>`
    document.querySelector('.main__video__boton').innerHTML = html;
}

const setMostrarVideo = () => {
    const html = `<i class="fas fa-video-slash" id="detener"></i>
    <span>Mostrar video</span>`
    document.querySelector('.main__video__boton').innerHTML = html;
}