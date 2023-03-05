class GameBoard {
	currentPiece;
	_context;
	_nextBlockPresenterContext;
	_grid;
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
		this.currentPiece = new Piece(this._context);
		this.currentPiece.setStartPosition();
		this.createNewPiece();
	}

	drawCurrentBoardState() {
		this.currentPiece.draw();
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

	calculatePointsForClearedLines(linesCount) {
		let points;
		switch (linesCount) {
			case 1:
				points = REWARDS.SINGLE;
				break;
			case 2:
				points = REWARDS.DOUBLE;
				break;
			case 3:
				points = REWARDS.TRIPLE;
				break;
			case 4:
				points = REWARDS.TETRIS;
				break;
			default:
				points = 0;
		}
		return points;
	}

	freezePiece() {
		this.currentPiece.shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value > 0)
					this._grid[y + this.currentPiece.y][x + this.currentPiece.x] = value;
			});
		});
	}

	rotatePiece(newPieceInfo) {
		let piece = JSON.parse(JSON.stringify(newPieceInfo));
		for (let y = 0; y < piece.shape.length; ++y) {
			for (let x = 0; x < y; ++x) {
				[piece.shape[x][y], piece.shape[y][x]] = [piece.shape[y][x], piece.shape[x][y]];
			}
		}
		piece.shape.forEach(row => row.reverse());
		return piece;
	}
}