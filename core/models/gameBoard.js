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

    dropPiece() {
        let pieceInfo = moves[KEY_CODES.DOWN](this.currentPiece);
        if (this.validatePieceInfo(pieceInfo)) {
            this.currentPiece.move(pieceInfo);
        } else {
            this.freezePiece();
            this.clearLines();
            if (this.currentPiece.y === 0)
                return false;
            this.currentPiece = this._nextPiece;
            this.currentPiece.context = this._context;
            this.currentPiece.setStartPosition();
            this.createNewPiece();
        }
        return true;
    }

    clearLines() {
        let lines = 0;
        this._grid.forEach((row, y) => {
            if (row.every(value => value > 0)) {
                lines++;
                this._grid.splice(y, 1);
                this._grid.unshift(Array(COLS).fill(0));
            }
        });
        if (lines > 0) {
            gameStateUpdateHook.score += this.calculatePointsForClearedLines(lines);
            gameStateUpdateHook.lines += lines;
            if (gameStateUpdateHook.lines >= LINES_PER_LEVEL) {
                gameStateUpdateHook.level++;
                gameStateUpdateHook.lines -= LINES_PER_LEVEL;
                // Увеличиваем скорость
                gameTime.level = LEVELS[gameStateUpdateHook.level];
            }
        }
    }

    createNewPiece() {
        this._nextPiece = new Piece(this._nextBlockPresenterContext);
        this._nextBlockPresenterContext
            .clearRect(0, 0,
                this._nextBlockPresenterContext.canvas.width,
                this._nextBlockPresenterContext.canvas.height
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

    pointInsideGamingBlock(x, y) {
        return x >= 0 && x <= COLS && y <= ROWS;
    }

    pointIsFree(x, y) {
        return this._grid[y] && this._grid[y][x] === 0;
    }

    validatePieceInfo(pieceInfo) {
        return pieceInfo.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = pieceInfo.x + dx;
                let y = pieceInfo.y + dy;
                return (
                    value === 0 ||
                    (this.pointInsideGamingBlock(x, y) && this.pointIsFree(x, y))
                );
            });
        });
    }
}