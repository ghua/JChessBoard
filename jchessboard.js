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

var JChessVector = (function () {

    function JChessVector() {
        this.clear();
    }

    JChessVector.prototype.clear = function () {
        this.keys = [];
        this.entries = {};

        return this;
    };

    JChessVector.prototype.get = function (key) {
        if (this.has(key)) {
            return this.entries[key];
        }
    };

    JChessVector.prototype.has = function (key) {
        return this.entries.hasOwnProperty(key);
    };

    JChessVector.prototype.set = function (key, value) {
        this.keys.push(key);
        this.entries[key] = value;

        return this;
    };

    JChessVector.prototype.values = function () {
        var values = [];
        var i;

        for (i = 0; i < this.keys.length; i++) {
            values.push(this.entries[this.keys[i]]);
        }

        return values;
    };

    JChessVector.prototype.delete = function (key) {
        var i;

        i = this.keys.indexOf(key);
        if (i > -1) {
            this.keys.splice(i, 1);
            delete this.entries[key];
        }

        return this;
    };

    return JChessVector;
}());

var JChessPossiblePositions = (function () {

    function JChessPossiblePositions() {
        this.vectors = [];
    }

    JChessPossiblePositions.prototype.push = function (vector) {
        this.vectors.push(vector);

        return this;
    };

    JChessPossiblePositions.prototype.all = function () {
        var v, vector;
        var values = [];

        for (v = 0; v < this.vectors.length; v++) {
            vector = this.vectors[v];
            values = values.concat(vector.keys);
        }

        return values;
    };

    JChessPossiblePositions.prototype.intersect = function (otherPositions) {
        var myPositions;

        myPositions = this.all();
        otherPositions = otherPositions.all();

        return myPositions.filter(function (value, index, self) {
            return otherPositions.indexOf(value) > -1;
        });
    };

    JChessPossiblePositions.prototype.deletePosition = function (position) {
        var v;
        for (v = 0; v < this.vectors.length; v++) {
            this.vectors[v].delete(position);
        }

        return this;
    };

    JChessPossiblePositions.prototype.isEmpty = function () {
        return this.vectors.length === 0;
    };

    return JChessPossiblePositions;

}());

