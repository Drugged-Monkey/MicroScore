define([
    'underscore',
    'backbone',
  //  'text!app/page/templates/main-table-template.html'
], function (_, Backbone) {// , template) {
    var self;
    var MainTableView = Backbone.View.extend({
        el: '#main-table-wrapper',
        //     template: _.template(template, {}),
        template: _.template($("#main-table-template").html(), {}),
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
