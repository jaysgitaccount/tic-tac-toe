let UIManager = (function() {
    const swapButton = document.querySelector('#swap-button');
    const playerDisplayTexts = ["Player 1 = ", "Player 2 = "];
    const playerDisplays = Array.from(document.querySelector('#player-display').children);
    const boardOverlay = document.querySelector('#board-overlay');

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

    return {
        swapButton,
        boardOverlay,
        hideUI,
        updatePlayerInfo
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
    
    function initialisePlayers() {
        for (let i = 0; i < states.length; i++) {
            // For each state, create corresponding Player
            players.push(Player((i + 1), states[i]));
        }
    }

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

        let { turnCounter, totalTurns } = TurnManager.startNewTurn();
        // Basic game flow:
        // start with random active player
        // somehow feed this to the board
        // when a tile is clicked on, switch active players/set timeout
        // repeat until game ends
        setCurrentActivePlayer(turnCounter);
    }

    function setCurrentActivePlayer(index) {
        currentActivePlayer = players[index];
    }

    function getCurrentActivePlayer() {
        return currentActivePlayer;
    }

    let TurnManager = (function() {
        // Random player starts
        let turnCounter = Math.round(Math.random());
        let totalTurns = 0;

        function startNewTurn() {
            // If it's NOT the first turn, switch turns
            if (totalTurns > 0) {
                turnCounter = 
                    turnCounter === 1
                        ? 0
                        : 1
            }
            // Increment total turns for UI
            totalTurns++;
            
            return {
                totalTurns,
                turnCounter
            }
        }

        return {
            startNewTurn
        }
    })();

    return {
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

    function createTile() {
        // Factory function that creates game tiles
        // Needs to be able to start empty, show X or O on hover
        // click to be "claimed" by X or O player
        // When turn ends (on click), save the state, display state/state and unbind event listener
        let tile = template.cloneNode(true);
        board.appendChild(tile);
        // Bind events
        tile.addEventListener('mouseover', displayState);
        tile.addEventListener('mouseout', clearState);
        tile.addEventListener('click', submitState);

        function displayState() {
            // show X or O when hovering, depending on active player
            let symbol = GameManager.getCurrentActivePlayer().symbol;
            tile.textContent = symbol;
        }

        function clearState() {
            tile.textContent = "";
        }

        function submitState() {
            // on click, store X or O, inform GameManager to end turn
            console.log('submitState');
        }

        function setState(player) {
            // Set the state from the active player (from GameManager)
            state = player.symbol;
        }
    }

    return {
        initialiseBoard
    }
})();

// I want the player to be able to select "PvP" or "vs AI" and be able to select if they want to be X or O (or swap symbols I guess)
// Customise # of chain needed to win?

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
