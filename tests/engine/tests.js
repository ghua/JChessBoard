(function (QUnit, JChessPiece, JChessBoard) {
    var settings = {imagesPath: '../../images/'};

    QUnit.test("Test JChessEngine._evaluateFen", function (assert) {
        var board = new JChessBoard(settings);
        board.start();
        var engine = new JChessEngine(board, 'w');

        assert.equal(engine._evaluateFen(board.positionToFen(), 'w'), 0);

        board.fenToPosition('8/8/8/8/4k2K/8/8/7r b')
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

}(QUnit, JChessPiece, JChessBoard));


