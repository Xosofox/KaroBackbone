var Backbone = require('backbone');
module.exports = Backbone.Model.extend({
    defaults: {
        size: 12,
        border: 0,
        fillBorder: true,
        specles: true,
        drawLimit: 2,
        hidePassedCPs: true,
        cpsActive: true,
        cpsVisited: []
    }
});

