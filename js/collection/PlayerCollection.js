var PlayerCollection = Backbone.Collection.extend({
    model: Player,

    initialize: function(models, options) {
        this.moveMessages=options.moveMessages;

        /* re-read movemessages */
        this.listenTo(this, "reset",function(o,id) {
            console.info("Init Players");
            //Look for messages

            //clear messages first
            this.moveMessages.reset();
            this.each(function(player) {
                //parse player moves for messages
                player.moves.each(function(move){
                    if (move.get("msg")) {
                        mm=new MoveMessage({
                            "move": move,
                            "player": player
                        });
                        this.moveMessages.add(mm,{silent:true});
                    }
                },this);
            },this);
            this.moveMessages.trigger("change");
        });
    },

    /**
     * positions, where all players currently stand that already moved this round
     */
    getOccupiedPositions: function() {
        var blockers = this.where({
            position: 0,
            status: "ok",
            moved: true
        });

        var positions=[];
        for (var i = 0, l=blockers.length;i<l; i++) {
            var mos =blockers[i].moves;
            if (mos.length>0) {
                var mo = mos.at(mos.length-1);
                positions.push(new Position({
                    x: mo.attributes.x,
                    y: mo.attributes.y
                }))
            };
        }
        return positions;
    }
});