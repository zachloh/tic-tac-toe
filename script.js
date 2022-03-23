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

  return {
    getName,
    setName,
    getMark,
    addMoveCount,
    getMoveCount
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

  cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const mark = pvpController.getPlayerTurn();

      if (!gameController.isRoundOver()) {
        // Check if a mark already exists
        if (gameboard.isValid(index)) {
          pvpController.recordMove();
          gameboard.setMark(index, mark);
          addToGameBoard(index, mark);
        }

        if (gameController.hasWinner(mark, gameboard.getBoard())) {
          gameMessage.textContent = `${pvpController.getName(mark)} wins!`;
          gameController.roundEnd();
          updateScore(mark);
          restartButton.textContent = 'New Round';
        } else {
          pvpController.swapTurn();
          displayTurn();
        }
      }
    });
  });

  vsAIButton.addEventListener('click', () => {
    gameController.swapToVsAi();
    hidePvpDisplay();
    moveButtonsDown();
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
    pvpController.resetTurn();
    resetGameBoard();
    gameController.roundStart();
    displayTurn();
    restartButton.textContent = 'Restart';
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
    gameMessage.classList.add('hide');
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
  
  function isRoundOver() {
    return roundOver;
  }

  function hasWinner(mark, gameboard) {
    if (pvpController.getTotalMoves() < 5) return false;

    return WINNING_COMBINATIONS.some(combination => {
      return combination.every(index => {
        return gameboard[index] === mark;    
      })
    })
  }

  function swapToVsAi() {
    resetGame();
  }

  function swapToPVP() {
    resetGame();
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
    isRoundOver,
    hasWinner,
    swapToVsAi,
    swapToPVP,
    resetGame,
    roundEnd,
    roundStart
  };
})();