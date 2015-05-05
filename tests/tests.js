(function(QUnit, jChessPiece, jChessBoard) {
    var settings = {imagesPath: '../images/'};
    var board = $('canvas').jschessboard(settings);

    QUnit.test("test jChessBoard cells", function( assert ) {
        assert.equal(board.cells.length, 64);
        var i;
        for (i = 0; i < 64; i++) {
            assert.equal(board.cells[i], undefined);
        }
    });

    QUnit.test("test jChessBoard: fenToPosition & positionToFen", function( assert ) {
        var fenString = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
        board.fenToPosition(fenString);
        assert.equal( board.positionToFen(), fenString );

        fenString = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
        board.fenToPosition(fenString);
        assert.equal( board.positionToFen(), fenString );

        fenString = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R';
        board.fenToPosition(fenString);
        assert.equal( board.positionToFen(), fenString );

        board.clear();
    });

    var piece = jChessPiece(board, settings);
    QUnit.test("test jChessPiece positionToCoordinate", function( assert ) {
        assert.equal( piece.coordinateToPosition(0,1), 8 );
        assert.equal( piece.coordinateToPosition(0,2), 16 );
        assert.equal( piece.coordinateToPosition(7,7), 63 );
        assert.equal( piece.coordinateToPosition(7,6), 55 );
    });

    QUnit.test("test jChessPiece positionToCoordinate", function( assert ) {
        assert.deepEqual( piece.positionToCoordinate(8), [0,1] );
        assert.deepEqual( piece.positionToCoordinate(16), [0,2] );
        assert.deepEqual( piece.positionToCoordinate(63), [7,7] );
        assert.deepEqual( piece.positionToCoordinate(55), [7,6] );
    });

    QUnit.test("Pawn isValid test", function( assert ) {
        assert.ok(piece.getType('p').isLegal(0, 2));
        assert.ok(piece.getType('p').isLegal(0, 1));
        assert.notOk(piece.getType('p').isLegal(0, 2)); // second try
        assert.notOk(piece.getType('p').isLegal(0, 3));
        assert.notOk(piece.getType('p').isLegal(1, 1));
        assert.notOk(piece.getType('p').isLegal(2, 0));
        assert.notOk(piece.getType('p').isLegal(0, -1));
    });

    QUnit.test("Bishop isValid test", function( assert ) {
        assert.ok(piece.getType('b').isLegal(1, 1));
        assert.ok(piece.getType('b').isLegal(4, 4));
        assert.ok(piece.getType('b').isLegal(-1, -1));
        assert.ok(piece.getType('b').isLegal(-5, -5));
        assert.ok(piece.getType('b').isLegal(-1, 1));
        assert.notOk(piece.getType('b').isLegal(7, 1));
        assert.notOk(piece.getType('b').isLegal(0, 3));
        assert.notOk(piece.getType('b').isLegal(5, -3));
        assert.notOk(piece.getType('b').isLegal(-2, 0));
    });

    QUnit.test("Knight isValid test", function( assert ) {
        var movesOffsets = [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]];

        for(var i in movesOffsets) {
            assert.ok(piece.getType('n').isLegal(movesOffsets[i][0], movesOffsets[i][1]));
        }

        assert.notOk(piece.getType('n').isLegal(7, 1));
        assert.notOk(piece.getType('n').isLegal(0, 3));
        assert.notOk(piece.getType('n').isLegal(5, -3));
        assert.notOk(piece.getType('n').isLegal(-2, 0));
    });

    QUnit.test("King isValid test", function( assert ) {
        var movesOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 1]];

        for(var i in movesOffsets) {
            assert.ok(piece.getType('k').isLegal(movesOffsets[i][0], movesOffsets[i][1]));
        }

        assert.notOk(piece.getType('k').isLegal(2, 1));
        assert.notOk(piece.getType('k').isLegal(7, 1));
        assert.notOk(piece.getType('k').isLegal(0, 3));
        assert.notOk(piece.getType('k').isLegal(5, -3));
        assert.notOk(piece.getType('k').isLegal(-2, 0));
    });

    QUnit.test("Rook isValid test", function( assert ) {
        assert.ok(piece.getType('r').isLegal(1, 0));
        assert.ok(piece.getType('r').isLegal(0, 1));
        assert.ok(piece.getType('r').isLegal(5, 0));
        assert.ok(piece.getType('r').isLegal(0, 5));
        assert.ok(piece.getType('r').isLegal(-1, 0));
        assert.ok(piece.getType('r').isLegal(0, -5));

        assert.notOk(piece.getType('r').isLegal(-1, -1));
        assert.notOk(piece.getType('r').isLegal(2, -1));
        assert.notOk(piece.getType('r').isLegal(-5, 5));
    });

    QUnit.test("Queen isValid test", function( assert ) {
        assert.ok(piece.getType('q').isLegal(1, 0));
        assert.ok(piece.getType('q').isLegal(0, 1));
        assert.ok(piece.getType('q').isLegal(5, 0));
        assert.ok(piece.getType('q').isLegal(0, 5));
        assert.ok(piece.getType('q').isLegal(-1, 0));
        assert.ok(piece.getType('q').isLegal(0, -5));

        assert.ok(piece.getType('q').isLegal(1, 1));
        assert.ok(piece.getType('q').isLegal(4, 4));
        assert.ok(piece.getType('q').isLegal(-1, -1));
        assert.ok(piece.getType('q').isLegal(-5, -5));
        assert.ok(piece.getType('q').isLegal(-1, 1));

        assert.notOk(piece.getType('q').isLegal(-5, 4));
        assert.notOk(piece.getType('q').isLegal(2, -1));
        assert.notOk(piece.getType('q').isLegal(6, 5));
    });

}(QUnit, jChessPiece, jChessBoard));


