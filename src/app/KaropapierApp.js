var Marionette = require("backbone.marionette");
var User = require("../model/User.js");
var UserFactory = require('../factory/UserFactory');
var DranGameCollection = require('../collection/DranGameCollection');
var KEvIn = require('../model/KEvIn');
var LocalSyncModel = require('../model/LocalSyncModel');
var KaroNotifier = require('../model/KaroNotifier');
var KaroNotifierView = require('../view/KaroNotifierView');
var NotificationControl = require('../model/NotificationControl');
var BrowserNotifier = require('../model/BrowserNotifier');
var KaroUtil = require('../model/Util');
var FaviconView = require('../view/FaviconView');
var TitleView = require('../view/TitleView');
var KaropapierLayout = require('../layout/KaropapierLayout');
var UserInfoBar = require('../view/UserInfoBar');
require('../polyfills');

module.exports = Marionette.Application.extend(/** @lends KaropapierApp */ {
    //global layout with regions for nav, sidebar, header and user info...
    /**
     * @constructor KaropapierApp
     * @class KaropapierApp
     * @param options
     */
    initialize: function(options) {
        console.log('APP INIT!!!!!!!!!!!');
        var me = this;

        this.User = new User({});
        //make this user refer to "check" for loging in
        this.User.url = function() {
            return "/api/user/check.json?callback=?";
        };
        this.User.fetch();

        this.userFactroy = new UserFactory();
        this.userFactroy.setLogin(this.User);

        this.UserDranGames = new DranGameCollection({
            user: this.User
        });

        //init Karo Event Interface KEvIn
        this.KEvIn = new KEvIn({
            user: this.User,
            host: "//turted.karoworld.de",
            vent: this.vent
        });

        this.Settings = new LocalSyncModel({
            id: 1,
            storageId: "settings",
            chat_funny: true,
            chat_limit: 20,
            chat_oldLink: false,
            notification_chat: true,
            notification_dran: true
        });

        this.notifier = new KaroNotifier({
            eventEmitter: this.vent,
            user: this.User,
            settings: this.Settings
        });
        this.notifierView = new KaroNotifierView({model: this.notifier});

        //Browser Notifications
        this.notificationControl = new NotificationControl();
        this.browserNotifier = new BrowserNotifier({
            eventEmitter: this.vent,
            user: this.User,
            settings: this.Settings,
            control: this.notificationControl
        });

        this.util = KaroUtil;
        //lazy css
        KaroUtil.lazyCss("/css/slidercheckbox/slidercheckbox.css");

        this.listenTo(this, "start", this.bootstrap.bind(this));
    },
    bootstrap: function() {
        var me = this;
        console.log("Jetzt bootstrap app");

        //container for KaroNotifier
        this.notifierView.render();

        //hook to events to update dran queue
        //refresh function considering logout
        function dranRefresh() {
            if (me.User.get("id") == 0) return false;
            me.UserDranGames.fetch();
        }

        dranRefresh();
        this.listenTo(this.User, "change:id", dranRefresh)


        this.vent.on("USER:DRAN", function(data) {
            me.UserDranGames.addId(data.gid, data.name);
        });

        this.vent.on("USER:MOVED", function(data) {
            me.UserDranGames.remove(data.gid);
        });

        //hook to events to update dran queue
        //refresh function considering logout
        function loadTheme() {
            if (me.User.get("id") == 0) return false;
            var theme = me.User.get("theme");
            var themeUrl = "/themes/" + theme + "/css/theme.css";
            KaroUtil.lazyCss(themeUrl);
        }

        loadTheme();
        this.listenTo(this.User, "change:id", loadTheme);

        //init dynamic favicon
        this.favi = new FaviconView({
            model: this.User,
            el: '#favicon'
        });

        this.titler = new TitleView({
            model: this.User,
            title: "Karopapier - Autofahren wie in der Vorlesung"
        })
        this.titler.render();

        //genereal page setup
        this.layout = new KaropapierLayout({
            el: "body"
        });

        //user info bar right top
        this.infoBar = new UserInfoBar({
            model: this.User
        });
        this.layout.header.show(Karopapier.infoBar);
        this.layout.navi.show(new NaviView());

        //Start the router
        this.router = new AppRouter();
        Backbone.history.start({
            pushState: true,
            root: '/i/'
        });

        this.vent.on('GAME:MOVE', function(data) {
            //only for unrelated moves, count up or down
            if (data.related) return false;
            var movedUser = me.userFactory.getUser({id: data.movedId, login: data.movedLogin});
            movedUser.decreaseDran();
            var nextUser = me.userFactory.getUser({id: data.nextId, login: data.nextLogin});
            nextUser.increaseDran();
        });

        //global keyup handler for hotkeys
        $(document).on("keypress", function(e) {
            //if key pressed outside input, the target is "body", so we consider it a hotkey
            var targetTag = e.target.tagName.toUpperCase();
            if (targetTag === "BODY") {
                if (e.which !== 0) {
                    //console.log("HOTKEY " + String.fromCharCode(e.which));
                    me.vent.trigger("HOTKEY", e);
                }
            }
        });
    }
});
