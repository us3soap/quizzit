$(function() {
    
    
    var socket = io.connect(GLOBAL.url);
    
    var maVue = new Vue({
        el: '#user-view',
        partyStarted: false,
        partyReload: false,
        userToken: '',
        pseudo: '',
        showModalInfo: false,
        showCommandTool: true,
        showRecapReponse: false,
        reponseDonnee: 0,
        reponseDonneeText: '',
        question: {},
        data: {},
        methods: {
            initview : function() {

                socket.on('start-party-users-' + GLOBAL.token, function (data) {
                    maVue.question = data;
                    maVue.partyStarted = true;
                    maVue.partyReload = false;
                });
                socket.on('reload-party-' + GLOBAL.token, function (data) {
                    console.log('user.ejs : reload-party-token reçu');
                    maVue.partyStarted = false;
                    maVue.partyReload = true;
                });
            },
            beginOnClick: function () {
                this.pseudo = $("#pseudo").val();
                socket.emit('user', { pseudo: this.pseudo, room: GLOBAL.token }, function (dataRetour) {
                    maVue.userToken = dataRetour['userToken'];
                    if (maVue.userToken != false) {
                        maVue.msgDebug = dataRetour['userToken'];
                        maVue.alreadyLogged = true;
                    } else {
                        maVue.msgInfo = "Désolé, la partie n'est pas accessible.";
                    }
                    maVue.gererAffichage('WaitStarting');
                });
            },
            gererAffichage: function (idDivAAfficher) {
                $("#UserLoginView").hide();
                $("#WaitStarting").hide();
                $("#UserReloadPartiView").hide();
                $("#PartyStarted").hide();
                
                $("#" + idDivAAfficher).show();
            },
            reloadSameParty: function () {
                socket.emit('reloadParty', { displayAdmin: false, pseudo: this.pseudo, room: GLOBAL.token}, function (data) {});
            },
            reloadAdmin: function () {
                socket.emit('reloadParty', { displayAdmin: true, pseudo: this.pseudo, room: GLOBAL.token}, function (dataRetour) {
                    document.location = "/admin/" + dataRetour['room'];
                });
            },
            reponseOnclick: function (btnNo) {
                this.reponseDonnee = btnNo;
                this.reponseDonneeText = this.question['reponse' + btnNo];
                this.showCommandTool = false;
                this.showRecapReponse = true;
                socket.emit('recolte-reponse', {
                    reponse: 'reponse' + btnNo,
                    id: this.props.question.idquestion
                }, function (dataRetour) {
                    console.log(dataRetour);
                });
            }
        }
    })
    

});