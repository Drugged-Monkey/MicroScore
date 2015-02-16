define([
  'jquery',
  'underscore',
  'backbone',
  'app/views/page-view',
  'app/models/page-model'
], function ($, _, Backbone, PageView, PageModel) {
    var self;
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "start",
            "!/": "start",
            '!/year/:id': 'showPage',
            '!/year/:year/tour/:tour': 'showPage',
            '*actions': 'defaultAction'
        },

        initialize : function() {
            self = this;
            _.bindAll(self, "start", "showPage", "defaultAction")
        },

        start: function() {
            console.log("app started");
        },

        showPage: function (year, tour) {
            self.model = new PageModel({}, {
                year: year,
                tour: _.isUndefined(tour) ? "" : tour 
            });
            self.view = new PageView({
                model: self.model
            });
        },

        defaultAction: function (actions) {
            console.log('No route:', actions);
        }

    });

    var initialize = function() {
        var router = new AppRouter();
        Backbone.history.start();
        return router;
    };

    return {
        initialize: initialize
    };
});