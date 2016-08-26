var room = require('../models/room/index.js');

module.exports = {

    createRoom: function(req, res) {
        
        //Création d'une nouvelle room
        var token = room.newRoom();
        var myRoom = room.getRoom(token);
        myRoom.open();
    
        res.render('dashboard.ejs', {url: req.headers.host,
                                token: token,
                                ready2play: myRoom.isReady()
        });
        
    },
};