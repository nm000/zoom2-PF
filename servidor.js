const express = require('express');

const app = express();

const http = require('http').Server(app);

const io = require('socket.io')(http);

const { v4: uuidV4 } = require('uuid');

const { ExpressPeerServer } = require('peer');

const servidorPeer = ExpressPeerServer(http, {
  debug: true
});

app.set('view engine', 'ejs');

app.use(express.static('logic'));

app.use('/peerjs', servidorPeer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:sala', (req, res) => {
  res.render('sala', { salaId: req.params.sala })
} )

io.on('connection', socket => {
  socket.on('join-room', (salaId, usuarioId) => {
    socket.join(salaId);
    socket.to(salaId).emit('user-connected', usuarioId);
    console.log("Entraron a la sala")

    socket.on('message', (mensaje) => {
      io.to(salaId).emit('createMessage', mensaje)
    })

  })
})



http.listen(process.env.PORT || 3000); //localhost
