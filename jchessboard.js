var jChessPiece = (function ($) {
    var constructor;

    constructor = function(board, options) {
        var me = {
            layer: undefined,
            currentPosition: undefined
        };

        me.coordinateToPosition = function (x, y) {
            return 8 * y + x;
        };

        me.positionToCoordinate = function(num) {
            return [num % 8, Math.floor(num / 8)];
        };

        var settings = $.extend({
            type: 'p',
            color: 'w',
            startX: 5,
            startY: 5,
            size: 64
        }, options);
        var types = {
            b: {
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
                isLegal: function (offsetX, offsetY) {
                    var firstDoubleStep = false;
                    if (offsetY == 2 && offsetX == 0 && this.isTouched == undefined) {
                        firstDoubleStep = true;
                    }

                    if (firstDoubleStep || (offsetY == 1 && offsetX == 0)) {
                        this.isTouched = true;
                        return true;
                    }

                    return false;
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

        var size = settings.size;
        var image = settings.imagesPath + '/wikipedia/' + settings.color + settings.type.toUpperCase() + '.png';
        var x = me.x = settings.startX * size - size / 2;
        var y = me.y = settings.startY * size - size / 2;

        me.roundPixels = function(px, cellSize) {
            return Math.floor(px / cellSize);
        };

        me.getType = function(name) {
            if (types.hasOwnProperty(name)) {
                return types[name];
            }
        };

        me.fen = settings.color == 'w' ? settings.type.toUpperCase() : settings.type.toLowerCase();
        me.currentPosition = me.coordinateToPosition(settings.startX, settings.startY);

        me.layer = me.fen + '_' + me.currentPosition;
        board.canvas.drawImage({
            name: me.layer,
            source: image,
            x: x,
            y: y,
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
                var newX = Math.ceil(layer.eventX / settings.size) * settings.size - settings.size / 2;
                var newY = Math.ceil(layer.eventY / settings.size) * settings.size - settings.size / 2;
                var offsetX = oldX - newX;
                var offsetY = oldY - newY;
                var offsetPositionX = Math.ceil(offsetX / settings.size);
                var offsetPositionY = Math.ceil(offsetY / settings.size);

                if (settings.color == 'b') {
                    offsetPositionX = offsetPositionX * -1;
                    offsetPositionY = offsetPositionY * -1;
                }

                if (newPositionX <= 8 && newPositionY <= 8 && me.getType(settings.type).isLegal(offsetPositionX, offsetPositionY)) {
                    board.canvas.animateLayer(layer, {
                        x: newX, y: newY
                    });

                    me.currentPosition = newPosition;

                    board.canvas.trigger('piecemove', [me, newX, newY]);
                } else {
                    board.canvas.animateLayer(layer, {
                        x: oldX, y: oldY
                    });
                }
            }
        });

        return me;
    };

    return constructor;
}(jQuery));

var jChessBoard = (function(jChessPiece, $) {
    var constructor;
    var columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    constructor = function(canvas, settings) {
        var me = {
            settings: {},
            cells: []
        };

        me.canvas = canvas;
        me.settings = settings;
        var size = settings.cellSize;
        var x = 0, y = 0, c = 0;
        var row, col, color;

        /**
         * http://www.thechessdrum.net/PGN_Reference.txt
         * 16.1: FEN
         *
         * @param fenString
         * @returns {*}
         */
        me.fenToPosition = function (fenString) {
            me.clear();

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
                            }, me.settings);

                            me.cells[i] = new jChessPiece(me, settings);
                            i++;
                        }


                    }
                }
            }

        };

        me.start = function() {
            return me.fenToPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
        };

        me.positionToFen = function () {
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
                var piece = me.cells[n];
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

        me.clear = function () {
            var i, cell;
            for (i = 0; i < 64; i++) {
                if (me.cells.hasOwnProperty(i)) {
                    cell = me.cells[i];
                    if (cell !== undefined) {
                        me.canvas.removeLayer(cell.layer);
                        delete me.cells[i];
                    }
                }
            }

            delete me.cells;
            me.cells = [];

            for (i = 0; i < 64; i++) {
                me.cells[i] = undefined;
            }
        };

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

                if (me.settings.debug === true) {
                    canvas.drawText({
                        layer: true,
                        fillStyle: '#9cf',
                        x: x, y: y,
                        fontSize: 48,
                        fontFamily: 'Verdana, sans-serif',
                        text: columns[col] + '' + parseInt(row + 1)
                    });
                }

                me.cells[c++] = undefined;
            }
        }

        me.clear();

        return me;
    };

    return constructor;
}(jChessPiece, jQuery));


(function ($) {

    $.fn.jschessboard = function (options) {
        var settings = $.extend({
            cellSize: 64,
            debug: false,
            imagesPath: 'images'
        }, options);

        return new jChessBoard(this, settings);
    };

}(jQuery));
