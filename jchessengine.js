var JChessVertex = (function () {

    function JChessVertex(san, weight, depthLeft) {
        this.san = san;
        this.weight = weight;
        this.edges = [];
        this.depthLeft = depthLeft;
    }

    JChessVertex.prototype.addEdge = function (edge) {
        this.edges.push(edge);
        return edge;
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
        console.log('Thinking...');

        var graph = new JChessGraph();

        this._buildRoute(this.board.nextStepSide, 3, graph);

        board.allPieces().forEach(function(piece) {
            piece._drawLayer(board);
        });

        return graph;

        var result = this._findBestRoute(graph);

        console.log('... Simon says: ' + result);

        return result;
    };

    JChessEngine.prototype._findBestRoute = function (graph) {
        var steps = [], scores = [], r, root;

        for (r = 0; r < graph.roots.length; r++) {
            root = graph.roots[r];
            steps.push(root.san);
            scores.push(this._getMaxOfArray(this._getUniqPaths(root)));
        }

        return steps[scores.indexOf(this._getMaxOfArray(scores))];
    };

    JChessEngine.prototype._getUniqPaths = function (root) {
        var paths = [], path;

        while (root.edges.length > 0) {
            path = [];
            this._getPath(root, path);
            paths.push(
                this._assessRoute(path)
            );
        }

        return paths;
    };

    JChessEngine.prototype._getPath = function (root, path) {
        var edge;

        path.push(root.weight);

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
        var pieces = this.board.allPieces().filter(function (value) {
            return value.color === stepSide
        });
        var possiblePositions, vertex, piece, possiblePosition, score, san, isCapture;

        for (p = 0; p < pieces.length; p++) {
            piece = pieces[p];

            piece._genPossiblePositions();
            possiblePositions = piece.possiblePositions.all().filter(function (value) {
                return piece.isPossiblePosition(value);
            });

            for (n = 0; n < possiblePositions.length; n++) {
                possiblePosition = possiblePositions[n];
                isCapture = this.board.has(possiblePosition);
                san = this.board._genPieceStepSan(piece, piece.currentPosition, possiblePosition, isCapture);
                vertex = new JChessVertex(san, this._assessStep(piece, possiblePosition), depthLeft);
                this.board.nextStepSide = stepSide;

                if (parentVertex !== undefined) {
                    parentVertex.addEdge(new JChessEdge(parentVertex, vertex));
                }

                if (depthLeft > 0) {
                    if (this.board.move(piece, possiblePosition, true)) {
                        //if (this.board.isCheckmate(stepSide === 'w' ? 'b' : 'w', true)) {
                        //    vertex.weight = 100;
                        //}

                        this._buildRoute(stepSide === 'w' ? 'b' : 'w', depthLeft - 1, graph, vertex);
                        this.board.back(true);
                    } else {
                        console.log(piece.type, piece.currentPosition, possiblePosition);
                    }
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

        return Math.round(score / numbers.length);
    };

    return JChessEngine;
}());
