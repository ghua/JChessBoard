(function(QUnit, JChessPiece, JChessBoard) {
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


    QUnit.test("test jChessBoard positionToCoordinate", function( assert ) {
        assert.equal( board.coordinateToPosition(0,1), 8 );
        assert.equal( board.coordinateToPosition(0,2), 16 );
        assert.equal( board.coordinateToPosition(7,7), 63 );
        assert.equal( board.coordinateToPosition(7,6), 55 );
        assert.equal( board.coordinateToPosition(0,7), 56 );
    });

    QUnit.test("test jChessBoard positionToCoordinate", function( assert ) {
        assert.deepEqual( board.positionToCoordinate(8), [0,1] );
        assert.deepEqual( board.positionToCoordinate(16), [0,2] );
        assert.deepEqual( board.positionToCoordinate(63), [7,7] );
        assert.deepEqual( board.positionToCoordinate(55), [7,6] );
    });

    var piece = new JChessPiece(board, settings);

    QUnit.test("Pawn isValid test", function( assert ) {
        assert.ok(piece.getType('p')(0, 2, false));
        assert.ok(piece.getType('p')(0, 1, false));
        assert.notOk(piece.getType('p')(0, 2, true)); // second try
        assert.notOk(piece.getType('p')(0, 3, true));
        assert.notOk(piece.getType('p')(1, 1, false));
        assert.notOk(piece.getType('p')(2, 0, false));
        assert.notOk(piece.getType('p')(0, -1, false));
    });

    QUnit.test("Bishop isValid test", function( assert ) {
        assert.ok(piece.getType('b')(1, 1));
        assert.ok(piece.getType('b')(4, 4));
        assert.ok(piece.getType('b')(-1, -1));
        assert.ok(piece.getType('b')(-5, -5));
        assert.ok(piece.getType('b')(-1, 1));
        assert.notOk(piece.getType('b')(7, 1));
        assert.notOk(piece.getType('b')(0, 3));
        assert.notOk(piece.getType('b')(5, -3));
        assert.notOk(piece.getType('b')(-2, 0));
    });

    QUnit.test("Knight isValid test", function( assert ) {
        var movesOffsets = [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]];

        for(var i in movesOffsets) {
            assert.ok(piece.getType('n')(movesOffsets[i][0], movesOffsets[i][1]));
        }

        assert.notOk(piece.getType('n')(7, 1));
        assert.notOk(piece.getType('n')(0, 3));
        assert.notOk(piece.getType('n')(5, -3));
        assert.notOk(piece.getType('n')(-2, 0));
    });

    QUnit.test("King isValid test", function( assert ) {
        var movesOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 1]];

        for(var i in movesOffsets) {
            assert.ok(piece.getType('k')(movesOffsets[i][0], movesOffsets[i][1]));
        }

        assert.notOk(piece.getType('k')(2, 1));
        assert.notOk(piece.getType('k')(7, 1));
        assert.notOk(piece.getType('k')(0, 3));
        assert.notOk(piece.getType('k')(5, -3));
        assert.notOk(piece.getType('k')(-2, 0));
    });

    QUnit.test("Rook isValid test", function( assert ) {
        assert.ok(piece.getType('r')(1, 0));
        assert.ok(piece.getType('r')(0, 1));
        assert.ok(piece.getType('r')(5, 0));
        assert.ok(piece.getType('r')(0, 5));
        assert.ok(piece.getType('r')(-1, 0));
        assert.ok(piece.getType('r')(0, -5));

        assert.notOk(piece.getType('r')(-1, -1));
        assert.notOk(piece.getType('r')(2, -1));
        assert.notOk(piece.getType('r')(-5, 5));
    });

    QUnit.test("Queen isValid test", function( assert ) {
        assert.ok(piece.getType('q')(1, 0));
        assert.ok(piece.getType('q')(0, 1));
        assert.ok(piece.getType('q')(5, 0));
        assert.ok(piece.getType('q')(0, 5));
        assert.ok(piece.getType('q')(-1, 0));
        assert.ok(piece.getType('q')(0, -5));

        assert.ok(piece.getType('q')(1, 1));
        assert.ok(piece.getType('q')(4, 4));
        assert.ok(piece.getType('q')(-1, -1));
        assert.ok(piece.getType('q')(-5, -5));
        assert.ok(piece.getType('q')(-1, 1));

        assert.notOk(piece.getType('q')(-5, 4));
        assert.notOk(piece.getType('q')(2, -1));
        assert.notOk(piece.getType('q')(6, 5));
    });

    QUnit.test("Test genLegalPositions by Bishop", function( assert ) {
        var actual = piece.genLegalPositions(4, 4, [[1,1], [-1,-1], [-1,1], [1,-1]]);
        var expected = [[36, 45, 54, 63], [36, 27, 18, 9, 0], [36, 43, 50, 57], [36, 29, 22, 15]];

        assert.deepEqual(actual, expected);
    });

    QUnit.test("Test genLegalPositions by Knight", function( assert ) {
        var actual = piece.genLegalPositions(4, 4, [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]], true);
        var expected = [[36, 19], [36, 51], [36, 26], [36, 42], [36, 21], [36, 53], [36, 30], [36, 46]];

        assert.deepEqual(actual, expected);
    });

}(QUnit, JChessPiece, JChessBoard));


