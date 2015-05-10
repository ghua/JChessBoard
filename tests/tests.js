(function (QUnit, JChessPiece, JChessBoard) {
    var settings = {imagesPath: '../images/'};
    QUnit.test("test jChessBoard cells", function (assert) {
        var board = $('canvas').jschessboard(settings);
        assert.equal(board.cells.length, 64);
        var i;
        for (i = 0; i < 64; i++) {
            assert.equal(board.cells[i], undefined);
        }
        board.clear();
    });

    QUnit.test("test jChessBoard: fenToPosition & positionToFen", function (assert) {
        var board = $('canvas').jschessboard(settings);
        var fenString = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w';
        board.fenToPosition(fenString);
        assert.equal(board.positionToFen(), fenString);

        fenString = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b';
        board.fenToPosition(fenString);
        assert.equal(board.positionToFen(), fenString);


        fenString = 'rnbqkbnr/ppppppp1/8/7p/7P/8/PPPPPPP1/RNBQKBNR w';
        board.fenToPosition(fenString);
        assert.equal(board.positionToFen(), fenString);

        fenString = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b';
        board.fenToPosition(fenString);
        assert.equal(board.positionToFen(), fenString);
        board.clear();
    });


    QUnit.test("test jChessBoard positionToCoordinate", function (assert) {
        var board = $('canvas').jschessboard(settings);
        assert.equal(board.coordinateToPosition(0, 1), 8);
        assert.equal(board.coordinateToPosition(0, 2), 16);
        assert.equal(board.coordinateToPosition(7, 7), 63);
        assert.equal(board.coordinateToPosition(7, 6), 55);
        assert.equal(board.coordinateToPosition(0, 7), 56);
    });

    QUnit.test("test jChessBoard positionToCoordinate", function (assert) {
        var board = $('canvas').jschessboard(settings);
        assert.deepEqual(board.positionToCoordinate(8), [0, 1]);
        assert.deepEqual(board.positionToCoordinate(16), [0, 2]);
        assert.deepEqual(board.positionToCoordinate(63), [7, 7]);
        assert.deepEqual(board.positionToCoordinate(55), [7, 6]);
    });

    QUnit.test("test jChessBoard newPositionByPositionAndOffset", function (assert) {
        var board = $('canvas').jschessboard(settings);
        assert.deepEqual(board.newPositionByPositionAndOffset(36, 1, 1), 45);
        assert.deepEqual(board.newPositionByPositionAndOffset(36, -1, -1), 27);
        assert.deepEqual(board.newPositionByPositionAndOffset(36, 1, -1), 29);
        assert.deepEqual(board.newPositionByPositionAndOffset(36, -1, 1), 43);
        assert.deepEqual(board.newPositionByPositionAndOffset(36, 3, 0), 39);
        assert.deepEqual(board.newPositionByPositionAndOffset(36, -3, 0), 33);
        assert.deepEqual(board.newPositionByPositionAndOffset(36, 0, 3), 60);
        assert.deepEqual(board.newPositionByPositionAndOffset(36, 0, -3), 12);
    });

    QUnit.test("test jChessBoard offsetsByPositions", function (assert) {
        var board = $('canvas').jschessboard(settings);
        assert.deepEqual(board.offsetsByPositions(36, 37), [1, 0]);
        assert.deepEqual(board.offsetsByPositions(36, 44), [0, 1]);
        assert.deepEqual(board.offsetsByPositions(36, 28), [0, -1]);
        assert.deepEqual(board.offsetsByPositions(36, 35), [-1, 0]);
        assert.deepEqual(board.offsetsByPositions(36, 29), [1, -1]);
        assert.deepEqual(board.offsetsByPositions(36, 27), [-1, -1]);
        assert.deepEqual(board.offsetsByPositions(36, 45), [1, 1]);
    });


    QUnit.test("Pawn isValid test", function (assert) {
        var board = $('canvas').jschessboard(settings);
        var piece = new JChessPiece(board, {fen: 'P', position: 51, imagesPath: '../images/'});
        piece.genPossiblePositions();
        piece.isTouched = false;
        assert.ok(piece.isPossiblePosition(35));
        assert.ok(piece.isPossiblePosition(35));
        assert.ok(piece.isPossiblePosition(43));
        assert.ok(piece.isPossiblePosition(43));
        assert.notOk(piece.isPossiblePosition(60));
        assert.notOk(piece.isPossiblePosition(53));
        assert.notOk(piece.isPossiblePosition(51));
        piece.isTouched = true;
        piece.genPossiblePositions();
        assert.notOk(piece.isPossiblePosition(35)); // second try
        assert.notOk(piece.isPossiblePosition(27));
        board.clear();
    });

    QUnit.test("Bishop isValid test", function (assert) {
        var board = $('canvas').jschessboard(settings);
        var piece = new JChessPiece(board, {fen: 'B', position: 51, imagesPath: '../images/'});
        piece.genPossiblePositions();
        assert.ok(piece.isPossiblePosition(60));
        assert.ok(piece.isPossiblePosition(42));
        assert.ok(piece.isPossiblePosition(33));
        assert.ok(piece.isPossiblePosition(24));
        assert.ok(piece.isPossiblePosition(44));
        assert.ok(piece.isPossiblePosition(37));
        assert.ok(piece.isPossiblePosition(30));
        assert.ok(piece.isPossiblePosition(23));
        assert.notOk(piece.isPossiblePosition(3));
        assert.notOk(piece.isPossiblePosition(52));
        assert.notOk(piece.isPossiblePosition(59));
        assert.notOk(piece.isPossiblePosition(50));
        board.clear();
    });

    QUnit.test("Knight isValid test", function (assert) {
        var board = $('canvas').jschessboard(settings);
        var piece = new JChessPiece(board, {fen: 'N', position: 36, imagesPath: '../images/'});
        piece.genPossiblePositions();
        assert.ok(piece.isPossiblePosition(21));
        assert.ok(piece.isPossiblePosition(30));
        assert.ok(piece.isPossiblePosition(46));
        assert.ok(piece.isPossiblePosition(53));
        assert.ok(piece.isPossiblePosition(51));
        assert.ok(piece.isPossiblePosition(42));
        assert.ok(piece.isPossiblePosition(26));
        assert.ok(piece.isPossiblePosition(19));
        assert.notOk(piece.isPossiblePosition(37));
        assert.notOk(piece.isPossiblePosition(28));
        assert.notOk(piece.isPossiblePosition(20));
        assert.notOk(piece.isPossiblePosition(63));
        board.clear();
    });

    QUnit.test("King isValid test", function (assert) {
        var board = $('canvas').jschessboard(settings);
        var piece = new JChessPiece(board, {fen: 'K', position: 36, imagesPath: '../images/'});
        piece.genPossiblePositions();
        assert.ok(piece.isPossiblePosition(44));
        assert.ok(piece.isPossiblePosition(43));
        assert.ok(piece.isPossiblePosition(35));
        assert.ok(piece.isPossiblePosition(27));
        assert.ok(piece.isPossiblePosition(28));
        assert.ok(piece.isPossiblePosition(29));
        assert.ok(piece.isPossiblePosition(37));
        assert.ok(piece.isPossiblePosition(45));
        assert.notOk(piece.isPossiblePosition(20));
        assert.notOk(piece.isPossiblePosition(12));
        assert.notOk(piece.isPossiblePosition(52));
        assert.notOk(piece.isPossiblePosition(46));
        board.clear();
    });

    QUnit.test("Rook isValid test", function (assert) {
        var board = $('canvas').jschessboard(settings);
        var piece = new JChessPiece(board, {fen: 'R', position: 36, imagesPath: '../images/'});
        piece.genPossiblePositions();
        assert.ok(piece.isPossiblePosition(44));
        assert.ok(piece.isPossiblePosition(52));
        assert.ok(piece.isPossiblePosition(60));
        assert.ok(piece.isPossiblePosition(28));
        assert.ok(piece.isPossiblePosition(20));
        assert.ok(piece.isPossiblePosition(12));
        assert.ok(piece.isPossiblePosition(4));
        assert.ok(piece.isPossiblePosition(35));
        assert.ok(piece.isPossiblePosition(33));
        assert.ok(piece.isPossiblePosition(32));
        assert.ok(piece.isPossiblePosition(37));
        assert.ok(piece.isPossiblePosition(38));
        assert.ok(piece.isPossiblePosition(39));
        assert.notOk(piece.isPossiblePosition(27));
        assert.notOk(piece.isPossiblePosition(45));
        assert.notOk(piece.isPossiblePosition(22));
        assert.notOk(piece.isPossiblePosition(50));
        board.clear();
    });

    QUnit.test("Queen isValid test", function (assert) {
        var board = $('canvas').jschessboard(settings);
        var piece = new JChessPiece(board, {fen: 'Q', position: 36, imagesPath: '../images/'});
        piece.genPossiblePositions();
        assert.ok(piece.isPossiblePosition(44));
        assert.ok(piece.isPossiblePosition(52));
        assert.ok(piece.isPossiblePosition(60));
        assert.ok(piece.isPossiblePosition(28));
        assert.ok(piece.isPossiblePosition(20));
        assert.ok(piece.isPossiblePosition(12));
        assert.ok(piece.isPossiblePosition(4));
        assert.ok(piece.isPossiblePosition(35));
        assert.ok(piece.isPossiblePosition(33));
        assert.ok(piece.isPossiblePosition(32));
        assert.ok(piece.isPossiblePosition(37));
        assert.ok(piece.isPossiblePosition(38));
        assert.ok(piece.isPossiblePosition(39));
        assert.ok(piece.isPossiblePosition(60));
        assert.ok(piece.isPossiblePosition(33));
        assert.ok(piece.isPossiblePosition(44));
        assert.ok(piece.isPossiblePosition(37));
        assert.notOk(piece.isPossiblePosition(42));
        assert.notOk(piece.isPossiblePosition(24));
        assert.notOk(piece.isPossiblePosition(30));
        assert.notOk(piece.isPossiblePosition(23));
        board.clear();
    });

    QUnit.test("Test genLegalPositions by Bishop", function (assert) {
        settings.type = 'b';
        var board = $('canvas').jschessboard(settings);
        piece = new JChessPiece(board, {fen: 'B', position: 36, imagesPath: '../images/'});
        var actual = piece.genPossiblePositions();
        var expected = [[45, 54, 63], [27, 18, 9, 0], [43, 50, 57], [29, 22, 15]];

        assert.deepEqual(actual, expected);
        board.clear();
    });

    QUnit.test("Test genLegalPositions by Knight", function (assert) {
        var piece;
        var board = $('canvas').jschessboard(settings);
        piece = new JChessPiece(board, {fen: 'N', position: 36, imagesPath: '../images/'});
        var actual = piece.genPossiblePositions();
        var expected = [[19], [51], [26], [42], [21], [53], [30], [46]];

        assert.deepEqual(actual, expected);
        board.clear();
    });

    QUnit.test("Test Pawn back step", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board = $('canvas').jschessboard(settings);
        board.start();
        assert.ok(board.move(51, 35));
        assert.notOk(board.move(35, 43));
        board.clear();
    });

    QUnit.test("Test Pawn second double step", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.start();
        assert.ok(board.move(51, 35));
        assert.ok(board.move(14, 22));
        assert.notOk(board.move(35, 19));
        board.clear();
    });

    QUnit.test("Test Bishop illegal jump", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.start();
        assert.notOk(board.move(61, 43));
        board.clear();
    });

    QUnit.test("Test Bishop illegal double punch", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('rnbqkbnr/pppppp2/8/6pp/2B1P3/8/PPPP1PPP/RNBQK1NR');
        assert.notOk(board.move(34, 6));
        board.clear();

        board.fenToPosition('rnbqkbnr/pppppp2/8/6pp/2B1P3/8/PPPP1PPP/RNBQK1NR');
        assert.ok(board.move(34, 13));
        board.clear();
    });

    QUnit.test("Test Bishop illegal rook jump", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('rnbqkbnr/pppppB2/8/6pp/4P3/8/PPPP1PPP/RNBQK1NR');
        assert.notOk(board.move(34, 6));
        board.clear();

        board.fenToPosition('rnbqkbnr/pppppp2/8/6pp/2B1P3/8/PPPP1PPP/RNBQK1NR');
        assert.ok(board.move(34, 13));
        board.clear();
    });

    QUnit.test("Test king can't step on check field", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('4k3/8/8/8/8/8/8/3QK3 b');
        assert.notOk(board.move(4, 3));
        board.clear();
    });

    QUnit.test("Test king can't step on check field after other step", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('4k3/8/8/8/8/8/8/3QK3 b');
        assert.ok(board.move(4, 5));
        assert.ok(board.move(59, 38));
        assert.notOk(board.move(5, 6));
        assert.ok(board.move(5, 4));
        board.clear();
    });

}(QUnit, JChessPiece, JChessBoard));


