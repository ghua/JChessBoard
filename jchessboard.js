var JChessPiece = (function ($) {

    var oneStepOffsets = {
        b: [[1, 1], [-1, -1], [-1, 1], [1, -1]],
        n: [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]],
        k: [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]],
        p: [[1, 0], [2, 0]],
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
        p: function (offsetX, offsetY, isTouched) {
            if (isTouched === false) {
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

        var size = s.size;
        var image = s.imagesPath + '/wikipedia/' + s.color + s.type.toUpperCase() + '.png';

        this.x = s.startX * size + size / 2;
        this.y = s.startY * size + size / 2;
        this.fen = s.color == 'w' ? s.type.toUpperCase() : s.type.toLowerCase();
        this.currentPosition = board.coordinateToPosition(s.startX, s.startY);
        this.nextPositions = this.genLegalPositions(s.startX, s.startY, this.getOneStepOffset(s.type), s.type === 'n');
        this.layer = this.fen + '_' + this.currentPosition;
        board.canvas.drawImage({
            name: this.layer,
            source: image,
            x: this.x,
            y: this.y,
            layer: true,
            draggable: true,
            bringToFront: true,
            dragstop: function (layer) {
                var oldX = layer._startX;
                var oldY = layer._startY;
                var oldPositionX = board.absoluteToRelative(oldX)
                var oldPositionY = board.absoluteToRelative(oldY);
                var newPositionX = board.absoluteToRelative(layer._eventX);
                var newPositionY = board.absoluteToRelative(layer._eventY);
                var oldPosition = board.coordinateToPosition(oldPositionX, oldPositionY);
                var newPosition = board.coordinateToPosition(newPositionX, newPositionY);
                var newX = board.absoluteCeil(layer.eventX);
                var newY = board.absoluteCeil(layer.eventY);
                var offsetX = oldX - newX;
                var offsetY = oldY - newY;
                var offsetPositionX = Math.ceil(offsetX / s.size);
                var offsetPositionY = Math.ceil(offsetY / s.size);

                if (s.color == 'b') {
                    offsetPositionX = offsetPositionX * -1;
                    offsetPositionY = offsetPositionY * -1;
                }

                var isValidOffset = me.getType(s.type);
                if (
                    newPositionX <= 8 && newPositionY <= 8
                    && isValidOffset(offsetPositionX, offsetPositionY, me.isTouched)
                    && me.isClearWay(newPosition, me.nextPositions, board.cells)
                ) {
                    board.canvas.animateLayer(layer, {
                        x: newX, y: newY
                    });

                    me.currentPosition = newPosition;
                    me.nextPositions = me.genLegalPositions(newPositionX, newPositionY, me.getOneStepOffset(s.type), s.type === 'n');

                    board.cells[oldPosition] = undefined;
                    board.cells[newPosition] = me;

                    me.isTouched = true;

                    board.canvas.trigger('piecemove', [board, me, newX, newY]);
                } else {
                    board.canvas.animateLayer(layer, {
                        x: oldX, y: oldY
                    });
                }
            }
        });

        return this;
    }

    JChessPiece.prototype.getType = function (name) {
        if (isLegalOffset.hasOwnProperty(name)) {
            return isLegalOffset[name];
        }
    };

    JChessPiece.prototype.getOneStepOffset = function (name) {
        if (oneStepOffsets.hasOwnProperty(name)) {
            return oneStepOffsets[name];
        }
    };

    JChessPiece.prototype.genLegalPositions = function (currentX, currentY, offsets, single) {
        var o, s, offset, stepX, stepY, legalPosition, vector;
        var legalPositions = [];
        for (o = 0; o < offsets.length; o++) {
            vector = [];
            offset = offsets[o];
            stepX = currentX;
            stepY = currentY;
            s = 0;
            while (s < 2 && stepX >= 0 && stepX < 8 && stepY >= 0 && stepY < 8) {
                legalPosition = this.board.coordinateToPosition(stepX, stepY);
                if (vector.indexOf(legalPosition) === -1) {
                    vector.push(legalPosition);
                }
                stepX = stepX + offset[0];
                stepY = stepY + offset[1];

                if (single === true) {
                    s++;
                }
            }

            legalPositions.push(vector);
        }

        return legalPositions;
    };

    JChessPiece.prototype.isClearWay = function (dstPosition, positions, cells) {
        var v, vector, end, slice, i, position;
        for (v = 0; v < positions.length; v++) {
            vector = positions[v];
            end = vector.indexOf(dstPosition);
            if (end > -1) {
                slice = vector.slice(1, end + 1);
                for (i = 0; i < slice.length; i++) {
                    position = slice[i];
                    if (cells[position] !== undefined) {
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
        var row, char, chars, piece, settings;
        var x, y, i;

        i = 0;
        for (y = 0; y < rows.length; y++) {
            row = rows[y];
            chars = row.split('');

            for (x = 0; x < row.length; x++) { // columns
                char = chars[x];

                if (char !== undefined) {
                    if (/\d/.test(char)) {
                        i += parseInt(char);
                    } else {
                        piece = char.toLowerCase();

                        settings = $.extend({
                            startX: x,
                            startY: y,
                            color: (piece == char) ? 'b' : 'w',
                            type: piece
                        }, this.settings);

                        this.cells[i] = new JChessPiece(this, settings);
                        i++;
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

        var piece = this.cells[oldPosition];

        this.movePiece(piece, newPosition);
    };

    JChessBoard.prototype.movePiece = function (piece, newPosition) {
        var layer = piece.layer;
        var XY = this.positionToCoordinate(newPosition);
        var size = this.settings.cellSize;

        this.canvas.animateLayer(layer, {
            x: this.relativeToAbsolute(XY[0]),
            y: this.relativeToAbsolute(XY[1])
        });
    };

    JChessBoard.prototype.coordinateToPosition = function (x, y) {
        return 8 * y + x;
    };

    JChessBoard.prototype.positionToCoordinate = function (num) {
        return [num % 8, Math.floor(num / 8)];
    };

    JChessBoard.prototype.absoluteToRelative = function (px) {
        var size = this.settings.cellSize;
        return Math.floor(px / size);
    };

    JChessBoard.prototype.absoluteCeil  = function (px) {
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
