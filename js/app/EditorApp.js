var EditorApp = Backbone.Marionette.Application.extend({
    initialize: function() {
        this.layout = new EditorLayout({
            editorApp: this
        });
        this.viewsettings = new MapViewSettings();
        this.editorsettings = new EditorSettings();
        this.map = new Map();
        this.map.setMapcode("XXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXGGGGGGGGGGGGGGGGGGGGGGGGGXX\nXGVGGVGGGGGGVGGGVGVVVGVGGG.X\nXGVGVGGGGGGGVVGVVGVGGGVGGG.X\nXGVVGGGVVVGGVGVGVGVVGGVGGG.X\nXGVGVGGVGVGGVGGGVGVGGGVGGG.X\nXGVGGVGVVVVGVGGGVGVVVGVVVG.X\nXGGGGGGGGGGGGGGGGGGGGGGGGG.X\nXX.........................X\nXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
        //this.map.setMapcode("F123456789\nWXYZLNOXPS");
        /*
        this.viewsettings.set({
            size: 20,
            border: 10,
            specles: true
        });
        */

        this.listenTo(Karopapier.vent, "HOTKEY", _.bind(this.hotkey, this));

        this.karoMaps = new KaroMapCollection();
        //CustomMapCollection()
        //WikiMapCollection()

        this.imageTranslator = new EditorImageTranslator({
            map: this.map,
            editorsettings: this.editorsettings
        });

        this.editorUndo = new EditorUndo({
            map: this.map,
            editorsettings: this.editorsettings
        });
    },
    hotkey: function(e) {
        var ascii = e.which;
        var char = String.fromCharCode(ascii).toUpperCase();
        //check hotkey for being a map code
        if (this.map.isValidField(char)) {
            this.editorsettings.setButtonField(1, char);
            e.preventDefault();
            e.stopPropagation();
        }

        //ctrl + z -->undo
        if (e.ctrlKey && ascii == 26) {
            //UNDO
            this.editorUndo.undo()
            e.preventDefault();
            e.stopPropagation();
        }

        //console.log("Unhandled hotkey",char, ascii);
    }
});
