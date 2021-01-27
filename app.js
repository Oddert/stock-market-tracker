require('dotenv').config()
var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    ejs           = require('ejs'),
    socketServer  = require('socket.io'),
    socketClient  = require('socket.io-client'),
    moment        = require('moment-timezone'),
    mongoose      = require('mongoose');

var Sublist       = require('./models/sublist');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

mongoose.connect(process.env.DATABASE);



app.get('/', function (req, res) {
  res.render('index');
});

app.get('/copy', function (req, res) {
  res.render('indexCopy');
});

app.get('/example', function (req, res) {
  res.render('example');
});

app.get('/basic', function (req, res) {
  res.render('basicline');
});

const PORT = process.env.PORT || 3000

var server = app.listen(PORT, function () {
  console.log("Server initialised on port " + PORT);
});



var socket = socketClient.connect('https://ws-api.iextrading.com/1.0/tops');

socket.on('message', message => console.log(message));

socket.on('connect', () => {
  socket.emit('subscribe', 'fb,aapl');
  // socket.emit('unsubscribe', 'agi+');
});

socket.on('disconnect', () => console.log('Disconnected.'));


var localio = socketServer(server);

var sublist = ['fb', 'aapl'];

function getList() {
  console.log('Get list called');
  Sublist.find({}, function (err, foundList) {
    if (err) {
      console.error(err);
    } else {
      if (Array.isArray(foundList[0].list)) sublist = foundList[0].list;
      else sublist = []
      console.log("Sublist updated to: ", sublist);
    }
  });
}

getList();

function updateList() {
  Sublist.remove({}, function (err) {
    if (err) {
      console.error(err);
    } else {
      Sublist.create({list: sublist}, function (err, createdList) {
        console.log('(80) Sublist Updated');
        console.log(createdList);
      });
    }
  });
}
//on server start -get list from db
//on add, overwrite list on db
//on remove overwrite list on db

localio.sockets.on('connection', function (localsocket) {

    console.log("New Connection");
    console.log('Broadcasting sublist: ', sublist);
    localsocket.emit('sublist', sublist.join());

    socket.on('message', data => {
      // console.log("Data recieved from IEX, broadcasting to clients");
      localsocket.broadcast.emit('tester', data);
    });

    localsocket.on('add', data => {
      if (!sublist.includes(data)) { sublist.push(data) }
      socket.emit('subscribe', data);
      console.log("(104) Sublist changed to add item: ", sublist);
      console.log("(105) Broadcasting ", data);
      localsocket.broadcast.emit('add', data);
      updateList();
    });

    localsocket.on('remove', data => {
      sublist = sublist.filter(each => each != data);
      socket.emit('unsubscribe', data);
      console.log("(113) Sublist changed to remove item: ", sublist);
      console.log("(114) Removing item: ", data);
      localsocket.broadcast.emit('remove', data);
      updateList();
    })

  }
);
