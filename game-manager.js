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
        GameManager.TurnManager.checkGameStatus(player);
        GameManager.TurnManager.checkDraw();
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
            getSymbol
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
        let maxTurns = Math.pow(Gameboard.boardSize, 2);

        function checkGameStatus(player) {
            // When a player clicks a tile, run this
            // If no win fulfilled, check draw
            // If no draw, outcome = continue

            console.log(checkIsWin(player));

            // executeNextAction(outcome);
        }

        function executeNextAction(outcome) {
            // switch statement :)
            // 
        
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

            return {
                playerCounter,
                totalTurns
            }
        }

        function checkIsWin(player) {
            // Check for 3 in a row of the player's symbol.
            let isWin = false;

            let board = Gameboard.boardRows;
            let playerSymbol = player.symbol;


            const checkRow = new Promise((resolve) => {
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
                        resolve (isRowWin);
                        return;
                    } else if (i === (board.length - 1) && !isRowWin) {
                        // If we checked all the rows and no win
                        resolve(isRowWin);
                    }
                }
            })

            // Check all win conditions
            Promise.all( [checkRow] ).then( outcomes => { 
                console.log('== PROMISE ==') 
                console.log(outcomes) 

                // Return win if any win conditions fulfilled
                isWin = outcomes.some( outcome => outcome === true );
            });

            return isWin;

            // Check vertical
            // for (let i = 0; i < Gameboard.boardRows.length; i++) {
            //     for (let j = 0; j < Gameboard.boardRows.length; j++) {
            //         // Whut
            //         let tileSymbol = Gameboard.boardRows[j][i].getSymbol();

            //         console.log('CHECK VERTICAL TILES, j:' + j + ', i:' + i);
            //         console.log('player symbol: ' + player.symbol);
            //         console.log(tileSymbol);

            //         if ( doesPlayerOwnTile(tileSymbol, String(player.symbol)) === false ) {
            //             // If this check fails, exit loop
            //             currentOutcome = outcomes.continue;

            //             // Return works but it stops the whole function
            //             // Break only exits out of the current loop
            //             // return;
            //         }
            //     }
            // }

            // Check positive diagonal
            // for (let i = 0; i < Gameboard.boardRows.length; i++) {
            //     // We want to see if 0,0/1,1/2,2... are filled
            //     let tileSymbol = Gameboard.boardRows[i][i].getSymbol();

            //     console.log('CHECK NEW TILE, i = ' + i);
            //     console.log(player);
            //     console.log(tileSymbol);
            //     console.log(doesPlayerOwnTile(tileSymbol, player));


            // }

            // Check negative diagonal
            // for (let i = 0; i < Gameboard.boardRows.length; i++) {
            //     let j = (Gameboard.boardRows.length - 1) - i;
            //     let tileSymbol = Gameboard.boardRows[i][j].getSymbol();

            //     console.log('CHECK NEW TILE, ' + i + ',' + j);
            //     console.log('player symbol: ' + player.symbol);
            //     console.log(tileSymbol);
            //     console.log(doesPlayerOwnTile(tileSymbol, player));
         
            // }
        }

        function checkDraw() {
            let isDraw;

            if (totalTurns === maxTurns) {
                // Don't start a new turn because no tiles left.
                // outcome: draw
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
            checkGameStatus,
            checkDraw
        }
    })();

    return {
        TurnManager,
        getCurrentActivePlayer
    }
})();