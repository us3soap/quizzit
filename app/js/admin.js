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
            recupFluxNouvellesQuestions : function () {
                var flux = '{' +
                        '"name" :  "Fichier de questions",' +
                        '"version" : 0.1,' +
                        '"token": "123456",' +
                        '"questions" : [';
                
                for (var i = 1 ; i <= cptQuestion ; i++) {
                    if (i > 1) {
                        flux += ',';
                    }
                    flux += '{"id":' + (i-1);
                    flux += ',"question":"' + $("#question_" + i).val() + '"';
                    flux += ',"type": "question"';
                    flux += ',"reponse1":"' + $("#reponse1_" + i).val() + '"';
                    flux += ',"reponse2":"' + $("#reponse2_" + i).val() + '"';
                    flux += ',"reponse3":"' + $("#reponse3_" + i).val() + '"';
                    flux += ',"reponse4":"' + $("#reponse4_" + i).val() + '"';
                    flux += ',"good":"' + $("input[name=reponseQuestion_" + i + "]:checked").val() + '"';
                    flux += ',"explication":"' + $("#explication_" + i).val() + '"}';
                }
                
                flux += "]}";
                return flux ;
            },
            
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
                
                //verif de la saisie des questions ajoutées
                for (var i = 1 ; i <= cptQuestion ; i++) {
                    if ($("#question_" + i).val() == "") {
                        erreur += "Veuillez indiquer la question " + i + "\n";
                    }
                    if ($("#reponse1_" + i).val() == "") {
                        erreur += "Veuillez indiquer la reponse 1 à la question " + i + "\n";
                    }
                    if ($("#reponse2_" + i).val() == "") {
                        erreur += "Veuillez indiquer la reponse 2 à la question " + i + "\n";
                    }
                    if ($("#reponse3_" + i).val() == "") {
                        erreur += "Veuillez indiquer la reponse 3 à la question " + i + "\n";
                    }
                    if ($("#reponse4_" + i).val() == "") {
                        erreur += "Veuillez indiquer la reponse 4 à la question " + i + "\n";
                    }
                    if ($("#explication_" + i).val() == "") {
                        erreur += "Veuillez indiquer l'explication de la question " + i + "\n";
                    }
                    if ($("input[name=reponseQuestion_" + i + "]:checked").length == 0) {
                        erreur += "Veuillez indiquer la bonne réponse à la question " + i + "\n";
                    }
                }
                
                return erreur;
            },
            
            recupDivAjoutQuestion : function () {
                cptQuestion++;
                if (cptQuestion > 0 ) {
                    $("#deleteQuestion").show();
                }
                return "<div id=\"divQuestion" + cptQuestion + "\"></br>"
                            + "<textarea id=\"question_" + cptQuestion +"\" placeholder=\"Question\" style=\"width: 456px; height: 66px;text-align: center;\"></textarea></br></br>"
                            + "<input id=\"reponse1_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 1\" style=\"text-align: center;\" />"
                                + "<input name=\"reponseQuestion_" + cptQuestion + "\" type=\"radio\" id=\"bonne_reponse_reponse1_" + cptQuestion + "\" value=\"reponse1\" />"
                            + "<input id=\"reponse2_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 2\" style=\"text-align: center;\" />"
                                + "<input name=\"reponseQuestion_" + cptQuestion + "\" type=\"radio\" id=\"bonne_reponse_reponse2_" + cptQuestion + "\" value=\"reponse2\" ></br></br>"
                            + "<input id=\"reponse3_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 3\" style=\"text-align: center;\" />"
                                + "<input name=\"reponseQuestion_" + cptQuestion + "\" type=\"radio\" id=\"bonne_reponse_reponse3_" + cptQuestion + "\" value=\"reponse3\" >"
                            + "<input id=\"reponse4_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 4\" style=\"text-align: center;\" />"
                                + "<input name=\"reponseQuestion_" + cptQuestion + "\" type=\"radio\" id=\"bonne_reponse_reponse4_" + cptQuestion + "\" value=\"reponse4\" ></br></br>"
                            + "<textarea id=\"explication_" + cptQuestion +"\" placeholder=\"Explication\" style=\"width: 456px; height: 44px;text-align: center;\"></textarea></br></br>"
                        + "</div>";
            },
            
            createRoom : function() {
                    alert("test");
                var nbUserSaisi = $("#nbUsersMax").val();
                var nbQuestionsSaisi = $("#nbQuestions").val();
                var timerQuestion = $("#timerQuestion").val();
                
                //controle de surface, return "" si pas d'erreur.
                var messageErreur = this.controleDeSurface();
                
                if (messageErreur != "") {
                    $.notify(messageErreur);
                }else{
                    var fluxnouvellesQuestions = this.recupFluxNouvellesQuestions();
                    var parametres = {'room': GLOBAL.token, 'nbUsersMax': nbUserSaisi, 'nbQuestions' : nbQuestionsSaisi, 'timerQuestion' : timerQuestion, 'nbNouvellesQuestions' : cptQuestion.toString(), 'nouvellesQuestions' : fluxnouvellesQuestions};
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