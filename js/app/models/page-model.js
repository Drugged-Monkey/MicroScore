define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    var self;
    var PageModel = Backbone.Model.extend({
        defaults: {
            message: "default message"
        },
        initialize: function (attributes, options) {
            self = this;
            self.options = options;
        }
    }, {

    });

    return PageModel;
});