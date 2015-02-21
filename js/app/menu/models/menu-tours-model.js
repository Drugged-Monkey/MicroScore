define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    var self;
    var MenuToursModel = Backbone.Model.extend({
        defaults: {
            year: {}
        },
        initialize: function (attributes, options) {
            self = this;
            self.options = options;
        }
    }, {

    });

    return MenuToursModel;
});