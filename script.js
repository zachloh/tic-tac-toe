// Gameboard module
const gameboard = (function() {

  let gameboard = ['','','',
                     '','','',
                     '','',''];

  // Check if the cell is already taken
  function isValid(index) {
    return !gameboard[index];
  }

  function setMark(index, mark) {
    gameboard[index] = mark;
  }

  function getBoard() {
    return gameboard;
  }

  function resetBoard() {
    gameboard = ['','','',
                 '','','',
                 '','',''];
  }

  return {
    isValid,
    setMark,
    getBoard,
    resetBoard
  };
})();

// Player factory function
const player = function(mark) {
  let name;
  let moveCount = 0;

  function getName() {
    return name;
  }

  function setName(newName) {
    name = newName;
  }

  function getMark() {
    return mark;
  }

  function addMoveCount() {
    moveCount++;
  }

  function getMoveCount() {
    return moveCount;
  }

  function resetMoveCount() {
    moveCount = 0;
  }

  return {
    getName,
    setName,
    getMark,
    addMoveCount,
    getMoveCount,
    resetMoveCount
  };
}

// PVP game mode module
const pvpController = (function() {

  const playerX = player('x');
  const playerO = player('o');

  let playerTurn = 'x';

  function getName(mark = playerTurn) {
    return (mark === 'x') ? playerX.getName() : playerO.getName();
  }

  function setNames(playerXName, playerOName) {
    playerX.setName(playerXName);
    playerO.setName(playerOName);
  }

  function getPlayerTurn() {
    return playerTurn;
  }

  function recordMove() {
    if (playerTurn === 'x') playerX.addMoveCount();
    if (playerTurn === 'o') playerO.addMoveCount();
  }

  function swapTurn() {
    playerTurn = (playerTurn === 'x') ? 'o' : 'x';
  }

  function getTotalMoves() {
    return playerX.getMoveCount() + playerO.getMoveCount();
  }

  function resetTurn() {
    playerTurn = 'x';
    playerX.resetMoveCount();
    playerO.resetMoveCount();
  }

  return {
    getName,
    setNames,
    getPlayerTurn,
    recordMove,
    swapTurn,
    getTotalMoves,
    resetTurn
  };
})();

// vsAI game mode module
const vsAIController = (function() {

  let playerMoveCount = 0;
  let remainingSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  function getMoveCount() {
    return playerMoveCount;
  }

  function updateMoveCount() {
    playerMoveCount++;
  }

  function resetMoveCount() {
    playerMoveCount = 0;
  }

  function updateRemainingSlots(index) {
    remainingSlots = remainingSlots.filter(item => item !== index);
  }
  
  function resetRemainingSlots() {
    remainingSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  }

  function getAIMove() {
    const AIMove = minimax(gameboard.getBoard(), 'o');
    return AIMove.index;
  }

  function minimax(newBoard, player) {

    let availableSpots = [];

    for (let i = 0; i < newBoard.length; i++) {
      if (!newBoard[i]) availableSpots.push(i); 
    }

    if (gameController.hasWinner('x', newBoard)) {
      return {score: -10};
    } else if (gameController.hasWinner('o', newBoard)) {
      return {score: 10};
    } else if (availableSpots.length === 0) {
      return {score: 0};
    }

    let moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
      let move = {};
      move.index = availableSpots[i];

      newBoard[availableSpots[i]] = player;

      if (player === 'o') {
        const result = minimax(newBoard, 'x');
        move.score = result.score;
      } else {
        const result = minimax(newBoard, 'o');
        move.score = result.score;
      }

      newBoard[availableSpots[i]] = '';

      moves.push(move);
    }

    let bestMove;

    if (player === 'o') {
      bestMove = moves.reduce((chosenMove, currentMove) => {
        return (currentMove.score > chosenMove.score) ? currentMove : chosenMove;
      });
    } else {
      bestMove = moves.reduce((chosenMove, currentMove) => {
        return (currentMove.score < chosenMove.score) ? currentMove : chosenMove;
      });
    }

    return bestMove;
  }

  return {
    getMoveCount,
    updateMoveCount,
    resetMoveCount,
    updateRemainingSlots,
    getAIMove,
    resetRemainingSlots
  }
})();

