module.exports = function(io) {
    
    var room = require('../models/room/index.js');
    var questionnaire = require('../models/questionnaire/index.js');
    var questions = require('../../resources/questions.json');

    io.on('connection', function (socket) {
    
        // Socket de connexion d'un nouveau joueur.
        socket.on('user', function (data, fn) {
            console.log('Inscription de : ' + data["pseudo"] + ' dans la room ' + data["room"]);
            var userToken = room.getRoom(data["room"]).memberJoin();
            // Si le user est valide, on l'ajoute sur la page de la room.
            if(userToken){
    
                //Sauvegarde du username et de la room dans la session
                socket.username = data["pseudo"];
                socket.room = data["room"];
                socket.token = userToken;
                socket.score = 0;
    
                socket.broadcast.emit('new-user-'+data["room"], {user : data["pseudo"],
                                                                    usertoken : userToken,
                                                                    nbUsers : room.getRoom( data["room"]).getMembers().length});
            }
    
            if(! room.getRoom(data["room"]).notEnough()){
                socket.broadcast.emit('start-party-room-'+data["room"]);
            }
    
            //Le token est retourné au client pour identifier les traitements
            fn({userToken:userToken});
        });
    
        // Socket permettant l'administration de la salle.
        socket.on('param-room', function (data, fn) {
            if(room.getRoom(data["room"]) != false){
                room.getRoom(data["room"]).setReady();
                room.getRoom(data["room"]).open();
                //--Parametrage
                room.getRoom(data["room"]).setMaxNbMembers(data["nbUsersMax"]);
                room.getRoom(data["room"]).setMinNbMembers(data["nbUsersMax"]);
                room.getRoom(data["room"]).setTimerQuestion(data["timerQuestion"]);
                
                //--Load questions si l'utilisateur en a saisi
                questionnaire.loadQuestionnaire(questions, data["room"]);
                
                socket.to('/'+data["room"]).emit('create-room-'+data["room"], {nbUsersMax : data["nbUsersMax"],
                                                                        nbQuestions : data["nbQuestions"],
                                                                        timerQuestion : data["timerQuestion"]});
                                                                        
                fn({url: "/room/"+data["room"]});
            }else{
                fn(false);
            }
        });
    
        // Socket permettant le lancement de la partie.
        socket.on('start', function (data, fn) {
            console.log('Debut de la party : '+data["room"]);
            room.getRoom(data["room"]).close();
            socket.broadcast.emit('cycle-question');
            fn(true);
        });
    
        // Socket d'écoute pour renvoyer une question aléa aux clients (index + user).
        socket.on('recup-question', function (data, fn) {
            var fluxQuestion = questionnaire.getQuestionnaire(data["room"]).getFluxQuestionAleatoire();
            socket.broadcast.emit('start-party-users-'+data["room"], fluxQuestion);
            fn(fluxQuestion);
        });
    
        socket.on('recolte-reponse', function (data, fn) {
            var point = 0;
            if(questionnaire.getQuestionnaire(socket.room).checkResponse(data["id"], data["reponse"])){
                point = 1;
            }
            socket.broadcast.emit('maj-party-users-'+socket.room, {nbPoint : point, usertoken : socket.token});
            fn(true);
        });
    
        //demander l'affichage des boutons reload sur User.ejs
        socket.on('display-reload-party', function (data, fn) {
            console.log("serveur.js : fin de partie : affichage des boutons 'reload' pour la room " + socket.room);
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