# JChessBoard

JChessBoard is an javascript & canvas chessboard implementation.
I created this project just for fun. You can use this code in your project without any fee or limitations.

[Demo](http://velichko.net/projects/jchessboard/demo.html)

Last changes:
7f4dce8 - added prototype of chess engine - [DEMO](http://velichko.net/projects/jchessboard/engine.html), first step is your

## Features

  - Canvas as graphical backend
  - Step validation
  - Step help
  - FEN is a standard notation for describing a particular board position
  - Algebraic notation is a method for recording and describing the moves in a game

## Dependencies

   - jquery - https://jquery.com/
   - jcanvas - http://calebevans.me/projects/jcanvas/
   - qunit - https://qunitjs.com/ (only for dev)

## Usage example
    
    <!DOCTYPE html>
    <html>
    <head>
        <script src=jquery.js"></script>
        <script src="jcanvas.js"></script>
        <script src="jchessboard.js"></script>
    </head>
    <canvas width="512" height="512">
    </canvas>
    <script>
        var board = $('canvas').jschessboard();
        board.start();
    </script>
    </body>
    </html>

## Public methods

 - .start() - start game from standard position
 - .fenToPosition() - convert fen string to board position
 - .positionToFen() - vice versa previous positionToFen
 - .clear() - clear board
 - .move() - this method is main tool for you,
     by this action you can move some piece to other cell.
     a set of parameters can be: algebraic notation or number of cell (bitboard represent).
     Example: .move(52, 36) it is same as .move('e2e4') or .move('e4')
        
You can consult the source code for definition of additional actions and events.

### Development

Want to contribute? Great!

Run in browser tests/demo.html

### Todo's

- Fix drag-n-drop freezes in firefox

License
----

MIT

