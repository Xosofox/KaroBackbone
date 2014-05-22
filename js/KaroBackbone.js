/*! KaroBackbone 2014-05-22 */
var ChatApp = Backbone.Marionette.Layout.extend({
    initialize: function() {
        this.layout = new ChatLayout({
            el: this.el
        }), this.layout.render(), this.configuration = new Backbone.Model(), this.configuration.set("limit", 4), 
        this.chatMessageCollection = new ChatMessageCollection(), this.chatMessagesView = new ChatMessagesView({
            model: this.configuration,
            collection: this.chatMessageCollection
        }), this.chatUserCollection = new ChatUserCollection(), this.chatUsersView = new ChatUsersView({
            collection: this.chatUserCollection
        }), console.log("Init Chat app");
    },
    render: function() {
        console.log("Someone called ChatApp's render"), this.layout.chatMessages.show(this.chatMessagesView), 
        this.layout.chatInfo.show(this.chatUsersView);
    }
}), KaropapierApp = Backbone.Marionette.Layout.extend({}), ChatLayout = Backbone.Marionette.Layout.extend({
    template: window.JST["chat/chatLayout"],
    regions: {
        chatMessages: "#chatMessages",
        chatInfo: "#chatInfo"
    }
}), ChatMessage = Backbone.Model.extend({}), ChatUser = Backbone.Model.extend({}), Game = Backbone.Model.extend({
    defaults: {
        id: 0
    },
    url: function() {
        return "http://reloaded.karopapier.de/api/game/" + this.get("id") + "/details.json?callback=?";
    },
    parse: function(a) {
        return a.game.id == this.id ? (this.map.set({
            cpsActive: a.game.cps
        }, {
            silent: !0
        }), this.map.set(a.map), playersData = a.players, _.each(playersData, function(a) {
            var b = new Move(a.lastmove);
            a.lastmove = b;
            var c = new MoveCollection(a.moves);
            a.moves = c;
        }), this.players.reset(a.players), a.game) : void console.warning("Dropped response for " + a.game.id);
    },
    initialize: function() {
        this.map = new Map(), this.moveMessages = new MoveMessageCollection(), this.players = new PlayerCollection([ {
            id: 0
        } ], {
            moveMessages: this.moveMessages
        });
    },
    load: function(a) {
        this.set({
            id: a
        }, {
            silent: !0
        }), console.info("Fetching for " + a), this.fetch();
    }
}), Map = Backbone.Model.extend({
    defaults: {
        id: 0,
        cps: [],
        rows: 0,
        cols: 0
    },
    initialize: function() {
        _.bindAll(this, "updateMapcode", "updateSize", "updateStarties", "updateCpList", "setFieldAtRowCol", "getFieldAtRowCol", "getPosFromRowCol"), 
        this.bind("change:mapcode", this.updateMapcode);
    },
    updateMapcode: function(a, b) {
        this.updateSize();
        var c = b.toUpperCase();
        c = c.replace(/\r/g, ""), this.set("mapcode", c, {
            silent: !0
        }), this.updateStarties(), this.updateCpList();
    },
    updateStarties: function() {
        this.set("starties", (this.get("mapcode").match(/S/g) || []).length);
    },
    updateCpList: function() {
        this.set("cps", (this.get("mapcode").match(/\d/g) || []).sort().filter(function(a, b, c) {
            return b == c.indexOf(a) ? 1 : 0;
        }));
    },
    updateSize: function() {
        var a = this.get("mapcode").split("\n");
        this.set({
            rows: a.length
        });
        var b = a[0].trim();
        this.set("cols", b.length);
    },
    setFieldAtRowCol: function(a, b, c) {
        {
            var d = this.getPosFromRowCol(a, b), e = this.get("mapcode");
            e.length;
        }
        e = e.substr(0, d) + c + e.substr(d + 1), this.set("mapcode", e);
    },
    getFieldAtRowCol: function(a, b) {
        if (0 > a) return void 0;
        if (0 > b) return void 0;
        if (a >= this.get("rows")) return void 0;
        if (b >= this.get("cols")) return void 0;
        var c = this.getPosFromRowCol(a, b);
        return this.get("mapcode").charAt(c);
    },
    getPosFromRowCol: function(a, b) {
        var c = a * (this.get("cols") + 1) + b;
        return c;
    },
    FIELDS: {
        F: "finish",
        O: "road",
        P: "parc",
        S: "start",
        V: "stone",
        W: "water",
        X: "grass",
        Y: "sand",
        Z: "mud",
        ".": "night",
        "1": "cp1",
        "2": "cp2",
        "3": "cp3",
        "4": "cp4",
        "5": "cp5",
        "6": "cp6",
        "7": "cp7",
        "8": "cp8",
        "9": "cp9"
    }
}), Path = Backbone.Model.extend({}), PathCollection = Backbone.Collection.extend({
    model: Path
}), MapPathFinder = Backbone.Model.extend({
    initialize: function(a) {
        if ("undefined" == typeof a) throw "MAP_MISSING";
        _.bindAll(this, "reset", "getMainField", "getAllOutlines", "getFieldOutlines", "getOutlineDirection"), 
        this.map = a, this.reset(), this.WILDCARD_FIELDS = [ "F", "S", "1", "2", "3", "4", "5", "6", "7", "8", "9" ], 
        this.modifiers = {
            top: {
                r: -1,
                c: 0
            },
            right: {
                r: 0,
                c: 1
            },
            bottom: {
                r: 1,
                c: 0
            },
            left: {
                r: 0,
                c: -1
            }
        }, this.directions = {
            "-1|0": "up",
            "0|1": "right",
            "1|0": "down",
            "0|-1": "left"
        }, this.outlineModifiers = {
            top: {
                from: {
                    r: 0,
                    c: 0
                },
                to: {
                    r: 0,
                    c: 1
                }
            },
            right: {
                from: {
                    r: 0,
                    c: 1
                },
                to: {
                    r: 1,
                    c: 1
                }
            },
            bottom: {
                from: {
                    r: 1,
                    c: 1
                },
                to: {
                    r: 1,
                    c: 0
                }
            },
            left: {
                from: {
                    r: 1,
                    c: 0
                },
                to: {
                    r: 0,
                    c: 0
                }
            }
        };
    },
    reset: function() {
        this.outlines = {};
    },
    getMainField: function() {
        function a(a, b, c) {
            if (a += "", b += "", b.length <= 0) return a.length + 1;
            for (var d = 0, e = 0, f = c ? 1 : b.length; ;) {
                if (e = a.indexOf(b, e), !(e >= 0)) break;
                d++, e += f;
            }
            return d;
        }
        var b = this.map.get("mapcode"), c = "", d = 0;
        for (var e in this.map.FIELDS) {
            var f = a(b, e);
            f && f > d && (c = e, d = f);
        }
        return c;
    },
    getAllOutlines: function() {
        this.reset();
        for (var a, b = (this.map.get("mapcode"), this.map.get("cols")), c = this.map.get("rows"), d = 0, e = 0; c > d; ) {
            for (e = 0; b > e; ) a = this.map.getFieldAtRowCol(d, e), a in this.map.FIELDS && this.getFieldOutlines(d, e), 
            e++;
            d++;
        }
        return !0;
    },
    getSvgPathFromOutlines: function(a, b) {
        var c = "", d = 1e4, e = -1, f = -1, g = "", h = _.first(_.values(a));
        for (e = h[0].y1, f = h[0].x1, g = this.getOutlineDirection(h), c = "M" + f * b + "," + e * b; !_.isEmpty(a) && d > 0; ) {
            var i = this.getKeyForRowCol(e, f);
            if (i in a) {
                var j = a[i], k = j.shift(), l = this.getOutlineDirection(k);
                l != g && (c += "L" + k.x1 * b + "," + k.y1 * b), g = l, f = k.x2, e = k.y2, 0 === j.length && delete a[i];
            } else {
                c += "L" + f * b + "," + e * b;
                var h = _.first(_.values(a));
                e = h[0].y1, f = h[0].x1, g = this.getOutlineDirection(h), c += "M" + f * b + "," + e * b;
            }
            d--;
        }
        return c += "Z";
    },
    getOutlineDirection: function(a) {
        var b = a.x2 - a.x1, c = a.y2 - a.y1;
        return this.directions[c + "|" + b];
    },
    getKeyForRowCol: function(a, b) {
        return a + "|" + b;
    },
    getRowColFromKey: function(a) {
        var b = a.split("|");
        return {
            r: parseInt(b[0]),
            c: parseInt(b[1])
        };
    },
    getFieldOutlines: function(a, b) {
        var c, d = this.map.getFieldAtRowCol(a, b);
        for (var e in this.modifiers) {
            var f = this.modifiers[e], g = a + f.r, h = b + f.c;
            if (c = this.map.getFieldAtRowCol(g, h), c != d) {
                var i = this.outlineModifiers[e].from, j = this.outlineModifiers[e].to;
                d in this.outlines || (this.outlines[d] = {});
                var k = b + i.c, l = a + i.r, m = b + j.c, n = a + j.r, o = this.getKeyForRowCol(l, k);
                o in this.outlines[d] || (this.outlines[d][o] = []), this.outlines[d][o].push({
                    x1: k,
                    y1: l,
                    x2: m,
                    y2: n
                });
            }
        }
        return !0;
    }
}), MapRenderPalette = Backbone.Model.extend({
    defaults: {
        road: "128,128,128",
        roadspecle: "100,100,100",
        offroad: "0,200,0",
        offroadspecle: "0,180,0",
        offroadsand: "230,230,115",
        offroadsandspecle: "200,200,100",
        offroadmud: "100,70,0",
        offroadmudspecle: "90,60,0",
        offroadmountain: "100,100,100",
        offroadmountainspecle: "0,0,0",
        offroadwater: "0,60,200",
        offroadwaterspecle: "0,30,100",
        start1: "200,200,200",
        start2: "100,100,100",
        finish1: "255,255,255",
        finish2: "0,0,0",
        checkpoint1: "000,102,255",
        checkpoint2: "000,100,200",
        checkpoint3: "000,255,102",
        checkpoint4: "000,200,000",
        checkpoint5: "255,255,000",
        checkpoint6: "200,200,000",
        checkpoint7: "255,000,000",
        checkpoint8: "200,000,000",
        checkpoint9: "255,000,255",
        checkpointBgOdd: "0,0,0",
        checkpointBgEven: "255,255,255",
        fog: "0,0,0",
        fogspecle: "0,0,0",
        parc: "200,200,200"
    },
    initialize: function() {
        _.bindAll(this, "setAlias", "getRGB"), this.setAlias(), this.bind("change", this.setAlias);
    },
    setAlias: function() {
        var b = {
            O: "road",
            Ospecle: "roadspecle",
            offroadmountain: "V",
            V: "offroadmountain",
            Vspecle: "offroadmountainspecle",
            W: "offroadwater",
            Wspecle: "offroadwaterspecle",
            X: "offroad",
            Xspecle: "offroadspecle",
            Y: "offroadsand",
            Yspecle: "offroadsandspecle",
            Z: "offroadmud",
            Zspecle: "offroadmudspecle",
            ".": "fog",
            ".specle": "fogspecle"
        };
        for (a in b) origin = b[a], this.set(a, this.get(origin));
    },
    getRGB: function(a) {
        return "rgb(" + this.get(a) + ")";
    }
}), Move = Backbone.Model.extend({
    defaults: {
        x: 0,
        y: 0,
        xv: 0,
        yv: 0
    }
}), MoveCollection = Backbone.Collection.extend({
    model: Move
}), MoveMessage = Backbone.Model.extend({}), Player = Backbone.Model.extend({
    defaults: {
        id: 0
    },
    initialize: function() {
        this.moves = new MoveCollection(), this.lastmove = new Move(), this.bind("change:id", function(a, b) {
            console.info(" New Player id: " + b);
        });
    }
}), User = Backbone.ModelFactory({
    defaults: {
        id: 0,
        login: "Gast"
    },
    initialize: function() {
        console.log("I am ", this);
    }
});

