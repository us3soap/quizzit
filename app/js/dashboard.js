/* global Vue*/
/* global io*/
/* global $*/
'use strict';
var socket = io.connect(GLOBAL.url);

var test = new Vue({
    el: '#content',
    data: {
        error : GLOBAL.error,
        players : [], //tableau des joueurs (token, username, points)
        nbUsersMax : '',
        nbUsersConnectes : 0,
        nbQuestions : '',
        pageQRCode :  '', //lien du QRcode (page admin-room ou room)
        timerQuestion : '',
        timerDebutPartie : 30,
        affichageExplication : false,
        affichageInfos : true,
        infos : '',
        affichageScore : false,
        affichageReponse1 : true, //gestion de l'animation pour afficher la bonne reponse
        affichageReponse2 : true, //gestion de l'animation pour afficher la bonne reponse
        affichageReponse3 : true, //gestion de l'animation pour afficher la bonne reponse
        affichageReponse4 : true, //gestion de l'animation pour afficher la bonne reponse
        tempsDeTransition : 8000, //temps entre affichage de la réponse et debut de la question suivante
        instructions : '', //Instructions afficher sur la page dashboard
        eventQuestion : '',
        eventTimerAvantDebutPartie : '',
        state: {
            loading : false,
            step : '' //waitParam, waitPlayer, waitGame, game, result
        },
        question: {} //tableau des questions (idquestion, question, reponse1, reponse2, reponse3, reponse4, good, explication)
    },
    ready: function() {
        
        this.pageQRCode = 'admin-room';
        this.state.loading = true;
        this.state.step = 'waitParam';

        this.instructions = 'Scanne ce QR Code pour parametrer la partie.',
        $('#content').show();
        
        var that = this;
        
        //socket ajout d'un joueur dans le salon
        socket.on('new-user-' + GLOBAL.token, function(data) {
            that.nbUsersConnectes = that.nbUsersConnectes + 1;
            that.players.push({token:data['usertoken'], username:data['user'],points:0}); //ajout d'un player
            that.players.splice(0,1);   //suppression d'un joueur "attente"
        }),
        
        //socket création d'une partie avec les params que l'utilisateur a saisi.
        socket.on('create-room-' + GLOBAL.token, function(data) {
            that.nbUsersMax = parseInt(data.nbUsersMax);
            that.nbQuestions = parseInt(data.nbQuestions);
            that.timerQuestion = parseInt(data.timerQuestion);

            for (var i = 1; i <= that.nbUsersMax ; i++) {
                that.players.push({token:'attente', username:'attente'});
            }
            that.pageQRCode = 'access-room';
            that.instructions = 'Scanne ce QR Code pour rejoindre la partie.';
            that.infos = 'Demarrage de la partie dans ' + that.timerDebutPartie + ' secondes';
            that.eventTimerAvantDebutPartie = setInterval(function () {
                if (that.timerDebutPartie == 0 ) {
                    clearInterval(that.eventTimerAvantDebutPartie);
                    that.affichageInfos = false;
                    that.players.splice(0,(that.nbUsersMax - that.nbUsersConnectes));
                    that.nbUsersMax = that.nbUsersConnectes;
                    
                    
                    that.state.step = 'waitPlay';
                    that.instructions = 'Tout le monde est la. Préparez vous !';
                    
                    setTimeout (function(){
                        socket.emit('start', {room : GLOBAL.token}, function (data) {
                            console.log("Démarrage partie");
                            that.cptQuestion = 0;
                            
                            //ici, une question durera xx secondes, paramétré par l'utilisateur, 10 secondes par défaut.
                            that.lancerIntervalQuestion();
                            //Je lance ma fonction en même temps que l'event
                            //car la première itération de mon event se fait au bon de 10 sec.
                            that.myGame();
                        });
                    }, 5000);
                } else {
                    that.timerDebutPartie = that.timerDebutPartie -1;
                    that.infos = 'Demarrage de la partie dans ' + that.timerDebutPartie + ' secondes';
                }
            }, 1000 );
            
        }),
        
        //socket lancement d'un partie nombre de joueur suffisant
        socket.on('start-party-room-' + GLOBAL.token, function(user) {
            
            that.state.step = 'waitPlay';
            that.instructions = 'Tout le monde est la. Préparez vous !';
            clearInterval(that.eventTimerAvantDebutPartie);
            that.affichageInfos = false;
            
            setTimeout (function(){
                socket.emit('start', {room : GLOBAL.token}, function (data) {
                    console.log("Démarrage partie");
                    that.cptQuestion = 0;
                    
                    //ici, une question durera xx secondes, paramétré par l'utilisateur, 10 secondes par défaut.
                    that.lancerIntervalQuestion();
                    //Je lance ma fonction en même temps que l'event
                    //car la première itération de mon event se fait au bon de 10 sec.
                    that.myGame();
                });
            }, 5000);
        }),
        
        //socket mise a jour score après reponse d'un utilisateur
        socket.on('maj-party-users-' + GLOBAL.token, function(data) {
            for (var i = 0; i < that.nbUsersMax ; i++) {
                if (that.players[i].token == data['usertoken']) {
                    that.players[i].points = that.players[i].points + parseInt(data['nbPoint']);
                }
            }
            
            console.log('maj-party-users', data);
            
            that.nbReponseRecu++;
            //si tout le monde a repondu alors transition et on passe à la question suivante.
            if (that.nbUsersMax==that.nbReponseRecu) {
                that.arreterIntervalQuestion();
                clearInterval(that.interval);
                
                that.animationReponses(that.question.good);
                //envoi au serveur fin du temps pour repondre à la question + cumul points sur les téléphones
                socket.emit('fin-temps-reponse', function (data) {});
                
                //relance question dans 6 secondes (après le recap des scores)
                if (that.cptQuestion < that.nbQuestions) {
                    setTimeout (function(){
                        that.lancerIntervalQuestion();
                        that.myGame();
                    },that.tempsDeTransition);
                } else {
                    setTimeout (function(){
                        that.state.step = 'result';
                        setTimeout (function(){
                            socket.emit('display-reload-party', {room : GLOBAL.token}, function (data) {});
                        },3000);
                    },that.tempsDeTransition);
                    
                }
            }
        })
    },
    methods: {
        /** 
         * Functions permettant de comptabiliser et recupérer les questions
         **/
        myGame: function() {
            var that = this;
            
            if (this.cptQuestion == this.nbQuestions) {
                this.arreterIntervalQuestion();
                this.state.step = 'result';
                
                setTimeout (function(){
                    socket.emit('display-reload-party', {room : GLOBAL.token}, function (data) {});
                },3000);
            } else if (this.cptQuestion % 5 == 0 && this.affichageScore) {
                this.arreterIntervalQuestion();
                this.affichageScore = false;
                this.state.step = 'result';
                setTimeout (function(){
                    //ici, une question durera xx secondes, paramétré par l'utilisateur, 10 secondes par défaut.
                    that.lancerIntervalQuestion();
                    that.myGame();
                },5000);
            } else {
                socket.emit('recup-question', {room : GLOBAL.token}, function (data) {
                    
                    that.affichageScore =true;
                    
                    that.nbReponseRecu = 0;
                    that.cptQuestion = that.cptQuestion + 1;
                    
                    console.log('affichage question', that.cptQuestion);
                    
                    that.question = data;
                    that.state.step = 'game';
                    
                    that.animationReponses('');
                    
                    clearInterval(that.interval);
                    
                    that.gererTimer();
                });
            }
        },
        
        /**
         * Function gérant l'animation des réponses.
         * @arg nomClass classe css a ajouter aux réponses
         * @arg bonneReponse div reponse qui ne doit pas prendre la classe css
         **/
        animationReponses : function (bonneReponse){
            
            if (bonneReponse == "reponse1") {
                this.affichageReponse2 =  false;
                this.affichageReponse3 =  false;
                this.affichageReponse4 =  false;
                this.affichageExplication =  true;
            } else if (bonneReponse == "reponse2") {
                this.affichageReponse1 =  false;
                this.affichageReponse3 =  false;
                this.affichageReponse4 =  false;
                this.affichageExplication =  true;
            } else if (bonneReponse == "reponse3") {
                this.affichageReponse2 =  false;
                this.affichageReponse1 =  false;
                this.affichageReponse4 =  false;
                this.affichageExplication =  true;
            } else if (bonneReponse == "reponse4") {
                this.affichageReponse2 =  false;
                this.affichageReponse3 =  false;
                this.affichageReponse1 =  false;
                this.affichageExplication =  true;
            } else {
                this.affichageReponse1 =  true;
                this.affichageReponse2 =  true;
                this.affichageReponse3 =  true;
                this.affichageReponse4 =  true;
                this.affichageExplication =  false;
            }
            
        },
        
        gererTimer : function () {
            // gestion du timer
            var $timelapsWrapper = document.querySelector('.canvas-wrapper'),
                $timelaps = document.querySelector('#timelaps'),
                timelapsCtx = $timelaps.getContext("2d");
        
            var timelapsH = $timelapsWrapper.offsetHeight,
                timelapsW = $timelapsWrapper.offsetWidth,
                timelapsCenter = timelapsW / 2;

            var r = timelapsW/2,
                x = 0,
                y = 0;
                
            var angle = -90;
            var totalTime = this.timerQuestion * 1000; //ms
            var tickInterval = 250;
            var step = tickInterval * 360 / totalTime;
            var tick = 0;
            var nextStep = 0;
            
            timelapsCtx.strokeStyle = "rgb(106, 150, 241)";
            timelapsCtx.lineWidth = 1;
            timelapsCtx.beginPath();
            angle = -90;
            tick = 0;
            timelapsCtx.clearRect(0, 0, timelapsW, timelapsH);
            var that = this;
            this.interval = setInterval(function () {
                nextStep = angle + step;
                
                while(angle < nextStep){
                    x = r + r*Math.cos(angle*(Math.PI/180));
                    y = r + r*Math.sin(angle*(Math.PI/180));
                    
                    timelapsCtx.moveTo(timelapsW/2, timelapsH/2);
                    timelapsCtx.lineTo(x,y);
                    timelapsCtx.stroke();
                    angle++;
                }
                
                tick += tickInterval;
                if (tick >= totalTime) {
                    console.log('stop temps de reponse ' + (tick/1000) + 's');
                    clearInterval(that.interval);

                    that.animationReponses(that.question.good);
                    //envoi au serveur fin du temps pour repondre à la question + cumul points sur les téléphones
                    socket.emit('fin-temps-reponse', function (data) {});
                }
            }, tickInterval);
        },
        
        lancerIntervalQuestion : function () {
            test.eventQuestion = setInterval(this.myGame, ((this.timerQuestion * 1000) + this.tempsDeTransition) );
        },
        
        arreterIntervalQuestion : function () {
            clearInterval(test.eventQuestion);
        }
    }
});