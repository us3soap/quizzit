/* global Vue*/
/* global io*/
/* global $*/
'use strict';
var socket = io.connect(GLOBAL.url);

new Vue({
    el: '#content',
    data: {
        error : GLOBAL.error,
        players : [], //tableau des joueurs (token, username, points)
        nbUsersMax : '',
        nbQuestions : '',
        pageQRCode :  '', //lien du QRcode (page admin-room ou room)
        timerQuestion : '',
        affichageReponse1 : true, //gestion de l'animation pour afficher la bonne reponse
        affichageReponse2 : true,
        affichageReponse3 : true,
        affichageReponse4 : true,
        tempsDeTransition : 6000, //temps entre affichage de la réponse et debut de la question suivante
        instructions : '', //Instructions afficher sur la page dashboard
        state: {
            loading : false,
            step : '', //waitParam, waitPlayer, waitGame, game, result
            result : ''
        },
        question: {} //tableau des questions (idquestion, question, reponse1, reponse2, reponse3, reponse4, good, explication)
    },
    ready: function() {
        
        this.pageQRCode = 'admin-room';
        this.state.loading = true;
        this.state.step = 'waitParam';
        //this.state.result = 'reponse';
        this.state.result = 'score';
        this.instructions = 'Scanne ce QR Code pour parametrer la partie.',
        $('#content').show();
        
        var that = this;
        
        //socket ajout d'un joueur dans le salon
        socket.on('new-user-' + GLOBAL.token, function(data) {
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
        }),
        
        //socket lancement d'un partie nombre de joueur suffisant
        socket.on('start-party-room-' + GLOBAL.token, function(user) {
            
            that.state.step = 'waitPlay';
            that.instructions = 'Tout le monde est la. Préparez vous !';
            
            setTimeout (function(){
                socket.emit('start', {room : GLOBAL.token}, function (data) {
                    console.log("start OK");
                    that.cptQuestion = 0;
                    //Je lance ma fonction en même temps que l'event
                    //car la première itération de mon event se fait au bon de 10 sec.
                    that.myGame();
                    //ici, une question durera xx secondes, paramétré par l'utilisateur, 10 secondes par défaut.
                    that.eventQuestion = setInterval(that.myGame, ((that.timerQuestion * 1000) + that.tempsDeTransition) );
                });
            }, 5000);
        }),
        
        //socket mise a jour score après reponse d'un utilisateur
        socket.on('maj-party-users-' + GLOBAL.token, function(data) {
            for (var i = 0; i < that.nbUsersMax ; i++) {
                console.log(that.players[i].token + ' == ' + data['usertoken'] + ' ?')
                if (that.players[i].token == data['usertoken']) {
                    that.players[i].points = that.players[i].points + parseInt(data['nbPoint']);
                }
            }
            
            console.log('maj-party-users');
            console.log(data);
            
            that.nbReponseRecu++;
            //si tout le monde a repondu alors transition et on passe à la question suivante.
            if (that.nbUsersMax==that.nbReponseRecu) {
                window.clearInterval(that.eventQuestion);
                window.clearInterval(that.interval);
                that.state.step = 'result';
                that.animationReponses(that.question.good);
                
                //relance question dans 6 secondes (après le recap des scores)
                if (that.cptQuestion < that.nbQuestions) {
                    setTimeout (function(){
                        that.myGame();
                        that.eventQuestion = setInterval(that.myGame, ((that.timerQuestion * 1000) + that.tempsDeTransition ) );
                    },that.tempsDeTransition);
                } else {
                    setTimeout (function(){
                        socket.emit('display-reload-party', {room : GLOBAL.token}, function (data) {});
                    },3000);
                    
                }
            }
        })
    },
    methods: {
        /** 
         * Functions permettant de comptabiliser et recupérer les questions
         * + création du chrono
         **/
        myGame: function() {
            
            var that = this;
            if (this.cptQuestion == this.nbQuestions) {
                clearInterval(this.eventQuestion);
                this.state.step = 'result';
                setTimeout (function(){
                    socket.emit('display-reload-party', {room : GLOBAL.token}, function (data) {});
                },3000);
            } else {
                socket.emit('recup-question', {room : GLOBAL.token}, function (data) {
                    that.nbReponseRecu = 0;
                    that.cptQuestion = that.cptQuestion + 1;
    
                    that.question = data;
                    that.state.step = 'game';
                    
                    that.animationReponses('');
                    
                    window.clearInterval(that.interval);
                    
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
                    var totalTime = that.timerQuestion * 1000; //ms
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
                    
                    that.interval = window.setInterval(function () {
                        console.log('tick');
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
                            console.log('stop tick ' + (tick/1000) + 's');
                            window.clearInterval(that.interval);
                            that.state.step = 'result';
                            that.animationReponses(that.question.good);
                        }
                    }, tickInterval);
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
            } else if (bonneReponse == "reponse2") {
                this.affichageReponse1 =  false;
                this.affichageReponse3 =  false;
                this.affichageReponse4 =  false;
            } else if (bonneReponse == "reponse3") {
                this.affichageReponse2 =  false;
                this.affichageReponse1 =  false;
                this.affichageReponse4 =  false;
            } else if (bonneReponse == "reponse4") {
                this.affichageReponse2 =  false;
                this.affichageReponse3 =  false;
                this.affichageReponse1 =  false;
            } else {
                this.affichageReponse1 =  true;
                this.affichageReponse2 =  true;
                this.affichageReponse3 =  true;
                this.affichageReponse4 =  true;
            }
        }
    }
});