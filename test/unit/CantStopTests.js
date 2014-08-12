describe("Markers", function() {
    it("clones should behave independently", function() {
        var markers1 = new Markers();
        var markers2 = deepCopy(markers1);
        
        markers1.Advance([2], [0,0]);
        markers2.Advance([3], [0,0]);
        expect(markers1.IsColumnMarked(2)).toBeTruthy();
        expect(markers1.IsColumnMarked(3)).toBeFalsy();
        expect(markers2.IsColumnMarked(2)).toBeFalsy();
        expect(markers2.IsColumnMarked(3)).toBeTruthy();
    });

    it("clones should behave independently", function() {
        var markers1 = new Markers();
        var markers2 = deepCopy(markers1);
        
        markers1.Advance([2], [0,0]);
        markers2.Advance([2,2], [0,0]);
        expect(markers1.GetMarkerHeight(0)).toBe(1);
        expect(markers2.GetMarkerHeight(0)).toBe(2);
    });
});

describe("GameState", function() {
    var gameState;

    var markersMovedCalled = false;
    var scoreChangedCalled = false;
    var gameEndCalled = false;
    var playerSwitchCalled = false;
    var errorCalled = "";
    beforeEach(function() {
        gameState = new GameState(2);
        markersMovedCalled = false;
        gameState.AddOnMarkersMoved(function() { markersMovedCalled = true; });
        scoreChangedCalled = false;
        gameState.AddOnScoresChanged(function() { scoreChangedCalled = true; });
        gameEndCalled = false;
        gameState.AddOnGameEnd(function() { gameEndCalled = true; });
        playerSwitchCalled = false;
        gameState.AddOnPlayerSwitch(function() { playerSwitchCalled = true; });
        errorCalled = "";
        gameState.AddOnCombinationError(function(error) { errorCalled = error; });
    });

    it("should remember the number of players", function() {
        var gameState1 = new GameState(2);
        expect(gameState1.GetNrPlayers()).toBe(2);
        var gameState2 = new GameState(3);
        expect(gameState2.GetNrPlayers()).toBe(3);
    });

    it("should initially have -1 for player positions", function() {
        for (var player = 0; player < 2; ++player) {
            for (var column = 2; column <= 12; ++column)
                expect(gameState.GetPlayerPosition(player, column)).toBe(-1);
        }
    });

    it("initially columns should not be won", function() {
        for (var column = 2; column <= 12; ++column)
            expect(gameState.IsColumnWon(column)).not.toBeTruthy();
    });

    it("initially no markers should be used", function() {
        expect(gameState.GetNrMarkers()).toBe(0);
    });

    it("initially the active player should be 0", function() {
        expect(gameState.GetActivePlayer()).toBe(0);
    });

    it("advancing in one column should use one marker", function() {
        gameState.Advance([3]);
        expect(gameState.GetNrMarkers()).toBe(1);
        expect(gameState.GetMarkerColumn(0)).toBe(3);
        expect(gameState.GetMarkerHeight(0)).toBe(0);
    });

    it("advancing in two columns at once should use two markers", function() {
        gameState.Advance([3, 5]);
        expect(gameState.GetNrMarkers()).toBe(2);
        expect(gameState.GetMarkerColumn(0)).toBe(3);
        expect(gameState.GetMarkerHeight(0)).toBe(0);
        expect(gameState.GetMarkerColumn(1)).toBe(5);
        expect(gameState.GetMarkerHeight(1)).toBe(0);
    });

    it("advancing in two columns in two steps should use two markers", function() {
        gameState.Advance([3]);
        gameState.Advance([5]);
        expect(gameState.GetNrMarkers()).toBe(2);
        expect(gameState.GetMarkerColumn(0)).toBe(3);
        expect(gameState.GetMarkerHeight(0)).toBe(0);
        expect(gameState.GetMarkerColumn(1)).toBe(5);
        expect(gameState.GetMarkerHeight(1)).toBe(0);
    });

    it("advancing in columns should call callbacks", function() {
        gameState.Advance([3]);
        expect(markersMovedCalled).toBeTruthy();
        expect(playerSwitchCalled).toBeFalsy();
        expect(scoreChangedCalled).toBeFalsy();
        expect(gameEndCalled).toBeFalsy();
    });

    it("initially no column or position should have a marker", function() {
        for (var col=2; col<=12; ++col) {
            expect(gameState.IsColumnMarked(col)).toBeFalsy();
            for (var h=0; h<gameState.GetColumnHeight(col); ++h) {
                expect(gameState.HasMarker(col, h)).toBeFalsy();
            }
        }
    });

    it("advance marker", function() {
        gameState.Advance([3]);
        expect(gameState.IsColumnMarked(3)).toBeTruthy();
        expect(gameState.IsColumnMarked(2)).toBeFalsy();
        expect(gameState.IsColumnMarked(4)).toBeFalsy();
        expect(gameState.HasMarker(3, 0)).toBeTruthy();
        expect(gameState.HasMarker(3, 1)).toBeFalsy();
        expect(gameState.HasMarker(2, 0)).toBeFalsy();
        expect(gameState.HasMarker(4, 0)).toBeFalsy();
    });

    it("advance two markers", function() {
        gameState.Advance([3,5]);
        expect(gameState.IsColumnMarked(3)).toBeTruthy();
        expect(gameState.IsColumnMarked(5)).toBeTruthy();
        expect(gameState.IsColumnMarked(2)).toBeFalsy();
        expect(gameState.IsColumnMarked(4)).toBeFalsy();
        expect(gameState.HasMarker(3, 0)).toBeTruthy();
        expect(gameState.HasMarker(5, 0)).toBeTruthy();
        expect(gameState.HasMarker(3, 1)).toBeFalsy();
        expect(gameState.HasMarker(2, 0)).toBeFalsy();
        expect(gameState.HasMarker(4, 0)).toBeFalsy();
    });

    it("initially every column should be usable", function() {
        for (var col = 2; col <= 12; ++col)
            expect(gameState.CanColumnBeUsed(col)).toBeTruthy();
    });

    it("with one marker every column should be usable", function() {
        gameState.Advance([3]);
        for (var col = 2; col <= 12; ++col)
            expect(gameState.CanColumnBeUsed(col)).toBeTruthy();
    });

    it("with two markers every column should be usable", function() {
        gameState.Advance([3, 5]);
        for (var col = 2; col <= 12; ++col)
            expect(gameState.CanColumnBeUsed(col)).toBeTruthy();
    });

    it("with three markers not every column should be usable", function() {
        gameState.Advance([3, 5]);
        gameState.Advance([9]);
        var used = new Array();
        for (var i = 2; i <= 12; ++i)
            used[i] = false;
        used[3] = used[5] = used[9] = true;
        for (var i = 2; i <= 12; ++i)
            expect(gameState.CanColumnBeUsed(i)).toBe(used[i]);
    });

    function OffsetColumn(col, offset) {
        col += offset;
        if (col>12)
            col -= 11;
        return col;
    }
    
    it("a column should not be usable if the maximum height is reached", function() {
        for (var col = 2; col <= 12; ++col) {
            gameState.Stop(); // to clear the previous markers
            for (var adv = 0; adv < gameState.GetColumnHeight(col); ++adv)
                gameState.Advance([col]);
            expect(gameState.CanColumnBeUsed(col)).toBeFalsy();
            
            gameState.Advance([OffsetColumn(col,1)]);
            expect(gameState.CanColumnBeUsed(col)).toBeFalsy();
            
            gameState.Advance([OffsetColumn(col,2)]);
            expect(gameState.CanColumnBeUsed(col)).toBeFalsy();
        }
    });

    it("initially every one column selection should not be usable because two have to be used", function() {
        for (var col1 = 2; col1 <= 12; ++col1) {
            expect(gameState.GetColumnCombinationError([col1], [2,3])).toBe(CombinationErrors.ColumnCanBeUsed);
        }
    });

    it("initially every column combination should be usable", function() {
        for (var col1 = 2; col1 <= 12; ++col1) {
            for (var col2 = 2; col2 <= 12; ++col2) {
                expect(gameState.GetColumnCombinationError([col1, col2], [])).toBe(CombinationErrors.Ok);
            }
        }
    });

    it("after advancing one marker all single column selections are not valid because at least two have to be used", function() {
        gameState.Advance([3]);
        for (var col1 = 2; col1 <= 12; ++col1) {
            expect(gameState.GetColumnCombinationError([col1], [2,3])).toBe(CombinationErrors.ColumnCanBeUsed);
        }
    });

    it("after advancing one marker all column combinations are valid", function() {
        gameState.Advance([3, 3]);
        for (var col1 = 2; col1 <= 12; ++col1) {
            for (var col2 = 2; col2 <= 12; ++col2) {
                expect(gameState.GetColumnCombinationError([col1, col2], [])).toBe(CombinationErrors.Ok);
            }
        }
    });

    it("after advancing two markers not all column combinations are valid", function() {
        gameState.Advance([3, 5]);
        for (var col = 2; col <= 12; ++col) {
            expect(gameState.GetColumnCombinationError([col], [])).toBe(CombinationErrors.Ok);
            expect(gameState.GetColumnCombinationError([3, col], [])).toBe(CombinationErrors.Ok);
            expect(gameState.GetColumnCombinationError([col, 3], [])).toBe(CombinationErrors.Ok);
            expect(gameState.GetColumnCombinationError([5, col], [])).toBe(CombinationErrors.Ok);
            expect(gameState.GetColumnCombinationError([col, 5], [])).toBe(CombinationErrors.Ok);
            expect(gameState.GetColumnCombinationError([col, col], [])).toBe(CombinationErrors.Ok);
        }
        expect(gameState.GetColumnCombinationError([4, 12], [])).toBe(CombinationErrors.ColumnIsNotMarked);
        expect(gameState.GetColumnCombinationError([2, 6], [])).toBe(CombinationErrors.ColumnIsNotMarked);
        expect(gameState.GetColumnCombinationError([9, 7], [])).toBe(CombinationErrors.ColumnIsNotMarked);
    });

    it("after advancing two markers only one new column can become marked", function() {
        gameState.Advance([3, 5]);
        expect(gameState.GetColumnCombinationError([6], [5,6])).toBe(CombinationErrors.Ok);
        expect(gameState.GetColumnCombinationError([6], [2,1])).toBe(CombinationErrors.ColumnCanBeUsed);
        expect(gameState.GetColumnCombinationError([6], [2,3])).toBe(CombinationErrors.ColumnCanBeUsed);
        expect(gameState.GetColumnCombinationError([6], [2,4])).toBe(CombinationErrors.ColumnCanBeUsed);
    });

    it("a column should be used twice if possible", function() {
        expect(gameState.GetColumnCombinationError([5], [2,3])).toBe(CombinationErrors.ColumnCanBeUsed);
        expect(gameState.GetColumnCombinationError([3], [2,1])).toBe(CombinationErrors.ColumnCanBeUsed);
        gameState.Advance([3]);
        expect(gameState.GetColumnCombinationError([5], [2,3])).toBe(CombinationErrors.ColumnCanBeUsed);
        expect(gameState.GetColumnCombinationError([3], [2,1])).toBe(CombinationErrors.ColumnCanBeUsed);
        gameState.Advance([5]);
        expect(gameState.GetColumnCombinationError([5], [2,3])).toBe(CombinationErrors.ColumnCanBeUsed);
        expect(gameState.GetColumnCombinationError([3], [2,1])).toBe(CombinationErrors.ColumnCanBeUsed);
        expect(gameState.GetColumnCombinationError([6], [4,2])).toBe(CombinationErrors.ColumnCanBeUsed);
        gameState.Advance([6]);
        expect(gameState.GetColumnCombinationError([5], [2,3])).toBe(CombinationErrors.ColumnCanBeUsed);
        expect(gameState.GetColumnCombinationError([3], [2,1])).toBe(CombinationErrors.ColumnCanBeUsed);
    });

    it("a marked column at maximum height can no longer be used", function() {
        gameState.Advance([2]);
        expect(gameState.GetColumnCombinationError([2], [])).toBe(CombinationErrors.Ok);
        gameState.Advance([2]);
        expect(gameState.GetColumnCombinationError([2], [])).toBe(CombinationErrors.ColumnIsAtMaximumHeight);
        gameState.Stop();
        gameState.Advance([3,3,3]);
        expect(gameState.GetColumnCombinationError([3], [])).toBe(CombinationErrors.Ok);
        gameState.Advance([3]);
        expect(gameState.GetColumnCombinationError([3], [])).toBe(CombinationErrors.ColumnIsAtMaximumHeight);
    });

    it("a marked column at one less than maximum height can be used only once", function() {
        gameState.Advance([2]);
        expect(gameState.GetColumnCombinationError([2,2], [])).toBe(CombinationErrors.ColumnIsAtMaximumHeight);
        expect(gameState.GetColumnCombinationError([2], [1,1])).toBe(CombinationErrors.Ok);
        gameState.Stop();
        gameState.Advance([3,3,3]);
        expect(gameState.GetColumnCombinationError([3,3], [])).toBe(CombinationErrors.ColumnIsAtMaximumHeight);
        expect(gameState.GetColumnCombinationError([3], [1,2])).toBe(CombinationErrors.Ok);
    });

    it("initially every dice combination should be possible", function() {
        expect(gameState.TryDice([1, 1, 1, 1])).toBeTruthy();
        expect(gameState.TryDice([6, 6, 6, 6])).toBeTruthy();
        expect(gameState.TryDice([1, 2, 3, 4])).toBeTruthy();
        expect(gameState.TryDice([1, 1, 5, 5])).toBeTruthy();
    });

    it("with one marker used every dice combination should be possible", function() {
        gameState.Advance([5]);
        expect(gameState.TryDice([1, 1, 1, 1])).toBeTruthy();
        expect(gameState.TryDice([6, 6, 6, 6])).toBeTruthy();
        expect(gameState.TryDice([1, 2, 3, 4])).toBeTruthy();
        expect(gameState.TryDice([1, 1, 5, 5])).toBeTruthy();
    });

    it("with two markers used every dice combinations should be possible", function() {
        gameState.Advance([5, 8]);
        expect(gameState.TryDice([1, 1, 1, 1])).toBeTruthy();
        expect(gameState.TryDice([6, 6, 6, 6])).toBeTruthy();
        expect(gameState.TryDice([1, 2, 3, 4])).toBeTruthy();
        expect(gameState.TryDice([1, 1, 5, 5])).toBeTruthy();
    });

    it("with three markers used certain dice combinations are not possible", function() {
        gameState.Advance([5, 8]);
        gameState.Advance([10]);
        expect(gameState.TryDice([1, 1, 1, 1])).toBeFalsy();
        gameState.Advance([5, 8]);
        gameState.Advance([10]);
        expect(gameState.TryDice([6, 6, 6, 6])).toBeFalsy();
        gameState.Advance([5, 8]);
        gameState.Advance([10]);
        expect(gameState.TryDice([2, 7, 4, 10])).toBeFalsy();
        gameState.Advance([5, 8]);
        gameState.Advance([10]);
        expect(gameState.TryDice([1, 2, 5, 10])).toBeFalsy();
    });

    it("column heights", function() {
        expect(gameState.GetColumnHeight(2)).toBe(2);
        expect(gameState.GetColumnHeight(3)).toBe(4);
        expect(gameState.GetColumnHeight(4)).toBe(6);
        expect(gameState.GetColumnHeight(5)).toBe(8);
        expect(gameState.GetColumnHeight(6)).toBe(10);
        expect(gameState.GetColumnHeight(7)).toBe(12);
        expect(gameState.GetColumnHeight(8)).toBe(10);
        expect(gameState.GetColumnHeight(9)).toBe(8);
        expect(gameState.GetColumnHeight(10)).toBe(6);
        expect(gameState.GetColumnHeight(11)).toBe(4);
        expect(gameState.GetColumnHeight(12)).toBe(2);
    });

    it("initial player positions should be -1", function() {
        for (var p = 0; p < gameState.GetNrPlayers(); ++p) {
            for (var col = 2; col <= 12; ++col) {
                expect(gameState.GetPlayerPosition(p, col)).toBe(-1);
            }
        }
    });

    it("player position should adjust after Advance and Stop", function() {
        gameState.Advance([3]);
        gameState.Stop();
        for (var col = 2; col <= 12; ++col) {
            if (col === 3)
                expect(gameState.GetPlayerPosition(0, col)).toBe(0);
            else
                expect(gameState.GetPlayerPosition(0, col)).toBe(-1);
        }
        for (var p = 1; p < gameState.GetNrPlayers(); ++p) {
            for (var col = 2; col <= 12; ++col) {
                expect(gameState.GetPlayerPosition(p, col)).toBe(-1);
            }
        }
    });

    it("player position should adjust after Advance twice and Stop", function() {
        gameState.Advance([3, 7]);
        gameState.Stop();
        for (var col = 2; col <= 12; ++col) {
            if (col === 3 || col === 7)
                expect(gameState.GetPlayerPosition(0, col)).toBe(0);
            else
                expect(gameState.GetPlayerPosition(0, col)).toBe(-1);
        }
        for (var p = 1; p < gameState.GetNrPlayers(); ++p) {
            for (var col = 2; col <= 12; ++col) {
                expect(gameState.GetPlayerPosition(p, col)).toBe(-1);
            }
        }
    });

    it("player position should adjust after both players Advance and Stop", function() {
        gameState.Advance([3, 7]);
        gameState.Stop();
        gameState.Advance([4, 9]);
        gameState.Stop();
        for (var col = 2; col <= 12; ++col) {
            if (col === 3 || col === 7)
                expect(gameState.GetPlayerPosition(0, col)).toBe(0);
            else
                expect(gameState.GetPlayerPosition(0, col)).toBe(-1);
        }
        for (var col = 2; col <= 12; ++col) {
            if (col === 4 || col === 9)
                expect(gameState.GetPlayerPosition(1, col)).toBe(0);
            else if (col === 3 || col === 7)
                expect(gameState.GetPlayerPosition(1, col)).toBe(-1);
            else
                expect(gameState.GetPlayerPosition(1, col)).toBe(-1);
        }
    });

    it("initial players on a position should be empty", function() {
        for (var col = 2; col <= 12; ++col) {
            for (var h=0; h<gameState.GetColumnHeight(col); ++h)
                expect(gameState.GetPlayersOnPosition(col, h)).toEqual([]);
        }
    });

    it("after advancing a player should be in the list of players on that position", function() {
        gameState.Advance([3]);
        gameState.Stop();
        expect(gameState.GetPlayersOnPosition(3, 0)).toEqual([0]);
        expect(gameState.GetPlayersOnPosition(4, 0)).toEqual([]);
        expect(gameState.GetPlayersOnPosition(3, 1)).toEqual([]);

        gameState.Stop();
        gameState.Advance([3]);
        gameState.Stop();
        expect(gameState.GetPlayersOnPosition(3, 1)).toEqual([0]);
        expect(gameState.GetPlayersOnPosition(3, 0)).toEqual([]);
        expect(gameState.GetPlayersOnPosition(4, 1)).toEqual([]);
    });

    it("after advancing two players should be in the list of players on that position", function() {
        gameState.Advance([3]);
        gameState.Stop();
        gameState.Advance([3]);
        gameState.Stop();
        expect(gameState.GetPlayersOnPosition(3, 0)).toEqual([0,1]);
    });

    it("after stopping the correct callbacks should be called", function() {
        gameState.Advance([3,5]);
        markersMovedCalled = false;
        gameState.Stop();

        expect(markersMovedCalled).toBeTruthy();
        expect(playerSwitchCalled).toBeTruthy();
        expect(scoreChangedCalled).toBeTruthy();
        expect(gameEndCalled).toBeFalsy();
    });

    it("after trying a good combination no callbacks should be called", function() {
        gameState.Advance([7,8,9]);
        markersMovedCalled = false;
        gameState.CanColumnCombinationBeUsed([7,8], []);

        expect(markersMovedCalled).toBeFalsy();
        expect(playerSwitchCalled).toBeFalsy();
        expect(scoreChangedCalled).toBeFalsy();
        expect(gameEndCalled).toBeFalsy();
        expect(errorCalled).toBe("");
    });

    it("after failing with a combination the correct callbacks should be called", function() {
        gameState.Advance([7,8,9]);
        markersMovedCalled = false;
        gameState.CanColumnCombinationBeUsed([2], []);

        expect(markersMovedCalled).toBeFalsy();
        expect(playerSwitchCalled).toBeFalsy();
        expect(scoreChangedCalled).toBeFalsy();
        expect(gameEndCalled).toBeFalsy();
        expect(errorCalled).toBe(CombinationErrors.ColumnIsNotMarked);
    });

    it("a game ends if one player has won three columns", function() {
        for (var player=0; player<2; ++player) {
            gameState = new GameState(2);

            if (player===1)
                gameState.Stop(); // switch to player 1
            
            expect(gameState.IsGameEnded()).toBeFalsy();

            for (var adv = 0; adv < gameState.GetColumnHeight(5); ++adv)
                gameState.Advance([5]);
            gameState.Stop();
            gameState.Stop();

            expect(gameState.IsGameEnded()).toBeFalsy();

            for (var adv = 0; adv < gameState.GetColumnHeight(6); ++adv)
                gameState.Advance([6]);
            gameState.Stop();
            gameState.Stop();

            expect(gameState.IsGameEnded()).toBeFalsy();

            for (var adv = 0; adv < gameState.GetColumnHeight(9); ++adv)
                gameState.Advance([9]);
            gameState.Stop();
            gameState.Stop();

            expect(gameState.IsGameEnded()).toBeTruthy();

            expect(gameState.GetWinner()).toBe(player);
        }
    });

    it("if a game ends the correct callbacks should be called", function() {
        expect(gameState.IsGameEnded()).toBeFalsy();

        for (var i=0; i<3; ++i) {
            for (var adv = 0; adv < gameState.GetColumnHeight(5+i); ++adv)
                gameState.Advance([5+i]);
            gameState.Stop();
            expect(gameEndCalled).toBe(i===2);
            gameState.Stop();
        }
    });
});
