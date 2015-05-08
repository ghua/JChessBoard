var JChessPiece = (function ($) {

    var oneStepOffsets = {
        b: [[1, 1], [-1, -1], [-1, 1], [1, -1]],
        n: [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]],
        k: [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]],
        p: [[0, -1], [0, -2], [-1, -1], [1, -1]],
        r: [[1, 0], [0, 1], [-1, 0], [0, -1]],
        q: [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]]
    };

    var isLegalOffset = {
        b: function (offsetX, offsetY) {
            return Math.abs(offsetX) == Math.abs(offsetY);
        },
        n: function (offsetX, offsetY) {
            var movesOffsets = oneStepOffsets.n;

            for (var i = 0; i < movesOffsets.length; i++) {
                var legalMove = movesOffsets[i];

                if (offsetX == legalMove[0] && offsetY == legalMove[1]) {
                    return true;
                }
            }

            return false;
        },
        k: function (offsetX, offsetY) {
            offsetX = Math.abs(offsetX);
            offsetY = Math.abs(offsetY);

            return (offsetX == 1 && offsetY == 1) || (offsetX == 0 && offsetY == 1) || (offsetX == 1 && offsetY == 0);
        },
        p: function (offsetX, offsetY, me) {
            if (me.isTouched === false) {
                return (offsetY === 1 || offsetY === 2) && offsetX === 0;
            }

            return offsetY === 1 && offsetX === 0;
        },
        r: function (offsetX, offsetY) {
            offsetX = Math.abs(offsetX);
            offsetY = Math.abs(offsetY);

            return (offsetX >= 1 && offsetY == 0) || (offsetX == 0 && offsetY >= 1);
        },
        q: function (offsetX, offsetY) {
            offsetX = Math.abs(offsetX);
            offsetY = Math.abs(offsetY);

            return (offsetX >= 1 && offsetY == 0) || (offsetX == 0 && offsetY >= 1) || offsetX == offsetY;
        }
    };

    function JChessPiece(board, options) {
        this.isTouched = false;
        this.board = board;
        var me = this;

        var s = $.extend({
            type: 'p',
            color: 'w',
            startX: 5,
            startY: 5,
            size: 64
        }, options);

        this.settings = s;

        var size = s.size;
        var image = s.imagesPath + '/wikipedia/' + s.color + s.type.toUpperCase() + '.png';

        this.x = s.startX * size + size / 2;
        this.y = s.startY * size + size / 2;
        this.fen = s.color == 'w' ? s.type.toUpperCase() : s.type.toLowerCase();
        this.currentPosition = board.coordinateToPosition(s.startX, s.startY);
        this.nextPositions = this.genLegalPositions(s.startX, s.startY);
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
                size = me.settings.cellSize / 2;
                for (n = 0; n < me.nextPositions.length; n++) {
                    vector = me.nextPositions[n];
                    for (v = 0; v < vector.length; v++) {
                        newPosition = vector[v];
                        XY = board.positionToCoordinate(newPosition);

                        if (newPosition !== me.currentPosition && me.nextStepIsValid(me.currentPosition, newPosition)) {
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

                if (me.nextStepIsValid(oldPosition, newPosition)) {
                    me.board.movePiece(me, newPosition);
                    me.setNewPosition(newPosition);
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

    JChessPiece.prototype.setNewPosition = function (newPosition) {
        var newXY = this.board.positionToCoordinate(newPosition);
        this.currentPosition = newPosition;
        this.nextPositions = this.genLegalPositions(newXY[0], newXY[1]);
        this.isTouched = true;
    };

    JChessPiece.prototype.nextStepIsValid = function (oldPosition, newPosition) {
        var oldXY, newXY, offsetX, offsetY;

        if (this.board.nextStepSide !== this.settings.color) {
            return false;
        }

        oldXY = this.board.positionToCoordinate(oldPosition);
        newXY = this.board.positionToCoordinate(newPosition);

        if (newXY[0] > 7 || newXY[1] > 7) {
            return false;
        }

        if (this.settings.color === 'b') {
            offsetX = (oldXY[0] - newXY[0]) * -1;
            offsetY = (oldXY[1] - newXY[1]) * -1;
        } else {
            offsetX = oldXY[0] - newXY[0];
            offsetY = oldXY[1] - newXY[1];
        }

        var isValidOffset = this.getType();

        return (isValidOffset(offsetX, offsetY, this) && this.isClearWay(newPosition));
    };

    JChessPiece.prototype.getType = function (name) {
        if (name === undefined) {
            name = this.settings.type;
        }

        if (isLegalOffset.hasOwnProperty(name)) {
            return isLegalOffset[name];
        }
    };

    JChessPiece.prototype.getOneStepOffset = function (name) {
        if (name === undefined) {
            name = this.settings.type;
        }

        if (oneStepOffsets.hasOwnProperty(name)) {
            return oneStepOffsets[name];
        }
    };

    JChessPiece.prototype.genLegalPositions = function (currentX, currentY) {
        var o, s, stepX, stepY, legalPosition, vector, offsets, single, offsetX, offsetY;
        var legalPositions = [];

        var oneStepTypes = ['n', 'k', 'p'];

        single = (oneStepTypes.indexOf(this.settings.type) > -1);

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

                if (this.settings.color === 'b' && this.settings.type === 'p') {
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

    JChessPiece.prototype.isClearWay = function (dstPosition) {
        var v, vector, end, slice, i, position, positions, cells, piece;
        positions = this.nextPositions;
        cells = this.board.cells;

        for (v = 0; v < positions.length; v++) {
            vector = positions[v];
            end = vector.indexOf(dstPosition);
            if (end > -1) {
                slice = vector.slice(1, end + 1);
                for (i = 0; i < slice.length; i++) {
                    position = slice[i];
                    piece = cells[position];
                    if (piece !== undefined && (piece.settings.color === this.settings.color || this.settings.type === 'p')) {
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
        var x, y, i;

        for (y = 0; y < rows.length; y++) {
            row = rows[y];
            chars = row.split('');
            x = 0;

            for (i = 0; i < row.length; i++) { // columns
                char = chars[i];

                if (char !== undefined) {
                    if (/\d/.test(char)) {
                        x += parseInt(char);
                    } else {
                        piece = char.toLowerCase();

                        settings = $.extend({
                            startX: x,
                            startY: y,
                            color: (piece == char) ? 'b' : 'w',
                            type: piece
                        }, this.settings);

                        position = this.coordinateToPosition(x, y);
                        this.cells[position] = new JChessPiece(this, settings);
                        x++;
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

        if (piece.nextStepIsValid(oldPosition, newPosition)) {
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
        this.cells[newPosition] = piece;

        piece.setNewPosition(newPosition);

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
