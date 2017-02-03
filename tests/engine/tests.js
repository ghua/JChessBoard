(function (QUnit, JChessPiece, JChessBoard) {
    var settings = {imagesPath: '../../images/'};

    QUnit.test("Test JChessEngine._evaluateFen", function (assert) {
        var board = new JChessBoard(settings);
        board.start();
        var engine = new JChessEngine(board, 'w');

        assert.equal(engine._evaluateFen(board.positionToFen(), 'w'), 0);

        board.fenToPosition('8/8/8/8/4k2K/8/8/7r b -')
        assert.equal(engine._evaluateFen(board.positionToFen(), 'w'), -5);

        assert.equal(engine._evaluateFen(board.positionToFen(), 'b'), 5);
    });

    QUnit.test("Test simple choice between pawn and queen", function (assert) {
        var fens = ['1Q6/8/n7/2P5/8/8/8/8 b -', '1P6/8/n7/2Q5/8/8/8/8 b -'];
        var results = ['Na6xb8', 'Na6xc5'];

        var board = new JChessBoard(settings);
        var engine = new JChessEngine(board, 'b');

        for (var n = 0; n < fens.length; n++) {
            board.fenToPosition(fens[n]);
            assert.equal(board.move(engine.think()), results[n]);
        }
    });

    QUnit.test("Test with chessfield.ru task #1 (Dehler, Otto Georg Edgar) - black side", function (assert) {
        var fen = 'k7/1R6/nK6/8/8/8/8/8 w -';

        var board = new JChessBoard(settings);
        board.fenToPosition(fen);
        var engine = new JChessEngine(board, 'b');

        board.move('Rb7d7');
        assert.equal(board.move(engine.think()), 'Na6b4');
        board.move('Rd7d8');

        assert.ok(board.isGameOver());
    });

    QUnit.test("Test with chessfield.ru task #1 (Dehler, Otto Georg Edgar) - white side", function (assert) {
        var fen = 'k7/1R6/nK6/8/8/8/8/8 w -';

        var board = new JChessBoard(settings);
        board.fenToPosition(fen);
        var engine = new JChessEngine(board, 'w');

        assert.equal(board.move(engine.think()), 'Rb7d7');
        board.move('Na6b4');
        assert.equal(board.move(engine.think()), 'Rd7d8');
        assert.ok(board.isGameOver());
    });


}(QUnit, JChessPiece, JChessBoard));


