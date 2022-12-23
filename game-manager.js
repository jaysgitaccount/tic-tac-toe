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

    function displayWinnerInfo(player) {
        turnTracker.textContent = `Congratulations, ${player.name} wins!`
    }

    function displayDrawInfo() {
        turnTracker.textContent = `It's a draw`
    }

    return {
        swapButton,
        boardOverlay,
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

    function info() {
        console.table(boardRows);
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
            // on click, store X or O, inform GameManager to end turn
            // Also, need to clear all event listeners

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
        info,
        initialiseBoard,
    }
})();

function Player(number, symbol) {
    let name = `Player ${number}`;
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

            console.log('=== UPDATEGAMESTATE ====')

            if (checkIsWin(player)) {
                endGame();
                displayWin();
            } else if (checkIsDraw()) {
                endGame();
                displayDraw();
                console.log('draw')
            } else {
                console.log('continue')
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

            console.log('== NEWTURN ==')
            console.log('Player ' + (playerCounter + 1) + "'s turn, total turns: " + totalTurns)
        }

        function checkIsWin(player) {
            let isWin = false;
            let playerSymbol = player.symbol;

            const checkRows = function () {
                // Check for win in the rows
                for (let i = 0; i < board.length; i++) {
                    console.log('-- Checking row ' + i + ' --');
                    let isRowWin = true;

                    for (let j = 0; j < board.length; j++) {
                        let tileSymbol = board[i][j].getSymbol();
                        
                        console.log('CHECK NEW TILE, ' + i + ',' + j);
                        console.log('player symbol: ' + player.symbol);
                        console.log('tile symbol: ' + tileSymbol);

                        if (!doesPlayerOwnTile(tileSymbol, playerSymbol)) {
                            // If any tile fails, stop checking row
                            isRowWin = false;
                            console.log('stop checking row ' + i)
                            break;
                        }
                    }

                    if (isRowWin) {
                        // If any row fulfills the win
                        isRowWin = true;
                        return isRowWin;
                    } else if (i === (board.length - 1) && !isRowWin) {
                        // If we checked all the rows and no win
                        return isRowWin;
                    }
                }
            }

            const checkColumns = function() {
                for (let i = 0; i < board.length; i++) {
                    console.log('-- Checking column ' + i + ' --');
                    let isColumnWin = true;

                    for (let j = 0; j < board.length; j++) {
                        let tileSymbol = board[j][i].getSymbol();
                        
                        console.log('CHECK NEW TILE, ' + j + ',' + i);
                        console.log('player symbol: ' + player.symbol);
                        console.log('tile symbol: ' + tileSymbol);

                        if (!doesPlayerOwnTile(tileSymbol, playerSymbol)) {
                            isColumnWin = false;
                            console.log('stop checking column ' + i)
                            break;
                        }
                    }

                    if (isColumnWin) {
                        isColumnWin = true;
                        return isColumnWin;
                    } else if (i === (board.length - 1) && !isColumnWin) {
                        return isColumnWin;
                    }
                }
            }

            const checkPosDiag = function() {
                for (let i = 0; i < board.length; i++) {
                    let posDiagWin = false;
                    
                    let tileSymbol = board[i][i].getSymbol();

                    console.log(
                        'CHECKING POS DIAG, i = ' + i
                    )
                    console.log('player symbol: ' + player.symbol);
                    console.log('tile symbol: ' + tileSymbol);
                    
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

                    console.log(
                        'CHECKING NEG DIAG, i = ' + i
                    )
                    console.log('player symbol: ' + player.symbol);
                    console.log('tile symbol: ' + tileSymbol);
                    
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
            let winConditions = [checkRows(), checkColumns(), checkPosDiag(), checkNegDiag()];

            console.log('==WIN CONDITIONS==')
            console.log(winConditions)

            isWin = winConditions.some( result => result === true );

            if (isWin) {
                // Set winning player
                winningPlayer = player;
                console.log('WINNER: ' + winningPlayer.name)
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
            console.log("is this player owned: " + isPlayerOwned);
            return isPlayerOwned;
        }

        return {
            startNewTurn,
            updateGameState
        }
    })();

    return {
        TurnManager,
        getCurrentActivePlayer,
        getWinningPlayer
    }
})();