!function(a) {
    a.Util = {}, a.Util.linkify = function(a) {
        return a ? (a = a.replace(/\banders\b/gi, ' <img style="opacity: .3" src="http://reloaded.karopapier.de/images/anders.jpg" alt="anders" title="anders" />'), 
        a = a.replace(/\bnen\b/gi, "einen"), a = a.replace(/img src="\/images\/smilies\/(.*?).gif" alt=/g, 'img src="http://www.karopapier.de/bilder/smilies/$1.gif" alt='), 
        a = a.replace(/GID[ =]([0-9]{3,6})/gi, function(a, b) {
            return $.getJSON("http://reloaded.karopapier.de/api/game/" + b + "/info.json?callback=?", function(a) {
                $("a.GidLink" + b).text(b + " - " + a.game.name);
            }), '<a class="GidLink' + b + '" href="http://www.karopapier.de/showmap.php?GID=' + b + '" target="_blank">' + b + "</a>";
        })) : a;
    };
}(Karopapier);

var ViewSettings = Backbone.Model.extend({
    defaults: {
        size: 12,
        border: 1,
        fillBorder: !0,
        specles: !1
    }
}), ChatMessageCollection = Backbone.Collection.extend({
    url: "http://reloaded.karopapier.de/api/chat/list.json?limit=10&callback=?",
    model: ChatMessage,
    initialize: function() {
        _.bindAll(this, "addItem");
    },
    addItem: function() {}
}), ChatUserCollection = Backbone.Collection.extend({
    url: "http://reloaded.karopapier.de/api/chat/users.json?callback=?",
    model: User,
    initialize: function() {
        _.bindAll(this, "addItem");
    },
    addItem: function() {}
}), MoveMessageCollection = Backbone.Collection.extend({
    model: MoveMessage,
    comparator: function(a) {
        return a.get("move").get("t");
    }
}), PlayerCollection = Backbone.Collection.extend({
    model: Player,
    initialize: function(a, b) {
        _.bindAll(this), this.moveMessages = b.moveMessages, this.bind("reset", function() {
            console.info("Init Players"), this.moveMessages.reset(), this.each(function(a) {
                a.get("moves").each(function(b) {
                    b.get("msg") && (mm = new MoveMessage({
                        move: b,
                        player: a
                    }), this.moveMessages.add(mm, {
                        silent: !0
                    }));
                }, this);
            }, this), this.moveMessages.trigger("change");
        });
    }
}), ChatMessageView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        _.bindAll(this, "render"), this.render();
    },
    render: function() {
        var a = this.model.get("text");
        return this.$el.html(a), a = this.$el.text(), a = Karopapier.Util.linkify(a), this.$el.attr("id", this.model.get("id")).html("<b>" + this.model.get("user") + "</b> (" + this.model.get("time") + "): " + a), 
        this;
    }
}), ChatMessagesView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        _.bindAll(this, "render", "addItem", "limit"), this.collection.on("reset", this.render), 
        this.collection.fetch(), this.collection.on("add", this.addItem), this.message_limit = 0, 
        this.model.on("change", this.limit);
    },
    addItem: function(a) {
        var b = new ChatMessageView({
            model: a
        });
        this.$el.append(b.el);
    },
    limit: function() {
        this.message_limit = this.model.get("limit"), this.render();
    },
    render: function() {
        this.$el.empty();
        return _.each(this.collection.last(this.message_limit), function(a) {
            this.addItem(a);
        }.bind(this)), this;
    }
}), ChatUsersView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        _.bindAll(this, "render", "addItem"), this.collection.on("reset", this.render), 
        this.collection.fetch(), this.collection.on("add", this.addItem);
    },
    addItem: function(a) {
        var b = new UserView({
            model: a,
            withGames: !0,
            withAnniversary: !0,
            withDesperation: !0
        }), c = $("<li></li>");
        c.append(b.el), this.$el.append(c);
    },
    render: function() {
        this.$el.empty();
        return this.collection.each(function(a) {
            this.addItem(a);
        }.bind(this)), this;
    }
}), EditorMapView = Backbone.View.extend({
    id: "editorMapView",
    initialize: function() {
        _.bindAll(this, "render", "draw", "mousedown", "mouseup", "mousemove", "mouseleave"), 
        $this = this, this.settings = this.options.settings, this.tools = this.options.tools, 
        this.map = new Map({
            mapcode: "XOSOFOX"
        }), this.mapRenderView = new MapRenderView({
            settings: this.settings,
            model: this.map
        }), this.$el.bind("contextmenu", function() {
            return !1;
        }), this.$el.append(this.mapRenderView.el), this.$el.css({
            display: "inline-block"
        });
    },
    render: function() {
        this.mapRenderView.render();
    },
    events: {
        mousedown: "mousedown",
        mouseup: "mouseup",
        mouseleave: "mouseleave",
        contextmenu: function() {
            return !1;
        }
    },
    draw: function(a) {
        for (var b = 1; 3 >= b; b++) if (buttonDown[b]) {
            var c = a.pageX - this.$el.offset().left, d = a.pageY - this.$el.offset().top;
            $("#drag" + b).text("(" + c + "|" + d + ")"), this.mapRenderView.setFieldAtXY(c, d, this.tools.buttonColor[b]);
        }
    },
    mousedown: function(a) {
        return buttonDown[a.which] = !0, a.preventDefault(), this.render(), this.draw(a), 
        this.$el.bind("mousemove", this.mousemove), !1;
    },
    mouseup: function(a) {
        buttonDown[a.which] = !1, this.render(), this.$el.unbind("mousemove");
    },
    mousemove: function(a) {
        this.draw(a);
    },
    mouseleave: function(a) {
        for (var b = 1; 3 >= b; b++) buttonDown[a.which] = !1;
        this.render();
    }
}), EditorToolsView = Backbone.View.extend({
    id: "editorTools",
    initialize: function() {
        $this = this, _.bindAll(this, "highlightActiveField", "selectField"), this.settings = this.options.settings, 
        this.$el.html(window.JST["editor/tools"]), this.slider = $("#size-slider", this.$el).slider({
            value: 8,
            min: 1,
            max: 20
        }), this.settings.set("size", 8), $("#drawSize", this.$el).text(8), this.slider.bind("slide", function(a, b) {
            $this.settings.set("size", b.value), $("#drawSize", this.$el).text(b.value);
        }), this.$el.bind("contextmenu", function() {
            return !1;
        }), this.buttonColor = [ null, "O", "S", "X" ], this.highlightActiveField();
    },
    events: {
        "mousedown .fieldSelector": "selectField"
    },
    highlightActiveField: function() {
        $(".fieldSelector", this.$el).removeClass("activeFieldSelector"), $('.fieldSelector[rel="' + this.buttonColor[1] + '"]', this.$el).addClass("activeFieldSelector");
    },
    selectField: function(a) {
        this.buttonColor[a.which] = $(a.currentTarget).attr("rel"), this.highlightActiveField();
    }
}), EditorView = Backbone.View.extend({
    id: "editor",
    initialize: function() {
        _.bindAll(this, "loadMapId", "loadMapcode", "buttonDown"), this.map = new Map(), 
        this.mapView = new MapRenderView({
            model: this.map
        }), this.settings = this.mapView.mapViewSettings, this.model = new Backbone.Model({
            buttonDown: 0
        }), this.model.on("change:buttonDown", this.buttonDown);
        var a = $("<div>");
        a.attr("id", "editorMap"), a.append(this.mapView.el), this.$el.append(a);
        var b = $("<div>");
        b.attr("id", "editorTools"), this.toolsView = new EditorToolsView({
            settings: this.settings,
            el: b
        }), this.$el.append(b);
        var c = $("<div></div>");
        c.attr("id", "mapCode"), this.codeView = new MapCodeView({
            el: c
        }), this.$el.append(c), this.mapcode = $('<textarea id="mapcode" style="float: left; display: block">XOSOFOX</textarea>'), 
        this.$el.append(this.mapcode), this.$el.append($('<input type="button" class="loadMapcode" value="Load" />')), 
        this.editorMapView.map.bind("change:rows change:cols", function() {
            this.mapcode.attr("rows", this.editorMapView.map.get("rows")), this.mapcode.attr("cols", this.editorMapView.map.get("cols"));
        }, this), this.editorMapView.map.bind("change:mapcode", function(a, b) {
            this.mapcode.val(b);
        }, this), this.editorMapView.map.bind("change:starties", function(a, b) {
            $("#starties").text(b);
        }, this), this.editorMapView.map.bind("change:cps", function(a, b) {
            $("#cpsUsed").text(b.join(","));
        }, this);
    },
    buttonDown: function() {
        console.log("Triggered Buttondown");
        var a = this.model.get("buttonDown");
        console.log(a);
    },
    events: {
        "click .loadMapcode": "loadMapcode"
    },
    loadMapId: function(a) {
        var b = this;
        $.getJSON("http://reloaded.karopapier.de/api/mapcode/" + a + ".json?callback=?", function(a) {
            b.mapcode.val(a), b.loadMapcode(a);
        });
    },
    loadMapcode: function() {
        this.editorMapView.map.set("mapcode", this.mapcode.val()), this.editorMapView.render();
    }
}), GameAppNavigationView = Backbone.Marionette.ItemView.extend({
    template: "#game-navi-template",
    events: {
        "click .back": "backGame",
        "click .next": "nextGame",
        "click .smaller": "smallerView",
        "click .bigger": "biggerView"
    },
    smallerView: function() {
        var a = app.gameAppView.gameView.settings.get("size");
        app.gameAppView.gameView.settings.set({
            size: a - 1
        });
    },
    biggerView: function() {
        var a = app.gameAppView.gameView.settings.get("size");
        app.gameAppView.gameView.settings.set({
            size: a + 1
        });
    },
    backGame: function() {
        var a = parseInt(app.gameAppView.model.get("id"));
        app.router.navigate("game/" + (a - 1), {
            trigger: !0
        });
    },
    nextGame: function() {
        var a = parseInt(app.gameAppView.model.get("id"));
        app.router.navigate("game/" + (a + 1), {
            trigger: !0
        });
    }
}), GameAppView = Backbone.View.extend({
    tagName: "div",
    id: "GameApp",
    initialize: function() {
        this.template = _.template('<div style="float: left"><h1 id="title">KaroBackbone</h1><div id="latestMessages"></div></div><div id="gameInfo"></div><div class="clearer"></div></div><div id="GameView"></div><div id="moveMessages"></div><div id="GameDetails"></div><div id="gameAppNavigation"></div>'), 
        this.$el.html(this.template), this.game = this.model, _.bindAll(this), this.gameView = new GameView({
            model: this.model,
            el: $("#GameView", this.$el)
        }), this.navigation = new GameAppNavigationView({
            el: $("#gameAppNavigation", this.$el)
        }), this.navigation.render(), this.gameInfo = new GameInfoView({
            model: this.game,
            el: $("#gameInfo", this.$el)
        }), this.gameInfo.render(), this.latestMessages = new MoveMessageView({
            model: this.game.moveMessages,
            el: $("#latestMessages", this.$el),
            filter: function(a) {
                return "Kinvarra" == a.get("player").get("name");
            },
            max: 5
        }), this.moveMessages = new MoveMessageView({
            model: this.game.moveMessages,
            el: $("#moveMessages", this.$el),
            filter: !1,
            max: 10
        }), this.model.bind("change", this.redraw);
    },
    close: function() {
        this.gameView.close(), this.gameInfo.close(), this.navigation.close(), alert("Remove myself"), 
        this.$el.remove();
    },
    render: function() {
        app.content.append(this.el);
    },
    redraw: function() {
        app.setTitle(this.model.get("name")), this.gameInfo.redraw();
    },
    setGameId: function(a) {
        0 != a && this.model.load(a);
    }
}), GameInfoView = Backbone.View.extend({
    id: "gameInfo",
    initialize: function() {
        this.template = _.template("<b>Spielinfos:</b> <ul> <li>Karte: <%= mapId %> - <%= mapName %> von <%= mapAuthor %></li><li>Richtungsmodus <b><%= gameDir %></b>, MEANING</li><li>ZZZ steht auf <%= gameZzz %></li><li>Checkpoints sind <b><%= gameCps %></b> CHECK MAP</li><li>Taktisches Crashen ist <b><%= gameTc %></b></li></ul>übrigens wurde das Spiel am <%= gameCreated %> von <%= gameCreator %> gestartet.");
    },
    redraw: function() {
        this.$el.html(this.template({
            mapId: this.model.map.get("id"),
            mapName: this.model.map.get("name"),
            mapAuthor: this.model.map.get("author"),
            gameCreator: this.model.get("creator"),
            gameCreated: this.model.get("created"),
            gameDir: this.model.get("dir"),
            gameCps: this.model.get("cps"),
            gameTc: this.model.get("tcrash"),
            gameZzz: this.model.get("zzz")
        }));
    }
}), GameView = Backbone.View.extend({
    initialize: function() {
        this.game = this.model, this.template = _.template('<div id="mapImageView"></div><div id="playersView"></div>'), 
        this.$el.html(this.template), this.settings = new ViewSettings(), this.mapImageView = new MapImageView({
            model: this.model.map,
            settings: this.settings,
            el: $("#mapImageView", this.$el)
        }), this.playersView = new PlayerCollectionView({
            model: this.model.players,
            settings: this.settings,
            el: $("#playersView", this.$el)
        });
    },
    render: function() {
        this.$el.html(this.template()), this.mapImageView.render(), this.$el.append(this.mapImageView.$el);
    }
}), MapBaseView = Backbone.View.extend({
    optionDefaults: {
        size: 12,
        border: 1,
        cpsActive: !0
    },
    initialize: function(a) {
        _.bindAll(this, "updateFieldSize", "getRowColFromXY", "getRowFromY", "getColFromX", "getXYFromRowCol", "getXFromCol", "getYFromRow", "getFieldAtXY", "setFieldAtXY", "setFieldAtRowCol"), 
        _.defaults(a, this.optionDefaults), this.options = a, this.mapViewSettings = new Backbone.Model(a), 
        this.mapViewSettings.bind("change:size change:border", this.updateFieldSize), this.updateFieldSize();
    },
    updateFieldSize: function() {
        this.fieldSize = this.mapViewSettings.get("size") + this.mapViewSettings.get("border");
    },
    getRowColFromXY: function(a, b) {
        return {
            r: this.getRowFromY(b),
            c: this.getColFromX(a)
        };
    },
    getRowFromY: function(a) {
        return Math.floor(a / this.fieldSize);
    },
    getColFromX: function(a) {
        return Math.floor(a / this.fieldSize);
    },
    getXYFromRowCol: function(a, b) {
        return {
            x: this.getXFromCol(b),
            y: this.getYFromRow(a)
        };
    },
    getXFromCol: function(a) {
        return (a + .5) * this.fieldSize;
    },
    getYFromRow: function(a) {
        return (a + .5) * this.fieldSize;
    },
    getFieldAtXY: function(a, b) {
        alert("Deprecated");
        var c = this.getRowColFromXY(a, b);
        return this.model.getFieldAtRowCol(c.r, c.c);
    },
    setFieldAtXY: function(a, b, c) {
        var d = this.getRowColFromXY(a, b), e = this.getFieldAtRowCol(d.r, d.c);
        e != c && this.setFieldAtRowCol(d.r, d.c, c);
    },
    setFieldAtRowCol: function(a, b, c) {
        this.model.setFieldAtRowCol(a, b, c);
    }
}), MapCodeView = Backbone.View.extend({
    tagName: "textarea",
    initialize: function() {
        _.bindAll(this, "render", "setBounds", "setCode", "getCode"), this.model.bind("change:mapcode", this.render), 
        this.model.bind("change:rows change:cols", this.setBounds), this.render();
    },
    setBounds: function() {
        this.$el.attr({
            rows: this.model.get("rows") + 1,
            cols: this.model.get("cols") + 1
        });
    },
    setCode: function() {
        this.$el.val(this.model.get("mapcode"));
    },
    getCode: function() {
        return this.$el.val();
    },
    render: function() {
        this.setBounds(), this.setCode();
    }
}), MapImageView = MapBaseView.extend({
    className: "mapImageView",
    tag: "img",
    initialize: function() {
        this.constructor.__super__.initialize.apply(this, arguments), _.bindAll(this, "render"), 
        this.model.bind("change:id", this.render), this.mapViewSettings.bind("change", this.render);
    },
    render: function() {
        var a = this.model.get("id");
        if (0 === a) this.$el.hide(); else {
            var b = this.mapViewSettings.get("cpsActive") === !0 ? 1 : 0;
            this.$el.show(), this.$el.attr("src", "http://reloaded.karopapier.de/images/loading.gif"), 
            this.$el.attr("src", "http://reloaded.karopapier.de/map/" + a + ".png?size=" + this.mapViewSettings.get("size") + "&border=" + this.mapViewSettings.get("border") + "&cps=" + b);
        }
    }
}), MapRenderView = MapBaseView.extend({
    id: "mapRenderView",
    className: "mapRenderView",
    tagName: "canvas",
    initialize: function() {
        this.constructor.__super__.initialize.apply(this, arguments), _.bindAll(this, "render", "drawBorder", "drawField", "drawFlagField", "drawStandardField", "drawStartField"), 
        this.model.bind("change:mapcode", this.render), this.mapViewSettings.bind("change", this.render), 
        this.palette = new MapRenderPalette();
    },
    render: function() {
        var a = this.model;
        this.size = this.mapViewSettings.get("size"), this.border = this.mapViewSettings.get("border"), 
        this.el.width = a.get("cols") * this.fieldSize, this.el.height = a.get("rows") * this.fieldSize, 
        this.ctx = this.el.getContext("2d"), this.ctx.fillStyle = this.palette.getRGB("offroad"), 
        this.ctx.lineWidth = this.mapViewSettings.get("size"), this.ctx.fillRect(0, 0, this.el.width, this.el.height);
        for (var b = 0; b < a.get("rows"); b++) for (var c = 0; c < a.get("cols"); c++) this.drawField(b, c, a.getFieldAtRowCol(b, c));
    },
    drawField: function(a, b, c) {
        if (x = b * this.fieldSize, y = a * this.fieldSize, ("X" == c || "Y" == c || "Z" == c || "O" == c || "V" == c || "W" == c || "." == c) && (fillColor = this.palette.getRGB(c), 
        specleColor = this.palette.getRGB(c + "specle"), this.drawStandardField(x, y, fillColor, specleColor)), 
        "F" == c && this.drawFlagField(x, y, this.palette.getRGB("finish1"), this.palette.getRGB("finish2")), 
        parseInt(c) == c) {
            var d = this.palette.getRGB("checkpoint" + c);
            if (c % 2) var e = this.palette.getRGB("checkpointBgOdd"); else var e = this.palette.getRGB("checkpointBgEven");
            this.drawFlagField(x, y, d, e);
        }
        "S" == c && this.drawStartField(x, y, this.palette.getRGB("start1"), this.palette.getRGB("start2")), 
        "P" == c && this.drawStandardField(x, y, this.palette.getRGB("parc"), this.palette.getRGB("roadspecle"), !1);
    },
    drawStandardField: function(a, b, c, d) {
        this.ctx.fillStyle = c, this.ctx.beginPath(), this.ctx.rect(a, b, this.size, this.size), 
        this.ctx.fill();
        var e = this.specles;
        if (arguments[4] === !1 && (e = !1), this.drawBorder(a, b, d), e) {
            this.ctx.fillStyle = d;
            for (var f = 0; f < this.size; f++) {
                this.ctx.beginPath();
                var g = Math.round(Math.random() * (this.size - 1)), h = Math.round(Math.random() * (this.size - 1));
                this.ctx.rect(a + g, b + h, 1, 1), this.ctx.fill();
            }
        }
    },
    drawBorder: function(a, b, c) {
        this.ctx.lineWidth = this.border, this.ctx.strokeStyle = c, this.ctx.beginPath(), 
        this.ctx.moveTo(a + this.size + .5, b), this.ctx.lineTo(a + this.size + .5, b + this.size + .5), 
        this.ctx.lineTo(a, b + this.size + .5), this.ctx.stroke(), this.ctx.closePath();
    },
    drawFlagField: function(a, b, c, d) {
        this.ctx.fillStyle = d, this.ctx.beginPath(), this.ctx.rect(a, b, this.size, this.size), 
        this.ctx.fill();
        for (var e = Math.round(this.size / 4), f = this.size / e, g = 0; f > g; g++) for (var h = 0; f > h; h++) if ((g + h) % 2 == 1) {
            this.ctx.fillStyle = c, this.ctx.beginPath();
            var i = Math.round(a + g * e), j = Math.round(b + h * e);
            this.ctx.rect(i, j, e, e), this.ctx.fill();
        }
        this.drawBorder(a, b, this.palette.getRGB("roadspecle"));
    },
    drawStartField: function(a, b) {
        this.ctx.fillStyle = this.palette.getRGB("start2"), this.ctx.beginPath();
        var c = this.size + this.border;
        this.ctx.rect(a, b, c, c), this.ctx.fill(), this.ctx.strokeStyle = this.palette.getRGB("start1"), 
        this.ctx.beginPath(), this.ctx.rect(a + .3 * c, b + .3 * c, .4 * c, .4 * c), this.ctx.stroke();
    }
}), MapSvgView = MapBaseView.extend({
    tagName: "div",
    className: "mapSvgView",
    initialize: function() {
        this.constructor.__super__.initialize.apply(this, arguments), _.bindAll(this, "adjustSize", "render", "initSvg"), 
        this.initSvg(), this.mapViewSettings.bind("change", this.adjustSize), this.model.bind("change:rows change:cols", this.adjustSize), 
        this.model.bind("change:mapcode", this.render), this.paths = [], this.mapPathFinder = new MapPathFinder(this.model), 
        this.render();
    },
    adjustSize: function() {
        var a = this.model.get("cols") * this.fieldSize, b = this.model.get("rows") * this.fieldSize;
        this.$el.css({
            width: a,
            height: b
        }), this.$SVG.attr({
            width: a,
            height: b
        });
    },
    initSvg: function() {
        var a = MapTemplate(), b = new DOMParser().parseFromString(a, "text/xml");
        this.SVG = b.documentElement, this.$SVG = $(this.SVG), this.$el.empty(), this.el.appendChild(this.SVG);
    },
    render: function() {
        if ("undefined" == typeof this.model.get("mapcode")) return !1;
        var a = this.mapPathFinder.getMainField(), b = this.model.FIELDS[a];
        this.$SVG.find("#mainfill").attr("class", b);
        var c = this.$SVG.find("#paths");
        $(c).empty(), this.mapPathFinder.getAllOutlines();
        for (var d in this.mapPathFinder.outlines) if (d !== a) {
            var e = this.mapPathFinder.getSvgPathFromOutlines(this.mapPathFinder.outlines[d], this.fieldSize), f = this.model.FIELDS[d], g = this.makeSVG("path", {
                d: e,
                "class": f
            });
            c[0].appendChild(g);
        }
        this.trigger("rendered");
    },
    makeSVG: function(a, b) {
        var c = document.createElementNS("http://www.w3.org/2000/svg", a);
        for (var d in b) c.setAttribute(d, b[d]);
        return c;
    }
}), MoveMessageView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this), this.model.bind("change", this.redraw), this.template = _.template("<%= name %>: <%= text %><br />\n"), 
        this.filter = this.options.filter ? this.options.filter : function() {
            return !0;
        };
    },
    redraw: function() {
        var a = "";
        filtered = this.model.filter(this.filter), _.each(filtered, function(b) {
            a += this.template({
                name: b.get("player").get("name"),
                text: b.get("move").get("msg")
            });
        }, this), this.$el.html(a);
    }
}), PlayerCollectionView = Backbone.View.extend({
    className: "playerCollection",
    template: _.template([ "<table class='playerList thin'>", "<tr><th>Spieler</th><th>Farbe</th><th>Züge</th><th>letzter Zug</th><th>Runde</th></tr>", "<% items.each(function(player) { %>", "<%= playerTemplate(player.attributes) %>", "<% }); %>", "</table>" ].join("")),
    playerTemplate: function(a) {
        var b = "";
        b += "<tr>", b += "<td>" + a.name + "</td>", b += '<td style="background-color: #' + a.color + '">&nbsp; &nbsp;</td>', 
        b += '<td><img src="images/car.png" />' + a.moveCount, b += a.crashCount > 0 ? ' <img src="images/crash.png" /> ' + a.crashCount : "", 
        b += "</td>";
        var c = moment(a.lastmove.get("t"), "YYYY-MM-DD HH:mm:ss").toDate();
        return b += '<td><span title="' + moment(c).format("DD.MM.YY H:mm") + '">', b += moment(c).diff(new Date(), "days") < -1 ? "vor " + Math.abs(moment(c).diff(new Date(), "days")) + " Tagen" : moment(c).fromNow(), 
        b += "</span></td>", b += "<td>", "kicked" == a.status && (b += "rausgeworfen"), 
        "left" == a.status && (b += "ausgestiegen"), "invited" == a.status && (b += "eingeladen"), 
        "ok" == a.status && (b += a.dran ? "dran" : 0 != a.position ? "wurde " + a.position + "." : a.moved ? "war schon" : "kommt noch"), 
        b += "</td>", b += "</tr>";
    },
    render: function() {
        var a = this.template({
            items: this.model,
            playerTemplate: this.playerTemplate
        });
        $(this.el).html(a);
    },
    initialize: function() {
        _.bindAll(this), this.model.bind("reset", function() {
            console.info("NEUE SPIELER"), this.render();
        }, this);
    }
}), UserView = Backbone.View.extend({
    options: {
        withAnniversary: !0,
        withGames: !1,
        withDesperation: !1
    },
    tagName: "span",
    initialize: function(a) {
        this.options = _.defaults(a || {}, this.options), _.bindAll(this, "render"), this.model.on("change", this.render), 
        this.render();
    },
    render: function() {
        var a = "";
        return this.options.withDesperation && this.model.get("desperate") && (a += '<img src="http:///reloaded.karopapier.de/images/spielegeil.png" alt="Spielegeil" title="Spielegeil">'), 
        a += '<span class="userLabel">' + this.model.get("login") + "</span>", this.options.withGames && (a += "<small>(" + this.model.get("dran") + "/" + this.model.get("activeGames") + ")</small>"), 
        this.$el.html(a), this;
    }
}), EditorAppRouter = Backbone.Router.extend({
    routes: {
        "editor/:mapId": "loadMap",
        editor: "loadMap",
        "": "loadMap"
    },
    loadMap: function(a) {
        console.info("Loading " + a), a = a || 1, app.editor.loadMapId(a);
    }
}), AppRouter = Backbone.Router.extend({
    routes: {
        "game/:gameId": "showGame",
        game: "showGame"
    },
    showGame: function(a) {
        console.info("Routing to " + a), a = a || 7e4, app.gameAppView.setGameId(a);
    }
});