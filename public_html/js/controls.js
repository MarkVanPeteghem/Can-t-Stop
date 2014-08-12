var NrPlayers = 2;

function SwitchPlayer(activePlayer) {
    $("#player").text("Player "+(activePlayer+1)+" ");
    $("#player-color").css("background", playerColors[activePlayer]);
    $("a.dice").text("-");
    $("a.dice").addClass("available");
    $("span.combination").text("-");
    $("span.combination").removeClass("error");
    $("#error-message").text("");
    $("#message").text("");

    $("#throw-dice").addClass("enabled");
    $("#clear-selection").removeClass("enabled");
    $("#apply").removeClass("enabled");
    $("#stop").removeClass("enabled");        
}

var game;

var selectedDie = -1;

$( document ).ready(function() {
    game = new GameState(NrPlayers);

    boardSize = $("#board").width() - margin;
    
    drawBoard();
    drawSquares();
    
    game.AddOnPlayerSwitch(SwitchPlayer);
    
    SwitchPlayer(0); // to show active player
    
    game.AddOnMarkersMoved(function() {
        drawSquares();
    });
    
    game.AddOnScoresChanged(function() {
        drawSquares();
    });
    
    game.AddOnCombinationError(function(error) {
        $("#message").text(error);
    });
    
    $("#throw-dice").addClass("enabled");
    
    var blown = false;

    $("#throw-dice").click(function() {
        if (!$(this).hasClass("enabled"))
            return;
        
        var dice = new Array();
        var NrRolls = 4;
        for (var roll=0; roll<NrRolls; ++roll) {
            setTimeout(function(){
                for (var id=1; id<=4; ++id) {
                    var die = Math.floor(Math.random()*6+1);
                    dice[id-1] = die;
                    $("#d"+id).text(""+die);
                }
            }, roll*150);
        }
        setTimeout(function(){
            if (!game.TryDice(dice)) {
                $("#message").text("Blown!");
                $("#apply").removeClass("enabled");
                $("#throw-dice").removeClass("enabled");
                $("#stop").addClass("enabled");
                $("#clear-selection").removeClass("enabled");
                blown = true;
            }
        }, NrRolls*150);
        for (var i=1; i<=4; ++i) {
            $("#d"+i).addClass("available");
        }
        $("#comb1").text("-");
        $("#comb2").text("-");
        $("#throw-dice").removeClass("enabled");
        $("#stop").removeClass("enabled");
    });
    
    for (var i=1; i<=4; ++i) {
        var name = "#d"+i;
        $(name).click(function() {
            var $this = $( this );
            
            if (!$this.hasClass("available"))
                return;
            
            $this.removeClass("available");
            var number = parseInt($this.text(), 10);
            if (selectedDie>0) {
                sum = selectedDie + number;
                if ($("#comb1").text()==="-")
                    $("#comb1").text(sum);
                else
                    $("#comb2").text(sum);
                selectedDie = -1;
                $("#apply").addClass("enabled");
            } else {
                selectedDie = number;
            }
            $("#clear-selection").addClass("enabled");
            $(".combination").removeClass("error");
        });
    }
    
    $("#clear-selection").click( function() {
        if (!$(this).hasClass("enabled"))
            return;
        
        selectedDie = -1;
        $(".dice").addClass("available");
        $(".combination").text("-");
        $(".combination").removeClass("error");
        $("#apply").removeClass("enabled");
        $("#stop").removeClass("enabled");
    });

    $("#apply").click( function() {
        if (!$(this).hasClass("enabled"))
            return;

        // needs to be here because we have multiple return statements
        $("#apply").removeClass("enabled");
        
        var columns = [];
        var comb1 = $("#comb1").text();
        var comb2 = $("#comb2").text();
        if (comb1!=="-")
            columns.push(parseInt(comb1, 10));
        if (comb2!=="-")
            columns.push(parseInt(comb2, 10));
        
        var unusedDice = [];
        for (var i=1; i<=4; ++i) {
            if ($("#d"+i).hasClass('available')) {
                var die = $("#d"+i).text();
                die = parseInt(die, 10);
                unusedDice.push(die);
            }
        }
        if (unusedDice.length%2!==0) {
            $("#error-message").text("a die is not matched");
            return;
        }
        var err = game.GetColumnCombinationError(columns, unusedDice);
        if (err!==CombinationErrors.Ok) {
            $("#error-message").text(err);
            return;
        }            
        
        game.Advance(columns);
        drawSquares();
        $("#throw-dice").addClass("enabled");
        $("#stop").addClass("enabled");
        $("#clear-selection").removeClass("enabled");
        $("#error-message").text("");
    });

    $("#stop").click( function() {
        if (!$(this).hasClass("enabled"))
            return;

        if (!blown) {
            game.Stop();
        } else {
            blown = false;
            game.SwitchToNextPlayer();
        }
    });
    
    $("html").keydown(function(event) {
        if (event.which>=97 && event.which<=102) {
            var number = event.which - 96;
            for (var i=1; i<=4; ++i) {
                var die = parseInt($("#d"+i).text());
                if ($("#d"+i).hasClass("available") && die===number) {
                    $("#d"+i).click();
                    break;
                }
            }
        } else {
            switch (event.which) {
                case 84: // t
                    $("#throw-dice").click();
                    break;
                case 65: // a
                    $("#apply").click();
                    break;
                case 67: // c
                    $("#clear-selection").click();
                    break;
                case 83: // s
                    $("#stop").click();
                    break;
            }
        }
    });
});
