var playerColors = [ "#00b", "#0b0", "#000", "#ddd" ];

var boardSize;
var margin = 4;
var squareMargin = 5;

function drawBoard() {
    var c=document.getElementById("board");
    var ctx=c.getContext("2d");

    ctx.beginPath(); 
    ctx.lineWidth="4";
    ctx.strokeStyle="black";
    var p1 = margin;
    var p2 = (boardSize-2*margin)/4;
    var p3 = 3*(boardSize-2*margin)/4;
    var p4 = boardSize-margin;
    ctx.moveTo(p1,p2);
    ctx.lineTo(p1,p3);
    ctx.lineTo(p2,p4);
    ctx.lineTo(p3,p4);
    ctx.lineTo(p4,p3);
    ctx.lineTo(p4,p2);
    ctx.lineTo(p3,p1);
    ctx.lineTo(p2,p1);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle="#f00";
    ctx.fill();

    var squareDist = Math.floor(boardSize/13);
    squareDist -= squareDist%2; // make sure it is an even number
    var squareSize = squareDist-squareMargin;
    squareSize -= squareSize%2; // make sure it is an even number

    ctx.fillStyle="white";
    ctx.strokeStyle = 'white';
    ctx.font = "18pt Arial";
    ctx.lineWidth = 2;
    for (var i=2; i<=12; ++i) {
        var x = boardSize/2 + squareDist*(i-7) - squareSize/2;
        var NrCells = 12 - 2*Math.abs(7-i);
        var dx = i>=10 ? -9 : 0;
        var y = boardSize/2 - (NrCells+1)*squareDist/2;
        ctx.strokeText(i, x+squareDist/4+dx, y+squareDist/2+8);        
    }
}

function drawSquares() {
    var c=document.getElementById("board");
    var ctx=c.getContext("2d");

    var squareDist = Math.floor(boardSize/13);
    squareDist -= squareDist%2; // make sure it is an even number
    var squareSize = squareDist-squareMargin;
    squareSize -= squareSize%2; // make sure it is an even number

    for (var i=2; i<=12; ++i) {
        var x = boardSize/2 + squareDist*(i-7) - squareSize/2;
        var NrCells = 12 - 2*Math.abs(7-i);
        var y = boardSize/2 + (NrCells-1)*squareDist/2;
        for (var j=0; j<NrCells; ++j) {
            ctx.fillStyle="#a00";
            ctx.fillRect(x,y,squareSize,squareSize);
            
            var playersOnSquare = 0;
            for (var p=0; p<NrPlayers; ++p) {
                if (game.GetPlayerPosition(p, i) === j) {
                    ctx.fillStyle = playerColors[p];
                    ctx.fillRect(x,y+(3-playersOnSquare)*squareSize/4,squareSize,squareSize/4);
                    ++playersOnSquare;
                }
            }
            
            // draw marker on the square if there is one
            ctx.lineWidth = 2;
            if (game.HasMarker(i,j)) {
                ctx.strokeStyle = 'white';
            } else {
                ctx.strokeStyle = '#f00';
            }
            ctx.strokeRect(x-1,y-1,squareSize+2,squareSize+2);

            y -= squareDist;
        }
    }
    
    // draw unused markers next to the board
    for (var i=0; i<3; ++i) {
        if (game.GetNrMarkers()<=i) {
            ctx.strokeStyle = 'white';
        } else {
            ctx.strokeStyle = '#f00';
        }
        var x = boardSize/2 + squareDist*(i+2-7) - squareSize/2;
        var y = boardSize/2 - (i+4)*squareDist;
        ctx.strokeRect(x-1,y-1,squareSize+2,squareSize+2);
    }
}