var JChessPiece = (function ($) {

    function JChessPiece(board, options) {
        this.stepOffsets = {
            b: [[1, 1], [-1, -1], [-1, 1], [1, -1]],
            n: [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]],
            k: [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]],
            p: [[0, -1], [-1, -1], [1, -1]],
            r: [[1, 0], [0, 1], [-1, 0], [0, -1]],
            q: [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]]
        };
        this.isTouched = false;
        this.board = board;
        var me = this;

        var s = $.extend({
            position: 0,
            fen: 'P',
            size: 64,
            castling: false
        }, options, this.board.settings);

        this.settings = s;
        this.color = s.fen.toUpperCase() === s.fen ? 'w' : 'b';
        this.currentPosition = s.position;
        this.fen = s.fen;
        this.castling = s.castling;
        this.type = this.fen.toLowerCase();

        var image = s.imagesPath + '/wikipedia/' + this.color + this.fen.toUpperCase() + '.png';
        var XY;

        XY = this.board.positionToCoordinate(this.currentPosition);

        this.X = XY[0];
        this.Y = XY[1];
        this.x = this.board.relativeToAbsolute(this.X);
        this.y = this.board.relativeToAbsolute(this.Y);

        this.layer = this.fen + '_' + this.currentPosition;
        board.canvas.drawImage({
            name: this.layer,
            source: image,
            x: this.x,
            y: this.y,
            layer: true,
            draggable: true,
            bringToFront: true,
            dragstart: function (layer) {
                var n, v, XY, size, newPosition, vector;

                if (me.settings.validation !== true || me.settings.help !== true) {
                    return;
                }

                if (me.board._checkStepSide(me)) {
                    me.genPossiblePositions();
                    size = me.settings.cellSize / 2;
                    for (n = 0; n < me.possiblePositions.vectors.length; n++) {
                        vector = me.possiblePositions.vectors[n].keys;
                        for (v = 0; v < vector.length; v++) {
                            newPosition = vector[v];

                            if (me.possiblePositions.vectors[n].get(newPosition) === false) {
                                XY = board.positionToCoordinate(newPosition);

                                board.canvas.drawEllipse($.extend({
                                    strokeStyle: 'green',
                                    strokeWidth: 2,
                                    fillStyle: 'yellow',
                                    layer: true,
                                    groups: ['help'],
                                    x: board.relativeToAbsolute(XY[0]),
                                    y: board.relativeToAbsolute(XY[1]),
                                    width: size,
                                    height: size
                                }, me.settings.helpStyle));
                            }
                        }
                    }
                }
            },
            dragstop: function (layer) {
                var oldX = layer._startX;
                var oldY = layer._startY;
                var oldPositionX = board.absoluteToRelative(oldX);
                var oldPositionY = board.absoluteToRelative(oldY);
                var newPositionX = board.absoluteToRelative(layer._eventX);
                var newPositionY = board.absoluteToRelative(layer._eventY);
                var oldPosition = board.coordinateToPosition(oldPositionX, oldPositionY);
                var newPosition = board.coordinateToPosition(newPositionX, newPositionY);

                if (me.board.move(me.currentPosition, newPosition) === false) {
                    board.canvas.animateLayer(layer, {
                        x: oldX, y: oldY
                    });
                }

                board.canvas.removeLayerGroup('help');
            }
        });

        return this;
    }

    JChessPiece.prototype.isCastlingAvailable = function () {
        return ['k', 'r'].indexOf(this.type) > -1 && this.castling === true && this.isTouched === false;
    };

    JChessPiece.prototype.destroy = function () {
        this.board.canvas.removeLayer(this.layer);
    };

    JChessPiece.prototype.setCurrentPosition = function (position) {
        var newXY = this.board.positionToCoordinate(position);
        this.currentPosition = position;
        this.genPossiblePositions();
        this.X = newXY[0];
        this.Y = newXY[1];
        this.isTouched = true;
    };

    JChessPiece.prototype._additionalPositionCheck = function () {
        var oldPosition, newPosition;

        if (arguments.length === 1) {
            oldPosition = this.currentPosition;
            newPosition = arguments[0];
        }

        if (arguments.length === 2) {
            oldPosition = arguments[0];
            newPosition = arguments[1];
        }

        if (newPosition === oldPosition) {
            return false;
        }

        if ((oldPosition >= 0 && oldPosition <= 63 && newPosition >= 0 && newPosition <= 63) === false) {
            return false;
        }

        if (this.type === 'p' && this._additionalPiecePositionCheck(oldPosition, newPosition) === false) {
            return false;
        }

        if (this.type === 'k' && this._additionalKingPositionCheck(oldPosition, newPosition) === false) {
            return false;
        }

        return true;
    };

    JChessPiece.prototype._additionalPiecePositionCheck = function (oldPosition, newPosition) {
        var offsets;
        offsets = this.board.offsetsByPositions(oldPosition, newPosition);
        if (offsets[0] !== 0 && (!this.board.has(newPosition) || this.board.get(newPosition).color === this.color)) {
            return false;
        }

        if (offsets[0] === 0 && this.board.has(newPosition)) {
            return false;
        }

        if (Math.abs(offsets[1]) === 2 && offsets[0] === 0) {
            if (this.isTouched === true) {
                return false;
            }

            // TODO: it's hot fix
            if (this.board.has(this.board.newPositionByPositionAndOffset(oldPosition, 0, offsets[1] + (this.color === 'w' ? 1 : -1))) === true) {
                return false
            }
        }

        return true;
    };

    JChessPiece.prototype._additionalKingPositionCheck = function (oldPosition, newPosition) {
        var crossing, crossingPiece, c, offsets, isShadow, isPosible;

        crossing = this.board.crossing[newPosition];
        for (c = 0; c < crossing.length; c++) {
            crossingPiece = crossing[c].piece;
            isShadow = crossing[c].shadow;
            offsets = this.board.offsetsByPositions(crossingPiece.currentPosition, newPosition);
            crossingPiece.isPossiblePosition(newPosition);
            if (crossingPiece.color !== this.color) {
                if (crossingPiece.type === 'p' && Math.abs(offsets[1]) > 0 && offsets[0] === 0) {
                    continue;
                }

                if (['n', 'p', 'k'].indexOf(crossingPiece.type) === -1 &&
                    crossingPiece.isPossiblePosition(newPosition) === false &&
                    crossingPiece.isPossiblePosition(oldPosition) === false) {
                    continue;
                }

                return false;
            }
        }

        return true;
    };

    JChessPiece.prototype.getOffsets = function (name) {
        if (name === undefined) {
            name = this.type;
        }

        if (this.stepOffsets.hasOwnProperty(name)) {
            var offsets = this.stepOffsets[name];
            if (this.isTouched === false) {
                if (name === 'p') {
                    offsets = offsets.concat([[0, -2]]);
                }

                if (name === 'k') {
                    var n, Xoffsets = [-2, 2], castlingPosition, Xoffset;
                    for (n = 0; n < Xoffsets.length; n++) {
                        Xoffset = Xoffsets[n];
                        castlingPosition = this.currentPosition + Xoffset;
                        if (this.board._isCastlingSideAvailable(this.currentPosition, castlingPosition) !== false) {
                            offsets = offsets.concat([[Xoffset, 0]]);
                        }
                    }
                }
            }

            return offsets;
        }
    };

    JChessPiece.prototype._genSourceVectors = function () {
        var possiblePositions, possiblePosition, oneStepTypes,
            offsets, XY, vector, offsetX, offsetY, stepX, stepY, single, s, o;

        possiblePositions = [];
        oneStepTypes = ['n', 'k', 'p'];

        offsets = this.getOffsets();
        XY = this.board.positionToCoordinate(this.currentPosition);
        single = (oneStepTypes.indexOf(this.type) > -1);

        for (o = 0; o < offsets.length; o++) {
            vector = [];
            offsetX = offsets[o][0];
            offsetY = offsets[o][1];

            if (this.board.side !== 'w') {
                offsetX *= -1;
                offsetY *= -1;
            }

            stepX = XY[0];
            stepY = XY[1];
            s = 0;
            while (s < 1 && stepX >= 0 && stepX < 8 && stepY >= 0 && stepY < 8) {
                possiblePosition = this.board.coordinateToPosition(stepX, stepY);

                if (this.currentPosition !== possiblePosition) {
                    vector.push(possiblePosition);

                    if (single === true) {
                        s++;
                    }
                }

                if ((this.color === 'b' && this.type === 'p')) {
                    stepX = stepX + offsetX * -1;
                    stepY = stepY + offsetY * -1;
                } else {
                    stepX = stepX + offsetX;
                    stepY = stepY + offsetY;
                }
            }

            possiblePositions.push(vector);
        }

        return possiblePositions;
    };

    JChessPiece.prototype.genPossiblePositions = function () {
        var shadow, vector, o, i, possiblePosition;
        var possiblePositions = new JChessPossiblePositions();
        var source, sourceVector;

        if (this.board.settings.validation !== true) {
            return;
        }

        source = this._genSourceVectors();

        for (o = 0; o < source.length; o++) {
            shadow = false;
            sourceVector = source[o];
            vector = new JChessVector();

            for (i = 0; i < sourceVector.length; i++) {
                possiblePosition = sourceVector[i];
                if (this.currentPosition !== possiblePosition) {
                    if (shadow === false && this._additionalPositionCheck(possiblePosition) === false) {
                        shadow = true;
                    }

                    if (this.board.has(possiblePosition) && this.board.get(possiblePosition).color === this.color) {
                        shadow = true;
                    }

                    vector.set(possiblePosition, shadow);

                    if (this.board.has(possiblePosition)) {
                        shadow = true;
                    }
                }
            }

            possiblePositions.push(vector);
        }
        this.possiblePositions = possiblePositions;
        return possiblePositions;
    };

    JChessPiece.prototype.isPossiblePosition = function (newPosition) {
        var v, vector, positions;

        if (this.possiblePositions.isEmpty()) {
            this.genPossiblePositions();
        }

        positions = this.possiblePositions.vectors;
        for (v = 0; v < positions.length; v++) {
            vector = positions[v];
            if (vector.has(newPosition) && vector.get(newPosition) === false) {
                return true;
            }
        }

        return false;
    };

    return JChessPiece;
}(jQuery));

