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
        this.nextBestMove = null;
        this.depth = 3;
        this.eventDispatcher = new JChessEventDispatcher();

        this.transpositionTable = {};
    }

    JChessEngine.prototype.think = function () {
        this._findBestPossibleMove();

        return this.nextBestMove;
    };

    JChessEngine.prototype._findBestPossibleMove = function () {
        var clone = new JChessBoard(this.board.settings, new JChessEventDispatcher());
        var fen = this.board.positionToFen();
        clone.fenToPosition(fen);

        this._evaluateNext(clone, this.depth, -Infinity, +Infinity);
    };

    JChessEngine.prototype._evaluateNext = function (board, depth, alpha, beta) {
        var n, p, piece, currentPosition, possiblePositions, possiblePosition, score;

        var pieces = board.allPieces().filter(function (value) {
            return value.color === board.nextStepSide;
        });

        if (true === board.isStalemate(board.nextStepSide)) {

            return 0;
        }

        if (depth === 0) {
            score = this._evaluateState(board);

            if (this.transpositionTable[board.zorbistHash] === undefined) {

                this.transpositionTable[board.zorbistHash] = score;
            }

            return score;
        }

        for (n = 0; n < pieces.length; n++) {
            piece = pieces[n];

            currentPosition = piece.currentPosition;
            possiblePositions = piece.getPossiblePositions();

            for(p = 0; p < possiblePositions.length; p++) {
                possiblePosition = possiblePositions[p];

                if (false === board.move(currentPosition, possiblePosition)) {

                    throw "Move filed!";
                }

                score = this._evaluateNext(board, depth - 1, alpha, beta);

                board.back();

                if (depth % 2 !== 0) { // max node
                    if (score >= alpha) {
                        this.nextBestMove = { 'currentPosition': currentPosition, 'possiblePosition': possiblePosition };

                        alpha = score;
                    }
                } else { // min node
                    if (score <= beta) {

                        beta = score;
                    }
                }

                if (alpha >= beta) {

                    break;
                }

            }
        }

        if (depth % 2 === 0) {

            return beta;
        }

        return alpha;
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
