/**
 * Игровая фигурка
 *
 * Класс описывает фигурку и ее поведение
 *
 * @author      Vadim Peskov
 * @version     1.0.1
 * @copyright GNU Public License
 *
 * @property {number} x x-координата фигурки
 * @property {number} y y-координата фигурки
 * @property {Array} shape Матрица, описывающая форму фигурки
 * @property context Контекст канваса, связанного с фигуркой
 */
class Piece {
    x;
    y;
    shape;
    context;
    _color;
    _typeId;

    /**
     * Конструктор объекта фигурки
     *
     * @param context Контекст канваса фигурки
     */
    constructor(context) {
        this.context = context;
        this.generate();
    }

    /**
     * Инициализация фигурки
     *
     * Задает положение, цвет, форму фигурки
     *
     * @return {undefined}
     */
    generate() {
        this.x = 0;
        this.y = 0;
        this._typeId = this.generateRandomTypeId(PIECE_SHAPES.length - 1);
        this._color = PIECE_COLORS[this._typeId];
        this.shape = PIECE_SHAPES[this._typeId];
    }

    /**
     * Отрисовывает фигурку
     *
     * @return {undefined}
     */
    draw() {
        this.context.fillStyle = this._color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.context.fillRect(this.x + x, this.y + y, 1, 1);
                }
            });
        });
    }

    /**
     * Перемещает фигурку
     *
     * @param {Piece} pieceInfo Объект с необходимым состоянием перемещаемой фигурки
     * @return {undefined}
     */
    move(pieceInfo) {
        this.x = pieceInfo.x;
        this.y = pieceInfo.y;
        this.shape = pieceInfo.shape
    }

    /**
     * Устанавливает начальное положение фигурки в зависимости от формы
     *
     * @return {undefined}
     */
    setStartPosition() {
        this.x = this._typeId === 4 ? 4 : 3;
    }

    /**
     * Генерирует случайный id-индекс типа фигурки
     *
     * @param {number} typesCount Количество доступных типов
     * @return {number} Cлучайный id-индекс типа фигурки
     */
    generateRandomTypeId(typesCount) {
        return Math.floor(Math.random() * typesCount + 1);
    }
}