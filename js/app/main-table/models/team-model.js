define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    var self;
    var TeamModel = Backbone.Model.extend({
        defaults: {
            place: 0,
            teamName: "",
            wins: 0,
            draws: 0,
            loses: 0,
            points: 0,
            wasLead: false,
            totalAnsweredQuestions: 0,
            totalMaxQuestions: 0,
            percents: 0.00,
            matches : []
        },
        initialize: function (attributes, options) {
            self = this;
            self.options = options;
        }
    }, {

    });

    return TeamModel;
});