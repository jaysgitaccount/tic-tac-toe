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
    // I want this to manage the entire gameplay loop.
    // Needs to initialise players/board, manage turns/active player, feed active player to board
    // Unsure if I want to store win state logic here

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
    const template = document.querySelector('template').content.firstElementChild;
    // Store gameboard as 2D array inside object

    // First, let's make the board scalable but start at 3x3.
    let boardSize = 3;

    const boardRows = new Array(boardSize);
    // initialise 2d array
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

    function checkGameState() {
        // If 3 in a row, that player wins
        // If board is 100% filled AND no 3 in a row (check win first), draw
        // If neither, continue
        // But since this is in Board, we should just return an outcome for GameManager to handle

        
    }

    function createTile() {
        let symbol;
        let tile = template.cloneNode(true);
        board.appendChild(tile);
        // Bind events
        tile.addEventListener('mouseover', displayState);
        tile.addEventListener('mouseout', clearState);
        tile.addEventListener('click', publishState);

        function displayState() {
            // show X or O when hovering, depending on active player
            symbol = GameManager.getCurrentActivePlayer().symbol;
            tile.textContent = symbol;
        }

        function clearState() {
            tile.textContent = "";
        }

        function publishState() {
            // on click, store X or O, inform GameManager to end turn
            // Also, need to clear all event listeners
            tile.removeEventListener('mouseover', displayState);
            tile.removeEventListener('mouseout', clearState);
            tile.removeEventListener('click', publishState);
            symbol = GameManager.getCurrentActivePlayer().symbol;
            tile.textContent = symbol;
            triggerNextTurn();
        }

        function triggerNextTurn() {
            GameManager.TurnManager.startNewTurn();
        }

        return {
            symbol
        }
    }

    return {
        initialiseBoard
    }
})();

function Player(number, symbol) {
    // Player object: Factory function
    // Will probably initialise players within Game Manager
    // Should be able to "apply" symbol to tile
    let name = `Player ${number}`;
    return {
        name,
        symbol
    }
}

