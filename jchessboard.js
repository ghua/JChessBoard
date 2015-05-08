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

        this.nextPositions = this.genLegalPositions(this.X, this.Y);
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
                me.nextPositions = me.genLegalPositions(me.X, me.Y);

                size = me.settings.cellSize / 2;
                for (n = 0; n < me.nextPositions.length; n++) {
                    vector = me.nextPositions[n];
                    for (v = 0; v < vector.length; v++) {
                        newPosition = vector[v];
                        XY = board.positionToCoordinate(newPosition);

                        if (me.isValidStep(me.currentPosition, newPosition)) {
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

                board.canvas.drawLayers();
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

                if (me.isValidStep(oldPosition, newPosition)) {
                    me.board.movePiece(me, newPosition);
                    me.setCurrentPosition(newPosition);
                } else {
                    board.canvas.animateLayer(layer, {
                        x: oldX, y: oldY
                    });
                }

                board.canvas.removeLayerGroup('help');
            }
        });

        return this;
    };

    JChessPiece.prototype.destroy = function () {
        this.board.canvas.removeLayer(this.layer);
        this.board[this.currentPosition] = undefined;
    };

    JChessPiece.prototype.setCurrentPosition = function (position) {
        var newXY = this.board.positionToCoordinate(position);
        this.currentPosition = position;
        this.nextPositions = this.genLegalPositions(newXY[0], newXY[1]);
        this.X = newXY[0];
        this.Y = newXY[1];
        this.isTouched = true;
    };

    JChessPiece.prototype.isValidStep = function () {
        var offsets, oldPosition, newPosition;

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

        if (this.board.nextStepSide !== this.color) {
            return false;
        }

        if ((oldPosition > 0 && oldPosition < 63 && newPosition > 0 && newPosition < 63) === false) {
            return false;
        }

        if (this.fen.toLowerCase() === 'p') {
            offsets = this.board.offsetsByPositions(oldPosition, newPosition);
            if (offsets[0] !== 0 && (this.board.cells[newPosition] === undefined || this.board.cells[newPosition].color === this.color)) {
                return false;
            }

            if (offsets[0] === 0 && this.board.cells[newPosition] !== undefined) {
                return false;
            }

            if (Math.abs(offsets[1]) > 1 && this.isTouched === true) {
                return false;
            }
        }

        return this._isValidStep(newPosition);
    };

    JChessPiece.prototype.getOneStepOffset = function (name) {
        if (name === undefined) {
            name = this.fen.toLocaleLowerCase();
        }

        if (oneStepOffsets.hasOwnProperty(name)) {
            return oneStepOffsets[name];
        }
    };

    JChessPiece.prototype.genLegalPositions = function (currentX, currentY) {
        var o, s, stepX, stepY, legalPosition, vector, offsets, single, offsetX, offsetY;
        var legalPositions = [];

        var oneStepTypes = ['n', 'k', 'p'];

        single = (oneStepTypes.indexOf(this.fen.toLocaleLowerCase()) > -1);

        offsets = this.getOneStepOffset();

        for (o = 0; o < offsets.length; o++) {
            vector = [];
            offsetX = offsets[o][0];
            offsetY = offsets[o][1];
            stepX = currentX;
            stepY = currentY;
            s = 0;
            while (s < 2 && stepX >= 0 && stepX < 8 && stepY >= 0 && stepY < 8) {
                legalPosition = this.board.coordinateToPosition(stepX, stepY);

                if (vector.indexOf(legalPosition) === -1) {
                    vector.push(legalPosition);
                }

                if (this.color === 'b' && this.fen.toLocaleLowerCase() === 'p') {
                    stepX = stepX + offsetX * -1;
                    stepY = stepY + offsetY * -1;
                } else {
                    stepX = stepX + offsetX;
                    stepY = stepY + offsetY;
                }

                if (single === true) {
                    s++;
                }
            }

            legalPositions.push(vector);
        }

        return legalPositions;
    };

    JChessPiece.prototype._isValidStep = function (newPosition) {
        var v, vector, end, slice, i, position, positions, cells, piece;
        positions = this.nextPositions;
        cells = this.board.cells;

        for (v = 0; v < positions.length; v++) {
            vector = positions[v];
            end = vector.indexOf(newPosition);
            if (end > -1) {
                slice = vector.slice(1, end + 1);
                for (i = 0; i < slice.length; i++) {
                    position = slice[i];
                    piece = cells[position];
                    if (piece !== undefined && piece.color === this.color) {
                        return false;
                    }
                }
            }
        }

        return true;
    };

    return JChessPiece;
}(jQuery));

var JChessBoard = (function (JChessPiece, $) {
    var columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    function JChessBoard(canvas, settings) {
        this.canvas = canvas;
        this.settings = settings;
        this.cells = [];
        this.nextStepSide = 'w';

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

                this.cells[c++] = undefined;
            }
        }

        this.clear();

        canvas.trigger('boardready', [this]);

        return this;
    }

    JChessBoard.prototype.start = function () {
        return this.fenToPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    };

    JChessBoard.prototype.fenToPosition = function (fenString) {
        this.clear();

        var rows = fenString.split('/');
        var row, char, chars, piece, settings, position;
        var y, i;

        position = 0;
        for (y = 0; y < rows.length; y++) {
            row = rows[y];
            chars = row.split('');


            for (i = 0; i < row.length; i++) { // columns
                char = chars[i];

                if (char !== undefined) {
                    if (/\d/.test(char)) {
                        position += parseInt(char);
                    } else {
                        settings = $.extend({
                            position: position,
                            fen: char
                        }, this.settings);

                        this.cells[position] = new JChessPiece(this, settings);
                        position++;
                    }
                }
            }
        }

        this.canvas.trigger('positionready', [this]);
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
            var piece = this.cells[n];
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

        return fenString;
    };

    JChessBoard.prototype.clear = function () {
        var i, cell;
        for (i = 0; i < 64; i++) {
            if (this.cells.hasOwnProperty(i)) {
                cell = this.cells[i];
                if (cell !== undefined) {
                    this.canvas.removeLayer(cell.layer);
                    delete this.cells[i];
                }
            }
        }

        this.canvas.drawLayers();

        delete this.cells;
        this.cells = [];

        for (i = 0; i < 64; i++) {
            this.cells[i] = undefined;
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

        if (this.cells[oldPosition] === undefined) {
            return false;
        }

        var piece = this.cells[oldPosition];

        if (piece.isValidStep(oldPosition, newPosition)) {
            this.movePiece(piece, newPosition);

            return true;
        }

        return false;
    };

    JChessBoard.prototype.movePiece = function (piece, newPosition) {
        var layer = piece.layer;
        var XY = this.positionToCoordinate(newPosition);
        var size = this.settings.cellSize;

        if (this.cells[piece.currentPosition] === undefined) {
            return false;
        }

        this.canvas.animateLayer(layer, {
            x: this.relativeToAbsolute(XY[0]),
            y: this.relativeToAbsolute(XY[1])
        });

        this.cells[piece.currentPosition] = undefined;

        if (this.cells[newPosition] !== undefined) {
            this.cells[newPosition].destroy();
        }

        this.cells[newPosition] = piece;

        piece.setCurrentPosition(newPosition);

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