const displayController = (function() {
  const cells = document.querySelectorAll('td');
  const vsAIButton = document.querySelector('.ai');
  const pvpButton = document.querySelector('.pvp');
  const form = document.querySelector('form');
  const player1 = document.querySelector('#player1');
  const player2 = document.querySelector('#player2');
  const leftNameDisplay = document.querySelector('.left.player');
  const rightNameDisplay = document.querySelector('.right.player');
  const leftScore = document.querySelector('.left.score');
  const rightScore = document.querySelector('.right.score');
  const gameMessage = document.querySelector('.game-message');
  const restartButton = document.querySelector('.restart-container button');

  window.addEventListener('load', () => {
    gameMessage.textContent = 'Choose your game mode!';
  })

  cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
      const index = e.target.dataset.index;

      // PVP mode
      if (gameController.getGameMode() === 'PVP') {
        const mark = pvpController.getPlayerTurn();

        // Check if a mark already exists
        if (!gameController.isRoundOver() && gameboard.isValid(index)) {
          pvpController.recordMove();
          gameboard.setMark(index, mark);
          addToGameBoard(index, mark);

          // Check for winner
          if (gameController.hasWinner(mark, gameboard.getBoard())) {
            gameMessage.textContent = `${pvpController.getName(mark)} wins!`;
            gameController.roundEnd();
            updateScore(mark);
            restartButton.textContent = 'New Round';
          } else {
            if (pvpController.getTotalMoves() === 9) {
              gameMessage.textContent = "It's a tie!";
              gameController.roundEnd();
              restartButton.textContent = 'New Round';
            } else {
              pvpController.swapTurn();
              displayTurn();
            }
          }
        }     
      // vsAI mode
      } else if (gameController.getGameMode() === 'vsAI') {  

        // Check if mark already exists
        if (!gameController.isRoundOver() && gameboard.isValid(index)) {
          gameboard.setMark(index, 'x');
          addToGameBoard(index, 'x');
          vsAIController.updateMoveCount();
          vsAIController.updateRemainingSlots(Number(index));

          // Check if player has won
          if (gameController.hasWinner('x', gameboard.getBoard())) {
            gameMessage.textContent = 'You win this round!';
            gameController.roundEnd();
            restartButton.textContent = 'New Round';
          } else {

            // Check for tie
            if (vsAIController.getMoveCount() === 5) {
              gameMessage.textContent = "It's a tie!";
              gameController.roundEnd();
              restartButton.textContent = 'New Round';
            } else {

              // Make AI move
              if (!gameController.isRoundOver()) {
                const AImoveIndex = vsAIController.getAIMove();
                gameboard.setMark(AImoveIndex, 'o');
                addToGameBoard(AImoveIndex, 'o');
                vsAIController.updateRemainingSlots(AImoveIndex);

                // Check if AI has won
                if (gameController.hasWinner('o', gameboard.getBoard())) {
                    gameMessage.textContent = 'AI wins this round!';
                    gameController.roundEnd();
                    restartButton.textContent = 'New Round';
                }
              }
            }
          }
        }
      }
    });
  });

  vsAIButton.addEventListener('click', () => {
    gameController.swapToVsAi();
    hidePvpDisplay();
    moveButtonsDown();
    restartButton.textContent = 'Restart';
    gameMessage.textContent = 'Make your move!';
    gameController.roundStart();
  });

  pvpButton.addEventListener('click', () => {
    gameController.swapToPVP();
    showPvpDisplay();
    gameController.roundEnd();
    gameMessage.textContent = '';
    restartButton.textContent = 'Restart';
    showForm();
    moveButtonsUp();
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const player1Name = player1.value;
    const player2Name = player2.value;

    pvpController.setNames(player1Name, player2Name);

    // Display scores
    leftNameDisplay.textContent = player1Name.toUpperCase();
    rightNameDisplay.textContent = player2Name.toUpperCase();
    leftScore.textContent = 0;
    rightScore.textContent = 0;

    // Clear form 
    player1.value = '';
    player2.value = '';

    displayTurn();

    gameController.roundStart();
    hideForm();
    moveButtonsDown();
  });

  restartButton.addEventListener('click', () => {
    gameboard.resetBoard();
    resetGameBoard();
    gameController.roundStart();

    restartButton.textContent = 'Restart';
    if (gameController.getGameMode() === 'PVP') {
      pvpController.resetTurn();
      displayTurn();
    }

    if (gameController.getGameMode() === 'vsAI') {
      gameMessage.textContent = 'Make your move!';
      vsAIController.resetMoveCount();
      vsAIController.resetRemainingSlots();
    }
  });

  function moveButtonsDown() {
    vsAIButton.classList.add('down');
    pvpButton.classList.add('down');
  }

  function moveButtonsUp() {
    vsAIButton.classList.remove('down');
    pvpButton.classList.remove('down');
  }

  function clearScores() {
    leftNameDisplay.textContent = '';
    rightNameDisplay.textContent = '';
    leftScore.textContent = '';
    rightScore.textContent = '';
  }

  function addToGameBoard(index, mark) {
    cells[index].textContent = mark;

    if (mark === 'o') cells[index].classList.add('o');
    if (mark === 'x') cells[index].classList.add('x');
  }

  function displayTurn() {
    gameMessage.textContent = `It's ${pvpController.getName()}'s turn!`;
  }

  function resetGameBoard() {
    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = '';
    })
  }

  function updateScore(mark) {
    if (mark === 'x') leftScore.textContent++;
    if (mark === 'o') rightScore.textContent++;
  }

  function hideForm() {
    form.classList.add('hide');
  }

  function showForm() {
    form.classList.remove('hide');
  }

  function hidePvpDisplay() {
    form.classList.add('hide');
    leftNameDisplay.classList.add('hide');
    rightNameDisplay.classList.add('hide');
    leftScore.classList.add('hide');
    rightScore.classList.add('hide');
  }

  function showPvpDisplay() {
    form.classList.remove('hide');
    leftNameDisplay.classList.remove('hide');
    rightNameDisplay.classList.remove('hide');
    leftScore.classList.remove('hide');
    rightScore.classList.remove('hide');
    gameMessage.classList.remove('hide');
  }

  return {
    clearScores,
    resetGameBoard
  }
})();

// Game controller module
const gameController = (function() {

  let roundOver = false;
  let gameMode;

  const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

  function getGameMode() {
    return gameMode;
  }
  
  function isRoundOver() {
    return roundOver;
  }

  function hasWinner(mark, gameboard) {
    if (gameMode === 'PVP' && pvpController.getTotalMoves() < 5) return false;

    return WINNING_COMBINATIONS.some(combination => {
      return combination.every(index => {
        return gameboard[index] === mark;    
      })
    })
  }

  function swapToVsAi() {
    resetGame();
    gameMode = 'vsAI';
    vsAIController.resetMoveCount();
    vsAIController.resetRemainingSlots();
  }

  function swapToPVP() {
    resetGame();
    gameMode = 'PVP';
    pvpController.resetTurn();
  }

  function resetGame() {
    gameboard.resetBoard();
    displayController.resetGameBoard();
    displayController.clearScores();
  }

  function roundEnd() {
    roundOver = true;
  }

  function roundStart() {
    roundOver = false;
  }

  return {
    getGameMode,
    isRoundOver,
    hasWinner,
    swapToVsAi,
    swapToPVP,
    resetGame,
    roundEnd,
    roundStart
  };
})();