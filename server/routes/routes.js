module.exports = function(router) {
    
    var dashboardController = require('../controllers/dashboard');
    var qrcodeController = require('../controllers/qrcode');
    var adminController = require('../controllers/admin');
    var userController = require('../controllers/user');
    var privateController = require('../controllers/private');

    /** Home page.
    **/
    router.get('/', dashboardController.createRoom);
    
    /** Home page parametré.
    **/
    router.get('/display/:token', dashboardController.getRoom);

    /** Génération du flux correspondant à l'image du QR Code pour rejoindre une partie paramétrée
    *   L'image générée est à afficher pour rejoindre la room.
    **/
    router.get('/admin-room/:token', qrcodeController.getQRadmin);
    
    /** Génération du flux correspondant à l'image du QR Code pour rejoindre une partie paramétrée/
    *   L'image générée est à afficher pour rejoindre la room.
    **/
    router.get('/access-room/:token', qrcodeController.getQRaccess);
    
    /** Admin page
    **/
    router.get('/admin/:token', adminController.getParam);
    
    /** User page
    **/
    router.get('/room/:token', userController.getRoom);
    
    /** Access page
    **/
    router.get('/access', userController.askRoom);
    
    /** Page de paramétrage pour login. 
    **/
    router.get('/private/login', privateController.getLogin);
    
    /** Page de paramétrage pour créer une room spécifique. 
    **/
    router.get('/private/view', privateController.getView);
};