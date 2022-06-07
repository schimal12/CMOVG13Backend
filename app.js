const { info } = require('console');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//Documentation for Rooms

io.on('connection', (socket) => {
  console.log("User connecting");
  socket.on('join', (uNickname, roomname) => {
    console.log(uNickname +": has joined the chat in the room "+roomname);
    socket.join(roomname);
    console.log("Current rooms of "+socket+" "+socket.rooms);
    var message = {"message": uNickname}
    io.to(roomname).emit("userconnected",message);
  });

  socket.on("messageemit", (uNickname, messageText, roomname) => {
    console.log(uNickname+": "+messageText);
    var message = {"message": messageText, "uNickname":uNickname};
    io.to(roomname).emit("message",message);
  });

  socket.on("listrooms", () => {
    console.log("Listing the rooms");
    var rooms = socket.rooms;
    console.log(rooms);
    io.emit("thisareyourrooms",rooms);
  });

});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(7000,"0.0.0.0", () => {
  console.log('listening server on *:7000');
});


app.listen(3001, "0.0.0.0", () => {
     console.log("Hearing APP in port 3001");
 });

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

// Handling of errors. 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
     var err = new Error('Not Found');
     err.status = 404;
     next(err);
   });

   // develoment error handler
   // will print stacktrace
   if (app.get('env') === 'development') {
     app.use(function(err, req, res, next) {
       res.status(err.status || 500);
         console.log(err);
         res.render('error', {  message: err.message, error: {} }); //Avoid printing the errors in the browser. 
     });
   }
  
   // production error handler
   // no stacktraces leaked to user
   app.use(function(err, req, res, next) {
     res.status(err.status || 500);
     res.render('error', {
       message: err.message,
       error: {}
     });
   });

module.exports = app; 