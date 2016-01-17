module("Motion");
test("basic", function () {
    expect(5);

    var mo = new Motion();
    mo.setXY1toXY2(1, 1, 4, 2);
    equal(mo.toString(), "[4|2] (3|1)", "setXY1toXY2");

    var pos = new Position({x: 3, y: 3});
    var vec = new Vector({x: 2, y: 0});
    var mo = new Motion({position: pos, vector: vec});

    equal(mo.toString(), '[3|3] (2|0)', '->toString() creates [|] (|) output');
    equal(mo.toKeyString(), '[3|3]', '->toKeyString() creates position only [|] output');

    var p1 = new Position(1, 1);
    var p2 = new Position(5, 3);
    var v = p1.getVectorTo(p2);
    var mo = new Motion({position: p2, vector: v});
    equal(mo.getSourcePosition().toString(), p1.toString(), '->getSourcePosition() returns correct origin');

    var p = new Position({x: 2, y: 1});
    var v = new Vector({x: -3, y: -1});
    var m = new Motion({
        "position": p,
        "vector": v
    });
    equal(m.getSourcePosition().toString(), "[5|2]", "getSourcePosition");
});

test("getStopPosition", function() {
    expect(3);

    var mo = new Motion();
    mo.setXY1toXY2(2,2,2,2);
    equal(mo.getStopPosition().toString(),"[2|2]",mo.toString() + " stops at 2|2")

    var mo = new Motion();
    mo.setXY1toXY2(0,0,2,2);
    equal(mo.getStopPosition().toString(),"[3|3]",mo.toString() + " stops at 3|3")

    var mo = new Motion();
    mo.setXY1toXY2(9,4,6,2)
    equal(mo.getStopPosition().toString(),"[3|1]",mo.toString() + " stops at 0|0")
})


test("Possibles", function () {
    expect(4);

    var p = new Position({x: 2, y: 1});
    var v = new Vector({x: 3, y: 1});
    var m = new Motion({
        "position": p,
        "vector": v
    });
    var expected = [
        "[4|1] (2|0)", "[5|1] (3|0)", "[6|1] (4|0)",
        "[4|2] (2|1)", "[5|2] (3|1)", "[6|2] (4|1)",
        "[4|3] (2|2)", "[5|3] (3|2)", "[6|3] (4|2)"
    ]
    var possibles = m.getPossibles();
    var stringArray = possibles.map(function (poss, i, possibles) {
        return poss.toString();
    });
    deepEqual(stringArray, expected, "->getPossibles returns 9 correct values");

    m.setXY1toXY2(5,5,3,3);
    var possibles = m.getPossiblesByLength();
    equal(possibles[0].toString(), "[2|2] (-1|-1)", "shortest first");
    equal(possibles[8].toString(), "[0|0] (-3|-3)", "longest last");

    var m = new Motion();
    m.setXY1toXY2(4,3,3,3);
    var expected = [
        "[1|2]","[2|2]","[3|2]",
        "[1|3]","[2|3]",
        "[1|4]","[2|4]","[3|4]"
    ]
    var possibles = m.getPossibles();
    var stringArray = possibles.map(function (poss, i, possibles) {
        return poss.toKeyString();
    });
    deepEqual(stringArray, expected, "->getPossibles does not returns 0|0");

})


//test("Illumination", function () {

    /*
     //create 9 array keys
     $ak=array('[4|2]','[5|2]','[6|2]','[4|3]','[5|3]','[6|3]','[4|4]','[5|4]','[6|4]');
     $nextMos=$mo->getNextMotionsPositionIndex();
     $t->is(array_keys($nextMos),$ak,'->getNextMotionsPositionIndex() creates pos based keys');
     $p2=new Position(5,2);
     $v2=new Vector(2,-1);
     $target2=new Motion($p2,$v2);
     $t->ok(($nextMos['[5|2]']==$target2),'->getNextMotionsPositionIndex() creates a correct Possibility 2');
     $p7=new Position(4,4);
     $v7=new Vector(1,1);
     $target7=new Motion($p7,$v7);
     $t->ok(($nextMos['[4|4]']==$target7),'->getNextMotionsPositionIndex() creates a correct Possibility 7');
     $p8=new Position(6,3);
     $v8=new Vector(3,0);
     $target8=new Motion($p8,$v8);
     $t->ok(($nextMos['[5|4]']!=$target8),'NTATYDNSF ->getNextMotionsPositionIndex() does not mix 6 and 8');

     $mo=createMotion(3,2,2,1);
     $illu=new PositionCollection();
     $illu->addXY(0,0);
     $illu->addXY(0,1);
     $illu->addXY(0,2);
     $illu->addXY(1,0);
     $illu->addXY(1,1);
     $illu->addXY(1,2);
     $illu->addXY(2,0);
     $illu->addXY(2,1);
     $illu->addXY(2,2);
     $illu->addXY(2,3);
     $illu->addXY(3,0);
     $illu->addXY(3,1);
     $illu->addXY(3,2);
     $illu->addXY(3,3);
     $illu->addXY(3,4);
     $illu->addXY(4,1);
     $illu->addXY(4,2);
     $illu->addXY(4,3);
     $illu->addXY(4,4);
     $illu->addXY(5,2);
     $illu->addXY(5,3);
     $illu->addXY(5,4);
     $illu->addXY(6,2);
     $illu->addXY(6,3);
     $illu->addXY(6,4);
     $t->is($mo->getIlluminatedPositions()->getArray(),$illu->getArray(),'->getIlluminatedPositions() returns right Positions');

     */
//});