var room = require('../models/room/index.js');

module.exports = {

    getParam: function(req, res) {
        
        var myRoom = room.getRoom(req.params.token);

        if(myRoom != false) {
            if(! room.getRoom(req.params.token).isReady()){
                console.log("Welcome to room : ["+req.params.token+"]");
                myRoom.setName("Room : ["+req.params.token+"]");
                res.render('admin.ejs', {url: req.headers.host,
                                        token: req.params.token,
                                        error: null
              });
            }else{
              console.log("La room est déjà paramétrée.");
              res.render('admin.ejs', {url: null,
                                      token: null,
                                      error: "La room est déjà paramétrée."
              });
            }
        }else{
            console.log("La room n'existe pas.");
            res.render('admin.ejs', {url: null,
                                    token: null,
                                    error: "La room n'existe pas."
            });
        }
    }
};