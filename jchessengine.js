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
        this.currentMoveChoice = null;
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

    JChessEngine.prototype._bestPossibleMove = function () {
        var board = $.clone(true, {}, this.board);

        this._minimax(board, 10, -this.bestScore, this.bestScore);

        return this.currentMoveChoice;
    };

    JChessEngine.prototype._minimax = function (board, depth, lowerBound, upperBound) {
        if (depth < 0) {
            return;
        }

        var n, p, piece, possiblePositions, possiblePosition;

        var pieces = board.allPieces().filter(function (value) {
            return value.color === stepSide
        });

        var candidateMoveNodes = [];
        for (p = 0; p < pieces.length; p++) {
            piece = pieces[p];
            possiblePositions = piece.getPossiblePositions();
            for (n = 0; n < possiblePositions.length; n++) {
                possiblePosition = possiblePositions[n];

                var clone = new JChessBoard(board.settings, new JChessEventDispatcher());
                var move = clone.move(piece, possiblePosition);
                depth = depth - 1;
                this._minimax(clone, depth, lowerBound, upperBound);

                var score = this._evaluateStep(clone, piece, depth);
                var node = {'score': score, 'move': move};

                if (board.nextStepSide === this.side) {
                    candidateMoveNodes.push(node);
                    if (node.score > lowerBound) {
                        lowerBound = node.score;
                    }
                } else {
                    if (node.score < upperBound) {
                        upperBound = node.score;
                    }
                }
                if (upperBound < lowerBound) {
                    break;
                }
            }
        }

        if (board.nextStepSide === this.side) {
            var candidateScores = [];
            var candidateMoves = [];
            for (n = 0; n < candidateMoveNodes.length; n++) {
                node = candidateMoveNodes[n];
                candidateMoves.push(node.move);
                candidateScores.push(node.score);
            }

            this.currentMoveChoice = candidateMoves[candidateScores.indexOf(Math.max(candidateScores))];

            return lowerBound;
        } else {
            return upperBound;
        }
    };

    JChessEngine.prototype._evaluateStep = function (board, piece, depth) {
        if (board.isCheckmate()) {
            return 100;
        }

        if (board.isCheck()) {
            return 20;
        }

        if (board.isGameOver()) {
            return 0;
        }

        if (board.nextStepSide === this.side) {
            return this.bestScore - depth;
        } else {
            return depth - this.bestScore;
        }
    };

    JChessEngine.prototype._getMaxOfArray = function (numArray) {
        return Math.max.apply(null, numArray);
    };

    JChessEngine.prototype.price = function (type) {
        return this.piecePrice[type];
    };

    return JChessEngine;
}(jQuery));
