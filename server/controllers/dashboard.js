var room = require('../models/room/index.js');

module.exports = {

    createRoom: function(req, res) {
        
        //Création d'une nouvelle room
        var token = room.newRoom();
        var myRoom = room.getRoom(token);
        myRoom.open();
    
        res.render('dashboard.ejs', {url: req.headers.host,
                                token: token,
                                ready2play: myRoom.isReady(),
                                error: null
        });
        
    },
    
    getRoom: function(req, res) {
        var myRoom = room.getRoom(req.params.token);
        if(myRoom){
            res.render('dashboard.ejs', {url: req.headers.host,
                                token: req.params.token,
                                ready2play: myRoom.isReady(),
                                error: null
            });    
        } else {
            res.render('dashboard.ejs', {url: req.headers.host,
                                token: req.params.token,
                                ready2play: false,
                                error: 'La salle demandée est introuvable'
         });
        }

        
    }
};