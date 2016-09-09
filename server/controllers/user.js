var room = require('../models/room/index.js');

module.exports = {
    
    askRoom : function(req, res){
        res.render('access.ejs', { error: null });
    },
    
    getRoom: function(req, res) {
        
        var myRoom = room.getRoom(req.params.token);
    
        if(myRoom!= false) {
            if(room.getRoom(req.params.token).isOpen()){
                if(room.getRoom(req.params.token).isReady()){
                  console.log('user.js', "Welcome to room : ["+req.params.token+"]");
                  room.getRoom(req.params.token).setName("Room : ["+req.params.token+"]");
                  res.render('user.ejs', {url: req.headers.host,
                                        room: req.params.token,
                                        error: null
                  });
                }else{
                  console.log('user.js',"La room", req.params.token, "n'a pas encore configurée.");
                  res.render('user.ejs', {url: false,
                                        room: false,
                                        error: "La room n'a pas encore configurée."
                  });
                }
    
            }else{
              console.log('user.js',"La room", req.params.token, "n'est pas accessible.");
              res.render('user.ejs', {url: false,
                                    room: false,
                                    error: "La room n'est pas accessible."
              });
            }
        }else{
            console.log('user.js', 'La room', req.params.token, 'n existe pas.');
            res.render('user.ejs', {url: false,
                                  room: false,
                                  error: 'La room '+ req.params.token + ' n existe pas.'
            });
        }
    }
};