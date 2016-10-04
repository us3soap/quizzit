/* global Vue*/
/* global $*/
/* global document*/
'use strict';

const routes = {
  '': 'dashboard',
  '#dashboard': 'dashboard',
  '#user': 'user'
}

new Vue({
    el: '#content',
    data: {
        user: {},
        rooms : {},
        currentView: 'dashboard'
    },
    components: {
        dashboard: { template: '<div>A custom dashboard!</div>' },
        user: { template: '<div>A custom user!</div>' }
    },
    ready: function() {
        $('#content').show();
        
        this.user = { firstname : 'John', name : 'Donald.'};
        
        if(! this.user.firstname){
            document.location = '/private/login';
        }
        this.currentView = routes[window.location.hash];
    },
    methods: {
        navigate : function(){
            this.currentView = routes[window.location.hash];
        },
        
        disconnect : function(){
            document.location = '/private/login';
        }
        
    }
})


