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

