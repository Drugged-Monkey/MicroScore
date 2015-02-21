require.config({
    paths: {
        jquery: 'lib/jquery/jquery',
        underscore: 'lib/underscore/underscore',
        backbone: 'lib/backbone/backbone',
        knockout: 'lib/knockout/knockout',
        tabletop: 'lib/tabletop/tabletop'
    }
});

require([
  'app',
], function (App) {
    App.initialize();
});