$(function() {

    var cptQuestion = 0;
    var socket = io.connect(GLOBAL.url);
    
    new Vue({
        el: '#content',
        data: {
            nomPage : 'Paramétrage de votre partie',
            
            nbUsersMax : [
                { text : '1' },
                { text : '2' },
                { text : '3' },
                { text : '4' }],
                
            nbQuestionsMax : [
                { text : '5' },
                { text : '10' },
                { text : '15' },
                { text : '20' }],
                
            timerQuestionMax : [
                { text : '15' },
                { text : '30' },
                { text : '45' },
                { text : '60' }]
        },
        methods: {
            controleDeSurface : function() {
                var erreur = "";
        
                //verif des 3 champs number
                if (!$("#nbUsersMax").val().match(/^[0-9]{1,2}$/)) {
                    erreur += "Veuillez indiquer le nombre de participants.\n";
                }
                if(!$("#nbQuestions").val().match(/^[0-9]{1,2}$/)){
                    erreur += "Veuillez indiquer le nombre de questions.\n";
                }
                if(!$("#timerQuestion").val().match(/^[0-9]{1,2}$/)){
                    erreur += "Veuillez indiquer le temps de réponse autorisé.\n";
                }
                
                return erreur;
            },
            
            createRoom : function() {
                var nbUserSaisi = $("#nbUsersMax").val();
                var nbQuestionsSaisi = $("#nbQuestions").val();
                var timerQuestion = $("#timerQuestion").val();
                
                //controle de surface, return "" si pas d'erreur.
                var messageErreur = this.controleDeSurface();
                
                if (messageErreur != "") {
                    $.notify(messageErreur);
                }else{
                    var parametres = {'room': GLOBAL.token, 'nbUsersMax': nbUserSaisi, 'nbQuestions' : nbQuestionsSaisi, 'timerQuestion' : timerQuestion, 'nbNouvellesQuestions' : cptQuestion.toString(), 'nouvellesQuestions' : ''};
                    socket.emit('param-room', parametres , function (data) {
                        if (data["url"] != null){
                            document.location=data["url"];
                        }
                    });
                }
            }
        }
    })
});