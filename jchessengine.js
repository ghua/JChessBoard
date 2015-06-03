var JChessVertex = (function () {

    function JChessVertex(piece, newPosition) {
        this.piece = piece;
        this.newPosition = newPosition;
        this.edges = [];
    }

    JChessVertex.prototype.addEdge = function(toVertex, weight) {
        this.edges.push(new JChessEdge(this, toVertex, weight));
    };

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

var JChessGraph = (function () {

    function JChessGraph() {
        this.vertices = [];
    }

    JChessGraph.prototype.addVertex = function (piece, newPosition) {
        var vertex = new JChessVertex(piece, newPosition);
        var index = this.vertices.indexOf(vertex);
        if (index > -1) {
            return this.vertices[index];
        }

        this.vertices.push(vertex);

        return vertex;
    };

    return JChessGraph;
}());

var JChessEngine = (function () {

    function JChessEngine(board) {
        this.board = board;
        this.graph = new JChessGraph();
        this.piecePrice = {
            p: 1, n: 3, b: 3, r: 6, q: 9, k: 12
        };
    }

    JChessEngine.prototype._alphaBeta = function (alpha, beta) {
        var score, n, vertex;
        var bestScore = 0;

        for (n = 0; n < this.graph.vertices.length; n++) {
            vertex = this.graph.vertices[n];
            score = vertex.edges

            score = -JChessEngine._alphaBeta( -beta, -alpha );
            if( score >= beta ) {
                return beta;
            }
            if( score > bestScore ) {
                bestScore = score;
                if( score > alpha ) {
                    alpha = score;
                }
            }
        }
        return bestScore;
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
                vertex = this.graph.addVertex(pieces[p], possiblePositions[n]);
                if (parentVertex !== undefined) {
                    vertex.addEdge(vertex, this._assessEdge(parentVertex, vertex));
                }
                if (depthLeft > 0) {
                    this.board.move(pieces[p].currentPosition, possiblePositions[n], true);
                    this._buildGraph(nextStepSide === 'w' ? 'b' : 'w', depthLeft-1, vertex);
                }
            }
            this.board.fenToPosition(currentFen);
        }
    };

    JChessEngine.prototype.price = function(type) {
        return this.piecePrice[type];
    };

    JChessEngine.prototype._assessEdge = function(fromVertex, toVertex) {
        if (fromVertex.newPosition === toVertex.newPosition) {
            return this.price(fromVertex.type);
        }

        return 0;
    };

    return JChessEngine;
}());
