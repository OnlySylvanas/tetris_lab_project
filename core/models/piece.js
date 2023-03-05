class Piece {
	_x;
	_y;
	_color;
	_shape;
	_context;
	_typeId;

	constructor(context) {
		this._context = context;
		this.generate();
	}

	generate() {
		this._x = 0;
		this._y = 0;
		this._typeId = this.generateRandomTypeId(PIECE_SHAPES.length - 1);
		this._color = PIECE_COLORS[this._typeId];
		this._shape = PIECE_SHAPES[this._typeId];
	}

	draw() {
		this._context.fillStyle = this._color;
		this._shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value > 0) {
					this._color.fillRect(this._x + x, this._y + y, 1, 1);
				}
			});
		});
	}

	setStartPosition() {
		this.x = this._typeId === 4 ? 4 : 3;
	}

	generateRandomTypeId(typesCount) {
		return Math.floor(Math.random() * typesCount + 1);
	}
}