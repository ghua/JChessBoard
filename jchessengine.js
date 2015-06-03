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
}());

var JChessVertex = (function () {

    function JChessVertex(piece, newPosition) {
        this.piece = piece;
        this.newPosition = newPosition;
    }

    return JChessVertex;
}());

var JChessEdge = (function () {

    function JChessEdge(fromVertex, toVertex, weight) {
        this.fromVertex = fromVertex;
        this.toVertex = toVertex;
        this.weight = weight;
    }

    return JChessEdge;
}());

var JChessEngine = (function () {

    function JChessEngine(board) {
        this.board = board;
        this.graph = new JChessGraph();
    }

    JChessEngine.prototype._alphaBeta = function (alpha, beta, depthLeft) {
        var bestScore;
    };

    JChessEngine.prototype.think = function () {
        this._buildGraph('w', 1);

        return;
    };

    JChessEngine.prototype._buildGraph = function (nextStepSide, depthLeft, parentVertex) {
        var p, n;
        var pieces = this.board.allPieces().filter(function (piece) {
            return piece.color === nextStepSide
        });
        var possiblePositions, vertex;
        var currentFen = this.board.positionToFen();

        for (p = 0; p < pieces.length; p++) {
            possiblePositions = pieces[p].possiblePositions.all()
                .filter(function (value) {
                    return pieces[p].isPossiblePosition(value);
                });
            for (n = 0; n < possiblePositions.length; n++) {
                vertex = new JChessVertex(pieces[p], possiblePositions[n]);
                this.graph.addVertex(vertex);
                if (parentVertex !== undefined) {
                    this.graph.addEdge(new JChessEdge(vertex, parentVertex, 0));
                }
                if (depthLeft > 0) {
                    this.board.move(pieces[p].currentPosition, possiblePositions[n], true);
                    this._buildGraph(nextStepSide === 'w' ? 'b' : 'w', depthLeft-1, vertex);
                }
            }
            this.board.fenToPosition(currentFen);
        }
    };

    return JChessEngine;
}());
