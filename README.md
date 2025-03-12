# Web-based Tetris Game

A web-based Tetris game built with Python (Flask) and JavaScript.

## Features

- Classic Tetris gameplay
- Score tracking
- Level progression
- Next piece preview
- Responsive design

## Prerequisites

- Python 3.7+
- Flask

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Game

1. Start the Flask server:
   ```bash
   python app.py
   ```
2. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## How to Play

- **Arrow Left/Right**: Move piece horizontally
- **Arrow Up**: Rotate piece
- **Arrow Down**: Soft drop (accelerate downward movement)
- **Spacebar**: Hard drop (instant placement)
- **P**: Pause/Resume game

## Game Rules

- The game starts with an empty board and randomly generates Tetris pieces (tetrominoes).
- Guide the falling pieces and create complete horizontal lines to clear them.
- The game ends when pieces stack to the top of the board.
- Clearing multiple lines at once awards more points.
- As you clear lines, the level increases, making pieces fall faster.

## Technology Stack

- Backend: Python with Flask
- Frontend: HTML, CSS, and vanilla JavaScript
- Game rendering: HTML5 Canvas API