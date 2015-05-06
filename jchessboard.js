var JChessPiece = (function ($) {

    var types = {
        b: {
            moveOffsets: [[-1,-1], [-1,1], [1,-1], [1,1]],
            isLegal: function (offsetX, offsetY) {
                return Math.abs(offsetX) == Math.abs(offsetY);
            }
        },
        n: {
            isLegal: function (offsetX, offsetY) {
                var movesOffsets = [[-1, -2], [-1, 2], [-2, -1], [-2, 1], [1, -2], [1, 2], [2, -1], [2, 1]];

                for (var i = 0; i < movesOffsets.length; i++) {
                    var legalMove = movesOffsets[i];

                    if (offsetX == legalMove[0] && offsetY == legalMove[1]) {
                        return true;
                    }
                }

                return false;
            }
        },
        k: {
            isLegal: function (offsetX, offsetY) {
                offsetX = Math.abs(offsetX);
                offsetY = Math.abs(offsetY);

                return (offsetX == 1 && offsetY == 1) || (offsetX == 0 && offsetY == 1) || (offsetX == 1 && offsetY == 0);
            }
        },
        p: {
            isLegal: function (offsetX, offsetY, isTouched) {
                if (isTouched === false) {
                    return (offsetY === 1 || offsetY === 2) && offsetX === 0;
                }

                return offsetY === 1 && offsetX === 0;
            }
        },
        r: {
            isLegal: function (offsetX, offsetY) {
                offsetX = Math.abs(offsetX);
                offsetY = Math.abs(offsetY);

                return (offsetX >= 1 && offsetY == 0) || (offsetX == 0 && offsetY >= 1);
            }
        },
        q: {
            isLegal: function (offsetX, offsetY) {
                offsetX = Math.abs(offsetX);
                offsetY = Math.abs(offsetY);

                return (offsetX >= 1 && offsetY == 0) || (offsetX == 0 && offsetY >= 1) || offsetX == offsetY;
            }
        }
    };

    function JChessPiece(board, options) {
        this.legalMoves = [];
        this.isTouched = false;
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

        this.x = s.startX * size - size / 2;
        this.y = s.startY * size - size / 2;
        this.fen = s.color == 'w' ? s.type.toUpperCase() : s.type.toLowerCase();
        this.currentPosition = this.coordinateToPosition(s.startX, s.startY);
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
                var oldPositionX = me.roundPixels(oldX, size);
                var oldPositionY = me.roundPixels(oldY, size);
                var newPositionX = me.roundPixels(layer._eventX, size);
                var newPositionY = me.roundPixels(layer._eventY, size);
                var oldPosition = me.coordinateToPosition(oldPositionX, oldPositionY);
                var newPosition = me.coordinateToPosition(newPositionX, newPositionY);
                var newX = Math.ceil(layer.eventX / s.size) * s.size - s.size / 2;
                var newY = Math.ceil(layer.eventY / s.size) * s.size - s.size / 2;
                var offsetX = oldX - newX;
                var offsetY = oldY - newY;
                var offsetPositionX = Math.ceil(offsetX / s.size);
                var offsetPositionY = Math.ceil(offsetY / s.size);

                if (s.color == 'b') {
                    offsetPositionX = offsetPositionX * -1;
                    offsetPositionY = offsetPositionY * -1;
                }

                if (newPositionX <= 8 && newPositionY <= 8 && me.getType(s.type).isLegal(offsetPositionX, offsetPositionY, me.isTouched)) {
                    board.canvas.animateLayer(layer, {
                        x: newX, y: newY
                    });

                    me.currentPosition = newPosition;

                    board.canvas.trigger('piecemove', [me, newX, newY]);

                    me.isTouched = true;
                } else {
                    board.canvas.animateLayer(layer, {
                        x: oldX, y: oldY
                    });
                }
            }
        });

        return this;
    }

    JChessPiece.prototype.coordinateToPosition = function (x, y) {
        return 8 * y + x;
    };

    JChessPiece.prototype.positionToCoordinate = function(num) {
        return [num % 8, Math.floor(num / 8)];
    };

    JChessPiece.prototype.getType = function(name) {
        if (types.hasOwnProperty(name)) {
            return types[name];
        }
    };

    JChessPiece.prototype.roundPixels = function(px, cellSize) {
        return Math.floor(px / cellSize);
    };

    return JChessPiece;
}(jQuery));

var JChessBoard = (function(JChessPiece, $) {
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

        return this;
    }

    JChessBoard.prototype.start = function() {
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
                            startX: x + 1,
                            startY: y + 1,
                            color: (piece == char) ? 'b' : 'w',
                            type: piece
                        }, this.settings);

                        this.cells[i] = new JChessPiece(this, settings);
                        i++;
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

        delete this.cells;
        this.cells = [];

        for (i = 0; i < 64; i++) {
            this.cells[i] = undefined;
        }
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
