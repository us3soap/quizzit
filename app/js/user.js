/* global Vue*/
/* global io*/
/* global $*/
var socket = io.connect(GLOBAL.url);

new Vue({
    el: '#content',
    data: {
        loading : false,
        error : GLOBAL.error,
        room : GLOBAL.token,
        state: {
            loading : false,
            step : ''
        },
        user: {
          token : '',
          pseudo: '',
          debug : ''
        },
        reponseDonnee: 0,
        reponseDonneeText: '',
        question: {}
    },
    ready: function() {
        
        this.state.loading = true;
        this.state.step = "login";
        $("#content").show();
        
        var that = this;
        
        socket.on('start-party-users-' + this.room, function (data) {
            that.question = data;
            that.partyStarted = true;
            that.partyReload = false;
        });
        
        socket.on('reload-party-' + this.room, function (data) {
            that.partyStarted = false;
            that.partyReload = true;
        });
        
    },
    methods: {
        login: function () {
            
            var that = this;
            
            socket.emit('user', { pseudo: this.user.pseudo, room: this.room }, function (data) {
                that.user.token = data['userToken'];
                if (that.user.token !== false) {
                    that.state.step = 'wait';
                } else {
                    that.error = "Désolé, la partie n'est pas accessible.";
                }
            });
        },
        // reloadSameParty: function () {
        //     socket.emit('reloadParty', { displayAdmin: false, pseudo: this.pseudo, room: GLOBAL.token}, function (data) {});
        // },
        // reloadAdmin: function () {
        //     socket.emit('reloadParty', { displayAdmin: true, pseudo: this.pseudo, room: GLOBAL.token}, function (dataRetour) {
        //         document.location = "/admin/" + dataRetour['room'];
        //     });
        // },
        // reponseOnclick: function (btnNo) {
        //     this.reponseDonnee = btnNo;
        //     this.reponseDonneeText = this.question['reponse' + btnNo];
        //     this.showCommandTool = false;
        //     this.showRecapReponse = true;
        //     socket.emit('recolte-reponse', {
        //         reponse: 'reponse' + btnNo,
        //         id: this.props.question.idquestion
        //     }, function (dataRetour) {
        //         console.log(dataRetour);
        //     });
        // },
        // afficherReponse: function (btnNo) {
        //     $("#reponseChoisie").show();
        // },
        // cacherReponse: function (btnNo) {
        //     $("#reponseChoisie").hide();
        // }
    }
});