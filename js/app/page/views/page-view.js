define([
    'underscore',
    'backbone',
  //  'text!app/page/templates/page-template.html'
], function (_, Backbone) {// , template) {
    var self;
    var PageView = Backbone.View.extend({
        el: '#page-wrapper',
   //     template: _.template(template, {}),
        template: _.template($("#page-template").html(), {}),
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
        }
    });

    return PageView;
});
