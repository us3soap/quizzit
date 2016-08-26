module.exports = function(router) {
    
    var dashboardController = require('../controllers/dashboard');
    var qrcodeController = require('../controllers/qrcode');
    var adminController = require('../controllers/admin');
    var userController = require('../controllers/user');

    /** Home page.
    **/
    router.get('/', dashboardController.createRoom);

    /** Génération du flux correspondant à l'image du QR Code pour rejoindre une partie paramétrée
    *   L'image générée est à afficher pour rejoindre la room.
    **/
    router.get('/admin-room/:token', qrcodeController.getQRadmin);
    
    /** Génération du flux correspondant à l'image du QR Code pour rejoindre une partie paramétrée/
    *   L'image générée est à afficher pour rejoindre la room.
    **/
    router.get('/access-room/:token', qrcodeController.getQRaccess);
    
    /** Admin page
    *   @param token : identifiant de la salle à paramétrer.
    *   @return url : url à intérargir pour les sockets
    *   @return room : id de la room à administrer (la valeur est forcée à false si une erreur est remontée)
    *   @return error : les erreurs à remonter en cas d'anomalie
    **/
    router.get('/admin/:token', adminController.getParam);
    
    /** User page
    *   @param token : identifiant de la salle à rejoindre.
    *   @return url : url à intérargir pour les sockets
    *   @return room : id de la room à administrer (la valeur est forcée à false si une erreur est remontée)
    *   @return error : les erreurs à remonter en cas d'anomalie
    **/
    router.get('/room/:token', userController.getRoom);
};