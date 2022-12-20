// Gameboard - board
// Game manager object - gameplay
// Players

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

    function hideBoardOverlay() {
        boardOverlay.style.display = "none";
    }
    return {
        swapButton,
        boardOverlay,
        hideBoardOverlay,
        updatePlayerInfo
    }
})();

let GameManager = (function() {
    // I want this to manage the entire gameplay loop.
    // Needs to receive data: player info, board size
    // Needs to initialise players/board, manage turns/active player, feed active player to board
    // Unsure if I want to store win state logic here

    const states = ["X", "O"];
    const players = [];

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

    function startGame() {
        // disable swap button
        // hide board overlay
        // begin

        // Unbind/disable UI
        UIManager.hideBoardOverlay();
        initialisePlayers();
    }

    return {
        states
    }
})();

(function Gameboard() {
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

    _render();

    function _render() {
        // Initialise the board
        for (let i = 0; i < boardRows.length; i++) {
            for (let j = 0; j < boardRows[i].length; j++) {
                boardRows[i][j] = Tile();
            }
        }
        _resizeTiles();
    }

    function _resizeTiles() {
        board.style.setProperty('--board-size', boardSize);
    }

    function Tile() {
        // Factory function that creates game tiles
        // Needs to be able to start empty, show X or O on hover
        // click to be "claimed" by X or O player
        // When turn ends (on click), save the state, display state/state and unbind event listener

        init();

        function init() {
            let tile = template.cloneNode(true);
            board.appendChild(tile);
            // Bind events
            tile.addEventListener('mouseover', displayState);
            tile.addEventListener('click', submitState);
        }

        function displayState() {
            // show X or O when hovering, depending on active player
            console.log('displayState');
        }

        function submitState() {
            // on click, store X or O, inform GameManager to end turn
            console.log('submitState');
        }

        function setState(player) {
            // Set the state from the active player (from GameManager)
            state = player.symbol;
        }

        return {
            init,
            setState,
        }
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
