var jChessPiece = (function (board, options) {
    this.types = {
        b: {
            type: 'b',
            isLegal: function (offsetX, offsetY) {
                return Math.abs(offsetX) == Math.abs(offsetY);
            }
        },
        n: {
            type: 'n',
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
            type: 'k',
            isLegal: function (offsetX, offsetY) {
                offsetX = Math.abs(offsetX);
                offsetY = Math.abs(offsetY);

                return (offsetX == 1 && offsetY == 1) || (offsetX == 0 && offsetY == 1) || (offsetX == 1 && offsetY == 0);
            }
        },
        p: {
            type: 'p',
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
            type: 'r',
            isLegal: function (offsetX, offsetY) {
                offsetX = Math.abs(offsetX);
                offsetY = Math.abs(offsetY);

                return (offsetX >= 1 && offsetY == 0) || (offsetX == 0 && offsetY >= 1);
            }
        },
        q: {
            type: 'q',
            isLegal: function (offsetX, offsetY) {
                offsetX = Math.abs(offsetX);
                offsetY = Math.abs(offsetY);

                return (offsetX >= 1 && offsetY == 0) || (offsetX == 0 && offsetY >= 1) || offsetX == offsetY;
            }
        }
    };

    function jChessPiece() {
        var me = this;
        var currentPosition;

        var settings = $.extend({
            type: 'p',
            color: 'w',
            startX: 5,
            startY: 5,
            size: 64
        }, options);

        var image = 'images/wikipedia/' + settings.color + settings.type.toUpperCase() + '.png';
        var x = settings.startX * settings.size - settings.size / 2;
        var y = settings.startY * settings.size - settings.size / 2;

        this.getFen = function () {
            return settings.color == 'w' ? settings.type.toUpperCase() : settings.type.toLowerCase();
        };

        this.getCurrentPosition = function () {
            return currentPosition;
        };

        var layer = board.canvas.drawImage({
            source: image,
            x: x,
            y: y,
            layer: true,
            draggable: true,
            dragstop: function (layer) {
                var oldX = layer._startX;
                var oldY = layer._startY;
                var oldPositionX = pixelsToPosition(oldX);
                var oldPositionY = pixelsToPosition(oldY);
                var newPositionX = pixelsToPosition(layer._eventX);
                var newPositionY = pixelsToPosition(layer._eventY);
                var oldPosition = _coordinateToNumber(oldPositionX, oldPositionY);
                var newPosition = _coordinateToNumber(newPositionX, newPositionY);
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

                if (newPositionX <= 8 && newPositionY <= 8 && settings.isLegal(offsetPositionX, offsetPositionY)) {
                    board.canvas.animateLayer(layer, {
                        x: newX, y: newY
                    });

                    board.canvas.trigger('piecemove', [me, newX, newY]);
                } else {
                    board.canvas.animateLayer(layer, {
                        x: oldX, y: oldY
                    });
                }
            }
        });

        board.cells[this.getCurrentPosition()] = this;

        this.getLayer = function () {
            return layer;
        };
    }

    return jChessPiece;

})();

var jChessBoard = function(canvas) {
    this.cells = [];

    this.canvas = canvas;

    this.init = function (size) {
        var columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        var x = 0, y = 0, c = 0;

        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                var color = ( (col % 2 == 0 && row % 2 == 0) || (col % 2 == 1 && row % 2 == 1) ? 'white' : 'gray');


                x = (col * size + size / 2);
                y = 512 - (row * size + size / 2);

                this.canvas.drawRect({
                    layer: true,
                    type: 'rectangle',
                    groups: ['board'],
                    fillStyle: color,
                    x: x, y: y,
                    width: size, height: size
                });

                this.canvas.drawText({
                    layer: true,
                    fillStyle: '#9cf',
                    x: x, y: y,
                    fontSize: 48,
                    fontFamily: 'Verdana, sans-serif',
                    text: columns[col] + '' + parseInt(row + 1)
                });

                this.cells[c++] = null;
            }
        }

        return this;
    };

    this.start = function() {
        return this.fenToPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    };

    /**
     * http://www.thechessdrum.net/PGN_Reference.txt
     * 16.1: FEN
     *
     * @param fenString
     * @returns {*}
     */
    this.fenToPosition = function (fenString) {
        this.clear();

        var rows = fenString.split('/');

        for (var y = 0; y < rows.length; y++) {
            var row = rows[y];
            var chars = row.split('');
            var i = 0;
            for (var x = 0; x < 8; x++) { // columns
                var char = chars[i];

                if (char == undefined) {
                    alert('Missing information: check FEN string');
                }

                if (/\d/.test(char)) {
                    x = x - 1 + parseInt(char);
                } else {
                    var piece = char.toLowerCase();
                    if (!this.types.hasOwnProperty(piece)) {
                        alert('Wrong piece "' + char + '": check FEN string');
                    }

                    var settings = $.extend({
                        startX: x + 1,
                        startY: y + 1,
                        color: (piece == char) ? 'b' : 'w'
                    }, this.types[piece]);

                    this.cells[x] = new jChessPiece(this, settings);
                }

                i++;
            }
        }

        return this;
    };

    this.positionToFen = function () {
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
                fenString += piece.getFen();
            } else {
                i++;
            }


        }
        return fenString;
    };

    this.clear = function () {
        for (var i in this.cells) {
            if (this.cells.hasOwnProperty(i)) {
                var cell = this.cells[i];
                if (cell instanceof jChessPiece) {
                    this.canvas.removeLayer(cell.getLayer());
                    this.cells[i] = null;
                }
            }
        }

        return this;
    };

    return this;
};

/**
 * @param x
 * @param y
 * @returns {*}
 * @private
 */
function _coordinateToNumber(x, y) {
    return 8 * y + x;
}

/**
 * @param num
 * @returns {*[]}
 * @private
 */
function _numberToCoordinate(num) {
    return [num % 8, Math.floor(num / 8)];
}

function _pixelsToPosition(px, size) {
    return Math.floor(px / size);
}

(function ($) {

    $.fn.jschessboard = function (options) {
        var settings = $.extend({
            cellSize: 64,
            debug: false
        }, options);

        var board = new jChessBoard(this);
        board.clear();
        board.init(settings.cellSize);
        return board;
    };

}(jQuery));
