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

    function JChessEngine(board, side, depth) {
        this.board = board;
        this.piecePrice = {
            p: 1, n: 3, b: 3, r: 5, q: 10, k: 11
        };
        this.side = side;
        this.bestPossibleMove = null;
        this.depth = (depth * 2) - 1;
        this.eventDispatcher = new JChessEventDispatcher();
        this.transpositionTable = {};

        var me = this;
        this._evaluateNext = function myself (board, depth, alpha, beta) {
            var n, p, piece, possiblePositions, score;

            score = me.getFromCache(board.zorbistHash);
            if (score !== undefined) {

                return score;
            }

            if (true === board.isStalemate(board.nextStepSide)) {

                return score;
            }

            if (depth === 0 || board.isCheck(board.nextStepSide)) {
                score = me._evaluateState(board);

                me.setToCache(board.zorbistHash, score);

                return score;
            }

            var pieces = board.allPieces().filter(function (value) {
                return value.color === board.nextStepSide;
            });

            for (n = 0; n < pieces.length; n++) {
                piece = pieces[n];

                var currentPosition = piece.currentPosition;
                possiblePositions = piece.getPossiblePositions();

                for(p = 0; p < possiblePositions.length; p++) {
                    var possiblePosition = possiblePositions[p];

                    if (alpha >= beta) {

                        break;
                    }

                    var step = board.move(currentPosition, possiblePosition);

                    if (false !== step) {
                        score = myself(board, depth - 1, alpha, beta);

                        if (depth % 2 !== 0) { // max node
                            if (score > alpha) {
                                if (depth === me.depth) {
                                    me.bestPossibleMove = {
                                        'depth': depth,
                                        'score': score,
                                        'alpha': alpha,
                                        'beta': beta,
                                        'currentPosition': currentPosition,
                                        'possiblePosition': possiblePosition
                                    };
                                }

                                alpha = score;
                            }
                        } else { // min node
                            if (score < beta) {

                                beta = score;
                            }
                        }

                        board.back();

                    }

                }
            }

            if (depth % 2 === 0) {

                return beta;
            }

            return alpha;
        };
    }

    JChessEngine.prototype.getFromCache = function (key) {
        return this.transpositionTable[key];
    };

    JChessEngine.prototype.setToCache = function (key, value) {
        return this.transpositionTable[key] = value;
    };

    JChessEngine.prototype.think = function () {
        this._findBestPossibleMove();

        return this.bestPossibleMove;
    };

    JChessEngine.prototype._findBestPossibleMove = function () {
        var clone = new JChessBoard(this.board.settings, new JChessEventDispatcher());
        var fen = this.board.positionToFen();
        clone.fenToPosition(fen);

        this._evaluateNext(clone, this.depth, -Infinity, +Infinity);
    };

    /**
     * @param board {JChessBoard}
     * @returns {number}
     * @private
     */
    JChessEngine.prototype._evaluateState = function (board) {
        if (true === board.isCheckmate(board.nextStepSide)) {

            return 100 - board.moveLog.length;
        }

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
}());
