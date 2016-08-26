var room = require('../models/room/index.js');

module.exports = function(io) {

    io.on('connection', function (socket) {  
        // Socket de connexion d'un nouveau joueur.
        io.on('user', function (data, fn) {
            console.log('Inscription de : ' + data["pseudo"] + ' dans la room ' + data["room"]);
            var userToken = room.getRoom(data["room"]).memberJoin();
            // Si le user est valide, on l'ajoute sur la page de la room.
            if(userToken){
    
                //Sauvegarde du username et de la room dans la session
                io.username = data["pseudo"];
                io.room = data["room"];
                io.token = userToken;
                io.score = 0;
    
            //     socket.broadcast.emit('new-user-'+data["room"], {user : data["pseudo"],
            //                                                         usertoken : userToken,
            //                                                         nbUsers : room.getRoom( data["room"]).getMembers().length});
             }
    
            // if(! room.getRoom(data["room"]).notEnough()){
            //     socket.broadcast.emit('start-party-room-'+data["room"]);
            // }
    
            //Le token est retourné au client pour identifier les traitements
            fn({userToken:userToken});
        });
    });
};