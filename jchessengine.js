/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Semyon Velichko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var JChessEngine = (function ($) {

    function JChessEngine(board, side) {
        this.board = board;
        this.piecePrice = {
            p: 2, n: 5, b: 5, r: 8, q: 12, k: 20
        };
        this.bestScore = board.countPossiblePositions();
        this.side = side;
    }

    JChessEngine.prototype.think = function () {
        console.log('Thinking...');

        var graph = new JChessGraph();

        console.log('Checkmate FEN\'s:');
        this._buildRoute(this.board.nextStepSide, 3, graph);

        board.allPieces().forEach(function (piece) {
            piece._drawLayer(board);
        });

        var result = this._findBestRoute(graph);

        console.log('Result: \n... Simon says: ' + result);

        return result;
    };

    JChessEngine.prototype._findBestRoute = function (graph) {
        var steps = [], scores = [], r, root, score, paths;


        console.log('Step scores:');
        for (r = 0; r < graph.roots.length; r++) {
            root = graph.roots[r];
            steps.push(root.san);
            paths = this._getUniqPaths(root);
            score = this._getMaxOfArray(paths) + this._sum(paths);
            scores.push(score);
            console.log('  ', root.san, score);
        }


        return steps[scores.indexOf(this._getMaxOfArray(scores))];
    };

    JChessEngine.prototype._getUniqPaths = function (root) {
        var paths = [], path;

        path = [];
        this._getPath(root, path);
        paths.push(this._assessRoute(path));

        while (root.edges.length > 0) {
            path = [];
            this._getPath(root, path);
            paths.push(this._assessRoute(path));
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

    JChessEngine.prototype._bestPossibleMove = function () {
        var board = $.clone(true, {}, this.board);

        this._minimax(board, 0, -this.bestScore, this.bestScore);

        return this.currentMoveChoice;
    };

    JChessEngine.prototype._minimax = function (board, depth, lowerBound, upperBound) {



    };

    JChessEngine.prototype._evaluateStep = function (board, piece, newPosition, depth) {
        if (board.isGameOver()) {
            return 0;
        }

        if (board.nextStepSide === this.side) {

        } else {
            
        }
    };

    JChessEngine.prototype._buildRoute = function (stepSide, depthLeft, graph, parentVertex) {
        var p, n;
        var pieces = this.board.allPieces().filter(function (value) {
            return value.color === stepSide
        });
        var possiblePositions, vertex, piece, possiblePosition, score, san, isCapture;

        if (this.board.nextStepSide === undefined) {
            return;
        }

        for (p = 0; p < pieces.length; p++) {
            piece = pieces[p];

            possiblePositions = piece.possiblePositions.all();

            for (n = 0; n < possiblePositions.length; n++) {
                possiblePosition = possiblePositions[n];
                piece._genPossiblePositions();
                if (piece.isPossiblePosition(possiblePosition) === true) {
                    if (this.board.move(piece, possiblePosition, true)) {
                        this.board.back(true);

                        isCapture = this.board.has(possiblePosition);
                        san = this.board._genPieceStepSan(piece, piece.currentPosition, possiblePosition, isCapture);
                        vertex = new JChessVertex(san, this._assessStep(piece, possiblePosition), depthLeft);
                        graph.addVertex(vertex, parentVertex === undefined);
                        this.board.nextStepSide = stepSide;

                        if (parentVertex !== undefined) {
                            parentVertex.addEdge(new JChessEdge(parentVertex, vertex));
                        }

                        if (depthLeft > 0) {
                            if (this.board.move(piece, possiblePosition, true)) {
                                if (this.board.isCheckmate(stepSide === 'w' ? 'b' : 'w', true)) {
                                    console.log('  ' + this.board.positionToFen());
                                    vertex.weight = 100;
                                } else {
                                    this._buildRoute(stepSide === 'w' ? 'b' : 'w', depthLeft - 1, graph, vertex);
                                }
                                this.board.back(true);
                            }
                        }
                    }
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

        return Math.round(this._sum(numbers) / numbers.length);
    };

    JChessEngine.prototype._sum = function (numbers) {
        var score = 0;
        for (var n = 0; n < numbers.length; n++) {
            score += numbers[n];
        }

        return score;
    };

    return JChessEngine;
}(jQuery));
