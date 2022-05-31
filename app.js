const express = require('express');
const mongoose = require('mongoose');

var http = require("http");
var routesServer = require("./routes/serverRoutes");

//Create Main App
const app = express(); 
var server = http.createServer(app);
io = require('socket.io')(server);

//Connection to DB to retrieve messages. 
mongoose.connect('mongodb://localhost:27017/cmov-g13',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
//Handle of errors while connecting to the DB. 
mongoose.connection.on("error", (err) => {
    console.log("Monggose connection Error "+err.message);
});

//Models. 
require("./models/users");
require("./models/chatroom");
require("./models/message");

app.use(express.json());
app.use(express.urlencoded({encoded: true}));


app.use('/api/v1', routesServer);

//Socket.io implementation. 

//Connection event. 
io.on('connection', (socket) => {
    console.log('Usuario Conectado');
    socket.on('join', (uNickname) => {
            console.log(uNickname + " : Se ha unido al chat ");
            socket.broadcast.emit('Usuario se ha conectado al chat', uNickname + " : Se ha conectado ");
        });

//Message Detection event. 
    socket.on('messagedetection', (sNickname,messageContent) => {
           //log the message in console 
           console.log(sNickname+" : " +messageContent)
                  //create a message object 
          let  message = {"message":messageContent, "sNickname":sNickname}
           // send the message to all users including the sender  using io.emit() 
          io.emit('message', message )
          });

 //Disconnect event 
    socket.on('disconnect', function() {
            console.log(uNickname +' has left ')   
            socket.broadcast.emit( "userdisconnect" ,' user has left')        
        });
});


app.listen(3001, "0.0.0.0", () => {
    console.log("Hearing in port 3001");
});

//Handling of errors. 

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