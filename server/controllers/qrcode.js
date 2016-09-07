var room = require('../models/room/index.js');
var qr = require('qr-image');


module.exports = {

    getQRadmin: function(req, res) {
        
        var myRoom = room.getRoom(req.params.token);
        
        if(myRoom != false) {
            //On affiche l'url du site
            var urlQr = req.headers.host+'/admin/'+req.params.token;
            var code = qr.image(urlQr, { type: 'svg' });
            res.type('svg');
            code.pipe(res);
            console.log('qrcode.js', 'qr-code affiché : '+ urlQr );
        }
        
    },
    
    getQRaccess: function(req, res) {
        
        var myRoom = room.getRoom(req.params.token);
        
        if(myRoom != false) {
            //On affiche l'url du site
            var urlQr = req.protocol+'://'+req.headers.host+'/room/'+req.params.token;
            var code = qr.image(urlQr, { type: 'svg' });
            res.type('svg');
            code.pipe(res);
            console.log('qrcode.js', 'qr-code affiché : '+ urlQr );
        }
    }
};