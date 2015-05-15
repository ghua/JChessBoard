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

    return JChessPossiblePositions;

}());

var JChessPiece = (function ($) {

    var oneStepOffsets = {
        b: [[1, 1], [-1, -1], [-1, 1], [1, -1]],
        n: [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]],
        k: [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]],
        p: [[0, -1], [0, -2], [-1, -1], [1, -1]],
        r: [[1, 0], [0, 1], [-1, 0], [0, -1]],
        q: [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]]
    };

    function JChessPiece(board, options) {
        this.isTouched = false;
        this.board = board;
        var me = this;

        var s = $.extend({
            position: 0,
            fen: 'P',
            size: 64
        }, options);

        this.settings = s;
        this.color = s.fen.toUpperCase() === s.fen ? 'w' : 'b';
        this.currentPosition = s.position;
        this.fen = s.fen;

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
                if (me.board._checkStepSide(me)) {
                    me.genPossiblePositions();
                    size = me.settings.cellSize / 2;
                    for (n = 0; n < me.possiblePositions.vectors.length; n++) {
                        vector = me.possiblePositions.vectors[n].keys;
                        for (v = 0; v < vector.length; v++) {
                            newPosition = vector[v];

                            if (me.possiblePositions.vectors[n].get(newPosition) === false) {
                                XY = board.positionToCoordinate(newPosition);

                                board.canvas.drawEllipse({
                                    strokeStyle: 'green',
                                    strokeWidth: 2,
                                    fillStyle: 'yellow',
                                    layer: true,
                                    groups: ['help'],
                                    x: board.relativeToAbsolute(XY[0]),
                                    y: board.relativeToAbsolute(XY[1]),
                                    width: size,
                                    height: size
                                });
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

                if (me.board._checkStepSide(me) && me.isPossiblePosition(newPosition)) {
                    me.board._move(me, newPosition);
                } else {
                    board.canvas.animateLayer(layer, {
                        x: oldX, y: oldY
                    });
                }

                board.canvas.removeLayerGroup('help');
            }
        });

        return this;
    }

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

        if (this.fen.toLowerCase() === 'p' && this._additionalPiecePositionCheck(oldPosition, newPosition) !== true) {
            return false;
        }

        if (this.fen.toLowerCase() === 'k' && this._additionalKingPositionCheck(oldPosition, newPosition) !== true) {
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

        if (Math.abs(offsets[1]) > 1 && this.isTouched === true) {
            return false;
        }

        return true;
    };

    JChessPiece.prototype._additionalKingPositionCheck = function (oldPosition, newPosition) {
        var crossing, crossingPiece, c, offsets;

        crossing = this.board.crossing[newPosition];
        for (c = 0; c < crossing.length; c++) {
            crossingPiece = crossing[c];
            offsets = this.board.offsetsByPositions(crossingPiece.currentPosition, newPosition);
            if (crossingPiece.color !== this.color && (Math.abs(offsets[1]) > 0 && offsets[0] === 0 && crossingPiece.fen.toLocaleLowerCase() === 'p') === false) {
                return false;
            }
        }

        return true;
    };

    JChessPiece.prototype.getOneStepOffset = function (name) {
        if (name === undefined) {
            name = this.fen.toLocaleLowerCase();
        }

        if (oneStepOffsets.hasOwnProperty(name)) {
            return oneStepOffsets[name];
        }
    };

    JChessPiece.prototype._genSourceVectors = function () {
        var possiblePositions, possiblePosition, oneStepTypes,
            offsets, XY, vector, offsetX, offsetY, stepX, stepY, single, s, o;

        possiblePositions = [];
        oneStepTypes = ['n', 'k', 'p'];

        offsets = this.getOneStepOffset();
        XY = this.board.positionToCoordinate(this.currentPosition);
        single = (oneStepTypes.indexOf(this.fen.toLocaleLowerCase()) > -1);

        for (o = 0; o < offsets.length; o++) {
            vector = [];
            offsetX = offsets[o][0];
            offsetY = offsets[o][1];
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

                if (this.color === 'b' && this.fen.toLocaleLowerCase() === 'p') {
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
        var v, vector, positions, cells;

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
    var columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    function JChessBoard(canvas, settings) {
        this.canvas = canvas;
        this.settings = settings;
        this.cells = [];
        this.crossing = [];
        this.nextStepSide = 'w';
        this.kings = {};

        var size = settings.cellSize;
        var x = 0, y = 0, c = 0;
        var row, col, color;

        for (row = 0; row < 8; row++) {
            for (col = 0; col < 8; col++) {
                color = ( (col % 2 == 0 && row % 2 == 0) || (col % 2 == 1 && row % 2 == 1) ? 'white' : 'gray');

                x = (col * size + size / 2);
                y = 512 - (row * size + size / 2);

                canvas.drawRect({
                    layer: true,
                    type: 'rectangle',
                    groups: ['board'],
                    fillStyle: color,
                    x: x, y: y,
                    width: size, height: size
                });

                if (settings.debug === true) {
                    canvas.drawText({
                        layer: true,
                        fillStyle: '#9cf',
                        x: x, y: y,
                        fontSize: 48,
                        fontFamily: 'Verdana, sans-serif',
                        text: columns[col] + '' + parseInt(row + 1)
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
        return this.fenToPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w');
    };

    JChessBoard.prototype.fenToPosition = function (fenString) {
        this.clear();

        var rows = fenString.match(/([\d\w]+)+/gi);
        var row, char, chars, settings, position;
        var y, i;

        position = 0;
        for (y = 0; y < rows.length && position < 64; y++) {
            row = rows[y];
            chars = row.split('');

            for (i = 0; i < row.length && position < 64; i++) { // columns
                char = chars[i];

                if (char !== undefined) {
                    if (/\d/.test(char)) {
                        position += parseInt(char);
                    } else {
                        settings = $.extend({
                            position: position,
                            fen: char
                        }, this.settings);

                        this.set(position, new JChessPiece(this, settings));
                        position++;
                    }
                }
            }
        }

        if (8 in rows && /(w|b)/.test(rows[8])) {
            this.nextStepSide = rows[8];
        }

        this._initPieces();

        this.canvas.trigger('positionready', [this]);
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
        var i, piece, positions, v, vector, p, position;

        this._initCrossing();

        for (i = 0; i < this.cells.length; i++) {
            if (this.has(i)) {
                piece = this.get(i);
                positions = piece.possiblePositions.vectors;
                for (v = 0; v < positions.length; v++) {
                    vector = positions[v].keys;
                    for (p = 0; p < vector.length; p++) {
                        position = vector[p];
                        if (this.crossing[position] === undefined) {
                            this.crossing[position] = [piece];
                        } else {
                            this.crossing[position].push(piece);
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

        return fenString + ' ' + this.nextStepSide;
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

    JChessBoard.prototype.move = function () {
        var oldX, oldY, newX, newY, oldPosition, newPosition;
        if (arguments.length == 2) {
            oldPosition = arguments[0];
            newPosition = arguments[1];
        }
        if (arguments.length == 4) {
            oldX = arguments[0];
            oldY = arguments[1];
            newX = arguments[2];
            newY = arguments[3];

            oldPosition = this.coordinateToPosition(oldX, oldY);
            newPosition = this.coordinateToPosition(newX, newY);
        }

        if (!this.has(oldPosition)) {
            return false;
        }

        var piece = this.get(oldPosition);
        if (this._checkStepSide(piece)) {
            piece.genPossiblePositions();
            if (piece.isPossiblePosition(newPosition)) {
                this._move(piece, newPosition);

                return true;
            }
        }

        return false;
    };

    JChessBoard.prototype._move = function (piece, newPosition) {
        var layer = piece.layer;
        var XY = this.positionToCoordinate(newPosition);

        if (!this.get(piece.currentPosition)) {
            return false;
        }

        this.canvas.animateLayer(layer, {
            x: this.relativeToAbsolute(XY[0]),
            y: this.relativeToAbsolute(XY[1])
        });

        this.delete(piece.currentPosition, true);

        if (this.has(newPosition)) {
            this.get(newPosition).destroy();
        }

        this.set(newPosition, piece);

        piece.setCurrentPosition(newPosition);
        this.each(function (piece) {
            piece.genPossiblePositions();
        });
        this.genCrossing();

        this.nextStepSide = (this.nextStepSide === 'w' ? 'b' : 'w');

        this.canvas.trigger('piecemove', [this, piece, XY[0], XY[1]]);
    };

    JChessBoard.prototype.coordinateToPosition = function (x, y) {
        return 8 * y + x;
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
        return [num % 8, Math.floor(num / 8)];
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

        type = piece.fen.toLocaleLowerCase();
        if (type === 'k') {
            this.kings[piece.color] = piece;
        }

        return this;
    };

    return JChessBoard;
}(JChessPiece, jQuery));


(function ($) {

    $.fn.jschessboard = function (options) {
        var settings = $.extend({
            cellSize: 64,
            debug: false,
            imagesPath: 'images'
        }, options);

        return new JChessBoard(this, settings);
    };

}(jQuery));
