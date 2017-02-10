# JChessBoard

The JChessBoard is a js+canvas chessboard implementation.

I have been creating this project just for fun and for academic purposes.

- [Board demo](http://velichko.net/projects/jchessboard/demo.html)
- [Engine demo](http://velichko.net/projects/jchessboard/engine.html)

## Features

  - JCanvas as graphical backend
  - Step validation
  - Step help (showing possible steps)
  - FEN - is a standard notation for describing a particular board position
  - Algebraic notation - is a method for recording and describing the moves in a game

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
        var board = $('canvas').jschessboard().board;
        board.start();
    </script>
    </body>
    </html>

## Public methods

 - .start() - start game from standard position
 - .fenToPosition() - convert fen string to board position
 - .positionToFen() - vice versa previous fenToPosition
 - .clear() - clear the board
 - .move() - this method is the main tool for you,
     by this action you can move some piece to another cell.
     a set of parameters can be: algebraic notation or a cell number (bitboard representation).
     Example: .move(52, 36) it is same as .move('e2e4') or .move('e4')
        
You can consult the source code for definition of additional actions and events.

### Development

Want to contribute? Great!

Run in browser: 
tests/board/qunit.html
tests/engine/qunit.html

### Todo's

- Fix broken tests
- Add en passant support
- Fix drag-n-drop freezes in firefox

License
----

This project is licensed under the terms of the MIT license.
