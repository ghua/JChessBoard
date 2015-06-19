var JChessVertex = (function () {

    function JChessVertex(san, weight) {
        this.san = san;
        this.weight = weight;
        this.edges = [];
    }

    JChessVertex.prototype.addEdge = function (edge) {
        this.edges.push(edge);
        return edge;
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
        this.roots = [];
    }

    JChessGraph.prototype.addVertex = function (vertex, isRoot) {
        this.vertices.push(vertex);
        if (isRoot === true) {
            this.roots.push(vertex);
        }

        return vertex;
    };

    return JChessGraph;
}());

var JChessEngine = (function () {

    function JChessEngine(board) {
        this.board = board;
        this.graph = new JChessGraph();
        this.piecePrice = {
            p: 2, n: 5, b: 5, r: 8, q: 12, k: 20
        };
    }

    JChessEngine.prototype.think = function () {
        var currentFen = this.board.positionToFen();


        var graph = new JChessGraph();

        this._buildRoute(this.board.nextStepSide, 3, graph);

        this.board.fenToPosition(currentFen);

        //return graph;

        return this._findBestRoute(graph);
    };

    JChessEngine.prototype._findBestRoute = function (graph) {
        var _paths = {}, r, root, path;

        for (r = 0; r < graph.roots.length; r++) {
            root = graph.roots[r];
            _paths[root.san] = this._getUniqPaths(root);
        }

        return _paths;
    };

    JChessEngine.prototype._getUniqPaths = function(root) {
        var paths = [], path;

        while (root.edges.length > 0) {
            path = [];
            this._getPath(root, path);
            paths.push(path);
        }

        return paths;
    };

    JChessEngine.prototype._getPath = function(root, path) {
        var edge;

        path.push(root.san);

        if (root.edges.length > 0) {
            edge = root.edges.pop();
            if (this._getPath(edge.toVertex, path)) {
                root.edges.push(edge);
            }
            return true
        }

        return false;
    };

    JChessEngine.prototype._buildRoute = function (stepSide, depthLeft, graph, parentVertex) {
        var p, n;
        var pieces = this.board.allPieces().filter(function (piece) {
            return piece.color === stepSide
        });
        var possiblePositions, vertex, piece, possiblePosition, score, san, isCapture, capturePiece;
        var currentPosition;

        for (p = 0; p < pieces.length; p++) {
            piece = pieces[p];

            piece._genPossiblePositions();
            currentPosition = piece.currentPosition;
            possiblePositions = piece.possiblePositions.all();

            for (n = 0; n < possiblePositions.length; n++) {
                possiblePosition = possiblePositions[n];

                if (piece.isPossiblePosition(possiblePosition) === true) {
                    isCapture = this.board.has(possiblePosition);
                    san = this.board._genPieceStepSan(piece, currentPosition, possiblePosition, isCapture);
                    vertex = new JChessVertex(san, this._assessStep(piece, possiblePosition));

                    if (parentVertex !== undefined) {
                        parentVertex.addEdge(new JChessEdge(parentVertex, vertex, parentVertex.weight + vertex.weight));
                    }

                    if (depthLeft > 0) {
                        var currentFen = this.board.positionToFen();
                        this.board.move(currentPosition, possiblePosition, true);

                        if (this.board.isCheckmate(stepSide === 'w' ? 'b' : 'w')) {
                            vertex.weight = 20;
                        }

                        this._buildRoute(stepSide === 'w' ? 'b' : 'w', depthLeft - 1, graph, vertex);
                        this.board.fenToPosition(currentFen, true);
                    }
                    graph.addVertex(vertex, parentVertex === undefined);
                }
            }
        }

        return graph;
    };

    JChessEngine.prototype._getMaxOfArray = function (numArray) {
        return Math.max.apply(null, numArray);
    };

    JChessEngine.prototype.price = function (type) {
        return this.piecePrice[type];
    };

    JChessEngine.prototype._assessStep = function (piece, newPosition) {
        if (this.board.has(newPosition)) {
            return this.price(this.board.get(newPosition).type);
        }

        return 1;
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
