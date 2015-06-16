var JChessVertex = (function () {

    function JChessVertex(step, weight) {
        this.step = step;
        this.edges = [];
        this.weight = weight;
    }

    JChessVertex.prototype.addEdge = function (toVertex) {
        this.edges.push(new JChessEdge(this, toVertex));
    };

    return JChessVertex;
}());

var JChessEdge = (function () {

    function JChessEdge(fromVertex, toVertex) {
        this.fromVertex = fromVertex;
        this.toVertex = toVertex;
    }

    return JChessEdge;
}());

var JChessGraph = (function () {

    function JChessGraph() {
        this.vertices = [];
    }

    JChessGraph.prototype.addVertex = function (step, weight) {
        var vertex = new JChessVertex(step, weight);

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

    JChessEngine.prototype.think = function () {
        var currentFen = this.board.positionToFen();

        var graph = this._buildRoute(this.board.nextStepSide, 3);
        var result = {};

        this.board.fenToPosition(currentFen);

        for (var san in graph) {
            if (graph.hasOwnProperty(san)) {
                var branches = graph[san].branches;
                result[san] = this._assessRoute(this._getScoreListFromBranch(graph[san]));
            }
        }

        return result;
    };

    JChessEngine.prototype._getScoreListFromBranch = function (vertex) {
        var result = [vertex.score];

        for (var san in vertex.branches) {
            if (vertex.branches.hasOwnProperty(san)) {
                result = result.concat(this._getScoreListFromBranch(vertex.branches[san]));
            }
        }

        return result;
    };

    JChessEngine.prototype._buildRoute = function (nextStepSide, depthLeft) {
        var p, n;
        var pieces = this.board.allPieces().filter(function (piece) {
            return piece.color === nextStepSide
        });
        var possiblePositions, piece, possiblePosition, score, san;
        var currentFen = this.board.positionToFen();
        var graph = {};

        for (p = 0; p < pieces.length; p++) {
            piece = pieces[p];

            possiblePositions = piece.possiblePositions.all()
                .filter(function (element) {
                    return piece.isPossiblePosition(element);
                });
            for (n = 0; n < possiblePositions.length; n++) {
                possiblePosition = possiblePositions[n];

                san = this.board._genPieceStepSan(piece, piece.currentPosition, possiblePosition, this.board.has(possiblePosition));

                graph[san] = {score: this._assessStep(possiblePosition)};

                if (depthLeft > 0) {
                    this.board.move(piece, possiblePosition, true);
                    graph[san].branches = this._buildRoute(nextStepSide === 'w' ? 'b' : 'w', depthLeft - 1);
                }
            }
            this.board.fenToPosition(currentFen, true);
        }

        return graph;
    };

    JChessEngine.prototype._getMaxOfArray = function (numArray) {
        return Math.max.apply(null, numArray);
    };

    JChessEngine.prototype.price = function (type) {
        return this.piecePrice[type];
    };

    JChessEngine.prototype._assessStep = function (newPosition) {
        if (this.board.has(newPosition)) {
            return this.price(this.board.get(newPosition).type);
        }

        return 0;
    };

    JChessEngine.prototype._assessRoute = function (numbers) {
        numbers = numbers.map(function (elem, index) {
            return (index % 2 === 0) ? elem : -elem;
        });

        var score = 0;
        for (var n = 0; n < numbers.length; n++) {
            score += numbers[n];
        }

        return score;
    };

    return JChessEngine;
}());
