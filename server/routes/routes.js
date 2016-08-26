module.exports = function(router) {
    
    var dashboardController = require('../controllers/dashboard');
    var qrcodeController = require('../controllers/qrcode');

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
};