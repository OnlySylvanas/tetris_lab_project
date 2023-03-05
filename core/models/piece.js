class Piece {
	x;
	y;
	shape;
	context;
	_color;
	_typeId;

	constructor(context) {
		this.context = context;
		this.generate();
	}

	generate() {
		this.x = 0;
		this.y = 0;
		this._typeId = this.generateRandomTypeId(PIECE_SHAPES.length - 1);
		this._color = PIECE_COLORS[this._typeId];
		this.shape = PIECE_SHAPES[this._typeId];
	}

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

	move(pieceInfo) {
		this.x = pieceInfo.x;
		this.y = pieceInfo.y;
		this.shape = pieceInfo.shape
	}

	setStartPosition() {
		this.x = this._typeId === 4 ? 4 : 3;
	}

	generateRandomTypeId(typesCount) {
		return Math.floor(Math.random() * typesCount + 1);
	}
}