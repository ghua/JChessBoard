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
        var me = this;
        this.setDepth(depth);
        this.board = board;
        this.clone = new JChessBoard(this.board.settings, new JChessEventDispatcher());
        this.clone.fenToPosition(this.board.positionToFen());
        this.board.eventDispatcher.addEventListener('board_piece_move', function (event) {
            this.clone.move(event.subject.currentPosition, event.environment.newPosition);
        }, me);
        this.board.eventDispatcher.addEventListener('board_step_back', function () {
            this.clone.back();
        }, me);

        this.piecePrice = {
            p: 1, n: 3, b: 4, r: 5, q: 10, k: 11
        };
        this.side = side;
        this.bestPossibleMove = null;

        this.eventDispatcher = new JChessEventDispatcher();
        this.transpositionTable = [];

        this._evaluateNext = function myself(board, depth, alpha, beta) {
            var n, p, piece, possiblePositions, score;

            if (board.isStalemate(board.nextStepSide)) {
                me.setToCache(board.zorbistHash, 0);

                return 0;
            }

            if (depth === 0) {
                score = me.transpositionTable[board.zorbistHash];
                if (score !== undefined) {

                    return score;
                }

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

                for (p = 0; p < possiblePositions.length; p++) {
                    var possiblePosition = possiblePositions[p];

                    var step = board.move(currentPosition, possiblePosition);
                    if (step === false) {

                        continue;
                    }

                    score = myself(board, depth - 1, alpha, beta);

                    board.back();

                    if (depth % 2 === 0) { // min node
                        if (score <= alpha) {

                            return alpha;
                        }
                        if (score < beta) {
                            beta = score;
                        }
                    } else { // max node
                        if (score >= beta) {
                            me.bestPossibleMove = me.prepareResponse(currentPosition, possiblePosition);

                            return beta;
                        }
                        if (score > alpha) {
                            me.bestPossibleMove = me.prepareResponse(currentPosition, possiblePosition);

                            alpha = score;
                        }

                    }
                }

            }

            if (depth % 2 === 0) { // min node

                return beta;
            }

            return alpha;
        };
    }

    JChessEngine.prototype.setDepth = function(depth) {
        this.depth = (depth * 2) - 1;
    };

    JChessEngine.prototype.prepareResponse = function (currentPosition, possiblePosition) {
        return [currentPosition, possiblePosition];
    };

    JChessEngine.prototype.predictZorbistHash = function (board, currentPosition, newPosition) {
        var currentHash = board.zorbistHash;

        // remove from old place
        var piece = board.cells[currentPosition];
        if (piece !== undefined) {
            currentHash ^= board.zorbistBoard[currentPosition][board.zorbistIndex[piece.fen]];
        } else {
            return false;
        }

        // remove if it is capture
        var capturePiece = board.cells[newPosition];
        if (capturePiece !== undefined) {
            currentHash ^= board.zorbistBoard[newPosition][board.zorbistIndex[capturePiece.fen]];
        }

        // place piece to new place
        currentHash ^= board.zorbistBoard[newPosition][board.zorbistIndex[piece.fen]];

        // change side
        currentHash ^= board.zorbistSide;

        return currentHash;
    };

    JChessEngine.prototype.setToCache = function (key, value) {
        if (this.transpositionTable[key] === undefined) {
            return this.transpositionTable[key] = value;
        }
    };

    JChessEngine.prototype.think = function (depth) {
        if (depth) {
            this.setDepth(depth);
        }
        this._findBestPossibleMove();

        return this.bestPossibleMove;
    };

    JChessEngine.prototype._findBestPossibleMove = function () {
        this.bestPossibleMove = null;

        this._evaluateNext(this.clone, this.depth, -Infinity, +Infinity);
    };

    /**
     * @param board {JChessBoard}
     * @returns {number}
     * @private
     */
    JChessEngine.prototype._evaluateState = function (board) {
        if (true === board.isCheck(board.nextStepSide) && true === board.isCheckmate(board.nextStepSide)) {
            score = 100 - board.moveLog.length;

            return score;
        }

        var score = 0;
        for (var n = 0; n < board.cells.length; n++) {
            var piece = board.cells[n];
            if (piece !== undefined) {
                if (piece.color === this.side) {
                    score += this.piecePrice[piece.type];
                } else {
                    score -= this.piecePrice[piece.type];
                }

            }
        }

        return score;
    };


    return JChessEngine;
}());
