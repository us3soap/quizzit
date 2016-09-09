/* global Vue*/
/* global $*/
/* global document*/
'use strict';
new Vue({
    el: '#content',
    data: {
        error : GLOBAL.error,
        nomPage : 'Quizz IT !',
        room : ''
    },
    ready: function() {
        $('#content').show();
    },
    methods: {
        go : function() {
            if(this.room !== ''){
                document.location = "/room/" + this.room;
            }
        }
    }
});
