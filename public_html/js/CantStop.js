"use strict";

Array.prototype.clone = function() {
	return this.slice(0);
};

function deepCopy(src, /* INTERNAL */ _visited) {
    if(src == null || typeof(src) !== 'object'){
        return src;
    }

    // Initialize the visited objects array if needed
    // This is used to detect cyclic references
    if (_visited == undefined){
        _visited = [];
    }
    // Otherwise, ensure src has not already been visited
    else {
        var i, len = _visited.length;
        for (i = 0; i < len; i++) {
            // If src was already visited, don't try to copy it, just return the reference
            if (src === _visited[i]) {
                return src;
            }
        }
    }

    // Add this object to the visited array
    _visited.push(src);

    //Honor native/custom clone methods
    if(typeof src.clone == 'function'){
        return src.clone(true);
    }

    //Special cases:
    //Array
    if (Object.prototype.toString.call(src) == '[object Array]') {
        //[].slice(0) would soft clone
        ret = src.slice();
        var i = ret.length;
        while (i--){
            ret[i] = deepCopy(ret[i], _visited);
        }
        return ret;
    }
    //Date
    if (src instanceof Date){
        return new Date(src.getTime());
    }
    //RegExp
    if(src instanceof RegExp){
        return new RegExp(src);
    }
    //DOM Elements
    if(src.nodeType && typeof src.cloneNode == 'function'){
        return src.cloneNode(true);
    }

    //If we've reached here, we have a regular object, array, or function

    //make sure the returned object has the same prototype as the original
    var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src): src.__proto__);
    if (!proto) {
        proto = src.constructor.prototype; //this line would probably only be reached by very old browsers 
    }
    var ret = object_create(proto);

    for(var key in src){
        //Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
        //For an example of how this could be modified to do so, see the singleMixin() function
        ret[key] = deepCopy(src[key], _visited);
    }
    return ret;
}

