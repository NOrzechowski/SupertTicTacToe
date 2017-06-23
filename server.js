'use strict';
const _ = require('underscore');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const views = path.join(__dirname, '/views');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
var users = [] 
app.set('views',views);
app.engine('handlebars',exphbs());
app.set('view engine', 'handlebars');
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/custom', express.static(__dirname + '/views/custom'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
      extended: true
}));
const server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
app.get('/', function(req,res){
        if(req.cookies['metadata'] && req.cookies['metadata'].persist == 'on'){	
	      	res.render('game',{users:users});
	}else{
		res.sendFile(INDEX);
	}
});
const io = socketIO(server);
io.on('connection', (socket) => {
  	  io.emit('new_client', 'New Connection');
    	  console.log('Client connected.');
	  //TODO: need to save move info and also verify whose turn it use
	  socket.on('move',function(data){
	  	var emitData = {position:data.position, x:data.x,y:data.y};
		io.emit('moved',emitData);
	  });
	  socket.on('disconnect', function(req,res){ 
		console.log("logging off: " + JSON.stringify(req));
	  });
});
var gamePieceToggle = false;
var numPlayers = 0;
app.post('/login',function(req,res){
	var username = req.body.username;
	var rememberMe = req.body.checkbox;
	if (numPlayers < 2 && !_.contains(users,username)){
	    numPlayers++;	  
	    users.push(username);
	    res.cookie('metadata',{username:username,persist:rememberMe});
	    res.render('game',{users:users});
	    if(gamePieceToggle){
		    res.cookie('piece',"x");
		    gamePieceToggle = false;
	    }else{
		    res.cookie('piece',"o");
		    gamePieceToggle = true;
	    }
	}else if(_.contains(users,username)){
	    //Handles the case if they close the tab and come back to game
	    //TODO need to keep a saved state of game server side...
	    res.render('game',{users:users});
	}else{
		res.sendFile(INDEX);
		//TODO send error message saying two players are already in a game
	}
});

app.get('/logoff',function(req,res){
	var username = req.cookies['metadata'].username;
	if(_.contains(users,username)){
		users.splice(users.indexOf(username));
	}
	res.cookie('metadata',null);
	res.sendFile(INDEX);
});
