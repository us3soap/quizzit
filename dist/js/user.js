/* global Vue*/
/* global io*/
/* global $*/
'use strict';
var socket = io.connect(GLOBAL.url);

new Vue({
    el: '#content',
    data: {
        nomPage : 'Quizz IT !',
        loading : false,
        isTimeToReply : true,
        error : GLOBAL.error,
        room : GLOBAL.token,
        state: {
            loading : false,
            step : ''
        },
        user: {
          token : '',
          pseudo: '',
          mail:'',
          score: 0,
          debug : ''
        },
        reponse : {
            id : 0,
            text : '',
            button : 'Afficher',
            display : false
        },
        question: {}
    },
    ready: function() {
        
        this.state.loading = true;
        this.state.step = 'login';
        $('#content').show();
        
        var that = this;
        
        socket.on('start-party-users-' + this.room, function (data) {
            var _reponse = {
                id : 0,
                text : '',
                button : 'Afficher',
                display : false
            };
            
            that.question = data;
            that.state.step = 'game';
            that.reponse = _reponse;
            that.isTimeToReply = true;
            that.nbPointAAjouter = 0;
        });
        
        socket.on('reload-party-' + this.room, function (data) {
            console.log('reload-party', data);
            that.state.step = 'reload';
        });
        
        socket.on('fin-temps-reponse', function (data) {
            console.log('fin-temps-reponse');
            that.isTimeToReply = false;
            that.user.score = that.user.score + that.nbPointAAjouter;
        });
        
    },
    methods: {
        login: function () {
            
            var that = this;
            
            socket.emit('user', { pseudo: this.user.pseudo, room: this.room }, function (data) {
                that.user.token = data.userToken;
                if (that.user.token !== false) {
                    that.state.step = 'wait';
                } else {
                    that.error = 'Désolé, la partie n\'est pas accessible.';
                }
            });
        },
        reply: function(id) {
            
            this.reponse.id = id;
            this.reponse.text = this.question['reponse' + this.reponse.id];
            
            var _data = {
                reponse: 'reponse' + this.reponse.id,
                id: this.question.idquestion
            };
            
            var that = this;
            
            socket.emit('recolte-reponse', _data, function (data) {
                that.nbPointAAjouter = data;
            });
        },
        display: function () {
            this.reponse.display = this.reponse.display ? false : true;
            this.reponse.button = this.reponse.display ? 'Dissimuler' : 'Afficher';

        },
        // reloadSameParty: function () {
        //     socket.emit('reloadParty', { displayAdmin: false, pseudo: this.pseudo, room: GLOBAL.token}, function (data) {});
        // },
        // reloadAdmin: function () {
        //     socket.emit('reloadParty', { displayAdmin: true, pseudo: this.pseudo, room: GLOBAL.token}, function (dataRetour) {
        //         document.location = "/admin/" + dataRetour['room'];
        //     });
        // },


    }
});