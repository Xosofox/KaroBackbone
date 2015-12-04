var UserView = Backbone.View.extend({
    options: {
        withAnniversary: true,
        withGames: false,
        withDesperation: false,
        withGamesLink: false,
        withInfoLink: false
    },
    tagName: "span",
    template: window["JST"]["user/userView"],
    initialize: function (options) {
        if (!this.model) {
            console.error("No model!");
            return false;
        }
        this.options = _.defaults(options || {}, this.options);
        _.bindAll(this, "dranChange", "render", "onChange");

        //console.log(this.model);
        this.listenTo(this.model, "change", this.onChange);
        //this.listenTo(this.model, "change", this.render);
        //this.listenTo(this.model, "change:dran", this.dranChange);
        this.listenTo(this.model, "remove", this.remove);

        this.render();
    },
    onChange: function(e) {
        //if dran is the only changed property
        if (e.changed.dran && _.size(e.changed)==1) {
            this.dranChange(e);
            return true;
        }
        this.render();
    },
    dranChange: function (user) {
        var prevDran = this.model.previous("dran");
        var newDran = this.model.get("dran");
        if (prevDran >= 0) {
            //console.log("Dran changed from", prevDran, " to ", newVal);
            var col = (prevDran > newDran) ? "#00ff00" : "#ff0000";

            //gets nihilated by immediately following render
            this.$el.find("span.userLabel").effect('highlight', {"color": col});
            //this.$el.effect('highlight', {"color": col});
            var v = this.renderedView();
            //console.log($(v).filter("small").html());
            this.$el.find("small").html($(v).filter("small").html());
        }
    },
    renderedView: function() {
        var data = this.model.toJSON();
        data.self = (this.model.get("id")==Karopapier.User.get("id"));
        var view = this.template({
            options: this.options,
            data: data
        });
        return view;
    },
    render: function () {
        this.$el.html(this.renderedView());
    }
});
