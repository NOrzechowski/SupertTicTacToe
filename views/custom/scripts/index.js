$(document).ready(function() {
     var setGamePiece = false;
     var socket = io();
     socket.on('clientConnected', function(msg){
	console.log("CLIENT CONNECTED: " + msg);
     });
     var gamePiece = String($.cookie('piece'));

     socket.on('moved',function(data){
    	var boxId = data.position + "-box";
	//TODO: based on location need to grey out apporpriate squares
	var locationId = "#" + data.position + "-" + data.x + data.y;
	if (!$(locationId).hasClass('o') && !$(locationId).hasClass('x')){
		if(gamePiece == 'x'){
			$(locationId).addClass('o');
		}else{
			$(locationId).addClass('x');
		}
	}
    });
    

    $('.gameAction > div').click(function(){
	var idStr = $(this).attr('id').toString();
	var x = idStr.substring(3,4);
	var y = idStr.substring(4,5);
	var loc = idStr.substring(0,2);
	var locationId = "#" + loc  + "-" + x + y;
	$(locationId).addClass(gamePiece);
	var box =  loc + "-box";
	var boxDiv = document.getElementById(box);
	$("#" + box).addClass("overlay");
	console.log("clicked on : " + locationId);
	socket.emit('move', {position:loc,x:x,y:y});
    });

    //TODO: need to write a function which checks three in a rows
    //TODO: write a function to save moves to a database to potentially apply ML to?? Also need to save whether the user won or not
})
