define([
  'jquery',
  'underscore',
  'backbone',
  'app/page/views/page-view',
  'app/page/models/page-model'
], function ($, _, Backbone, PageView, PageModel) {
    var self;
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "start",
            "!/": "start",
            '!/year/:year': 'showPage',
            '!/year/:year/tour/:tour': 'showPage',
            '*actions': 'defaultAction'
        },

        initialize: function (options) {
            self = this;
            self.options = options;
            _.bindAll(self,
                "start",
                "showPage",
                "defaultAction")
        },

        start: function () {
            console.info("[App][Router]:started");
        },

        showPage: function (year, tour) {
            self.options.mainView.renderTours(year);
            if (!!!tour) {
                self.navigate("!/year/" + year + "/tour/" + 1, { trigger: true });
            } else {
                self.model = new PageModel({}, {
                    year: year,
                    tour: _.isUndefined(tour) ? "" : tour
                });
                self.view = new PageView({
                    model: self.model
                });
            }
        },

        defaultAction: function (actions) {
            console.error('[App][Router]:There are no corresponing route:', actions);
        }

    });

    var initialize = function (options) {
        var router = new AppRouter(options);
        Backbone.history.start();
        return router;
    };

    return {
        initialize: initialize
    };
});