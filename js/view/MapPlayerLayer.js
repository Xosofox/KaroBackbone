var MapPlayerLayer = Backbone.View.extend({
    tag: "img",
    optionDefaults: {
        size: 11,
        border: 1
    },
    initialize: function (options) {
        if (!this.model) {
            console.error("Missing Model");
            return false;
        }
        _.bindAll(this, "render");
        _.defaults(options, this.optionDefaults);
        this.settings = new Backbone.Model(options);
        this.listenTo(this.settings, "change:size change:border", this.render);
        this.listenTo(this.model, "change:id", this.render);
    },
    render: function () {
        var gameId = this.model.get("id");
        if (gameId === 0) {
            this.$el.hide();
        } else {
            //console.info("Getting image");
            this.$el.show();
            //console.log(this.$el);
            this.$el.attr("src", "http://www.karopapier.de/images/loading.gif");
            //http://www.karopapier.de/imgenerateFG.php?GID=78483&pixel=11&karoborder=1&limit=2
            this.$el.attr("src", "http://www.karopapier.de/imgenerateFG.php?GID=" + gameId + "&pixel=" + this.settings.get("size") + '&karoborder=' + this.settings.get("border") + '&limit=' + 2);
        }
    }
});