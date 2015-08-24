(function (QUnit, JChessPiece, JChessBoard) {
    var settings = {imagesPath: '../../images/'};

    QUnit.test("Test JChessEngine._evaluateFen", function(assert) {
        var board = new JChessBoard(settings);
        board.start();
        var engine = new JChessEngine(board, 'w');

        assert.equal(engine._evaluateFen(board.positionToFen()), 0);

        board.fenToPosition('8/8/8/8/4k2K/8/8/7r b')
        assert.equal(engine._evaluateFen(board.positionToFen()), -5);

        engine.side = 'b';
        assert.equal(engine._evaluateFen(board.positionToFen()), 5);
    });

}(QUnit, JChessPiece, JChessBoard));


