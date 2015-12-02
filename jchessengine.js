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
            p: 1, n: 3, b: 3, r: 5, q: 10, k: 11
        };
        this.side = side;
        this.currentMoveChoice = null;
        this.maxDepth = 3;
        this.eventDispatcher = new JChessEventDispatcher();
    }

    JChessEngine.prototype.think = function () {
        this._bestPossibleMove();

        return this.currentMoveChoice;
    };

    JChessEngine.prototype._bestPossibleMove = function () {
        var clone = new JChessBoard(this.board.settings, new JChessEventDispatcher());
        var fen = this.board.positionToFen();
        clone.fenToPosition(fen);

        var scores = this._getScoresFromFen(fen, this.side);
        var min = Math.min.apply(null, scores.filter(function (value) {
            return value < 0;
        }));
        var max = Math.max.apply(null, scores.filter(function (value) {
            return value > 0;
        }));

        this._minimax(clone, 0, min, max);
    };

    JChessEngine.prototype._minimax = function (board, depth, lowerBound, upperBound) {
        var n, p, piece, possiblePositions, possiblePosition;

        this.eventDispatcher.dispatchEvent('iteration', new JChessEvent(this, {
            'board': board,
            'depth': depth,
            'lowerBound': lowerBound,
            'upperBound': upperBound
        }));

        if (depth > this.maxDepth || board.countPossiblePositions() === 0) {
            // @todo: would be better to fix this ↓↓↓↓↓
            if (board.isCheckmate()) {
                return 100;
            }

            return this._evaluateState(board, depth);
        }

        var pieces = board.allPieces().filter(function (value) {
            return value.color === board.nextStepSide;
        });

        var candidateMoveNodes = [];
        for (p = 0; p < pieces.length; p++) {
            piece = pieces[p];
            possiblePositions = piece.getPossiblePositions();
            for (n = 0; n < possiblePositions.length; n++) {
                possiblePosition = possiblePositions[n];

                var clone = new JChessBoard(board.settings, new JChessEventDispatcher());
                clone.fenToPosition(board.positionToFen());
                var move = clone.move(piece, possiblePosition);
                var score = this._minimax(clone, depth + 1, lowerBound, upperBound);

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

            this.currentMoveChoice = candidateMoves[candidateScores.indexOf(Math.max.apply(null, candidateScores))];

            return lowerBound;
        } else {
            return upperBound;
        }
    };

    /**
     * @param board {JChessBoard}
     * @param depth {number}
     * @returns {number}
     * @private
     */
    JChessEngine.prototype._evaluateState = function (board, depth) {
        return this._evaluateFen(board.positionToFen(), this.side);
    };

    /**
     * @param {string} fen
     * @param {string} mySide
     * @returns {Array}
     * @private
     */
    JChessEngine.prototype._getScoresFromFen = function (fen, mySide) {
        var me = this;
        return fen.match(/^([a-zA-Z0-9\/]+)/)[0].replace(/[0-9\/]/gi, '').replace(/./g, function (value) {
                var score;
                score = parseInt(me.piecePrice[value.toLowerCase()]);

                var isBlackPiece = /[a-z]/.test(value);
                if (( (isBlackPiece === true && mySide === 'w' ) || (isBlackPiece === false && mySide === 'b'))) {
                    score = score * -1;
                }

                return score + ':';
            })
            .replace(/:$/, '')
            .split(':')
            .map(function (value) {
                return parseInt(value);
            }, me);
    };

    /**
     * @param fen {string}
     * @param mySide {string}
     * @returns {number}
     * @private
     */
    JChessEngine.prototype._evaluateFen = function (fen, mySide) {
        var scores = this._getScoresFromFen(fen, mySide);

        var sum = 0, n;
        for (n = 0; n < scores.length; n++) {
            sum += scores[n];
        }

        return sum;
    };

    return JChessEngine;
}(jQuery));
