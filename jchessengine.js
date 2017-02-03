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

        this.transpositionTable = {};
        this.searchQueue = [];

        this.value = null;
    }

    JChessEngine.prototype.think = function () {
        this._findBestPossibleMove();

        return this.currentMoveChoice;
    };

    JChessEngine.prototype._findBestPossibleMove = function () {
        var me = this;

        var clone = new JChessBoard(this.board.settings, new JChessEventDispatcher());
        var fen = this.board.positionToFen();
        clone.fenToPosition(fen);

        clone.eventDispatcher.addEventListener('board_piece_captured', function (event) {
            me.value = me.piecePrice[event.piece.type];
        });

        this._fillQueue(clone);

        this._evaluateNext(clone, 2, -Infinity, +Infinity);
    };

    JChessEngine.prototype._fillQueue = function (board) {
        var n, p, piece, possiblePositions, possiblePosition;
        var fen = this.board.positionToFen();

        var pieces = board.allPieces().filter(function (value) {
            return value.color === board.nextStepSide;
        });

        for (p = 0; p < pieces.length; p++) {
            this.value = 0;

            piece = pieces[p];
            possiblePositions = piece.getPossiblePositions();
            for (n = 0; n < possiblePositions.length; n++) {
                possiblePosition = possiblePositions[n];
                this.searchQueue.push({'fen': fen, 'piece': piece, 'possiblePosition': possiblePosition});
            }
        }
    };

    JChessEngine.prototype._evaluateNext = function (board, depth, lowerBound, upperBound) {
        var p, piece, fen, possiblePosition;
        var zorbistHash;

        this.eventDispatcher.dispatchEvent('iteration', new JChessEvent(this, {
            'board': board,
            'depth': depth,
            'lowerBound': lowerBound,
            'upperBound': upperBound
        }));

        var pieces = board.allPieces().filter(function (value) {
            return value.color === board.nextStepSide;
        });

        while (this.searchQueue.length > 0) {
            p = this.searchQueue.pop();

            if (piece instanceof JChessPiece) {
                if (piece !== p['piece']) {
                    board.fenToPosition(p['fen']);
                }
            }

            this.value = 0;

            possiblePosition = p['possiblePosition'];
            piece = p['piece'];


            zorbistHash = board.zorbistHash;
            zorbistHash ^= board.zobristBoard[piece.currentPosition][board.zorbistIndex[piece.fen]];
            if (board.has(possiblePosition)) {
                zorbistHash ^= board.zobristBoard[possiblePosition][board.zorbistIndex[board.get(possiblePosition).fen]];
            }
            zorbistHash ^= board.zobristBoard[possiblePosition][board.zorbistIndex[piece.fen]];


            if (this.transpositionTable[zorbistHash]) {
                // return this.transpositionTable[zorbistHash];
            } else {
                fen = board.positionToFen();

                board.move(piece, possiblePosition);

                this.transpositionTable[board.zorbistHash] = this.value;

                if (depth > 0) {
                    this._fillQueue(board);
                }

                depth--;
            }


        }

        return;
    };

    return JChessEngine;
}(jQuery));
