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
        var fenString = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w -';
        board.fenToPosition(fenString);
        assert.equal(board.positionToFen(), fenString);

        fenString = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b -';
        board.fenToPosition(fenString);
        assert.equal(board.positionToFen(), fenString);


        fenString = 'rnbqkbnr/ppppppp1/8/7p/7P/8/PPPPPPP1/RNBQKBNR w KQ';
        board.fenToPosition(fenString);
        assert.equal(board.positionToFen(), fenString);

        fenString = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq';
        board.fenToPosition(fenString);
        assert.equal(board.positionToFen(), fenString);
        board.clear();
    });


    QUnit.test("test jChessBoard coordinateToPosition - wite side", function (assert) {
        var board = $('canvas').jschessboard(settings);
        assert.equal(board.coordinateToPosition(0, 0), 0);
        assert.equal(board.coordinateToPosition(0, 1), 8);
        assert.equal(board.coordinateToPosition(0, 2), 16);
        assert.equal(board.coordinateToPosition(7, 7), 63);
        assert.equal(board.coordinateToPosition(7, 6), 55);
        assert.equal(board.coordinateToPosition(0, 7), 56);
    });

    QUnit.test("test jChessBoard coordinateToPosition - black side", function (assert) {
        var settings = $.extend({'side': 'b'}, settings);
        var board = $('canvas').jschessboard(settings);
        assert.equal(board.coordinateToPosition(0, 0), 56);
        assert.equal(board.coordinateToPosition(0, 1), 48);
        assert.equal(board.coordinateToPosition(0, 2), 40);
        assert.equal(board.coordinateToPosition(7, 7), 7);
        assert.equal(board.coordinateToPosition(7, 6), 15);
        assert.equal(board.coordinateToPosition(0, 7), 0);
    });

    QUnit.test("test jChessBoard positionToCoordinate - wite side", function (assert) {
        var board = $('canvas').jschessboard(settings);
        assert.deepEqual(board.positionToCoordinate(8), [0, 1]);
        assert.deepEqual(board.positionToCoordinate(16), [0, 2]);
        assert.deepEqual(board.positionToCoordinate(63), [7, 7]);
        assert.deepEqual(board.positionToCoordinate(55), [7, 6]);
    });

    QUnit.test("test jChessBoard positionToCoordinate - black side", function (assert) {
        var settings = $.extend({'side': 'b'}, settings);
        var board = $('canvas').jschessboard(settings);
        assert.deepEqual(board.positionToCoordinate(8), [0, 6]);
        assert.deepEqual(board.positionToCoordinate(16), [0, 5]);
        assert.deepEqual(board.positionToCoordinate(63), [7, 0]);
        assert.deepEqual(board.positionToCoordinate(55), [7, 1]);
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
        assert.ok(actual.vectors.length === 4);
        for (var e = 0; e < expected.length; e++) {
            assert.deepEqual(actual.vectors[e].keys, expected[e]);
        }
        board.clear();
    });

    QUnit.test("Test genLegalPositions by Knight", function (assert) {
        var piece;
        var board = $('canvas').jschessboard(settings);
        piece = new JChessPiece(board, {fen: 'N', position: 36, imagesPath: '../images/'});
        var actual = piece.genPossiblePositions();
        var expected = [[19], [51], [26], [42], [21], [53], [30], [46]];
        assert.ok(actual.vectors.length === 8);
        for (var e = 0; e < expected.length; e++) {
            assert.deepEqual(actual.vectors[e].keys, expected[e]);
        }
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

    QUnit.test("Test king can't step on check field", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('4k3/8/8/8/8/8/8/3QK3 b');
        assert.ok(board.crossing[3].length === 2);
        assert.ok(board.crossing[11].length === 2);
        assert.ok(board.crossing[12].length === 1);
        assert.ok(board.crossing[13].length === 1);
        assert.ok(board.crossing[5].length === 1);
        assert.notOk(board.move(4, 3));
        board.clear();
    });

    QUnit.test("Test king can't step on check field after other step", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('4k3/8/8/8/8/8/8/3QK3 b');

        assert.ok(board.crossing[3].length === 2);
        assert.ok(board.crossing[11].length === 2);
        assert.ok(board.crossing[12].length === 1);
        assert.ok(board.crossing[13].length === 1);
        assert.ok(board.crossing[5].length === 1);

        assert.ok(board.move(4, 5));

        assert.ok(board.crossing[3].length === 1);
        assert.ok(board.crossing[4].length === 1);
        assert.ok(board.crossing[12].length === 1);
        assert.ok(board.crossing[13].length === 1);
        assert.ok(board.crossing[14].length === 1);
        assert.ok(board.crossing[6].length === 1);

        assert.ok(board.move(59, 38));
        assert.notOk(board.move(5, 6));
        assert.ok(board.move(5, 4));
        assert.ok(board.move(38, 35));
        assert.notOk(board.move(4, 11));
        assert.ok(board.move(4, 12));
        assert.ok(board.move(35, 36));
        assert.notOk(board.move(12, 4));
        board.clear();
    });

    QUnit.test("Test king ignore self color shadow", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('4k3/8/8/8/8/8/8/3QK3 w');
        assert.ok(board.move(60, 51));
        board.clear();

        board.fenToPosition('4k3/8/8/8/8/8/8/3QK3 w');
        assert.ok(board.move(60, 52));
        board.clear();

        board.fenToPosition('4k3/8/8/8/8/8/8/3QK3 w');
        assert.ok(board.move(60, 53));
        board.clear();
    });

    QUnit.test("Two kings fight first step", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('8/8/8/4k3/8/4K3/8/8 w');

        assert.notOk(board.move(44, 35));
        assert.notOk(board.move(44, 36));
        assert.notOk(board.move(44, 37));
        assert.ok(board.move(44, 45));

        board.clear();
    });

    QUnit.test("Two kings fight second step", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('8/8/8/4k3/8/4K3/8/8 w');
        assert.ok(board.move(44, 45));
        assert.notOk(board.move(28, 37));
        board.clear();

        board.fenToPosition('8/8/8/4k3/8/4K3/8/8 w');
        assert.ok(board.move(44, 45));
        assert.notOk(board.move(28, 36));
        board.clear();
    });

    QUnit.test("Test JChessPossiblePositions all", function (assert) {
        var positions = new JChessPossiblePositions();
        var vector;

        vector = new JChessVector();
        vector.set(1, true);
        vector.set(2, true);
        positions.push(vector);

        vector = new JChessVector();
        vector.set(3, true);
        vector.set(4, true);
        positions.push(vector);

        vector = new JChessVector();
        vector.set(5, true);
        vector.set(6, true);
        positions.push(vector);

        vector = new JChessVector();
        vector.set(7, true);
        vector.set(8, true);
        positions.push(vector);

        var all = positions.all();
        assert.deepEqual(all, [1, 2, 3, 4, 5, 6, 7, 8]);
    });

    QUnit.test("Test JChessPossiblePositions uniq", function (assert) {
        var positions = new JChessPossiblePositions();
        var vector;

        vector = new JChessVector();
        vector.set(1, true);
        vector.set(2, true);
        positions.push(vector);

        vector = new JChessVector();
        vector.set(3, true);
        vector.set(4, true);
        positions.push(vector);

        vector = new JChessVector();
        vector.set(5, true);
        vector.set(6, true);
        positions.push(vector);

        var secondPositions = new JChessPossiblePositions();
        vector = new JChessVector();
        vector.set(1, true);
        vector.set(5, true);
        vector.set(9, true);
        secondPositions.push(vector);

        var intersect = positions.intersect(secondPositions);
        assert.deepEqual(intersect, [1, 5]);
    });

    QUnit.test("Test king false checked by pawn", function (assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('8/8/8/4p3/8/4K3/8/8 w');
        assert.notOk(board.move(44, 35));
        assert.ok(board.move(44, 36));
        assert.notOk(board.move(44, 37));
        board.clear();

        board.fenToPosition('8/8/8/8/3Kp3/8/8/8 w');
        assert.notOk(board.move(35, 43));
        assert.ok(board.move(35, 27));
        board.clear();
    });

    QUnit.test("Test king false checked by pawn 2", function (assert) {
        var board = $('canvas').jschessboard(settings);

        board.fenToPosition('rnbq1bnr/ppp1kppp/3P4/1N6/4p3/8/PPPP1PPP/R1BQKBNR b');
        assert.ok(board.move(12, 11));
        board.clear();
    });

    QUnit.test("Test hitting the protected position", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('8/8/8/6n1/3Kp3/8/8/8 w');
        assert.notOk(board.move(35, 36));
        board.clear();
    });

    QUnit.test("Test check", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('8/8/8/6n1/3Kq3/8/R7/8 w');
        assert.notOk(board.move(48, 0));
        board.clear();
    });

    QUnit.test("Test move after check and position reset", function(assert) {
        var board = $('canvas').jschessboard(settings);
        var fen = '8/8/8/6n1/3Kq3/8/R7/8 w -';
        board.fenToPosition(fen);
        assert.notOk(board.move(48, 0));
        assert.ok(board.positionToFen() === fen);
        board.clear();
    });

    QUnit.test("Test checkmate", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('8/8/8/8/4k2K/8/8/7r b');

        assert.ok(board.move(36, 37));
        assert.notOk(board.move(39, 31));
        assert.notOk(board.move(36, 30));
        assert.notOk(board.move(36, 38));
        assert.notOk(board.move(36, 46));
        assert.notOk(board.move(36, 47));

        assert.ok(board.nextStepSide === undefined);

        board.clear();
    });

    QUnit.test("Test basic king side castling", function(assert) {
        var fen = 'rnbqkb1r/ppppp2p/8/5np1/5Pp1/7N/PPPPP1BP/RNBQK2R w KQkq';
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition(fen);

        assert.ok(board.move(60, 62));
        assert.ok(board.get(61).type === 'r');
        assert.ok(board.get(62).type === 'k');
        assert.ok('rnbqkb1r/ppppp2p/8/5np1/5Pp1/7N/PPPPP1BP/RNBQ1RK1 w kq', board.positionToFen());

        board.clear();
    });

    QUnit.test("Test basic queen side castling", function(assert) {
        var fen = 'rnbqkb1r/ppp5/5n2/3ppppp/1PPP4/B2Q4/P2NPPPP/R3KBNR w KQkq';
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition(fen);

        assert.ok(board.move(60, 58));
        assert.ok(board.get(59).type === 'r');
        assert.ok(board.get(58).type === 'k');
        assert.equal('rnbqkb1r/ppp5/5n2/3ppppp/1PPP4/B2Q4/P2NPPPP/2KR1BNR b kq', board.positionToFen());

        board.clear();
    });

    QUnit.test("Test _makeRangeBetween", function(assert) {
        var board = $('canvas').jschessboard(settings);
        var i;
        var range = board._makeRangeBetween(0, 3);
        assert.ok(range.length === 4);
        for(i = 0; i < range.length; i++) {
            assert.ok(range[i] === i);
        }

        range = board._makeRangeBetween(3, 0);
        assert.ok(range.length === 4);
        for(i = 0; i < range.length; i++) {
            assert.ok(range[i] === range.length-i-1);
        }
    });

    QUnit.test("Test basic queen side castling fail - rook already is touched", function(assert) {
        var fen = 'rnbqkb1r/ppp5/5n2/3ppppp/1PPP4/B2Q4/P2NPPPP/R3KBNR w KQkq';
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition(fen);

        assert.ok(board.move(56, 57));
        assert.ok(board.move(31, 39));
        assert.ok(board.move(57, 56));
        assert.ok(board.move(30, 38));
        assert.notOk(board.move(60, 58));
        assert.equal('rnbqkb1r/ppp5/5n2/3ppp2/1PPP2pp/B2Q4/P2NPPPP/R3KBNR w kq', board.positionToFen());

        board.clear();
    });

    QUnit.test("Test basic queen side castling fail - king already is touched", function(assert) {
        var fen = 'rnbqkb1r/ppp5/5n2/3ppppp/1PPP4/B2Q4/P2NPPPP/R3KBNR w KQkq';
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition(fen);

        assert.ok(board.move(60, 59));
        assert.ok(board.move(31, 39));
        assert.ok(board.move(59, 60));
        assert.ok(board.move(30, 38));
        assert.notOk(board.move(60, 58));
        assert.equal('rnbqkb1r/ppp5/5n2/3ppp2/1PPP2pp/B2Q4/P2NPPPP/R3KBNR w kq', board.positionToFen());

        board.clear();
    });

    QUnit.test("Test basic queen side castling fail - king way is in attack", function(assert) {
        var fen = 'rnbqk2r/ppp5/5n2/8/8/b7/7R/R3KBN1 w KQkq';
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition(fen);

        assert.notOk(board.move(60, 58));

        board.clear();
    });

    QUnit.test("Test basic queen side castling fail - king is in check", function(assert) {
        var fen = 'rnbqk2r/ppp5/5n2/8/1b6/8/7R/R3KBN1 w KQkq';
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition(fen);

        assert.notOk(board.move(60, 58));

        board.clear();
    });

    QUnit.test("Test changing fen by castling", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq');
        assert.ok(board.move(63, 55));
        assert.ok(board.positionToFen().match(/Qkq$/));
        board.clear();

        board.fenToPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq');
        assert.ok(board.move(56, 48));
        assert.ok(board.positionToFen().match(/Kkq$/));
        board.clear();

        board.fenToPosition('r3k2r/8/8/8/8/8/8/R3K2R b KQkq');
        assert.ok(board.move(0, 8));
        assert.ok(board.positionToFen().match(/KQk$/));
        board.clear();

        board.fenToPosition('r3k2r/8/8/8/8/8/8/R3K2R b KQkq');
        assert.ok(board.move(7, 15));
        assert.ok(board.positionToFen().match(/KQq$/));
        board.clear();

        board.fenToPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq');
        assert.ok(board.move(60, 52));
        assert.ok(board.positionToFen().match(/kq$/));
        board.clear();

        board.fenToPosition('r3k2r/8/8/8/8/8/8/R3K2R b KQkq');
        assert.ok(board.move(4, 12));
        assert.ok(board.positionToFen().match(/KQ$/));
        board.clear();
    });

    QUnit.test("Test piece wrong jump", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('rnbqkbnr/ppppp1pp/5p2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq');
        assert.notOk(board.move(53, 37));
        board.clear();
    });

    QUnit.test("Test _anToPosition - white side", function(assert) {
        var board = $('canvas').jschessboard();
        assert.equal(board._anToPosition('a1'), 56);
        assert.equal(board._anToPosition('e4'), 36);
        assert.equal(board._anToPosition('a8'), 0);
    });

    QUnit.test("Test _anToPosition - black side", function(assert) {
        var board = $('canvas').jschessboard($.extend({'side': 'b'}, settings));
        assert.equal(board._anToPosition('a1'), 56);
        assert.equal(board._anToPosition('e4'), 36);
        assert.equal(board._anToPosition('a8'), 0);
    });

    QUnit.test("Test get pawn by algebraic notation - _pieceByNextSan", function(assert) {
        var board = $('canvas').jschessboard(settings);
        var piece;
        board.start();
        piece = board._pieceByNextSan('e4');
        assert.equal(piece.fen, 'P');
        assert.equal(piece.currentPosition, 52);
        board.clear();
    });

    QUnit.test("Test get knight by algebraic notation - _pieceByNextSan", function(assert) {
        var board = $('canvas').jschessboard(settings);
        var piece;
        board.start();
        piece = board._pieceByNextSan('Nc3');
        assert.equal(piece.fen, 'N');
        assert.equal(piece.currentPosition, 57);
        board.clear();
    });

    QUnit.test("Test _positionToAn", function(assert) {
        var board = $('canvas').jschessboard(settings);
        assert.equal(board._positionToAn(56), 'a1');
        assert.equal(board._positionToAn(36), 'e4');
        assert.equal(board._positionToAn(0), 'a8');
    });

    QUnit.test("Test choice between two knights by algebraic notation - _pieceByNextSan", function(assert) {
        var board = $('canvas').jschessboard(settings);
        var piece;
        board.fenToPosition('rnbqkbn1/pppppp1r/6pp/8/8/2N3N1/PPPPPPPP/R1BQKB1R w KQq');
        piece = board._pieceByNextSan('Nge4');
        assert.equal(piece.fen, 'N');
        assert.equal(piece.currentPosition, 46);

        piece = board._pieceByNextSan('Ng3e4');
        assert.equal(piece.fen, 'N');
        assert.equal(piece.currentPosition, 46);
        board.clear();

        board.fenToPosition('rnbqkbnr/pppppp2/6pp/6N1/8/6N1/PPPPPPPP/R1BQKB1R w KQq');
        piece = board._pieceByNextSan('N3e4');
        assert.equal(piece.fen, 'N');
        assert.equal(piece.currentPosition, 46);
        board.clear();
    });

    QUnit.test("Test move by algebraic notation", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.start();
        assert.ok(board.move('e4'));
        assert.ok(board.move('e5'));
        assert.ok(board.move('Nf3'));
        assert.ok(board.move('Nf6'));
        assert.ok(board.move('Nxe5'));
        board.clear();
    });

    QUnit.test("Test changing double castling by algebraic notation", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq');
        assert.equal(board.move('0-0-0'), '0-0-0');
        assert.equal(board.move('O-O'), '0-0');
        board.clear();
    });

    QUnit.test("Test pawn promotion by algebraic notation", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.fenToPosition('4k3/1P6/8/8/8/8/8/4K3 w KQkq');
        assert.equal(board.move('b8N'), 'b7b8N');
        assert.ok(board.has(1));
        assert.equal(board.get(1).fen, 'N');
        board.clear();
    });

    QUnit.test("Test returning algebraic notation by board move method", function(assert) {
        var board = $('canvas').jschessboard(settings);
        board.start();
        assert.equal(board.move('e4'), 'e2e4');
        assert.equal(board.move('e5'), 'e7e5');
        assert.equal(board.move('h4'), 'h2h4');
        assert.equal(board.move('Nf6'), 'Ng8f6');
        assert.equal(board.move('h5'), 'h4h5');
        assert.equal(board.move('Nxh5'), 'Nf6xh5');
        board.clear();
    });

}(QUnit, JChessPiece, JChessBoard));


