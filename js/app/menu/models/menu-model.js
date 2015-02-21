define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    var self;
    var MenuModel = Backbone.Model.extend({
        defaults: {
            years: []
        },
        initialize: function (attributes, options) {
            self = this;
            self.options = options;
        }
    }, {

    });

    return MenuModel;
});