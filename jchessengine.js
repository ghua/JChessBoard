var JChessEngine = (function () {

    function JChessEngine(board) {
        this.board = board;
        this.graph = new JChessGraph();
    }

    JChessEngine.prototype._alphaBeta = function (alpha, beta, depthLeft) {
        var bestScore;
    };

    JChessEngine.prototype.think = function () {



    };

    JChessEngine.prototype._buildGraph = function (piece, depthLeft) {
        var p, n;
        var nextStepSide = piece.color === 'w' ? 'b' : 'w';
        var pieces = this.board.allPieces().filter(function (piece) {
            return piece.color === nextStepSide
        });
        var possiblePositions;
        var currentFen = this.board.positionToFen();

        for (p = 0; p < pieces.length; p++) {
            possiblePositions = pieces[p].possiblePositions.all();
            for (n = 0; n < possiblePositions.length; n++) {
                this.graph.addVertex(new JChessVertex(pieces[p], possiblePositions[n]));
                if (depthLeft > 0) {
                    this.board.move(pieces[p].currentPosition, possiblePositions[n], true);
                    this._buildGraph(pieces[p], depthLeft-1);
                }
            }
        }

        this.board.fenToPosition(currentFen);
    };

    return JChessEngine;
}());

var JChessGraph = (function () {

    function JChessGraph() {
        this.vertices = [];
        this.edges = [];
    }

    JChessGraph.prototype.addVertex = function (vertex) {
        this.vertices.push(vertex);

        return this;
    };

    JChessGraph.prototype.addEdge = function (edge) {
        this.edges.push(edge);

        return this;
    };

    return JChessGraph;
});

var JChessVertex = (function () {

    function JChessVertex(piece, newPosition) {
        this.piece = piece;
        this.newPosition = newPosition;
    }

    return JChessVertex;
}());

var JChessEdge = (function () {

    function JChessEdge(fromVertex, toVertex, weight) {

    }

    return JChessEdge;
}());
