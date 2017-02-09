(function (QUnit, JChessPiece, JChessBoard) {
    var settings = {imagesPath: '../../images/', 'side': 'w'};

    QUnit.test("Test by Dehler, Otto Georg Edgar 2-ply puzzle (depth = 2)", function (assert) {
        var fen = 'k7/1R6/nK6/8/8/8/8/8 w -';
        var board = new JChessBoard(settings, new JChessEventDispatcher);
        board.fenToPosition(fen);
        var engine = new JChessEngine(board, settings.side, 2);
        assert.equal(board.move.apply(board, engine.think()), 'Rb7d7');
        assert.equal('Ka8b8', board.move('Ka8b8'));
        assert.equal(board.move.apply(board, engine.think()), 'Rd7d8');
        assert.ok(board.isCheckmate(board.nextStepSide));
    });

    QUnit.test("Test by Dehler, Otto Georg Edgar 2-ply puzzle (depth = 3)", function (assert) {
        var fen = 'k7/1R6/nK6/8/8/8/8/8 w -';
        var board = new JChessBoard(settings, new JChessEventDispatcher);
        board.fenToPosition(fen);
        var engine = new JChessEngine(board, settings.side, 3);
        assert.equal(board.move.apply(board, engine.think()), 'Rb7d7');
        assert.equal('Ka8b8', board.move('Ka8b8'));
        assert.equal(board.move.apply(board, engine.think()), 'Rd7d8');
        assert.ok(board.isCheckmate(board.nextStepSide));
    });

    QUnit.test("Test by Loyd, Samuel 2-ply puzzle (depth = 2)", function (assert) {
        var fen = '7k/7b/5Kp1/8/8/8/8/5Q2 w -';
        var board = new JChessBoard(settings, new JChessEventDispatcher);
        board.fenToPosition(fen);
        var engine = new JChessEngine(board, settings.side, 2);
        assert.equal(board.move.apply(board, engine.think()), 'Qf1a1');
        assert.equal('g6g5', board.move('g6g5'));
        assert.equal(board.move.apply(board, engine.think()), 'Kf6f7');
        assert.ok(board.isCheckmate(board.nextStepSide));
    });

    QUnit.test("Test by Loyd, Samuel 2-ply puzzle (depth = 3)", function (assert) {
        var fen = '7k/7b/5Kp1/8/8/8/8/5Q2 w -';
        var board = new JChessBoard(settings, new JChessEventDispatcher);
        board.fenToPosition(fen);
        var engine = new JChessEngine(board, settings.side, 3);
        assert.equal(board.move.apply(board, engine.think()), 'Qf1a1');
        assert.equal('g6g5', board.move('g6g5'));
        assert.equal(board.move.apply(board, engine.think()), 'Kf6f7');
        assert.ok(board.isCheckmate(board.nextStepSide));
    });

    QUnit.test("Test by Speckmann, Werner 3-ply puzzle (depth = 3)", function (assert) {
        var board = new JChessBoard(settings, new JChessEventDispatcher);
        board.fenToPosition('k2N4/7R/8/4K3/8/8/8/8 w -');
        var engine = new JChessEngine(board, settings.side, 3);
        assert.equal(board.move.apply(board, engine.think()), 'Ke5d6');
        assert.equal('Ka8b8', board.move('Ka8b8'));
        assert.equal(board.move.apply(board, engine.think()), 'Nd8c6');
        assert.equal('Kb8c8', board.move('Kb8c8'));
        assert.equal(board.move.apply(board, engine.think()), 'Rh7c7');
        assert.ok(board.isCheckmate(board.nextStepSide));
    });

    QUnit.test("test predictZorbistHash", function (assert) {
        var board = new JChessBoard(settings, new JChessEventDispatcher);
        board.fenToPosition('k7/1R6/nK6/8/8/8/8/8 w -');

        var engine = new JChessEngine(board, settings.side, 3);

        var predictedHash = engine.predictZorbistHash(board, 17, 16);

        board.move(17, 16);

        assert.equal(board.zorbistHash, predictedHash);
    });


}(QUnit, JChessPiece, JChessBoard));


