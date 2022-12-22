let UIManager = (function() {
    const swapButton = document.querySelector('#swap-button');
    const playerDisplayTexts = ["Player 1 = ", "Player 2 = "];
    const playerDisplays = Array.from(document.querySelector('#player-display').children);
    const boardOverlay = document.querySelector('#board-overlay');
    const turnTracker = document.querySelector('#turn-tracker');

    function updatePlayerInfo(states) {
        playerDisplays.forEach((text, index) => {
            text.textContent = playerDisplayTexts[index];
            text.textContent += states[index];
        })
    }

    function hideUI() {
        boardOverlay.style.display = "none";
        swapButton.style.display = "none";
    }

    function updateTurnTracker() {
        turnTracker.textContent = `${GameManager.getCurrentActivePlayer().name}'s turn`;
    }

    return {
        swapButton,
        boardOverlay,
        hideUI,
        updatePlayerInfo,
        updateTurnTracker
    }
})();

let GameManager = (function() {
    const states = ["X", "O"];
    const players = [];
    let currentActivePlayer;

    // Initialise UI
    UIManager.updatePlayerInfo(states);
    UIManager.swapButton.addEventListener('click', swapPlayerInfo);
    UIManager.boardOverlay.addEventListener('click', startGame);
    
    function swapPlayerInfo() {
        states.reverse();
        UIManager.updatePlayerInfo(states);
    }

    function disableUI() {
        UIManager.swapButton.removeEventListener('click', swapPlayerInfo);
        UIManager.boardOverlay.removeEventListener('click', startGame);
        UIManager.hideUI();
    }

    function startGame() {
        disableUI();
        initialisePlayers();
        Gameboard.initialiseBoard();
        TurnManager.startNewTurn();
    }

    function initialisePlayers() {
        for (let i = 0; i < states.length; i++) {
            // For each state, create corresponding Player
            players.push(Player((i + 1), states[i]));
        }
    }

    function setCurrentActivePlayer(index) {
        currentActivePlayer = players[index];
    }

    function getCurrentActivePlayer() {
        return currentActivePlayer;
    }

    function checkGameState() {
        // If 3 in a row, that player wins
        // If board is 100% filled AND no 3 in a row (check win first), draw
        // If neither, continue
        // But since this is in Board, we should just return an outcome for GameManager to handle
        
        // check for columns, rows and diagonals
        // at the end of each turn, get all of the active player's tiles
        // search these tiles to see if they fulfil the win conditions

        // IF no win, check draw (get # of squares, check vs. totalTurns)
        // to easily see if the board has been filled or not

        // If no draw, then startNewTurn()
        
    }

    let TurnManager = (function() {
        // Generate random starting player
        let playerCounter = Math.round(Math.random());
        let totalTurns = 0;

        function startNewTurn() {
            // First, switch players
            playerCounter = 
                playerCounter === 1
                    ? 0
                    : 1

            totalTurns++;

            setCurrentActivePlayer(playerCounter);
            UIManager.updateTurnTracker();
            console.log('== NEWTURN ==')
            console.log('Player ' + (playerCounter + 1) + "'s turn, total turns: " + totalTurns)

            return {
                playerCounter,
                totalTurns
            }
        }

        return {
            startNewTurn
        }
    })();

    return {
        TurnManager,
        getCurrentActivePlayer
    }
})();

let Gameboard = (function() {
    const board = document.querySelector('#board');
    // Create deep copy of DOM
    const template = document.querySelector('template').content.firstElementChild;

    // Controls size of game board
    let boardSize = 3;

    // Initialise board via 2D array
    const boardRows = new Array(boardSize);
    for (let i = 0; i < boardRows.length; i++) {
        boardRows[i] = new Array(boardSize);
    }

    function initialiseBoard() {
        _render();
    }
    
    function _render() {
        // Initialise the tiles
        for (let i = 0; i < boardRows.length; i++) {
            for (let j = 0; j < boardRows[i].length; j++) {
                boardRows[i][j] = createTile();
            }
        }
        _resizeTiles();
    }

    function _resizeTiles() {
        board.style.setProperty('--board-size', boardSize);
    }

    function checkTiles(player) {
        let outcomes = {
            continue: "continue",
            win: "win",
            draw: "draw"
        };
        let currentOutcome = outcomes.win;

        // Check positive diagonal
        for (let i = 0; i < boardRows.length; i++) {
            // We want to see if 0,0/1,1/2,2... are filled
            let tileSymbol = boardRows[i][i].getSymbol();

            console.log('CHECK NEW TILE, i = ' + i);
            console.log(player);
            console.log(tileSymbol);
            console.log(doesPlayerOwnTile(tileSymbol, player));

            if ( !(doesPlayerOwnTile(tileSymbol, player)) ) {
                // If this check fails, exit loop
                currentOutcome = outcomes.continue;
                break;
            }

            console.log(currentOutcome);
        }
    }

    function doesPlayerOwnTile(tileSymbol, player) {
        let isPlayerOwned = false;
        if (tileSymbol === player.symbol) {
            isPlayerOwned = true;
        }
        return isPlayerOwned;
    }

    function info() {
        console.table(boardRows);
    }

    function createTile() {
        let symbol;
        let tile = template.cloneNode(true);

        board.appendChild(tile);
        // Bind events
        tile.addEventListener('mouseover', updateTileSymbol);
        tile.addEventListener('mouseout', resetTileSymbol);
        tile.addEventListener('click', submitTile);

        function updateTileSymbol() {
            symbol = GameManager.getCurrentActivePlayer().symbol;
            tile.textContent = symbol;
        }

        function resetTileSymbol() {
            tile.textContent = "";
        }

        function submitTile() {
            // on click, store X or O, inform GameManager to end turn
            // Also, need to clear all event listeners
            tile.removeEventListener('mouseover', updateTileSymbol);
            tile.removeEventListener('mouseout', resetTileSymbol);
            tile.removeEventListener('click', submitTile);
            updateTileSymbol();
            checkTiles(GameManager.getCurrentActivePlayer());
            setTimeout( () => {
                triggerNextTurn()
            }, 0);
        }

        function triggerNextTurn() {
            GameManager.TurnManager.startNewTurn();
        }

        function getSymbol() {
            return symbol;
        }

        return {
            getSymbol,
        }
    }

    return {
        info,
        initialiseBoard
    }
})();

function Player(number, symbol) {
    let name = `Player ${number}`;
    return {
        name,
        symbol
    }
}

