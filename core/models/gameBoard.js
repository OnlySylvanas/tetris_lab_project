class GameBoard {
	_context;
	_nextBlockPresenterContext;
	_grid;
	_currentPiece;
	_nextPiece;

	constructor(context, nextBlockPresenterContext) {
		this._context = context;
		this._nextBlockPresenterContext = nextBlockPresenterContext;
		this.initializeBoard();
	}

	initializeBoard() {
		this._context.canvas.width = COLS * BLOCK_SIZE;
		this._context.canvas.height = ROWS * BLOCK_SIZE;
		this._context.scale(BLOCK_SIZE, BLOCK_SIZE)
	}
}