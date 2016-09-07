/* global Vue*/
/* global io*/
/* global $*/
var socket = io.connect(GLOBAL.url);
new Vue({
    el: '#content',
    data: {
        error : GLOBAL.error,
        room : GLOBAL.token,
        state: {
            loading : false,
            step : ''
        },
        nomPage : 'Paramétrage de votre partie',
        param : {
          user : 1,
          question : 20,
          timer : 15
        },
        nbUsersMax : [
            { text : '1' },
            { text : '2' },
            { text : '3' },
            { text : '4' }
        ],
        nbQuestionsMax : [
            { text : '5' },
            { text : '10' },
            { text : '15' },
            { text : '20' }
        ],
        timerQuestionMax : [
            { text : '15' },
            { text : '30' },
            { text : '45' },
            { text : '60' }
        ],
        form : {
            msg : "",
            valid : true
        }
    },
    ready: function() {
        this.state.loading = true;
        $("#content").show();
    },
    methods: {
        controleDeSurface : function() {
            this.form.msg = "";
            this.form.valid = true;
            
            //verif des 3 champs number
            if (! this.param.user.toString().match(/^[0-9]{1,2}$/)) {
                this.form.msg = "Veuillez indiquer le nombre de participants.\n";
                this.form.valid = false;
            }
            if(! this.param.question.toString().match(/^[0-9]{1,2}$/)){
                this.form.msg = "Veuillez indiquer le nombre de questions.\n";
                this.form.valid = false;
            }
            if(! this.param.timer.toString().match(/^[0-9]{1,2}$/)){
                this.form.msg = "Veuillez indiquer le temps de réponse autorisé.\n";
                this.form.valid = false;
            }
        },
        
        createRoom : function() {
            
            this.controleDeSurface();
            
            if (! this.form.valid) {
                $.notify(this.form.msg);
            }else{
                var parametres = {'room': this.room, 'nbUsersMax': this.param.user, 'nbQuestions' : this.param.question, 'timerQuestion' : this.param.timer};
                socket.emit('param-room', parametres , function (data) {
                    if (data["url"] != null){
                        document.location=data["url"];
                    }
                });
            }
        },
        
        afficherDiv : function(step) {
            this.state.step = step; 
            $(".avant").addClass("afficherVerso");
            $(".arriere").addClass("afficherRecto");
        },
        
        retourEcran : function() {
            $(".arriere").attr("class","arriere");
            $(".avant").attr("class","avant");
        }
    }
});
