define([
    'underscore',
    'backbone',
    'app/menu/models/menu-tours-model'
  //  'text!app/menu/templates/menu-template.html',
  //  'text!app/menu/templates/menu-tours-template.html',
], function (_, Backbone, MenuToursModel) { //, template, toursTemplate) {
    var self;
    var MenuView = Backbone.View.extend({
        el: '#menu-wrapper',
        //  template: _.template(template, {}),
        template: _.template($("#menu-template").html(), {}),
        toursEl: '#menu-tours-wrapper',
        // toursTemplate: _.template(template, {}),
        toursTemplate: _.template($("#menu-tours-template").html(), {}),
        initialize: function () {
            self = this;
            _.bindAll(self, "render");

            self.render();
        },

        render: function () {
            self.$el.html(self.template({
                attributes: self.model.attributes,
                options: self.model.options
            }));
        },

        renderTours: function (year) {
            self.menuToursModel = new MenuToursModel({
                year: year
            }, {});

            $(self.toursEl).html(self.toursTemplate({
                attributes: self.menuToursModel.attributes,
                options: self.menuToursModel.options,
            }))    
        }
    });

    return MenuView;
});