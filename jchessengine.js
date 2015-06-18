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
        this.status = 1;
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

        return this._findBestRoute(graph);

        //return graph;
    };

    JChessEngine.prototype._findBestRoute = function (graph) {
        var _paths = {}, r, root, path;

        for (r = 0; r < graph.roots.length; r++) {
            root = graph.roots[r];
            path = this._getUniqPaths(root);
            if (_paths[root.san] === undefined) {
                _paths[root.san] = [];
            }
            _paths[root.san].push(path);
        }

        return _paths;
    };

    JChessEngine.prototype._getUniqPaths = function(root, path, level) {
        var v, edge, child;

        root.edges.filter(function(value) {
            return value.status > 1;
        });

        if (level === 0) {
            path = [];
        }

        for (v = 0; v < root.edges.length; v++) {
            edge = root.edges[v];
            edge.status = 1;
            child = edge.toVertex;
            path.push(edge.weight);
            if (child.edges.length > 0) {
                if (this._getUniqPaths(child, path, level + 1) === false) {
                    if (level > 0) {
                        return false;
                    }
                }
            } else {
                root.edges[v].status = 2;
                return false;
            }
        }

        return path;
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

            currentPosition = piece.currentPosition;
            possiblePositions = piece.possiblePositions.all()
                .filter(function (element) {
                    return piece.isPossiblePosition(element);
                });

            for (n = 0; n < possiblePositions.length; n++) {
                possiblePosition = possiblePositions[n];
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
