let UIManager = (function() {
    const swapButton = document.querySelector('#swap-button');
    const playerDisplays = Array.from(document.querySelector('#player-display').children);
    const boardOverlay = document.querySelector('#board-overlay');
    const turnTracker = document.querySelector('#turn-tracker');
    const playerSymbols = document.querySelector('#player-symbols');
    const playerNames = [];

    initPlayerForm();
    
    function initPlayerForm() {
        const form = document.querySelector('form');
        form.addEventListener('submit', event => {
            event.preventDefault();

            let formData = new FormData(form);
            
            playerNames.push(formData.get("player1-name"));
            playerNames.push(formData.get("player2-name"));

            // Hide form after submit, show symbol UI
            form.classList.add('hidden');
            playerSymbols.classList.remove('hidden');
            GameManager.initialisePregameUI();
        })
    }

    function updatePlayerInfo(states) {
        playerDisplays.forEach((text, index) => {
            text.textContent = `${playerNames[index]} = `;
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

    function displayWinnerInfo(player) {
        turnTracker.textContent = `Congratulations, ${player.name} wins!`
    }

    function displayDrawInfo() {
        turnTracker.textContent = `It's a draw`
    }

    function getPlayerNames() {
        return playerNames;
    }

    return {
        swapButton,
        boardOverlay,
        getPlayerNames,
        hideUI,
        updatePlayerInfo,
        updateTurnTracker,
        displayWinnerInfo,
        displayDrawInfo
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

    function createTile() {
        let symbol = undefined;
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
            symbol = undefined;
            tile.textContent = "";
        }

        function submitTile() {
            lockTile();
            updateTileSymbol();
            GameManager.TurnManager.updateGameState(GameManager.getCurrentActivePlayer());
        }

        function lockTile() {
            tile.removeEventListener('mouseover', updateTileSymbol);
            tile.removeEventListener('mouseout', resetTileSymbol);
            tile.removeEventListener('click', submitTile);
            tile.classList.add('submitted');
        }

        function getSymbol() {
            return symbol;
        }

        return {
            getSymbol,
            lockTile
        }
    }

    return {
        boardSize,
        boardRows,
        initialiseBoard,
    }
})();

function Player(name, symbol) {
    return {
        name,
        symbol
    }
}

let GameManager = (function() {
    const states = ["X", "O"];
    const players = [];
    let currentActivePlayer;
    let winningPlayer;
    let board = Gameboard.boardRows;

    function initialisePregameUI() {
        UIManager.updatePlayerInfo(states);
        UIManager.swapButton.addEventListener('click', swapPlayerInfo);
        UIManager.boardOverlay.addEventListener('click', startGame);
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
        TurnManager.startNewTurn();
    }

    function initialisePlayers() {
        for (let i = 0; i < states.length; i++) {
            // Initialise each player with corresponding name and state
            players.push(Player((UIManager.getPlayerNames()[i]), states[i]));
        }
    }

    function setCurrentActivePlayer(index) {
        currentActivePlayer = players[index];
    }

    function getCurrentActivePlayer() {
        return currentActivePlayer;
    }

    function getWinningPlayer() {
        return winningPlayer;
    }

    function endGame() {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                board[i][j].lockTile();
            }
        }
    }

    function displayWin() {
        UIManager.displayWinnerInfo(winningPlayer);
    }

    function displayDraw() {
        UIManager.displayDrawInfo();
    }

    let TurnManager = (function() {
        // Generate random starting player
        let playerCounter = Math.round(Math.random());
        let totalTurns = 0;
        let maxTurns = Math.pow(Gameboard.boardSize, 2);

        function updateGameState(player) {
            if (checkIsWin(player)) {
                endGame();
                displayWin();
            } else if (checkIsDraw()) {
                endGame();
                displayDraw();
            } else {
                startNewTurn();
            }
        }

        function startNewTurn() {
            // First, switch players
            playerCounter = 
                playerCounter === 1
                    ? 0
                    : 1

            totalTurns++;

            setCurrentActivePlayer(playerCounter);
            UIManager.updateTurnTracker();
        }

        function checkIsWin(player) {
            let isWin = false;
            let playerSymbol = player.symbol;

            const checkRows = function () {
                for (let i = 0; i < board.length; i++) {
                    let isRowWin = true;

                    for (let j = 0; j < board.length; j++) {
                        let tileSymbol = board[i][j].getSymbol();

                        if (!doesPlayerOwnTile(tileSymbol, playerSymbol)) {
                            // If any tile fails, stop checking row
                            isRowWin = false;
                            break;
                        }
                    }

                    if (isRowWin) {
                        isRowWin = true;
                        return isRowWin;
                    } else if (i === (board.length - 1) && !isRowWin) {
                        // If last row fails check
                        return isRowWin;
                    }
                }
            }

            const checkColumns = function() {
                for (let i = 0; i < board.length; i++) {
                    let isColumnWin = true;

                    for (let j = 0; j < board.length; j++) {
                        let tileSymbol = board[j][i].getSymbol();

                        if (!doesPlayerOwnTile(tileSymbol, playerSymbol)) {
                            isColumnWin = false;
                            break;
                        }
                    }

                    if (isColumnWin) {
                        isColumnWin = true;
                        return isColumnWin;
                    } else if (i === (board.length - 1) && !isColumnWin) {
                        // If last column fails check
                        return isColumnWin;
                    }
                }
            }

            const checkPosDiag = function() {
                for (let i = 0; i < board.length; i++) {
                    let posDiagWin = false;
                    let tileSymbol = board[i][i].getSymbol();

                    if (!doesPlayerOwnTile(tileSymbol, playerSymbol)) {
                        // If any tile fails check, exit
                        return posDiagWin;
                    } else if (i === (board.length - 1) && doesPlayerOwnTile(tileSymbol, playerSymbol)) {
                        posDiagWin = true;
                        return posDiagWin;
                    }
                }
            }

            const checkNegDiag = function() {
                for (let i = 0; i < board.length; i++) {
                    let negDiagWin = false;
                    let tileSymbol = board[i][((board.length - 1) - i)].getSymbol();

                    if (!doesPlayerOwnTile(tileSymbol, playerSymbol)) {
                        // If any tile fails check, exit
                        return negDiagWin;
                    } else if (i === (board.length - 1) && doesPlayerOwnTile(tileSymbol, playerSymbol)) {
                        negDiagWin = true;
                        return negDiagWin;
                    }
                }
            }

            // Consolidate all win checks
            let winConditions = [
                checkRows(),
                checkColumns(),
                checkPosDiag(),
                checkNegDiag()
            ];

            isWin = winConditions.some( result => result === true );

            if (isWin) {
                // Set winning player
                winningPlayer = player;
            }

            return isWin;
        }

        function checkIsDraw() {
            let isDraw = false;

            if (totalTurns === maxTurns) {
                isDraw = true;
            }

            return isDraw;
        }


        function doesPlayerOwnTile(tileSymbol, playerSymbol) {
            let isPlayerOwned = false;

            if (tileSymbol == playerSymbol) {
                isPlayerOwned = true;
            }

            return isPlayerOwned;
        }

        return {
            startNewTurn,
            updateGameState
        }
    })();

    return {
        TurnManager,
        initialisePregameUI,
        getCurrentActivePlayer,
        getWinningPlayer
    }
})();
