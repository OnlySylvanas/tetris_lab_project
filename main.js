let boardPresenter = document.getElementById('board');
let gameBoardContext = boardPresenter.getContext('2d');
let nextBlockPresenter = document.getElementById('next_block_presenter');
let nextBlockPresenterContext = nextBlockPresenter.getContext('2d');

let gameState = {
	score: 0,
	level: 0,
	lines: 0
};

let gameTime = {
	start: 0,
	elapsed: 0,
	level: 0
}

function updateGameState(key, value) {
	let uiLabel = document.getElementById(key);
	if (uiLabel)
		uiLabel.textContent = value
}

let gameStateUpdateHook = new Proxy(gameState, {
	set(target, key, value) {
		target[key] = value;
		updateGameState(key, value);
		return true;
	}
})

moves = {
	[KEY_CODES.LEFT]: p => ({ ...p, x: p.x - 1 }),
	[KEY_CODES.RIGHT]: p => ({ ...p, x: p.x + 1 }),
	[KEY_CODES.DOWN]: p => ({ ...p, y: p.y + 1 }),
	[KEY_CODES.SPACE]: p => ({ ...p, y: p.y + 1 }),
	[KEY_CODES.UP]: p => gameBoard.rotatePiece(p)
};

let gameBoard = new GameBoard(gameBoardContext, nextBlockPresenterContext);
initializeNextBlockPresenter();
addEventListeners();

function initializeNextBlockPresenter() {
	nextBlockPresenterContext.canvas.width = 4 * BLOCK_SIZE;
	nextBlockPresenterContext.canvas.height = 4 * BLOCK_SIZE;
	nextBlockPresenterContext.scale(BLOCK_SIZE, BLOCK_SIZE);
}

function addEventListeners() {
	document.addEventListener('keydown', event => {
		if (event.keyCode === KEY_CODES.P) {
			pause();
		}
		if (event.keyCode === KEY_CODES.ESC) {
			finishGame();
		} else if (moves[event.keyCode]) {
			event.preventDefault();
			let pieceInfo = moves[event.keyCode](gameBoard.currentPiece);
			if (event.keyCode === KEY_CODES.SPACE) {
				while (gameBoard.validatePieceInfo(pieceInfo)) {
					gameStateUpdateHook.score += REWARDS.HARD_DROP;
					gameBoard.currentPiece.move(pieceInfo);
					pieceInfo = moves[KEY_CODES.DOWN](gameBoard.currentPiece);
				}
			} else if (gameBoard.validatePieceInfo(pieceInfo)) {
				gameBoard.currentPiece.move(pieceInfo);
				if (event.keyCode === KEY_CODES.DOWN) {
					gameStateUpdateHook.score += REWARDS.SOFT_DROP;
				}
			}
		}
	});
}

let requestId;

function play() {
	resetGame();
	gameTime.start = performance.now();
	if (requestId)
		cancelAnimationFrame(requestId);
	animate();
}

function resetGame() {
	gameState.score = 0;
	gameState.level = 0;
	gameState.lines = 0;
	gameTime.start = 0;
	gameTime.elapsed = 0;
	gameBoard.resetBoard();
	gameTime.level = LEVELS[gameState.level];
}

function animate(currentTick) {
	gameTime.elapsed = currentTick - gameTime.start;
	if (gameTime.elapsed > gameTime.level) {
		gameTime.start = currentTick;
		if (!gameBoard.dropPiece()) {
			finishGame();
			return;
		}
	}
	gameBoardContext
		.clearRect(0, 0, gameBoardContext.canvas.width, gameBoardContext.canvas.height);
	gameBoard.drawCurrentBoardState();
	requestId = requestAnimationFrame(animate);
}

function finishGame() {
	cancelAnimationFrame(requestId);
	showMessage("Конец игры");
}

function pause() {
	if (!requestId) {
		animate();
		return;
	}
	cancelAnimationFrame(requestId);
	requestId = null;
	showMessage("Пауза")
}

function showMessage(message) {
	gameBoardContext.fillStyle = 'black';
	gameBoardContext.fillRect(1, 3, 8, 1.2);
	gameBoardContext.font = '1px Arial';
	gameBoardContext.fillStyle = 'lightgreen';
	gameBoardContext.fillText(message, 3, 4);
}