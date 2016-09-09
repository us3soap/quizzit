module.exports = function(io) {
    
    var room = require('../models/room/index.js');
    var questionnaire = require('../models/questionnaire/index.js');
    var questions = require('../../resources/questions.json');

    io.on('connection', function (socket) {
    
        // Socket de connexion d'un nouveau joueur.
        socket.on('user', function (data, fn) {
            
            console.log('socket.js', 'Inscription de :', data.pseudo, 'dans la room', data.room);
            
            var userToken = room.getRoom(data.room).memberJoin();
            
            // Si le user est valide, on l'ajoute sur la page de la room.
            if(userToken){
                socket.username = data.pseudo;
                socket.room = data.room;
                socket.token = userToken;
                socket.score = 0;
                
                var _data = {
                    user : data.pseudo,
                    usertoken : userToken,
                    nbUsers : room.getRoom(data.room).getMembers().length
                };
    
                socket.broadcast.emit('new-user-'+data.room, _data);
            }
    
            if(! room.getRoom(data.room).notEnough()){
                console.log('socket.js', 'La room :', data.room, 'est prête à jouer');
                socket.broadcast.emit('start-party-room-'+data["room"]);
            }
            
            fn({userToken:userToken});
        });
    
        // Socket permettant l'administration de la salle.
        socket.on('param-room', function (data, fn) {
            
            console.log('socket.js', "Parametrage de la partie", data.room, ': nbUsers =>', data.nbUsersMax , ', nbQuestions =>', data.nbQuestions, ', timer =>', data.timerQuestion );
            
            var _room = room.getRoom(data["room"]);
            
            if(_room != false){
                _room.setReady();
                _room.open();
                
                //--Parametrage
                _room.setMaxNbMembers(data.nbUsersMax);
                _room.setMinNbMembers(data.nbUsersMax);
                _room.setTimerQuestion(data.timerQuestion);
                _room.setNbQuestions(data.nbQuestions);

                questionnaire.loadQuestionnaire(questions, data.room);
                
                var _data = {
                    nbUsersMax : data.nbUsersMax,
                    nbQuestions : data.nbQuestions,
                    timerQuestion : data.timerQuestion
                };
                
                socket.broadcast.emit('create-room-'+data.room, _data);
                
                fn({url: "/room/"+data["room"]});
            }else{
                fn(false);
            }
        });
    
        // Socket permettant le lancement de la partie.
        socket.on('start', function (data, fn) {
            
            console.log('socket.js', 'Debut de la partie : ' + data.room);
            
            room.getRoom(data.room).close();
            socket.broadcast.emit('cycle-question');
            
            fn(true);
        });
    
        // Socket d'écoute pour renvoyer une question aléa aux clients (index + user).
        socket.on('recup-question', function (data, fn) {
            
            var _questionnaire = questionnaire.getQuestionnaire(data.room);
            
            if(_questionnaire){
                
                var fluxQuestion = _questionnaire.getFluxQuestionAleatoire();
                socket.broadcast.emit('start-party-users-'+data.room, fluxQuestion);
                fn(fluxQuestion);
                
            } else {
                
                fn(false);
                
            }

        });
    
        socket.on('recolte-reponse', function (data, fn) {
            
            var _data = {
                nbPoint : questionnaire.getQuestionnaire(socket.room).checkResponse(data.id, data.reponse) ? 1 : 0,
                usertoken : socket.token
            };

            socket.broadcast.emit('maj-party-users-'+socket.room, _data);
            
            fn(true);
        });
    
        //demander l'affichage des boutons reload sur User.ejs
        socket.on('display-reload-party', function (data, fn) {
            console.log('socket.js', 'fin de partie : affichage des boutons reload pour la room ' + socket.room);
            socket.broadcast.emit('reload-party-');
            fn(true);
        });
        
        //reinitialiser la partie.
        socket.on('reloadParty', function (data, fn) {
            console.log("serveur.js : reinit de la room " + socket.room);
            console.log("displayAdmin = " + data["displayAdmin"]);
            //Dans tous les cas on reinitialise le questionnaire.
            questionnaire.getQuestionnaire(socket.room).reinitialiserQuestionsPosees();
            
            if (data["displayAdmin"]){ //On affiche l'admin pour parametrer une nouvelle partie.
                room.getRoom(socket.room).setWaiting();
                socket.broadcast.emit('reloading-room-'+socket.room);
            } else {                   //On relance directement une partie sans rien changer.
                socket.broadcast.emit('start-party-room-'+socket.room);
            }
            fn({room:socket.room});
        });
        
        //socket de deconnexion d'un joueur.
        socket.on('disconnect', function () {
            
            if(room.getRoom(socket.room) != false){
                room.getRoom(socket.room).memberLeave(socket.token);
    
                socket.broadcast.emit('user-left-'+socket.room, {
                    username: socket.username,
                    usertoken: socket.token,
                    nbUsers : room.getRoom(socket.room).getMembers().length
                });
            }
            
        });
    });
};