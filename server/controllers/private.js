module.exports = {
    
    getView: function(req, res) {
        console.log('private.js', 'accès page paramétrage');
        res.render('private.ejs', {});
    }
    
};