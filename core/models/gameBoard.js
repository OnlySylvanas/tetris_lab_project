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

	resetBoard() {
		this._grid = this.getEmptyBoardGrid();
		this._currentPiece = new Piece(this._context);
		this._currentPiece.setStartPosition();
		this.createNewPiece();
	}

	drawCurrentBoardState() {
		this._currentPiece.draw();
		this.drawBoard();
	}

	drawBoard() {
		this._grid.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value > 0) {
					this._context.fillStyle = PIECE_COLORS[value];
					this._context.fillRect(x, y, 1, 1);
				}
			});
		});
	}

	createNewPiece() {
		this._nextPiece = new Piece(this._context);
		this._nextBlockPresenterContext
			.clearRect(0, 0,
				this._nextBlockPresenterContext.width,
				this._nextBlockPresenterContext.height
			);
		this._nextPiece.draw();
	}

	getEmptyBoardGrid() {
		return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
	}
}