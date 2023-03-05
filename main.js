let gameBoard = document.getElementById('board');
let gameBoardContext = gameBoard.getContext('2d');
let nextBlockPresenter = document.getElementById('next_block_presenter');
let nextBlockPresenterContext = nextBlockPresenter.getContext('2d');

let gameState = {
	score: 0,
	level: 0,
	lines: 0
};

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

let board = new GameBoard(gameBoardContext, nextBlockPresenterContext);
initializeNextBlockPresenter();

function initializeNextBlockPresenter() {
	nextBlockPresenterContext.canvas.width = 4 * BLOCK_SIZE;
	nextBlockPresenterContext.canvas.height = 4 * BLOCK_SIZE;
	nextBlockPresenterContext.scale(BLOCK_SIZE, BLOCK_SIZE);
}