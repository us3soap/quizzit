module.exports = {
    
    getLogin: function(req, res) {
        res.render('login.ejs', {});
    },
    
    getView: function(req, res) {
        res.render('private.ejs', {});
    }
    
};