//If Object.create isn't already defined, we just do the simple shim, without the second argument,
//since that's all we need here
var object_create = Object.create;
if (typeof object_create !== 'function') {
    object_create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

function Markers() {
    this.columns = new Array();
    this.heights = new Array();
    
    this.clear = function() {
        this.columns = new Array();
        this.heights = new Array();
    };
    
    this.GetNrMarkers = function() {
        return this.columns.length;
    };
    
    this.GetMarkerColumn = function(index) {
        return this.columns[index];
    };
    
    this.GetMarkerHeight = function(index) {
        return this.heights[index];
    };
    
    this.IsColumnMarked = function(column) {
        return this.GetMarkerIndex(column) >= 0;
    };
    
    this.HasMarker = function(column, height) {
        for (var i=0; i<this.columns.length; ++i)
            if (this.columns[i]===column && this.heights[i]===height)
                return true;
        return false;
    };
    
    this.GetMarkerIndex = function(column) {
        for (var i=0; i<this.columns.length; ++i)
            if (this.columns[i]===column)
                return i;
        return -1;
    };
    
    this.Advance = function(newColumns, positions) {
        for (var i=0; i<newColumns.length; ++i) {
            var column = newColumns[i];
            if (this.IsColumnMarked(column)) {
                ++this.heights[this.GetMarkerIndex(column)];
            } else {
                this.columns.push(column);
                this.heights.push(positions[column-2]+1);
            }
        }
    };
};

function GameState(NrPlayers) {
    var playerPositions = new Array(NrPlayers);
    for (var i=0; i<NrPlayers; ++i) {
        playerPositions[i] = new Array(11);
        for (var j=0; j<11; ++j) 
            playerPositions[i][j] = -1;
    }
    
    var activePlayer = 0;

    var winnerOfColumn = new Array(11);
    for (var i=0; i<12; ++i)
        winnerOfColumn[i] = -1;
    
    var columnsWonByPlayer = new Array(NrPlayers);
    for (var i=0; i<NrPlayers; ++i)
        columnsWonByPlayer[i] = [];

    var maxNrMarkers = 3;
    var markers = new Markers();
    
    this.GetNrPlayers = function() {
        return NrPlayers;
    };
    
    this.GetColumnHeight = function(column) {
        return 12 - 2*Math.abs(7-column);
    };
    
    this.GetPlayerPosition = function(player, column) {
        return playerPositions[player][column-2];
    };
    
    this.GetPlayersOnPosition = function(column, height) {
        var players = new Array();
        for (var player=0; player<NrPlayers; ++player) {
            if (this.GetPlayerPosition(player, column)===height)
                players.push(player);
        }
        return players;
    };
    
    this.GetNrColumnsWonByPlayer = function(player) {
        return columnsWonByPlayer[player].length;
    };
    
    this.GetColumnWonByPlayer = function(player, idx) {
        return columnsWonByPlayer[player][idx];
    };
    
    this.IsColumnWon = function(column) {
        return winnerOfColumn[column-2]>=0;
    };
    
    this.GetWinnerOfColumn = function(column) {
        return winnerOfColumn[column-2];
    };
    
    this.GetActivePlayer = function() {
        return activePlayer;
    };
 
    this.GetNrMarkers = function() {
        return markers.GetNrMarkers();
    };
    
    this.GetMarkerColumn = function(marker) {
        return markers.GetMarkerColumn(marker);
    };
    
    this.GetMarkerHeight = function(marker) {
        return markers.GetMarkerHeight(marker);
    };
    
    this.IsColumnMarked = function(column) {
        return markers.IsColumnMarked(column);
    };
    
    this.HasMarker = function(column, height) {
        return markers.HasMarker(column, height);
    };
    
    this.GetMarkerIndex = function(column) {
        return markers.GetMarkerIndex(column);
    };
    
    this.AreAllMarkersUsed = function() {
        return markers.GetNrMarkers()===maxNrMarkers;
    };
    
    this.TryDice = function(values) {
        for (var i=0; i<values.length; ++i) {
            for (var j=i+1; j<values.length; ++j) {
                if (this.CanColumnBeUsed(values[i]+values[j]))
                    return true;
            }
        }
        return false;
    };
    
    this.Advance = function(columns) {
        markers.Advance(columns, playerPositions[activePlayer]);
        OnMarkersMoved();
    };
    
    this.SwitchToNextPlayer = function() {
        activePlayer = (activePlayer+1)%NrPlayers;
        markers.clear();
        OnPlayerSwitch();
        OnMarkersMoved();
    };
    
    this.Stop = function() {
        for (var i=0; i<this.GetNrMarkers(); ++i) {
            var column = this.GetMarkerColumn(i);
            var height = this.GetMarkerHeight(i);
            playerPositions[activePlayer][column-2] = height;
            if (height===this.GetColumnHeight(column)-1) {
                columnsWonByPlayer[activePlayer].push(column-2);
                winnerOfColumn[column-2] = activePlayer;
            }
        }
            
        this.SwitchToNextPlayer();
        OnScoresChanged();
        if (this.IsGameEnded()) {
            OnGameEnd();
        }
    };
    
    this.CanColumnBeUsed = function(column) {
        if (this.IsColumnWon(column))
            return false;
        if (markers.IsColumnMarked(column)) {
            var marker = markers.GetMarkerIndex(column);
            return markers.GetMarkerHeight(marker)+1 < this.GetColumnHeight(column);
        }
        
        // column is not won and not marked, so there have to be markers available
        return !this.AreAllMarkersUsed();
    };
    
    this.HasUsableMarker = function(column) {
        if (markers.IsColumnMarked(column)) {
            var marker = markers.GetMarkerIndex(column);
            return markers.GetMarkerHeight(marker)+1 < this.GetColumnHeight(column);
        } else {
            return false;
        }
    };
    
    this.HasUsableMarker2 = function(column) {
        if (markers.IsColumnMarked(column)) {
            var marker = markers.GetMarkerIndex(column);
            return markers.GetMarkerHeight(marker)+2 < this.GetColumnHeight(column);
        } else {
            return false;
        }
    };
    
    this.GetColumnCombinationError = function(columns, unusedDice) {
        if (columns.length===0)
            return CombinationErrors.NeedToSelectAtLeastOne;
        
        var markersTrial = deepCopy(markers);
        
        for (var i=0; i<columns.length; ++i) {
            var column = columns[i];
            if (this.IsColumnWon(column))
                return CombinationErrors.ColumnsThatAreWonCannotBeUsed;
            if (markersTrial.IsColumnMarked(column)) {
                var idx = markersTrial.GetMarkerIndex(column);
                if (markersTrial.GetMarkerHeight(idx)===this.GetColumnHeight(column)-1)
                    return CombinationErrors.ColumnIsAtMaximumHeight;
            } else {
                if (markersTrial.GetNrMarkers()===maxNrMarkers)
                    return CombinationErrors.ColumnIsNotMarked;
            }
            markersTrial.Advance([column], playerPositions[activePlayer]);
        }
        
        for (var i=0; i<unusedDice.length; ++i) {
            for (var j=i+1; j<unusedDice.length; ++j) {
                var column = unusedDice[i]+unusedDice[j];
                if (!this.IsColumnWon(column)) {
                    if (markersTrial.IsColumnMarked(column)) {
                        var idx = markersTrial.GetMarkerIndex(column);
                        if (markersTrial.GetMarkerHeight(idx)<this.GetColumnHeight(column)-1)
                            return CombinationErrors.ColumnCanBeUsed;
                    } else {
                        if (markersTrial.GetNrMarkers()<maxNrMarkers)
                            return CombinationErrors.ColumnCanBeUsed;
                    }
                }
            }
        }
        
        return CombinationErrors.Ok;
    };
    
    this.CanColumnCombinationBeUsed = function(columns, unusedDice) {
        var error = this.GetColumnCombinationError(columns, unusedDice);
        if (error!==CombinationErrors.Ok)
            OnCombinationError(error);
        return error===CombinationErrors.Ok;
    };
    
    this.IsGameEnded = function() {
        return this.GetWinner()>=0;
    };
    
    this.GetWinner = function() {
        for (var player=0; player<this.GetNrPlayers(); ++player)
            if (this.GetNrColumnsWonByPlayer(player)>=3)
                return player;
        return -1;
    };
    
    var OnPlayerSwitchCallbacks = new Array();
    this.AddOnPlayerSwitch = function (callback) {
        OnPlayerSwitchCallbacks.push(callback);
    };
    function OnPlayerSwitch() {
        OnPlayerSwitchCallbacks.forEach(function (callback, index, array) {
                callback(activePlayer);
            });
    }
    
    var OnMarkersMovedCallbacks = new Array();
    this.AddOnMarkersMoved = function (callback) {
        OnMarkersMovedCallbacks.push(callback);
    };
    function OnMarkersMoved() {
        OnMarkersMovedCallbacks.forEach(function (callback, index, array) {
                callback();
            });
    }
    
    var OnScoresChangedCallbacks = new Array();
    this.AddOnScoresChanged = function (callback) {
        OnScoresChangedCallbacks.push(callback);
    };
    function OnScoresChanged() {
        OnScoresChangedCallbacks.forEach(function (callback, index, array) {
                callback();
            });
    }
    
    var OnCombinationErrorCallbacks = new Array();
    this.AddOnCombinationError = function (callback) {
        OnCombinationErrorCallbacks.push(callback);
    };
    function OnCombinationError(error) {
        OnCombinationErrorCallbacks.forEach(function (callback, index, array) {
                callback(error);
            });
    }
    
    var OnGameEndCallbacks = new Array();
    this.AddOnGameEnd = function (callback) {
        OnGameEndCallbacks.push(callback);
    };
    function OnGameEnd() {
        OnGameEndCallbacks.forEach(function (callback, index, array) {
                callback();
            });
    }
    
    return this;
};

var CombinationErrors = {
    Ok: "Ok",
    NeedToSelectAtLeastOne: "NeedToSelectAtLeastOne",
    ColumnsThatAreWonCannotBeUsed: "ColumnsThatAreWonCannotBeUsed",
    ColumnIsAtMaximumHeight: "ColumnIsAtMaximumHeight",
    ColumnIsNotMarked: "ColumnIsNotMarked",
    ColumnCanBeUsed: "ColumnCanBeUsed"
};

if (Object.freeze)
    Object.freeze(CombinationErrors);