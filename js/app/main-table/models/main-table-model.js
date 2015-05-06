define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    var self;
    var MainViewModel = Backbone.Model.extend({
        defaults: {
            
        },
        initialize: function (attributes, options) {
            self = this;
            self.options = options;
        }
    }, {

    });

    return MainViewModel;
});