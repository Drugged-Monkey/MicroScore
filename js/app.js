define([
  'jquery',
  'underscore',
  'backbone',
  'router',
  'app/main/views/main-view',
  'app/main/models/main-model'
], function ($, _, Backbone, Router, MainView, MainModel) {
    var self;
    var initialize = function () {
        self = this;

        self.mainModel = new MainModel({
            
        }, {
           
        });

        self.mainView = new MainView({
            model : self.mainModel
        });

        Router.initialize({
            mainView: self.mainView
        });
    }

    return {
        initialize: initialize
    };
});