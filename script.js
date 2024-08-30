/* constantes */
const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;

const EVENT_MOVEMENTS = {
    LEFT: 'ArrowLeft',
    DOWN: 'ArrowDown',
    RIGHT: 'ArrowRight',
    DROP: ' '
};

const COLORS = ['blue', 'green', 'purple', 'orange', 'pink'];

const PIECES = [
    [ // la pieza amarilla
        [1, 1],
        [1, 1]
    ],
    [
        [1, 1, 1, 1]
    ],
    [ // es la pieza lila
        [0, 1, 0],
        [1, 1, 1]
    ],
    [ // la pieza verde
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    [
        [0, 1],
        [0, 1],
        [1, 1]
    ]
];

/* juego */
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const $score = document.querySelector('span');
const $section = document.querySelector('section');
const $resetButton = document.getElementById('reset-button');
const audio = new window.Audio('https://video.aprendejs.dev/tetris.mp3');

let score = 0;

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

let board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

function createBoard(width, height) {
    return Array(height).fill().map(() => Array(width).fill(0));
}

const piece = {
    position: { x: 5, y: 5 },
    shape: [
        [1, 1],
        [1, 1]
    ],
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
};

let dropCounter = 0;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;

    if (dropCounter > 1000) {
        piece.position.y++;
        dropCounter = 0;

        if (checkCollision()) {
            piece.position.y--;
            solidifyPiece();
            removeRows();
        }
    }

    draw();
    window.requestAnimationFrame(update);
}

function draw() {
    // Dibujar fondo con líneas de la cuadrícula
    context.fillStyle = '#000'; // Color de fondo del tablero
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar la cuadrícula
    context.strokeStyle = '#444'; // Color de las líneas de la cuadrícula
    context.lineWidth = 0.05; // Grosor de las líneas de la cuadrícula

    // Dibujar líneas verticales
    for (let x = 1; x < BOARD_WIDTH; x++) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, BOARD_HEIGHT);
        context.stroke();
    }

    // Dibujar líneas horizontales
    for (let y = 1; y < BOARD_HEIGHT; y++) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(BOARD_WIDTH, y);
        context.stroke();
    }

    // Dibujar las piezas que ya están en el tablero
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                context.fillStyle = 'yellow';
                context.fillRect(x, y, 1, 1);
            }
        });
    });

    // Dibujar la pieza actual
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = piece.color;
                context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
            }
        });
    });

    // Actualizar la puntuación
    $score.innerText = score;
}



document.addEventListener('keydown', event => {
    if (event.key === EVENT_MOVEMENTS.LEFT) {
        piece.position.x--;
        if (checkCollision()) {
            piece.position.x++;
        }
    }

    if (event.key === EVENT_MOVEMENTS.RIGHT) {
        piece.position.x++;
        if (checkCollision()) {
            piece.position.x--;
        }
    }

    if (event.key === EVENT_MOVEMENTS.DOWN) {
        piece.position.y++;
        if (checkCollision()) {
            piece.position.y--;
            solidifyPiece();
            removeRows();
        }
    }

    if (event.key === 'ArrowUp') {
        const rotated = [];

        for (let i = 0; i < piece.shape[0].length; i++) {
            const row = [];

            for (let j = piece.shape.length - 1; j >= 0; j--) {
                row.push(piece.shape[j][i]);
            }

            rotated.push(row);
        }

        const previousShape = piece.shape;
        piece.shape = rotated;
        if (checkCollision()) {
            piece.shape = previousShape;
        }
    }

    if (event.key === EVENT_MOVEMENTS.DROP) {
        dropPiece(); // Caída instantánea
    }
});

function dropPiece() {
    while (!checkCollision()) {
        piece.position.y++;
    }
    piece.position.y--; // Retrocede una posición después de la colisión
    solidifyPiece();
    removeRows();
}

function checkCollision() {
    return piece.shape.find((row, y) => {
        return row.find((value, x) => {
            return (
                value === 1 &&
                board[y + piece.position.y]?.[x + piece.position.x] !== 0
            );
        });
    });
}

function solidifyPiece() {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                board[y + piece.position.y][x + piece.position.x] = 1;
            }
        });
    });

    resetPiece();
}

function resetPiece() {
    piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2);
    piece.position.y = 0;
    piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];
    piece.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    if (checkCollision()) {
        window.alert('Game over!! Sorry!');
        board.forEach((row) => row.fill(0));
        score = 0;
    }
}

function removeRows() {
    const rowsToRemove = [];

    board.forEach((row, y) => {
        if (row.every(value => value === 1)) {
            rowsToRemove.push(y);
        }
    });

    rowsToRemove.forEach(y => {
        board.splice(y, 1);
        const newRow = Array(BOARD_WIDTH).fill(0);
        board.unshift(newRow);
        score += 10;
    });
}

function resetGame() {
    board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);
    score = 0;
    resetPiece();
    draw();
}

$resetButton.addEventListener('click', () => {
    resetGame();
});

$section.addEventListener('click', () => {
    update();

    $section.remove();
    audio.volume = 0.01;
    audio.play();
});
