import React, { useEffect, useRef } from 'react';
import './App.scss';

const CANVAS_SIZE = 500;
const GRID_COUNT = 10;
const CELL_SIZE = CANVAS_SIZE / GRID_COUNT;

type Player = 'X' | 'O';
type Cell = Player | null;

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let board: Cell[][] = Array.from({ length: GRID_COUNT }, () =>
      Array(GRID_COUNT).fill(null)
    );
    let currentPlayer: Player = 'X';
    let gameState: 'start' | 'play' | 'end' = 'start';
    let winner: Player | 'Draw' | null = null;

    // Hàm kiểm tra chiến thắng với điều kiện 5 dấu liền nhau
    const checkWinner = (): Player | 'Draw' | null => {
      // Duyệt từng ô làm điểm bắt đầu
      for (let i = 0; i < GRID_COUNT; i++) {
        for (let j = 0; j < GRID_COUNT; j++) {
          const cell = board[i][j];
          if (cell === null) continue;

          // Kiểm tra ngang (hàng)
          if (j <= GRID_COUNT - 5) {
            let win = true;
            for (let k = 1; k < 5; k++) {
              if (board[i][j + k] !== cell) {
                win = false;
                break;
              }
            }
            if (win) return cell;
          }

          // Kiểm tra dọc (cột)
          if (i <= GRID_COUNT - 5) {
            let win = true;
            for (let k = 1; k < 5; k++) {
              if (board[i + k][j] !== cell) {
                win = false;
                break;
              }
            }
            if (win) return cell;
          }

          // Kiểm tra đường chéo chính (xuống phải)
          if (i <= GRID_COUNT - 5 && j <= GRID_COUNT - 5) {
            let win = true;
            for (let k = 1; k < 5; k++) {
              if (board[i + k][j + k] !== cell) {
                win = false;
                break;
              }
            }
            if (win) return cell;
          }

          // Kiểm tra đường chéo phụ (xuống trái)
          if (i <= GRID_COUNT - 5 && j >= 4) {
            let win = true;
            for (let k = 1; k < 5; k++) {
              if (board[i + k][j - k] !== cell) {
                win = false;
                break;
              }
            }
            if (win) return cell;
          }
        }
      }

      // Nếu không còn ô trống và chưa có người thắng thì hòa
      const isDraw = board.every(row => row.every(cell => cell !== null));
      if (isDraw) return 'Draw';

      return null;
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (gameState === 'start') {
        gameState = 'play';
      } else if (gameState === 'play') {
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);
        if (board[row][col] === null) {
          board[row][col] = currentPlayer;
          const result = checkWinner();
          if (result) {
            gameState = 'end';
            winner = result;
          } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
          }
        }
      } else if (gameState === 'end') {
        resetGame();
        gameState = 'play';
      }
    };

    canvas.addEventListener('click', handleClick);

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Vẽ lưới 10x10
      ctx.strokeStyle = '#000';
      for (let i = 0; i <= GRID_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }

      // Vẽ các dấu X và O
      ctx.font = `${CELL_SIZE * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < GRID_COUNT; i++) {
        for (let j = 0; j < GRID_COUNT; j++) {
          const mark = board[i][j];
          if (mark) {
            ctx.fillStyle = mark === 'X' ? 'red' : 'blue';
            ctx.fillText(mark, j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
          }
        }
      }

      // Vẽ thông tin trạng thái game
      ctx.fillStyle = 'black';
      ctx.font = '24px Arial';
      if (gameState === 'start') {
        ctx.fillText('Nhấn để chơi', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      } else if (gameState === 'play') {
        ctx.fillText(`Lượt của: ${currentPlayer}`, CANVAS_SIZE / 2, 30);
      } else if (gameState === 'end') {
        if (winner === 'Draw') {
          ctx.fillText('Hòa!', CANVAS_SIZE / 2, 30);
        } else {
          ctx.fillText(`Người chơi ${winner} thắng!`, CANVAS_SIZE / 2, 30);
        }
        ctx.fillText('Nhấn để chơi lại', CANVAS_SIZE / 2, CANVAS_SIZE - 30);
      }
    };

    const gameLoop = () => {
      draw();
      requestAnimationFrame(gameLoop);
    };

    const resetGame = () => {
      board = Array.from({ length: GRID_COUNT }, () =>
        Array(GRID_COUNT).fill(null)
      );
      currentPlayer = 'X';
      gameState = 'start';
      winner = null;
    };

    gameLoop();

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />;
};

export default Game;