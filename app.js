const { info } = require('console');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger 	   = require('morgan');
const router 	= express.Router();
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Rooms =  [];


//Documentation for Rooms
io.on('connection', (socket) => {


  socket.on('join', (uNickname, roomname) => {
    console.log(uNickname +": has joined the chat in the room "+roomname);
    socket.join(roomname);
    var message = {"message": uNickname}
    //Create Rooms.
    //Create Room if it doesn't exist. 
    if(Rooms.length == 0){
      console.log("Creating first room");
      const room = new Room(roomname);
      var tmpUser = {socket: socket, username: uNickname};
      room.addUser(tmpUser);
      Rooms.push(room);
      console.log("Room name "+roomname+" User: "+uNickname);
    }else{
      //Search in the Rooms if there is a room with name "roomname". 
      const existance = Rooms.find(room => room.name == roomname);
      if(typeof existance !== 'undefined' && existance !== null){
        //There's already a Room, do nothing. 
        console.log("This Room already exists, do nothing"); 
        var tmpUser = {socket: socket, username: uNickname};
        var currentUsers = existance.users;
        const searchUser = currentUsers.findIndex((user) => user.socket == socket); 
        if(typeof searchUser !== 'undefined' && searchUser !== null){
          existance.addUser(tmpUser);
        }else{
          console.log("El usuario "+tmpUser+ " ya se encuentra en el rooom "+roomname);
        }
        console.log("Room name "+existance.name +" User: "+existance.users.toString());
      }else{
        //There is no Room. 
        const room = new Room(roomname);
        var tmpUser = {socket: socket, username: uNickname};
        room.addUser(tmpUser);
        Rooms.push(room);
        console.log("Room name "+ roomname +" User: "+ room.users.toString());
      }
    }
    console.log("Current rooms of "+socket+" "+Array.from((socket.rooms).values()));
    io.to(roomname).emit("userconnected",message);
  });


  socket.on("messageemit", (uNickname, messageText, roomname) => {
    console.log(uNickname+": "+messageText);
    var message = {"message": messageText, "uNickname":uNickname};
    //Adding Messages to the Room. 
    //1) Checking if the Room exists (It should ...)
    const existance = Rooms.find(room => room.name == roomname);
    if(typeof existance !== 'undefined' && existance !== null){
      //2) Create Message 
      const message = new Message(messageText, uNickname);
      existance.addMessage(message);
    }else{
      console.log("There is an Error");
    }
    io.to(roomname).emit("message",message);
  });




  socket.on("listrooms", () => {
    console.log("Listing the rooms");
    var roomTmp = [];
    Rooms.forEach(function (room) {
      roomTmp.push(room.name);
    });
    console.log(roomTmp);
    socket.emit("thisareyourrooms",roomTmp);
  });


  socket.on("verifyOldMessages", (roomname) => {
    console.log("Verifying old messages");
    //Find the room where the user is logging in. 
    const existance = Rooms.find(room => room.name == roomname);
    if(typeof existance !== 'undefined' && existance !== null){
      var messageSet = existance.messages;
      var setMessagesRoom = [];
      messageSet.forEach(function (message) {
        let messageU = {"username":message.user,"message":message.buffer};
        console.log("Ex: "+messageU);
        setMessagesRoom.push(messageU);
      });
      console.log("Messages for the room "+roomname);
      setMessagesRoom.forEach(function (message){
        console.log(message.username+ ": "+message.message);
      })
    }else{
      console.log("Error while creating the room");
    }    
    socket.emit("updatingMessages",setMessagesRoom);
  });
});

server.listen(7000,"0.0.0.0", () => {
  console.log('listening server on *:7000');
});

app.use(bodyParser.json());
app.use(logger('dev'));

require('./routes/serverRoutes')(router);
app.use('/api/v1', router);

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


   // Classes of Objects. 

   class Room {
    constructor(fname) {
      this.name = fname;
      this.messages = [];
      this.users = []
    }
    addMessage(message){
      this.messages.push(message);
    }
    addUser(user){
      this.users.push(user)
    }
    printElements(){
      return this.name + " " + this.users.toString();
    }
  }
  
  class Message { 
    constructor(buffer, user) {
     this.buffer = buffer; 
     this.user = user;
    }
    printElements(){
      return this.user + " " + this.buffer;
    }
  }

module.exports = app; 