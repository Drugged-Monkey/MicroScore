define([
    'underscore',
    'backbone',
    'app/menu/models/menu-model',
    'app/menu/views/menu-view',
 //       'text!app/main/templates/main-template.html'
], function (_, Backbone, MenuModel, MenuView){ //, template) {
    var self;
    var MainView = Backbone.View.extend({
        el: 'body',
     //   template: _.template(template, {}),
        template: _.template($("#main-template").html(), {}),
        initialize: function () {
            self = this;
            _.bindAll(self, "render");

            self.render();
            self.createMenu();
        },

        render: function () {
            self.$el.html(self.template({
                attributes: self.model.attributes,
                options: self.model.options
            }));
        },

        createMenu: function() {
            self.menuModel = new MenuModel({
                initial: {
                    year: "2012-2013"
                },
                years: [{
                        name: "2012-2013",
                        tours: [{
                            name: "1"
                        }, {
                            name: "2"
                        }, {
                            name: "3"
                        }, {
                            name: "4"
                        }]
                    },
                    {
                        name: "2013-2014",
                        tours: [{
                            name: "1"
                        }, {
                            name: "2"
                        }, {
                            name: "3"
                        }]
                    },
                    {
                        name: "2014-2015",
                        tours: [{
                            name: "1"
                        }, {
                            name: "2"
                        }, {
                            name: "3"
                        }, {
                            name: "4"
                        }, {
                            name: "5"        
                        }]
                    }
                ]
            }, {
                
            });

            self.menuView = new MenuView({
                model: self.menuModel
            });
        },

        renderTours: function(year) {
            var obj = _.find(self.menuModel.get("years"), function(item) {
                return item.name == year;
            });
            self.menuView.renderTours(obj);
        }
    });

    return MainView;
});
