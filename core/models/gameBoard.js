/**
 * Игровое поле
 *
 * Класс описывает игровое поле,
 * содержащее логику генерации фигур и управления ими
 *
 * @author      Vadim Peskov
 * @version     1.0.1
 * @copyright GNU Public License
 *
 * @property {Piece} currentPiece Фигурка, отображаемая в данный момент
 */

class GameBoard {
    currentPiece;
    _context;
    _nextBlockPresenterContext;
    _grid;
    _nextPiece;

    /**
     * Конструктор объекта игрового поля
     *
     * @param context Контекст канваса главного игрового поля
     * @param nextBlockPresenterContext Контекст канваса поля, отображающего следующую фигурку
     */
    constructor(context, nextBlockPresenterContext) {
        this._context = context;
        this._nextBlockPresenterContext = nextBlockPresenterContext;
        this.initializeBoard();
    }

    /**
     * Инициализация игровой доски
     *
     * Задает размеры главного канваса и правила масштабирования
     *
     * @return {undefined}
     */
    initializeBoard() {
        this._context.canvas.width = COLS * BLOCK_SIZE;
        this._context.canvas.height = ROWS * BLOCK_SIZE;
        this._context.scale(BLOCK_SIZE, BLOCK_SIZE)
    }

    /**
     * Очищает доску
     *
     * Удаляется все содержимое игровой доски, генерируются новые фигурки
     *
     * @return {undefined}
     */
    resetBoard() {
        this._grid = this.getEmptyBoardGrid();
        this.currentPiece = new Piece(this._context);
        this.currentPiece.setStartPosition();
        this.createNewPiece();
    }

    /**
     * Отрисовывает доску и падающую фигурку
     *
     * @return {undefined}
     */
    drawCurrentBoardState() {
        this.currentPiece.draw();
        this.drawBoard();
    }

    /**
     * Отрисовывает доску и находящиеся на ней фигурки
     *
     * @return {undefined}
     */
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

    /**
     * Спускает фигуру на 1 единицу и выполняет перерисовку
     *
     * @return {boolean} Возможность продолжения игры
     */
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

    /**
     * Очищает закрытые игроком линии, начисляет награду
     *
     * В случае необходимости (прохождение требований уровня)
     * ускоряет игру в соответствии с глобальными параметрами
     *
     * @return {undefined}
     */
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

    /**
     * Создает новую фигурку, перерисовывает связанный с ней канвас
     *
     * @return {undefined}
     */
    createNewPiece() {
        this._nextPiece = new Piece(this._nextBlockPresenterContext);
        this._nextBlockPresenterContext
            .clearRect(0, 0,
                this._nextBlockPresenterContext.canvas.width,
                this._nextBlockPresenterContext.canvas.height
            );
        this._nextPiece.draw();
    }

    /**
     * Создает числовое представление пустой доски
     *
     * @return {Array} Числовое представление пустой доски
     */
    getEmptyBoardGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    /**
     * Вычисляет награду за очищенные линии
     *
     * @param {number} linesCount Количество очищенных линий
     * @return {number} Очки за очищенные линии
     */
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

    /**
     * Останавливает фигурку, не давая ей двигаться ниже
     *
     * @return {undefined}
     */
    freezePiece() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0)
                    this._grid[y + this.currentPiece.y][x + this.currentPiece.x] = value;
            });
        });
    }

    /**
     * Поворачивает фигурку на 90 градусов с использованием транспонирования
     * @param {Piece} newPieceInfo Объект фигурки, которая должна быть повернута
     * @return {Piece} Объект перевернутой фигурки
     */
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

    /**
     * Проверяет, находится ли точка с координатами x и y в игривом блоке
     * @param {number} x Координата X
     * @param {number} y Координата Y
     * @return {boolean} Результат проверки
     */
    pointInsideGamingBlock(x, y) {
        return x >= 0 && x <= COLS && y <= ROWS;
    }

    /**
     * Проверяет, находится ли точка с координатами x и y свободной
     * (на ней не должно находиться никаких фигур)
     * @param {number} x Координата X
     * @param {number} y Координата Y
     * @return {boolean} Результат проверки
     */
    pointIsFree(x, y) {
        return this._grid[y] && this._grid[y][x] === 0;
    }

    /**
     * Проверяет, валидность данных о фигурке
     * @param {Piece} pieceInfo Проверяемая фигурка
     * @return {boolean} Результат проверки
     */
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