var JChessBoard = (function (JChessPiece, $) {

    function JChessBoard(canvas, options) {
        var settings = $.extend({
            cellSize: 64,
            numbers: false,
            imagesPath: 'images',
            side: 'w',
            helpStyle: {},
            validation: true,
            help: true,
            lightColor: 'white',
            darkColor: 'gray'
        }, options);

        this.canvas = canvas;
        this.settings = settings;
        this.cells = [];
        this.crossing = {};
        this.nextStepSide = 'w';
        this.kings = {};
        this.check = false;
        this.castlings = '-';
        this.side = settings.side;
        this.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        this.ranks = [8, 7, 6, 5, 4, 3, 2, 1];

        var size = settings.cellSize;
        var x = 0, y = 0, c = 0;
        var row, col, color;

        for (row = 0; row < 8; row++) {
            for (col = 0; col < 8; col++) {
                color = ( (col % 2 == 0 && row % 2 == 0) || (col % 2 == 1 && row % 2 == 1) ? settings.lightColor : settings.darkColor);

                x = (col * size + size / 2);
                y = (row * size + size / 2);

                if (this.side !== 'w') {
                    y = size * 8 - y;
                }

                canvas.drawRect({
                    layer: true,
                    type: 'rectangle',
                    groups: ['board'],
                    fillStyle: color,
                    x: x, y: y,
                    width: size, height: size
                });

                if (settings.numbers === true) {
                    canvas.drawText({
                        layer: true,
                        fillStyle: '#9cf',
                        x: x, y: y,
                        fontSize: 24,
                        fontFamily: 'Verdana, sans-serif',
                        text: this.files[col] + '' + this.ranks[row]
                    });
                }

                this.cells[c] = undefined;
                c++;
            }
        }

        this.clear();

        canvas.trigger('boardready', [this]);

        return this;
    }

    JChessBoard.prototype.start = function () {
        return this.fenToPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq');
    };

    JChessBoard.prototype.fenToPosition = function (fenString) {
        this.clear();

        var rows = fenString.match(/([\d\w\-]+)+/gi);
        var row, char, chars, settings, position;
        var y, i;


        if (9 in rows && (/^K?Q?k?q?$/.test(rows[9]) | rows[9] === '-')) {
            this.castlings = rows[9];
        }

        position = 0;
        for (y = 0; y < rows.length && position < 64; y++) {
            row = rows[y];
            chars = row.split('');

            for (i = 0; i < row.length && position < 64; i++) {
                char = chars[i];

                if (char !== undefined) {
                    if (/\d/.test(char)) {
                        position += parseInt(char);
                    } else {
                        this.set(position, new JChessPiece(this, {
                            position: position,
                            fen: char,
                            castling: this.castlings.indexOf(char === 'R' ? 'Q' : char === 'r' ? 'q' : char) > -1
                        }));
                        position++;
                    }
                }
            }
        }

        if (8 in rows && /(w|b)/.test(rows[8])) {
            this.nextStepSide = rows[8];
        }

        this._initPieces();
    };

    JChessBoard.prototype._initPieces = function () {
        var i, cell;
        this.each(function (piece) {
            piece.genPossiblePositions();
        });

        this.genCrossing();
    };

    JChessBoard.prototype._initCrossing = function () {
        var i;
        for (i = 0; i < 64; i++) {
            this.crossing[i] = [];
        }
    };

    JChessBoard.prototype.genCrossing = function () {
        var i, piece, positions, v, vector, p, position, value;

        if (this.settings.validation !== true) {
            return false;
        }

        this._initCrossing();

        for (i = 0; i < this.cells.length; i++) {
            if (this.has(i)) {
                piece = this.get(i);
                positions = piece.possiblePositions.vectors;
                for (v = 0; v < positions.length; v++) {
                    vector = positions[v].keys;
                    for (p = 0; p < vector.length; p++) {
                        position = vector[p];
                        value = {'piece': piece, 'shadow': positions[v].get(position)};
                        if (this.crossing[position] === undefined) {
                            this.crossing[position] = [value];
                        } else {
                            this.crossing[position].push(value);
                        }
                    }
                }
            }
        }
    };

    JChessBoard.prototype.positionToFen = function () {
        var fenString = '';
        var i = 0;
        for (var n = 0; n < 64; n++) {
            if (n > 0 && n % 8 == 0) {
                if (i > 0) {
                    fenString += i.toString();
                    i = 0;
                }
                fenString += '/';
            }
            var piece = this.get(n);
            if (piece) {
                if (i > 0) {
                    fenString += i.toString();
                    i = 0;
                }
                fenString += piece.fen;
            } else {
                i++;
            }
        }
        if (i > 0) {
            fenString += i;
        }

        return fenString + ' ' + this.nextStepSide + ' ' + this.castlings.split('')
                .sort(function (a, b) {
                    var p = ['K', 'Q', 'k', 'q'];
                    return p.indexOf(a) > p.indexOf(b);
                }).join('');
    };

    JChessBoard.prototype._isCastlingSideAvailable = function (oldPosition, newPosition) {
        var king, rook, offset, offsets;

        offsets = this.offsetsByPositions(oldPosition, newPosition);

        king = this.get(oldPosition);
        if (king !== undefined && Math.abs(offsets[0]) === 2) {
            offset = (newPosition > oldPosition ? 1 : -2);
            rook = this.get(newPosition + offset);
            if (rook !== undefined && this._checkCastlingRules(king, rook) === true) {
                return rook;
            }
        }

        return false;
    };

    JChessBoard.prototype._checkCastlingRules = function (king, rook) {
        if (!king.isCastlingAvailable() || !rook.isCastlingAvailable()) {
            return false;
        }

        var from = king.currentPosition;
        var to = rook.currentPosition;
        var sequence = this._makeRangeBetween(from, to);
        var i, position, crossing, c;

        for (i = 0; i < sequence.length; i++) {
            position = sequence[i];
            if (this.get(position) === rook) {
                continue;
            }

            if (this.get(position) !== undefined && this.get(position) !== king) {
                return false;
            }

            crossing = this.crossing[position];
            for (c = 0; c < crossing.length; c++) {
                if (crossing[c].piece.color !== king.color && crossing[c].shadow === false) {
                    return false
                }
            }
        }

        return true;
    };

    JChessBoard.prototype._makeRangeBetween = function (from, to) {
        var iterator = from < to ? +1 : -1;
        var sequence = [from];
        while (from !== to) {
            from = from + iterator;
            sequence.push(from);
        }

        return sequence;
    };

    JChessBoard.prototype.clear = function () {
        var i;
        for (i = 0; i < 64; i++) {
            if (this.has(i)) {
                this.delete(i, false);
            }
        }

        this.canvas.drawLayers();

        delete this.cells;
        this.cells = [];

        for (i = 0; i < 64; i++) {
            this.cells[i] = undefined;
            this.crossing[i] = [];
        }
    };

    JChessBoard.prototype.move = function (oldPosition, newPosition, isFake) {
        var checkFen, checkColor;

        if (!this.has(oldPosition)) {
            return false;
        }

        var piece = this.get(oldPosition);
        if (this.settings.validation !== true || this._checkStepSide(piece)) {
            piece.genPossiblePositions();
            if (this.settings.validation !== true || piece.isPossiblePosition(newPosition) === true) {
                checkColor = this.nextStepSide;
                if (this.isCheck(checkColor) === true) {
                    this.canvas.trigger('check', [this, piece]);
                    checkFen = this.positionToFen();
                }

                this._move(piece, newPosition, isFake);

                if (this.isCheck(checkColor) === true && checkFen !== undefined) {
                    this._move(piece, oldPosition);
                    this.nextStepSide = checkColor;

                    return false;
                }

                if (this.isCheck(this.nextStepSide) && this.isCheckmate(this.nextStepSide)) {
                    this.nextStepSide = undefined;
                    this.canvas.trigger('checkmate', [this]);
                }

                return true;
            }
        }

        return false;
    };

    JChessBoard.prototype._move = function (piece, newPosition, isFake) {
        var layer = piece.layer;
        var XY = this.positionToCoordinate(newPosition);
        var oldPosition = piece.currentPosition;
        var rook, side;

        if (!this.get(oldPosition)) {
            return false;
        }

        if (isFake !== true) {
            this.canvas.animateLayer(layer, {
                x: this.relativeToAbsolute(XY[0]),
                y: this.relativeToAbsolute(XY[1])
            });

            rook = this._isCastlingSideAvailable(oldPosition, newPosition);

            if (piece.type === 'k') {
                this.castlings = this.castlings.replace(piece.color === 'w' ? /(K|Q)/g : /k|q/g, '');
            }
            if (piece.type === 'r') {
                side = this._getSideByRook(piece);
                this.castlings = this.castlings.replace(piece.color === 'w' ? side.toUpperCase() : side, '');
            }
        }

        this.delete(oldPosition, true);

        if (this.has(newPosition)) {
            this.get(newPosition).destroy();
        }

        this.set(newPosition, piece);

        piece.setCurrentPosition(newPosition);

        this.nextStepSide = (this.nextStepSide === 'w' ? 'b' : 'w');

        if (isFake !== true) {
            if (rook !== false) {
                side = this._getSideByRook(rook);
                this._move(rook, side === 'k' ? newPosition - 1 : newPosition + 1);
                this.canvas.trigger('castling', [this, piece, rook]);
                this.nextStepSide = (this.nextStepSide === 'w' ? 'b' : 'w');
            }
            this.canvas.trigger('piecemove', [this, piece, XY[0], XY[1]]);

            if (piece.type === 'p' && [0, 7].indexOf(XY[1]) > -1) {
                this.canvas.trigger('promotion', [this, piece]);
            }
        }

        this.each(function (piece) {
            piece.genPossiblePositions();
        });
        this.genCrossing();
    };

    JChessBoard.prototype._getSideByRook = function (rook) {
        return [0, 56].indexOf(rook.currentPosition) > -1 ? 'q' : 'k';
    };

    JChessBoard.prototype.coordinateToPosition = function (x, y, side) {
        if (side === undefined) {
            side = this.side;
        }

        if (side === 'w') {
            return 8 * y + x;
        }

        return (8 * (7 - y) + x);
    };

    /**
     * 00,01,02,03,04,05,06,07
     * 08,09,10,11,12,13,14,15
     * 16,17,18,19,20,21,22,23
     * 24,25,26,27,28,29,30,31
     * 32,33,34,35,36,37,38,39
     * 40,41,42,43,44,45,46,47
     * 48,49,50,51,52,53,54,55
     * 56,57,58,59,60,61,62,63
     *
     * @param num
     * @returns {*[]}
     */
    JChessBoard.prototype.positionToCoordinate = function (num) {
        var x = num % 8;
        var y = Math.floor(num / 8);

        if (this.side !== 'w') {
            y = 7 - y;
        }

        return [x, y];
    };

    JChessBoard.prototype.absoluteToRelative = function (px) {
        var size = this.settings.cellSize;
        return Math.floor(px / size);
    };

    JChessBoard.prototype.newPositionByPositionAndOffset = function (positon, offsetX, offsetY) {
        var XY;
        XY = this.positionToCoordinate(positon);
        XY[0] = XY[0] + offsetX;
        XY[1] = XY[1] + offsetY;
        return this.coordinateToPosition(XY[0], XY[1]);
    };

    JChessBoard.prototype.offsetsByPositions = function (oldPosition, newPosition) {
        var oldXY, newXY;
        oldXY = this.positionToCoordinate(oldPosition);
        newXY = this.positionToCoordinate(newPosition);

        return [newXY[0] - oldXY[0], newXY[1] - oldXY[1]]
    };

    JChessBoard.prototype.absoluteCeil = function (px) {
        var size = this.settings.cellSize;
        return Math.ceil(px / size) * size - size / 2;
    };

    JChessBoard.prototype.relativeToAbsolute = function (position) {
        var size = this.settings.cellSize;
        return position * size + size / 2;
    };

    JChessBoard.prototype._checkStepSide = function (piece) {
        return this.nextStepSide === piece.color;
    };

    JChessBoard.prototype.get = function (num) {
        if (this.has(num)) {
            return this.cells[num];
        }
    };

    JChessBoard.prototype.has = function (num) {
        return this.cells[num] !== undefined;
    };

    JChessBoard.prototype.delete = function (num, isMove) {
        var cell = this.cells[num];

        if (isMove === false) {
            cell.destroy();
        }
        this.cells[num] = undefined;

        return this;
    };

    JChessBoard.prototype.allPieces = function () {
        return this.cells.filter(function (value) {
            return value !== undefined;
        });
    };

    JChessBoard.prototype.each = function (callable) {
        this.allPieces().forEach(callable);
        return this;
    };

    JChessBoard.prototype.set = function (num, piece) {
        var type;
        this.cells[num] = piece;

        type = piece.type;
        if (type === 'k') {
            this.kings[piece.color] = piece;
        }

        return this;
    };

    JChessBoard.prototype.isCheck = function (color) {
        var king, currentPosition, crossing, n, piece;
        king = this.kings[color];
        if (king === undefined) {
            return false;
        }

        currentPosition = king.currentPosition;
        crossing = this.crossing[currentPosition];

        for (n = 0; n < crossing.length; n++) {
            piece = crossing[n].piece;
            if (piece.color !== color && piece.isPossiblePosition(currentPosition)) {
                return true;
            }
        }

        return false;
    };

    JChessBoard.prototype.isCheckmate = function (color) {
        var n, p, positions, position, piece;
        var currentFen = this.positionToFen();
        var king = this.kings[color];
        if (king === undefined) {
            return false;
        }
        var pieces = this.allPieces().filter(function (piece) {
            return piece.color === color;
        });

        for (n = 0; n < pieces.length; n++) {
            piece = pieces[n];
            positions = piece.possiblePositions.all();
            for (p = 0; p < positions.length; p++) {
                position = positions[p];
                this.move(piece.currentPosition, position, true);
                if (this.isCheck(color) === false) {
                    this.fenToPosition(currentFen);
                    return false;
                }
            }
        }

        return true;
    };

    JChessBoard.prototype._anToPosition = function(an) {
        if (an.match(/[a-h][1-8]/)) {
            var x = this.files.indexOf(an[0]);
            var y = this.ranks.indexOf(parseInt(an[1]));
            return this.coordinateToPosition(x, y, 'w');
        }
    };

    JChessBoard.prototype._pieceByNextSan = function(san) {
        var i, pieces, piece, type, positions, newPosition, an, sub;
        var found = [];
        type = 'p';
        pieces = this.allPieces();
        sub = san.match(/^(P?|K|N)([a-h][1-8])$/);
        if (sub) {
            if (sub[1]) {
                type = sub[1].toLowerCase();
            }
            an = sub[2];
            newPosition = this._anToPosition(an);

            for (i = 0; i < pieces.length; i++) {
                piece = pieces[i];
                if (piece.color === this.nextStepSide && piece.type === type) {
                    positions = piece.possiblePositions.all();
                    if (positions.indexOf(newPosition) > -1) {
                        return piece;
                    }
                }
            }
        }
    };

    return JChessBoard;
}(JChessPiece, jQuery));


(function ($) {

    $.fn.jschessboard = function (options) {
        return new JChessBoard(this, options);
    };

}(jQuery));
