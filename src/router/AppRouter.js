var APPS = {};
var AppRouter = Backbone.Router.extend({
    routes: {
        "": "showChat",
        "index.html": "showChat",
        "chat.html": "showChat",
        "dran.html": "showDran",
        "editor.html": "showEditor",
        "game.html?GID=:gameId": "showGame",
        "newshowmap.php?GID=:gameId": "showGame",
        "game.html": "defaultRoute",
        ":path": "showStatic"
    },
    doDummy: function (info) {
        var a;
        if (info in APPS) {
            a = APPS[info];
        } else {
            a = new DummyApp({
                info: info
            });
            a.start();
            APPS[info] = a;
        }
        Karopapier.layout.content.show(a.view, {preventDestroy: true});
    },
    showStatic: function (path) {
        this.doDummy(path);
        return;

        Karopapier.layout.content.show(new StaticView({
            path: path
        }));
    },
    showChat: function () {
        //if (!Karopapier.chatApp) {
        //Karopapier.chatContainer = new Backbone.View();
        Karopapier.chatApp = new ChatApp();
        Karopapier.layout.content.show(Karopapier.chatApp.view);
    },
    showEditor: function() {
        Karopapier.editorApp = new EditorApp();
        Karopapier.layout.content.show(Karopapier.editorApp.layout);
    },
    showDran: function () {
        Karopapier.dranApp = new DranApp();
        Karopapier.layout.content.show(Karopapier.dranApp.view);
    },
    showGame: function (gameId) {
        this.doDummy("Game " + gameId);
        return;
        if (gameId) {
            game.load(gameId);
        }
    },
    defaultRoute: function () {
        this.doDummy("Game with no ID");
        return;
        this.navigate("game.html", {trigger: true});
        //this.navigate("game.html?GID=81161", {trigger: true});
        //this.navigate("game.html?GID=57655", {trigger: true});
    }
});


