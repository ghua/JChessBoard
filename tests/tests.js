QUnit.test("testCoordinateToNumber", function( assert ) {
    assert.equal( _coordinateToNumber(0,1), 8 );
    assert.equal( _coordinateToNumber(0,2), 16 );
    assert.equal( _coordinateToNumber(7,7), 63 );
    assert.equal( _coordinateToNumber(7,6), 55 );
});

QUnit.test("testNumberToCoordinate", function( assert ) {
    assert.deepEqual( _numberToCoordinate(8), [0,1] );
    assert.deepEqual( _numberToCoordinate(16), [0,2] );
    assert.deepEqual( _numberToCoordinate(63), [7,7] );
    assert.deepEqual( _numberToCoordinate(55), [7,6] );
});

var board = $('canvas');
board.jschessboard();

QUnit.test("test _initBoard", function( assert ) {
    assert.equal(_cells.length, 64);
    for (var i = 0; i < 64; i++) {
        assert.equal(_cells[i], null);
    }
});

QUnit.test("test _fenToPosition & _positionToFen", function( assert ) {
    board.startPosition();

    var fenString = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    _fenToPosition(board ,  fenString);
    assert.equal( _positionToFen(board), fenString );

    fenString = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
    _fenToPosition(board ,  fenString);
    assert.equal( _positionToFen(board), fenString );

    fenString = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R';
    _fenToPosition(board ,  fenString);
    assert.equal( _positionToFen(board), fenString );
});

QUnit.test("Pawn isValid test", function( assert ) {
    assert.ok(_pieces.p.isLegal(0, 2));
    assert.ok(_pieces.p.isLegal(0, 1));
    assert.notOk(_pieces.p.isLegal(0, 2)); // second try
    assert.notOk(_pieces.p.isLegal(0, 3));
    assert.notOk(_pieces.p.isLegal(1, 1));
    assert.notOk(_pieces.p.isLegal(2, 0));
    assert.notOk(_pieces.p.isLegal(0, -1));
});

QUnit.test("Bishop isValid test", function( assert ) {
    assert.ok(_pieces.b.isLegal(1, 1));
    assert.ok(_pieces.b.isLegal(4, 4));
    assert.ok(_pieces.b.isLegal(-1, -1));
    assert.ok(_pieces.b.isLegal(-5, -5));
    assert.ok(_pieces.b.isLegal(-1, 1));
    assert.notOk(_pieces.b.isLegal(7, 1));
    assert.notOk(_pieces.b.isLegal(0, 3));
    assert.notOk(_pieces.b.isLegal(5, -3));
    assert.notOk(_pieces.b.isLegal(-2, 0));
});

QUnit.test("Knight isValid test", function( assert ) {
    var movesOffsets = [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]];

    for(var i in movesOffsets) {
        assert.ok(_pieces.n.isLegal(movesOffsets[i][0], movesOffsets[i][1]));
    }

    assert.notOk(_pieces.n.isLegal(7, 1));
    assert.notOk(_pieces.n.isLegal(0, 3));
    assert.notOk(_pieces.n.isLegal(5, -3));
    assert.notOk(_pieces.n.isLegal(-2, 0));
});

QUnit.test("King isValid test", function( assert ) {
    var movesOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 1]];

    for(var i in movesOffsets) {
        assert.ok(_pieces.k.isLegal(movesOffsets[i][0], movesOffsets[i][1]));
    }

    assert.notOk(_pieces.k.isLegal(2, 1));
    assert.notOk(_pieces.k.isLegal(7, 1));
    assert.notOk(_pieces.k.isLegal(0, 3));
    assert.notOk(_pieces.k.isLegal(5, -3));
    assert.notOk(_pieces.k.isLegal(-2, 0));
});

QUnit.test("Rook isValid test", function( assert ) {
    assert.ok(_pieces.r.isLegal(1, 0));
    assert.ok(_pieces.r.isLegal(0, 1));
    assert.ok(_pieces.r.isLegal(5, 0));
    assert.ok(_pieces.r.isLegal(0, 5));
    assert.ok(_pieces.r.isLegal(-1, 0));
    assert.ok(_pieces.r.isLegal(0, -5));

    assert.notOk(_pieces.r.isLegal(-1, -1));
    assert.notOk(_pieces.r.isLegal(2, -1));
    assert.notOk(_pieces.r.isLegal(-5, 5));
});

QUnit.test("Queen isValid test", function( assert ) {
    assert.ok(_pieces.q.isLegal(1, 0));
    assert.ok(_pieces.q.isLegal(0, 1));
    assert.ok(_pieces.q.isLegal(5, 0));
    assert.ok(_pieces.q.isLegal(0, 5));
    assert.ok(_pieces.q.isLegal(-1, 0));
    assert.ok(_pieces.q.isLegal(0, -5));

    assert.ok(_pieces.q.isLegal(1, 1));
    assert.ok(_pieces.q.isLegal(4, 4));
    assert.ok(_pieces.q.isLegal(-1, -1));
    assert.ok(_pieces.q.isLegal(-5, -5));
    assert.ok(_pieces.q.isLegal(-1, 1));

    assert.notOk(_pieces.q.isLegal(-5, 4));
    assert.notOk(_pieces.q.isLegal(2, -1));
    assert.notOk(_pieces.q.isLegal(6, 5));
});
