module.exports = function(router) {
    
    var room = require('../models/room/index.js');
    var questionnaire = require("../models/questionnaire/index.js");
    var qr = require('qr-image');
    
    /** Home page.
    *   Cette page permet de diffuser le QRcode pour paramétrage du questionnaire
    *   @return url : l'url sur laquelle est diffusée les évènements
    *   @return token : le token référençant la page a accédée.
    *   @return ready2play : l'indicateur permettant de conditionnant le QRcode [true=>la partie est administrée, false=> en attente de paramétrage]
    **/
    router.get('/', function(req, res) {
    
        //Création d'une nouvelle room
        var token = room.newRoom();
        var myRoom = room.getRoom(token);
        myRoom.open();
    
        res.render('dashboard.ejs', {url: req.headers.host,
                                token: token,
                                ready2play: myRoom.isReady()
        });
    });
    
    /** Génération du flux correspondant à l'image du QR Code pour rejoindre une partie paramétrée
    *   L'image générée est à afficher pour rejoindre la room.
    *   @param token : identifiant de la salle à paramétrer.
    *   @return qrcode : image symbolisant une adresse de type /admin-room/idToken
    **/
    router.get('/admin-room/:token', function(req, res) {
      var myRoom = room.getRoom(req.params.token);
    
      if(myRoom != false) {
        //On affiche l'url du site
        var urlQr = req.headers.host+'/admin/'+req.params.token;
        var code = qr.image(urlQr, { type: 'svg' });
        res.type('svg');
        code.pipe(res);
        console.log('qr-code affiché : '+ urlQr );
      }
    });
    
    /** Génération du flux correspondant à l'image du QR Code pour rejoindre une partie paramétrée/
    *   L'image générée est à afficher pour rejoindre la room.
    *   @param token : identifiant de la salle à rejoindre.
    *   @return qrcode : image symbolisant une adresse de type /access-room/idToken
    **/
    router.get('/access-room/:token', function(req, res) {
        var myRoom = room.getRoom(req.params.token);
    
        if(myRoom != false) {
          //On affiche l'url du site
          var urlQr = req.protocol+'://'+req.headers.host+'/room/'+req.params.token;
          var code = qr.image(urlQr, { type: 'svg' });
          res.type('svg');
          code.pipe(res);
          console.log('qr-code affiché : '+ urlQr );
        }
    });
};