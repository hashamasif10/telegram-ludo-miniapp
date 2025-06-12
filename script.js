console.log("JavaScript file linked successfully!");

// Initialize Telegram WebApp
try {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        console.log("Telegram WebApp SDK initialized successfully.");
        // Telegram.WebApp.expand();
    } else {
        console.error("Telegram WebApp SDK not found.");
    }
} catch (e) {
    console.error("Error initializing Telegram WebApp SDK:", e);
}

const BOARD_SIZE = 15; // Ludo board is typically 15x15 cells
const CELL_SIZE = 30; // Each cell is 30px x 30px
const PIECE_SIZE = 24; // Piece size
const players = ['red', 'green', 'yellow', 'blue'];
const playerStartPositions = { // For placing pieces in their start containers
    red: [{row: 1, col: 1}, {row: 1, col: 4}, {row: 4, col: 1}, {row: 4, col: 4}],
    green: [{row: 1, col: 10}, {row: 1, col: 13}, {row: 4, col: 10}, {row: 4, col: 13}],
    yellow: [{row: 10, col: 10}, {row: 10, col: 13}, {row: 13, col: 10}, {row: 13, col: 13}],
    blue: [{row: 10, col: 1}, {row: 10, col: 4}, {row: 13, col: 1}, {row: 13, col: 4}],
};

// These are the coordinates for the inner circles within the start boxes
const startPieceContainerCoords = {
    red: [
        { top: 15 + CELL_SIZE, left: 15 + CELL_SIZE }, { top: 15 + CELL_SIZE, left: 15 + CELL_SIZE * 2.5 },
        { top: 15 + CELL_SIZE * 2.5, left: 15 + CELL_SIZE }, { top: 15 + CELL_SIZE * 2.5, left: 15 + CELL_SIZE * 2.5 }
    ],
    green: [
        { top: 15 + CELL_SIZE, left: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 4.5) + 15 }, { top: 15 + CELL_SIZE, left: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 3) + 15 },
        { top: 15 + CELL_SIZE * 2.5, left: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 4.5) + 15 }, { top: 15 + CELL_SIZE * 2.5, left: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 3) + 15 }
    ],
    yellow: [
        { top: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 4.5) + 15, left: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 4.5) + 15 }, { top: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 4.5) + 15, left: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 3) + 15 },
        { top: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 3) + 15, left: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 4.5) + 15 }, { top: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 3) + 15, left: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 3) + 15 }
    ],
    blue: [
        { top: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 4.5) + 15, left: 15 + CELL_SIZE }, { top: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 4.5) + 15, left: 15 + CELL_SIZE * 2.5 },
        { top: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 3) + 15, left: 15 + CELL_SIZE }, { top: 30 + BOARD_SIZE * CELL_SIZE - (CELL_SIZE * 3) + 15, left: 15 + CELL_SIZE * 2.5 }
    ]
};


document.addEventListener('DOMContentLoaded', () => {
    const ludoBoard = document.getElementById('ludo-board');
    if (!ludoBoard) {
        console.error("Ludo board element not found!");
        return;
    }
    ludoBoard.style.width = `${BOARD_SIZE * CELL_SIZE}px`;
    ludoBoard.style.height = `${BOARD_SIZE * CELL_SIZE}px`;

    createBoardCells(ludoBoard);
    createPlayerStartAreas(ludoBoard);
    initializePlayerPieces(ludoBoard);
});

function createBoardCells(boardElement) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            // cell.textContent = `${r},${c}`; // For debugging cell positions

            // Add specific styling for paths and home columns (simplified)
            if ((r >= 6 && r <= 8) || (c >= 6 && c <= 8)) { // Central cross area
                if (r === 7 && c === 7) {
                    cell.classList.add('center-triangle');
                } else if (r === 7 && c < 6) cell.classList.add('red-path'); // Red home path
                else if (c === 7 && r < 6) cell.classList.add('green-path'); // Green home path (corrected)
                else if (r === 7 && c > 8) cell.classList.add('yellow-path'); // Yellow home path
                else if (c === 7 && r > 8) cell.classList.add('blue-path'); // Blue home path (corrected)
                else if ((r === 6 && (c <=5 || c >=9)) || (r === 8 && (c <=5 || c >=9)) || (c === 6 && (r <=5 || r >=9)) || (c === 8 && (r <=5 || r >=9))) {
                     // General path cells - no specific color unless it's a start cell for a path
                } else {
                    // Home columns or other specific cells
                     if (c === 1 && r === 6) cell.classList.add('red-path'); // Start of red path
                     if (r === 1 && c === 8) cell.classList.add('green-path'); // Start of green path
                     if (c === 13 && r === 8) cell.classList.add('yellow-path'); // Start of yellow path
                     if (r === 13 && c === 6) cell.classList.add('blue-path'); // Start of blue path
                }
            }
             // Color the main path cells
            const pathCoords = [
                // Red path entry
                {r: 6, c: 1}, {r: 6, c: 2}, {r: 6, c: 3}, {r: 6, c: 4}, {r: 6, c: 5},
                // Green path entry
                {r: 1, c: 8}, {r: 2, c: 8}, {r: 3, c: 8}, {r: 4, c: 8}, {r: 5, c: 8},
                // Yellow path entry
                {r: 8, c: 13}, {r: 8, c: 12}, {r: 8, c: 11}, {r: 8, c: 10}, {r: 8, c: 9},
                // Blue path entry
                {r: 13, c: 6}, {r: 12, c: 6}, {r: 11, c: 6}, {r: 10, c: 6}, {r: 9, c: 6},
            ];

            pathCoords.forEach(coord => {
                if (r === coord.r && c === coord.c) {
                    if (r === 6) cell.classList.add('red-path');
                    if (c === 8) cell.classList.add('green-path'); // Corrected: This is for green path
                    if (r === 8) cell.classList.add('yellow-path'); // Corrected: This is for yellow path
                    if (c === 6) cell.classList.add('blue-path');
                }
            });


            // Mark starting cells for each player (the cell where pieces first enter the track)
            if (r === 6 && c === 1) cell.classList.add('red-path', 'start-cell'); // Red start
            if (r === 1 && c === 8) cell.classList.add('green-path', 'start-cell'); // Green start
            if (r === 8 && c === 13) cell.classList.add('yellow-path', 'start-cell'); // Yellow start
            if (r === 13 && c === 6) cell.classList.add('blue-path', 'start-cell'); // Blue start


            boardElement.appendChild(cell);
        }
    }
}

function applyTheme(themeName) {
    const boardElement = document.getElementById('ludo-board'); // Assuming ludo-board is the main themed element
    if (!boardElement) {
        console.error("Ludo board element not found for theming.");
        return;
    }

    // Remove existing theme classes
    boardElement.classList.remove('theme-space', 'theme-jungle'); // Add any other theme classes here

    if (themeName && themeName !== 'default') {
        boardElement.classList.add(`theme-${themeName}`);
        console.log(`Applied theme: ${themeName}`);
    } else {
        console.log("Applied theme: default");
    }

    try {
        localStorage.setItem('ludoTheme', themeName);
    } catch (e) {
        console.warn("localStorage is not available or failed to save theme:", e);
    }
}

async function executeAITurn(playerColor) {
    console.log(`AI turn for player: ${playerColor}`);
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    if(rollDiceBtn) rollDiceBtn.disabled = true; // Disable button during AI turn

    // 1. AI Rolls Dice (with a slight delay for UX)
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay

    // Call existing rollDice, but it needs to not auto-pass turn if AI has no moves yet.
    // Let's make a specific AI dice roll or modify rollDice carefully.
    // For now, let's assume rollDice just gives a number and updates display,
    // and AI turn logic handles what to do with it.
    // The current rollDice() function updates currentDiceRoll and the display.
    // It also checks for valid moves and can switch player if no moves. This needs to be controlled.

    // Simplified AI dice roll:
    const diceResultDisplay = document.getElementById('dice-result');
    // 1. AI Rolls Dice (animated)
    // The rollDice function now returns a Promise and handles animation.
    // It also sets currentDiceRoll globally.
    const finalRoll = await rollDice(true, playerColor); // Pass true for isAI, and playerColor
    console.log(`AI (${playerColor}) completed roll animation, result: ${finalRoll}`);
    // currentDiceRoll is already set by the new rollDice function.

    await new Promise(resolve => setTimeout(resolve, 500)); // Short delay after showing roll for AI "thinking"

    // 2. AI Analyzes Possible Moves
    const possibleMoves = [];
    const playerPieces = document.querySelectorAll(`.player-piece[data-player='${playerColor}']:not(.piece-home)`);

    playerPieces.forEach(pieceElement => {
        const isAtStart = pieceElement.parentElement.classList.contains('start-piece-container');
        const currentPosition = parseInt(pieceElement.dataset.currentPosition, 10);

        if (isAtStart) {
            if (currentDiceRoll === 6) {
                possibleMoves.push({
                    pieceElement: pieceElement,
                    pieceId: pieceElement.dataset.pieceId,
                    currentPosition: -1,
                    isStartMove: true,
                    newPositionIndex: 0, // Will move to first cell of path
                    description: `Move piece ${pieceElement.dataset.pieceId} from start.`
                });
            }
        } else { // Piece is on board
            const playerPath = playerPaths[playerColor];
            const newPositionIndex = currentPosition + currentDiceRoll;
            if (newPositionIndex < playerPath.length) { // Can move without overshooting
                possibleMoves.push({
                    pieceElement: pieceElement,
                    pieceId: pieceElement.dataset.pieceId,
                    currentPosition: currentPosition,
                    isStartMove: false,
                    newPositionIndex: newPositionIndex,
                    description: `Move piece ${pieceElement.dataset.pieceId} from ${currentPosition} to ${newPositionIndex}.`
                    // TODO: Add capture analysis and home entry flags here
                });
            }
        }
    });

    console.log(`AI (${playerColor}) found possible moves:`, possibleMoves);

    // 3. AI Selects Best Move (Simple Strategy)
    let bestMove = null;
    if (possibleMoves.length > 0) {
        // Priority 1: Move a piece from start if a 6 is rolled.
        const startMoves = possibleMoves.filter(move => move.isStartMove);
        if (startMoves.length > 0) {
            bestMove = startMoves[0]; // Pick the first available start move
        } else {
            // Priority 4 (Basic): Pick the first valid move found for pieces on board.
            // More advanced: furthest piece, piece that can capture, piece that can go home.
            // For now, just pick the first one.
            bestMove = possibleMoves[0];
        }
    }

    // 4. AI Executes Move
    if (bestMove) {
        console.log(`AI (${playerColor}) selected move:`, bestMove.description);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate thinking/action delay

        // Set selectedPiece global for the move functions
        selectedPiece = {
            element: bestMove.pieceElement,
            player: playerColor,
            id: bestMove.pieceId,
            isAtStart: bestMove.isStartMove,
            currentPosition: bestMove.currentPosition
        };

        if (bestMove.isStartMove) {
            movePieceFromStart(selectedPiece); // This function handles dice consumption for '6 out'
        } else {
            // moveSelectedPieceOnBoard expects currentDiceRoll to be set.
            // It will consume the dice roll and handle turn progression.
            moveSelectedPieceOnBoard();
        }
        // Note: movePieceFromStart and moveSelectedPieceOnBoard already handle
        // resetting currentDiceRoll and selectedPiece, and switching player if roll != 6.

    } else {
        console.log(`AI (${playerColor}) has no valid moves with roll ${currentDiceRoll}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        // If AI has no moves, turn should pass.
        // This is handled by the move functions if a piece *could* have been selected but can't move.
        // If no piece could even be selected (e.g. all at start, roll != 6), explicitly pass turn.
        if (currentDiceRoll !== 6) { // If it was a 6, AI gets another turn (or should have moved out)
             currentPlayer = getNextPlayer(currentPlayer);
        }
        currentDiceRoll = 0; // Reset dice roll
        document.getElementById('dice-result').textContent = `Player ${currentPlayer}'s turn. Roll dice.`;
        // Check if the new current player is also AI
        if (isAIPlayer(currentPlayer)) {
            executeAITurn(currentPlayer);
        } else {
             if(rollDiceBtn) rollDiceBtn.disabled = false; // Re-enable for human player
        }
    }
     // Ensure button is re-enabled if next player is human and AI turn is fully complete
    if (!isAIPlayer(currentPlayer) && rollDiceBtn) {
        rollDiceBtn.disabled = false;
    }
}

function createPlayerStartAreas(boardElement) {
    players.forEach(player => {
        const startBox = document.createElement('div');
        startBox.classList.add('start-box', `${player}-start-box`);
        // boardElement.appendChild(startBox); // Appending to boardElement makes it part of the grid, which is not what we want.

        // Create 4 inner circles for pieces for each start box
        for (let i = 0; i < 4; i++) {
            const pieceContainer = document.createElement('div');
            pieceContainer.classList.add('start-piece-container');
            pieceContainer.dataset.player = player;
            pieceContainer.dataset.pieceIndex = i;
            // Position these containers within the startBox later if needed, or directly position pieces
            startBox.appendChild(pieceContainer);
        }
         // Append startBox to the main ludo-board, not inside a cell
        document.getElementById('ludo-board').appendChild(startBox);
    });
}


function initializePlayerPieces(boardElement) {
    const startBoxes = {
        red: document.querySelector('.red-start-box'),
        green: document.querySelector('.green-start-box'),
        yellow: document.querySelector('.yellow-start-box'),
        blue: document.querySelector('.blue-start-box'),
    };

    players.forEach(player => {
        const pieceContainers = startBoxes[player].querySelectorAll('.start-piece-container');
        pieceContainers.forEach((container, index) => {
            const piece = document.createElement('div');
            piece.classList.add('player-piece', `${player}-piece`);
            piece.textContent = index + 1; // Number the pieces 1-4
            piece.dataset.player = player;
            piece.dataset.pieceId = `${player}-${index}`;
            // Pieces are appended to the container, which is already positioned by CSS
            container.appendChild(piece);
        });
    });
}

function rollDice() {
    const diceResultDisplay = document.getElementById('dice-result');
    if (!diceResultDisplay) {
        console.error("Dice result display element not found!");
        return 0; // Or handle error appropriately
    }
    const roll = Math.floor(Math.random() * 6) + 1;
    diceResultDisplay.textContent = `You rolled: ${roll}`;
    return roll;
}

// Updated rollDice function with animation
// isAICall parameter to slightly change behavior if AI is rolling (e.g. no immediate move check)
// playerColorForDisplay is for AI display "AI (green) rolled: X"
async function rollDice(isAICall = false, playerColorForDisplay = currentPlayer) {
    const diceResultDisplay = document.getElementById('dice-result');
    const rollDiceBtn = document.getElementById('roll-dice-btn');

    if (!diceResultDisplay) {
        console.error("Dice result display element not found!");
        return Promise.reject("Dice display not found");
    }

    if(rollDiceBtn && !isAICall) rollDiceBtn.disabled = true; // Disable button for human player during roll

    const finalRoll = Math.floor(Math.random() * 6) + 1;
    const animationDuration = 700; // Total animation time
    const intervalTime = 60; // How often to change number
    let currentAnimationTime = 0;

    diceResultDisplay.classList.add('rolling');

    return new Promise((resolve) => {
        const animationInterval = setInterval(() => {
            diceResultDisplay.textContent = Math.floor(Math.random() * 6) + 1;
            currentAnimationTime += intervalTime;
            if (currentAnimationTime >= animationDuration) {
                clearInterval(animationInterval);
                diceResultDisplay.classList.remove('rolling');
                diceResultDisplay.textContent = finalRoll;
                currentDiceRoll = finalRoll; // Set the global currentDiceRoll

                const displayPrefix = isAICall ? `AI (${playerColorForDisplay})` : `Player ${currentPlayer}`;
                diceResultDisplay.textContent = `${displayPrefix} rolled: ${finalRoll}`; // Update display text after animation
                console.log(`${displayPrefix} rolled a ${finalRoll}`);

                if (!isAICall) { // Human player's roll, proceed with move check
                    // Basic check if any piece can move for human player
                    let canMove = false;
                    document.querySelectorAll(`.player-piece[data-player='${currentPlayer}']:not(.piece-home)`).forEach(p => {
                        const isAtStart = p.parentElement.classList.contains('start-piece-container');
                        if ((isAtStart && currentDiceRoll === 6) || !isAtStart) {
                            canMove = true;
                        }
                    });

                    if (!canMove) {
                        console.log(`Player ${currentPlayer} has no valid moves with a ${currentDiceRoll}.`);
                        selectedPiece?.element.classList.remove('selected-piece');
                        selectedPiece = null;
                        const prevPlayer = currentPlayer;
                        currentPlayer = getNextPlayer(currentPlayer);
                        diceResultDisplay.textContent = `Player ${currentPlayer}'s turn. (${prevPlayer} had no move with ${finalRoll})`;
                        currentDiceRoll = 0; // Reset for next player

                        if (isAIPlayer(currentPlayer)) {
                            executeAITurn(currentPlayer); // AI's turn now
                        } else {
                            if(rollDiceBtn) rollDiceBtn.disabled = false; // Re-enable for next human player
                        }
                    } else {
                        console.log(`Player ${currentPlayer} can make a move with ${finalRoll}. Click a piece.`);
                        if(rollDiceBtn) rollDiceBtn.disabled = false; // Re-enable for human to select piece
                    }
                }
                resolve(finalRoll);
            }
        }, intervalTime);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const ludoBoard = document.getElementById('ludo-board');
    if (!ludoBoard) {
        console.error("Ludo board element not found!");
        return;
    }
    ludoBoard.style.width = `${BOARD_SIZE * CELL_SIZE}px`;
    ludoBoard.style.height = `${BOARD_SIZE * CELL_SIZE}px`;

    // Player Identification & Game ID Display
    loadStateFromUrlOnLaunch(); // Call this early, before setting up the board from scratch.

    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            localPlayerId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
            console.log("Local Player ID (Telegram):", localPlayerId);
        } else {
            localPlayerId = `dev-${Math.random().toString(36).substring(2, 9)}`; // Fallback for non-Telegram env
            console.log("Local Player ID (Fallback):", localPlayerId);
        }
    } catch (e) {
        console.error("Error getting Telegram User ID:", e);
        localPlayerId = 'error-getting-id';
    }
    const localPlayerIdElement = document.getElementById('local-player-id');
    if (localPlayerIdElement) {
        localPlayerIdElement.textContent = localPlayerId;
    }
    console.log("Current Game ID:", gameId);


    createBoardCells(ludoBoard);
    createPlayerStartAreas(ludoBoard); // Ensure this is called before piece initialization
    initializePlayerPieces(ludoBoard);

    const rollDiceBtn = document.getElementById('roll-dice-btn');
    if (rollDiceBtn) {
        rollDiceBtn.addEventListener('click', async () => {
            if (isAIPlayer(currentPlayer)) {
                console.log("Not human player's turn.");
                return;
            }
            rollDiceBtn.disabled = true; // Disable button
            try {
                await rollDice(); // rollDice now handles its own logic including enabling button or passing turn
            } catch (error) {
                console.error("Error during dice roll:", error);
                rollDiceBtn.disabled = false; // Re-enable on error
            }
        });
    } else {
        console.error("Roll dice button not found!");
    }

    // Game State Buttons
    const saveStateBtn = document.getElementById('save-state-btn');
    if (saveStateBtn) {
        saveStateBtn.addEventListener('click', () => {
            const gameState = getGameState();
            const gameStateJSON = JSON.stringify(gameState, null, 2);
            console.log("Game State Saved (see below):");
            console.log(gameStateJSON); // Log to console
            document.getElementById('game-state-json').value = gameStateJSON; // Display in textarea
            alert("Game state saved to console and textarea!");
        });
    }

    const loadStateBtn = document.getElementById('load-state-btn');
    if (loadStateBtn) {
        loadStateBtn.addEventListener('click', () => {
            const gameStateJSON = document.getElementById('game-state-json').value;
            if (gameStateJSON) {
                try {
                    const gameState = JSON.parse(gameStateJSON);
                    console.log("Attempting to load game state:", gameState);
                    // loadGameState(gameState); // This will be implemented next
                    alert("loadGameState(gameState) is not yet implemented. Parsed state logged to console.");
                } catch (e) {
                    console.error("Error parsing game state JSON for loading:", e);
                    alert("Error parsing JSON from textarea. Check console.");
                }
            } else {
                alert("Textarea is empty. Paste a game state JSON to load.");
            }
        });
    }

    const shareTurnBtn = document.getElementById('share-turn-btn');
    if (shareTurnBtn) {
        shareTurnBtn.addEventListener('click', handleShareTurn);
    }

    // Initial AI Turn Check: If the very first player is AI, start their turn.
    // This should happen after board is initialized and state (if any) is loaded.
    if (isAIPlayer(currentPlayer)) {
        console.log(`Initial player ${currentPlayer} is AI. Starting AI turn.`);
        const rollDiceBtn = document.getElementById('roll-dice-btn');
        if(rollDiceBtn) rollDiceBtn.disabled = true;
        executeAITurn(currentPlayer);
    } else {
        // Ensure dice button is enabled if first player is human
        const rollDiceBtn = document.getElementById('roll-dice-btn');
        if(rollDiceBtn) rollDiceBtn.disabled = false;
    }

    // Theme Buttons & Load Saved Theme
    const defaultThemeBtn = document.getElementById('theme-default-btn');
    const spaceThemeBtn = document.getElementById('theme-space-btn');
    // const jungleThemeBtn = document.getElementById('theme-jungle-btn'); // If added

    if (defaultThemeBtn) {
        defaultThemeBtn.addEventListener('click', () => applyTheme('default'));
    }
    if (spaceThemeBtn) {
        spaceThemeBtn.addEventListener('click', () => applyTheme('space'));
    }
    // if (jungleThemeBtn) {
    //     jungleThemeBtn.addEventListener('click', () => applyTheme('jungle'));
    // }

    // Load saved theme or apply default
    let savedTheme = 'default';
    try {
        savedTheme = localStorage.getItem('ludoTheme') || 'default';
    } catch (e) {
        console.warn("localStorage not available, defaulting to 'default' theme.", e);
    }
    applyTheme(savedTheme);

    // Emoji Reaction Button Listeners
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emoji = button.dataset.emoji;
            // For local display, always use the current player
            // In a networked game, this would be the player who sent the reaction.
            showEmojiReaction(emoji, currentPlayer);
        });
    });

});

// Simplified player area position - relative to the ludo-board element
// These would ideally map to the center of each player's starting box area or main path entry.
// For simplicity, using percentages of the board dimensions.
const playerEmojiPositions = {
    red: { top: '75%', left: '15%' },    // Bottom-left quadrant
    green: { top: '15%', left: '75%' },  // Top-right quadrant
    yellow: { top: '75%', left: '75%' }, // Bottom-right quadrant
    blue: { top: '15%', left: '15%' }    // Top-left quadrant
};

function getPlayerEmojiPosition(playerColor) {
    return playerEmojiPositions[playerColor] || { top: '50%', left: '50%' }; // Default to center
}

function showEmojiReaction(emoji, playerColor) {
    const overlayContainer = document.getElementById('emoji-overlay-container');
    const ludoBoardElement = document.getElementById('ludo-board');

    if (!overlayContainer || !ludoBoardElement) {
        console.error("Emoji overlay container or Ludo board not found.");
        return;
    }

    const emojiDiv = document.createElement('div');
    emojiDiv.classList.add('emoji-display');
    emojiDiv.textContent = emoji;

    const position = getPlayerEmojiPosition(playerColor);

    // Calculate position relative to the ludo-board
    // The overlay is assumed to be a direct child or positioned identically to ludo-board
    emojiDiv.style.top = position.top;
    emojiDiv.style.left = position.left;
    // Adjust transform to center the emoji on its coordinates if desired
    emojiDiv.style.transform = 'translate(-50%, -50%) scale(0.5)'; // Initial state for animation

    overlayContainer.appendChild(emojiDiv);

    // Remove the emoji element after the animation completes (2.5s as defined in CSS)
    setTimeout(() => {
        if (emojiDiv.parentElement) {
            emojiDiv.parentElement.removeChild(emojiDiv);
        }
    }, 2500);
}

// Game state variables
let localPlayerId = null; // Will be set on DOMContentLoaded
let gameId = `ludo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; // Unique game ID

// AI Configuration
const aiControlledPlayers = ['green', 'yellow']; // Example: Green and Yellow are AI

let currentPlayer = 'red';
let currentDiceRoll = 0;
let selectedPiece = null;

// Player path definitions (row, col coordinates)
// These paths define the sequence of cells a piece moves along.
// Each player has 52 common cells + 5 home column cells + 1 final home cell. Total 58 steps.
const LUDO_PATH_LENGTH = 52; // Common path around the board

const playerPaths = {
    red: [],
    green: [],
    yellow: [],
    blue: []
};

// Safe cells (coordinates) - typically marked with a star
const safeCells = [
    { r: 6, c: 1 }, { r: 1, c: 8 }, { r: 8, c: 13 }, { r: 13, c: 6 }, // Player start cells
    { r: 8, c: 2 }, { r: 2, c: 6 }, { r: 6, c: 12 }, { r: 12, c: 8 }  // Other common safe cells
];

// Function to generate paths
function generatePlayerPaths() {
    // Red Path
    // Start: (6,1) -> (6,0) is technically out of bounds for a 15x15 grid if 0-indexed
    // Ludo board pathing is specific. Let's map it carefully.
    // Assuming a 15x15 grid where cells are 0-indexed (0 to 14)

    // Red path starts at (6,1)
    for (let i = 0; i < 5; i++) playerPaths.red.push({ r: 6, c: 1 + i }); // (6,1) to (6,5)
    for (let i = 0; i < 5; i++) playerPaths.red.push({ r: 5 - i, c: 6 }); // (5,6) to (1,6)
    playerPaths.red.push({ r: 0, c: 6 }); // (0,6)
    playerPaths.red.push({ r: 0, c: 7 }); // Center column top entry
    playerPaths.red.push({ r: 0, c: 8 }); // (0,8)
    for (let i = 0; i < 5; i++) playerPaths.red.push({ r: 1 + i, c: 8 }); // (1,8) to (5,8)
    for (let i = 0; i < 5; i++) playerPaths.red.push({ r: 6, c: 9 + i }); // (6,9) to (6,13)
    playerPaths.red.push({ r: 6, c: 14 }); // (6,14)
    playerPaths.red.push({ r: 7, c: 14 }); // Center row right entry
    playerPaths.red.push({ r: 8, c: 14 }); // (8,14)
    for (let i = 0; i < 5; i++) playerPaths.red.push({ r: 8, c: 13 - i }); // (8,13) to (8,9)
    for (let i = 0; i < 5; i++) playerPaths.red.push({ r: 9 + i, c: 8 }); // (9,8) to (13,8)
    playerPaths.red.push({ r: 14, c: 8 }); // (14,8)
    playerPaths.red.push({ r: 14, c: 7 }); // Center column bottom entry
    playerPaths.red.push({ r: 14, c: 6 }); // (14,6)
    for (let i = 0; i < 5; i++) playerPaths.red.push({ r: 13 - i, c: 6 }); // (13,6) to (9,6)
    for (let i = 0; i < 5; i++) playerPaths.red.push({ r: 8, c: 5 - i }); // (8,5) to (8,1)
    playerPaths.red.push({ r: 8, c: 0 }); // (8,0)
    playerPaths.red.push({ r: 7, c: 0 }); // Center row left entry (final common path cell for red)
    // Red Home Column
    for (let i = 1; i <= 6; i++) playerPaths.red.push({ r: 7, c: i }); // (7,1) to (7,6) (final home cell)

    // Green Path - offset by 13 cells from Red's path start
    const greenOffset = 13; // (52 / 4)
    for (let i = 0; i < LUDO_PATH_LENGTH; i++) {
        const redCell = playerPaths.red[i];
        let r = redCell.r, c = redCell.c;
        // This is a common way to rotate paths on a Ludo board.
        // Red (bottom-left start) -> Green (top-left start) needs (x,y) -> (y, 14-x) like transformation if board was 0,0 at corner
        // Given our coordinate system (0,0 top-left):
        // Red path starts (6,1), moves right. Green path starts (1,8), moves up.
        // (6,1) for red is like (1,8) for green if we rotate the board view.
        // Let's use a simpler, explicit definition for green path start, then shift.
        // Green path starts at (1,8)
        if (i < greenOffset) { // Placeholder, needs actual shift logic
             playerPaths.green.push(playerPaths.red[(i + greenOffset) % LUDO_PATH_LENGTH]);
        } else {
             playerPaths.green.push(playerPaths.red[(i + greenOffset) % LUDO_PATH_LENGTH]);
        }
    }
     // Green Home Column: (1,7) to (6,7)
    for (let i = 1; i <= 6; i++) playerPaths.green.push({ r: i, c: 7 });


    // Yellow Path - offset by 26 cells from Red
    const yellowOffset = 26;
    for (let i = 0; i < LUDO_PATH_LENGTH; i++) {
        playerPaths.yellow.push(playerPaths.red[(i + yellowOffset) % LUDO_PATH_LENGTH]);
    }
    // Yellow Home Column: (7,13) down to (7,8)
    for (let i = 1; i <= 6; i++) playerPaths.yellow.push({ r: 7, c: 13 - i });


    // Blue Path - offset by 39 cells from Red
    const blueOffset = 39;
    for (let i = 0; i < LUDO_PATH_LENGTH; i++) {
        playerPaths.blue.push(playerPaths.red[(i + blueOffset) % LUDO_PATH_LENGTH]);
    }
    // Blue Home Column: (13,7) up to (8,7)
    for (let i = 1; i <= 6; i++) playerPaths.blue.push({ r: 13 - i, c: 7 });

    // Correct Green path (starts (1,8), moves up, then right, etc.)
    playerPaths.green = [];
    for (let i = 0; i < 5; i++) playerPaths.green.push({ r: 1 + i, c: 8 }); // (1,8) to (5,8)
    for (let i = 0; i < 5; i++) playerPaths.green.push({ r: 6, c: 9 + i }); // (6,9) to (6,13)
    playerPaths.green.push({ r: 6, c: 14 }); // (6,14)
    playerPaths.green.push({ r: 7, c: 14 }); // Center row right entry
    playerPaths.green.push({ r: 8, c: 14 }); // (8,14)
    for (let i = 0; i < 5; i++) playerPaths.green.push({ r: 8, c: 13 - i }); // (8,13) to (8,9)
    for (let i = 0; i < 5; i++) playerPaths.green.push({ r: 9 + i, c: 8 }); // (9,8) to (13,8)
    playerPaths.green.push({ r: 14, c: 8 }); // (14,8)
    playerPaths.green.push({ r: 14, c: 7 }); // Center column bottom entry
    playerPaths.green.push({ r: 14, c: 6 }); // (14,6)
    for (let i = 0; i < 5; i++) playerPaths.green.push({ r: 13 - i, c: 6 }); // (13,6) to (9,6)
    for (let i = 0; i < 5; i++) playerPaths.green.push({ r: 8, c: 5 - i }); // (8,5) to (8,1)
    playerPaths.green.push({ r: 8, c: 0 }); // (8,0)
    playerPaths.green.push({ r: 7, c: 0 }); // Center row left entry
    playerPaths.green.push({ r: 6, c: 0 }); // (6,0)
    for (let i = 0; i < 5; i++) playerPaths.green.push({ r: 5 - i, c: 1 }); // (5,1) to (1,1) (Error in logic here, should be (6,1) path)
    // Path correction for green (and consequently yellow, blue if based on rotation)
    // The simple rotation playerPaths.red[(i + greenOffset) % LUDO_PATH_LENGTH] is generally correct if playerPaths.red is the full 52-step common path
    // Let's redefine Red's path to be exactly 52 steps for common areas first.
    playerPaths.red = [];
    // Bottom arm, moving right towards center
    for(let i=1; i<=5; i++) playerPaths.red.push({r:6, c:i}); // (6,1) to (6,5)
    // Right arm, moving up towards center
    for(let i=5; i>=1; i--) playerPaths.red.push({r:i, c:6}); // (5,6) to (1,6)
    playerPaths.red.push({r:0, c:6}); // (0,6) - Entry to top horizontal
    playerPaths.red.push({r:0, c:7}); // (0,7) - Top horizontal center
    playerPaths.red.push({r:0, c:8}); // (0,8) - Exit from top horizontal
    // Top arm, moving left towards center
    for(let i=1; i<=5; i++) playerPaths.red.push({r:i, c:8}); // (1,8) to (5,8)
    // Left arm, moving down towards center (for Red, this is Green's area)
    for(let i=1; i<=5; i++) playerPaths.red.push({r:6, c:9+i-1}); // (6,9) to (6,13)
    playerPaths.red.push({r:6, c:14}); // (6,14)
    playerPaths.red.push({r:7, c:14}); // (7,14)
    playerPaths.red.push({r:8, c:14}); // (8,14)
    // ... and so on for the full 52 steps. This is getting lengthy.
    // A more robust way is to define corner entries and relative movements.

    // Path definitions based on standard Ludo board structure
    // Red: Starts at (6,1), moves right. Home path: (7,1) to (7,6)
    // Green: Starts at (1,8), moves up. Home path: (1,7) to (6,7) (Error, Green moves up, so (1,7) to (6,7) is wrong)
    // Green home path is (r--, c=7). So (5,7), (4,7), (3,7), (2,7), (1,7), (0,7) - no, (1,7) to (6,7) for green
    // Green path starts (1,8), moves towards (0,8), then (0,7), (0,6), then (1,6)...
    // Let's use a well-established Ludo path sequence.
    // The first cell of each player's path (their "start cell")
    const P_STARTS = { red: {r:6,c:1}, green: {r:1,c:8}, yellow: {r:8,c:13}, blue: {r:13,c:6} };
    // The entry point to home column for each player
    const P_HOME_ENTRIES = { red: {r:7,c:0}, green: {r:0,c:7}, yellow: {r:7,c:14}, blue: {r:14,c:7} };

    // General path for all players (52 steps)
    const commonPath = [
        // Red's perspective starting path
        {r:6,c:1},{r:6,c:2},{r:6,c:3},{r:6,c:4},{r:6,c:5}, // Move right from red start
        {r:5,c:6},{r:4,c:6},{r:3,c:6},{r:2,c:6},{r:1,c:6}, // Move up on right side of red start block
        {r:0,c:6},{r:0,c:7},{r:0,c:8}, // Top horizontal path (left to right)
        {r:1,c:8},{r:2,c:8},{r:3,c:8},{r:4,c:8},{r:5,c:8}, // Move down on left side of green start block
        {r:6,c:9},{r:6,c:10},{r:6,c:11},{r:6,c:12},{r:6,c:13}, // Move right on top side of green start block
        {r:6,c:14},{r:7,c:14},{r:8,c:14}, // Right vertical path (top to bottom)
        {r:8,c:13},{r:8,c:12},{r:8,c:11},{r:8,c:10},{r:8,c:9}, // Move left on bottom side of yellow start block
        {r:9,c:8},{r:10,c:8},{r:11,c:8},{r:12,c:8},{r:13,c:8}, // Move down on right side of yellow start block
        {r:14,c:8},{r:14,c:7},{r:14,c:6}, // Bottom horizontal path (right to left)
        {r:13,c:6},{r:12,c:6},{r:11,c:6},{r:10,c:6},{r:9,c:6}, // Move up on left side of blue start block
        {r:8,c:5},{r:8,c:4},{r:8,c:3},{r:8,c:2},{r:8,c:1}, // Move left on top side of blue start block
        {r:8,c:0},{r:7,c:0},{r:6,c:0}  // Left vertical path (bottom to top), leads to red's home entry
    ];
    if(commonPath.length !== LUDO_PATH_LENGTH) console.error(`Common path length is not ${LUDO_PATH_LENGTH}, it is ${commonPath.length}`);


    // Red path = commonPath + red home path
    playerPaths.red = [...commonPath];
    for(let i=1; i<=6; i++) playerPaths.red.push({r:7, c:i}); // (7,1) to (7,6) - Red home

    // Green path = commonPath starting from green's start + green home path
    const greenStartIndexInCommon = commonPath.findIndex(p => p.r === P_STARTS.green.r && p.c === P_STARTS.green.c);
    playerPaths.green = [
        ...commonPath.slice(greenStartIndexInCommon),
        ...commonPath.slice(0, greenStartIndexInCommon)
    ];
    for(let i=1; i<=6; i++) playerPaths.green.push({r:i, c:7}); // (1,7) to (6,7) - Green home (r is increasing)

    // Yellow path
    const yellowStartIndexInCommon = commonPath.findIndex(p => p.r === P_STARTS.yellow.r && p.c === P_STARTS.yellow.c);
    playerPaths.yellow = [
        ...commonPath.slice(yellowStartIndexInCommon),
        ...commonPath.slice(0, yellowStartIndexInCommon)
    ];
    for(let i=1; i<=6; i++) playerPaths.yellow.push({r:7, c:13-i}); // (7,12) to (7,7) - Yellow home (c is decreasing)

    // Blue path
    const blueStartIndexInCommon = commonPath.findIndex(p => p.r === P_STARTS.blue.r && p.c === P_STARTS.blue.c);
    playerPaths.blue = [
        ...commonPath.slice(blueStartIndexInCommon),
        ...commonPath.slice(0, blueStartIndexInCommon)
    ];
    for(let i=1; i<=6; i++) playerPaths.blue.push({r:13-i, c:7}); // (12,7) to (7,7) - Blue home (r is decreasing)

    // console.log("Red Path:", playerPaths.red);
    // console.log("Green Path:", playerPaths.green);
    // console.log("Yellow Path:", playerPaths.yellow);
    // console.log("Blue Path:", playerPaths.blue);
}

// Call path generation
generatePlayerPaths();

function getGameState() {
    const playerPiecesState = [];
    document.querySelectorAll('.player-piece').forEach(pieceElement => {
        let positionValue;
        if (pieceElement.classList.contains('piece-home')) {
            positionValue = 'home';
        } else if (pieceElement.parentElement.classList.contains('start-piece-container')) {
            positionValue = -1; // In start area
        } else {
            // Ensure dataset.currentPosition is valid, otherwise default or log error
            const posAttr = pieceElement.dataset.currentPosition;
            positionValue = (posAttr !== undefined && !isNaN(parseInt(posAttr, 10))) ? parseInt(posAttr, 10) : -1; // Default to start if invalid
            if (posAttr === undefined || isNaN(parseInt(posAttr, 10))) {
                console.warn(`Piece ${pieceElement.dataset.pieceId} had invalid position: ${posAttr}. Defaulting to -1.`);
            }
        }
        playerPiecesState.push({
            id: pieceElement.dataset.pieceId,
            player: pieceElement.dataset.player,
            position: positionValue,
            // currentPosition attribute for direct DOM piece dataset is string, ensure it's correctly parsed for state
            rawPositionData: pieceElement.dataset.currentPosition
        });
    });

    return {
        gameId: gameId,
        version: "1.0.0", // Game state version
        timestamp: new Date().toISOString(),
        currentPlayer: currentPlayer,
        currentDiceRoll: currentDiceRoll, // Store null if no active roll
        playerPieces: playerPiecesState,
        // playerColors: players, // `players` is already a global const ['red', 'green', 'yellow', 'blue']
        // safeCells: safeCells, // `safeCells` is already a global const
        // paths: playerPaths // `playerPaths` is already generated globally
    };
}

function loadGameState(state) {
    if (!state || !state.playerPieces || !state.gameId) {
        console.error("Invalid game state object provided for loading.", state);
        alert("Invalid game state object. Cannot load.");
        return;
    }

    console.log("Loading game state for game ID:", state.gameId);
    gameId = state.gameId; // Restore gameId

    // Reset current board state before loading
    // 1. Send all pieces back to their start containers
    document.querySelectorAll('.player-piece').forEach(pieceElement => {
        sendPieceToStart(pieceElement); // This also resets currentPosition to -1
        pieceElement.classList.remove('piece-home', 'selected-piece'); // Remove special states
        pieceElement.addEventListener('click', handlePieceClick); // Ensure event listener is present
    });

    // 2. Set current player
    currentPlayer = state.currentPlayer || 'red';
    currentDiceRoll = state.currentDiceRoll || 0;
    selectedPiece = null; // Clear any selected piece

    // Update dice display
    const diceResultDisplay = document.getElementById('dice-result');
    if (diceResultDisplay) {
        if (currentDiceRoll > 0) {
            diceResultDisplay.textContent = `Player ${currentPlayer} rolled: ${currentDiceRoll}`;
        } else {
            diceResultDisplay.textContent = `Player ${currentPlayer}'s turn. Roll dice.`;
        }
    }

    // 3. Reposition pieces based on the loaded state
    state.playerPieces.forEach(pieceState => {
        const pieceElement = document.querySelector(`.player-piece[data-piece-id='${pieceState.id}']`);
        if (!pieceElement) {
            console.warn(`Piece element not found during load: ${pieceState.id}`);
            return;
        }

        pieceElement.dataset.currentPosition = pieceState.position; // Update data attribute first

        if (pieceState.position === 'home') {
            pieceElement.classList.add('piece-home');
            pieceElement.removeEventListener('click', handlePieceClick);
            // Visually place it in the home area (e.g., a designated div or rely on CSS to hide/mark)
            // For now, assuming it's in the last cell of its path or handled by .piece-home style
            // If it's in a cell, it should be moved from start.
            // Let's find its player's home path's last cell.
            const playerPath = playerPaths[pieceState.player];
            if (playerPath && playerPath.length > 0) {
                const homeCellCoords = playerPath[playerPath.length - 1];
                const homeCellElement = getCellElement(homeCellCoords.r, homeCellCoords.c);
                if (homeCellElement) {
                    homeCellElement.appendChild(pieceElement);
                } else {
                     console.error(`Home cell element not found for ${pieceState.id} at`, homeCellCoords);
                }
            }
        } else if (pieceState.position === -1) { // In start area
            sendPieceToStart(pieceElement); // Ensures it's in the correct start container visually
        } else if (typeof pieceState.position === 'number' && pieceState.position >= 0) { // On board path
            const playerPath = playerPaths[pieceState.player];
            if (playerPath && pieceState.position < playerPath.length) {
                const cellCoords = playerPath[pieceState.position];
                const targetCellElement = getCellElement(cellCoords.r, cellCoords.c);
                if (targetCellElement) {
                    targetCellElement.appendChild(pieceElement);
                    // Ensure piece is not styled as if in start container
                    pieceElement.style.position = 'relative';
                    pieceElement.style.top = 'auto';
                    pieceElement.style.left = 'auto';
                } else {
                    console.error(`Target cell not found for ${pieceState.id} at path index ${pieceState.position}`, cellCoords);
                    sendPieceToStart(pieceElement); // Fallback: send to start if cell invalid
                }
            } else {
                console.error(`Invalid path index ${pieceState.position} for piece ${pieceState.id}. Sending to start.`);
                sendPieceToStart(pieceElement);
            }
        }
    });

    // Update Game ID display if it changed (though typically it's set once)
    // console.log("Game state loaded. Current Game ID:", gameId);
    alert("Game state loaded!");
}

function isAIPlayer(playerColor) {
    return aiControlledPlayers.includes(playerColor);
}

function handleShareTurn() {
    if (!window.Telegram || !window.Telegram.WebApp) {
        console.error("Telegram WebApp SDK is not available. Cannot share turn.");
        alert("Share functionality is only available within Telegram and requires your bot to handle the inline query.");
        return;
    }

    const gameState = getGameState();
    const gameStateJSON = JSON.stringify(gameState);
    const encodedGameState = encodeURIComponent(gameStateJSON);

    // This is a simplified query. Ideally, your bot creates an inline button
    // with the full state in the start_param.
    const queryForBot = `ludo:${gameState.gameId.substring(0,8)}:${gameState.currentPlayer}`;

    console.log("Attempting to switchInlineQuery with query:", queryForBot);
    console.log("Full encoded state for bot (start_param):", "ludoGameState=" + encodedGameState);

    try {
        // The user types '@your_bot_username queryForBot'
        // The bot then shows an inline result (e.g., a button "Play Ludo Turn")
        // That button, when clicked, launches the Mini App with `start_param` set to "ludoGameState=" + encodedGameState
        window.Telegram.WebApp.switchInlineQuery(queryForBot, ['users', 'groups', 'channels']);
    } catch (e) {
        console.error("Error calling switchInlineQuery:", e);
        alert("Error trying to share. Check console. Ensure your bot is set up for inline queries.");
    }
}

function loadStateFromUrlOnLaunch() {
    console.log("Checking for game state in URL parameters on launch...");
    let gameStateJSON = null;
    const gameStateKey = "ludoGameState="; // Key to identify the game state in start_param

    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.start_param) {
            const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
            console.log("Found start_param:", startParam);
            if (startParam && startParam.startsWith(gameStateKey)) {
                gameStateJSON = decodeURIComponent(startParam.substring(gameStateKey.length));
                console.log("Game state found and decoded from start_param.");
            } else {
                console.log("start_param did not contain expected game state key:", startParam);
            }
        } else {
            console.log("Telegram WebApp SDK or start_param not available at launch.");
        }

        if (gameStateJSON) {
            console.log("Attempting to parse and load game state from URL's start_param.");
            const gameState = JSON.parse(gameStateJSON);
            loadGameState(gameState);
        } else {
            console.log("No game state found to load from URL parameters on launch.");
        }
    } catch (e) {
        console.error("Error loading game state from URL on launch:", e);
        // Don't alert here as it might be annoying on every launch if there's an issue or no state
    }
}


function getNextPlayer(currentPlayer) {
    const playerIndex = players.indexOf(currentPlayer);
    return players[(playerIndex + 1) % players.length];
}

function handlePieceClick(event) {
    const pieceElement = event.target.closest('.player-piece');
    if (!pieceElement) return;

    const piecePlayer = pieceElement.dataset.player;
    const pieceId = pieceElement.dataset.pieceId;

    if (piecePlayer !== currentPlayer) {
        console.log(`Not ${currentPlayer}'s turn.`);
        // Optionally provide visual feedback to the user
        return;
    }

    // Deselect any previously selected piece
    if (selectedPiece && selectedPiece.element !== pieceElement) {
        selectedPiece.element.classList.remove('selected-piece');
    }

    // Toggle selection for the current piece
    if (selectedPiece && selectedPiece.element === pieceElement) {
        pieceElement.classList.remove('selected-piece');
        selectedPiece = null;
        console.log(`Piece ${pieceId} deselected.`);
    } else {
        pieceElement.classList.add('selected-piece');
        selectedPiece = {
            element: pieceElement,
            player: piecePlayer,
            id: pieceId,
            isAtStart: !pieceElement.parentElement.classList.contains('cell') // Check if parent is a start-piece-container
        };
        console.log(`Piece ${pieceId} selected for player ${piecePlayer}. At start: ${selectedPiece.isAtStart}`);

        // Attempt to move out of home if a 6 is rolled
        if (selectedPiece.isAtStart && currentDiceRoll === 6) {
            movePieceFromStart(selectedPiece);
            // Reset dice roll to prevent using the 6 again for this piece immediately unless it's a bonus turn (not implemented yet)
            // currentDiceRoll = 0; // Or handle bonus turns for rolling a 6
            // Switch to next player or allow another roll (bonus turn for 6)
            // For now, let's assume 6 gives another roll or ends turn if piece moved out.
            // If a piece moved out, the turn action is complete.
            console.log(`Player ${currentPlayer} moved a piece out with a 6.`);
            // currentPlayer = getNextPlayer(currentPlayer); // Basic turn switch for now
            // updateTurnIndicator(); // Function to update UI for current player
            // selectedPiece.element.classList.remove('selected-piece');
            // selectedPiece = null;
            // No automatic next turn yet, let player decide if they have other 6-roll moves or to move this piece further
        } else if (!selectedPiece.isAtStart && currentDiceRoll > 0) {
            console.log(`Piece ${pieceId} is on board. Ready to move ${currentDiceRoll} steps.`);
            // Movement logic for pieces on board will be called here later
            // moveSelectedPiece(currentDiceRoll);
        }
    }
}

function movePieceFromStart(pieceToMove) {
    if (!pieceToMove || !pieceToMove.element) {
        console.error("Invalid piece to move from start.");
        return;
    }
    const player = pieceToMove.player;
    const startCellCoords = playerPaths[player][0]; // First cell in the player's path

    const targetCellElement = document.querySelector(`.cell[data-row='${startCellCoords.r}'][data-col='${startCellCoords.c}']`);
    if (targetCellElement) {
        // Remove from start container and append to cell
        const pieceElement = pieceToMove.element;
        targetCellElement.appendChild(pieceElement);
        pieceElement.style.position = 'relative'; // Or remove absolute if it was set for start area
        pieceElement.style.top = 'auto';
        pieceElement.style.left = 'auto';
        pieceToMove.isAtStart = false; // Update piece state
        console.log(`Piece ${pieceToMove.id} moved to start cell (${startCellCoords.r}, ${startCellCoords.c})`);

        // After moving from start, deselect and potentially end turn or allow bonus roll for 6
        pieceElement.classList.remove('selected-piece');
        selectedPiece = null;
        // currentDiceRoll = 0; // Consume the dice roll
        // Switch player or handle bonus for 6
        // For now, assume turn ends or player gets another roll (not fully implemented here)
        // currentPlayer = getNextPlayer(currentPlayer);
        // updateDiceDisplay(); // Update dice display if roll consumed
        // updateTurnIndicator();

        // After moving from start with a 6, player gets another turn.
        // Reset dice roll, but it's still current player's turn.
        // The dice display should prompt to roll again.
        if (currentDiceRoll === 6) {
            console.log(`Player ${currentPlayer} moved out with a 6, gets another turn!`);
            document.getElementById('dice-result').textContent = `Player ${currentPlayer} (rolled 6), roll again!`;
        }
        currentDiceRoll = 0; // Consume the 6 for this specific action
        // selectedPiece is nulled by the successful movePieceFromStart

        // Logic after a piece is moved from start
        // currentDiceRoll is 0 because it was consumed by the '6 out' move.
        // The player who rolled 6 (currentPlayer) gets another turn.
        if (isAIPlayer(currentPlayer)) {
            console.log(`AI ${currentPlayer} moved out with 6, executing bonus turn.`);
            executeAITurn(currentPlayer); // AI handles its own bonus roll.
        } else {
            console.log(`Human ${currentPlayer} moved out with 6, gets another turn.`);
            document.getElementById('dice-result').textContent = `Player ${currentPlayer} (rolled 6), roll again!`;
            const rollDiceBtn = document.getElementById('roll-dice-btn');
            if (rollDiceBtn) rollDiceBtn.disabled = false; // Enable for human's bonus roll
        }

    } else {
        console.error(`Start cell not found for player ${player} at`, startCellCoords);
    }
}

function getCellElement(row, col) {
    return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
}

function moveSelectedPieceOnBoard() {
    if (!selectedPiece || selectedPiece.isAtStart || currentDiceRoll === 0) {
        console.log("Condition for moveSelectedPieceOnBoard not met:", selectedPiece, currentDiceRoll);
        if(selectedPiece) selectedPiece.element.classList.remove('selected-piece');
        selectedPiece = null;
        // If dice was rolled but no valid piece selected or action taken, and it wasn't a 6, pass turn
        if (currentDiceRoll > 0 && currentDiceRoll !== 6) {
             console.log("Passing turn as no valid move was made with the roll.");
             currentPlayer = getNextPlayer(currentPlayer);
             document.getElementById('dice-result').textContent = `Player ${currentPlayer}'s turn. Roll dice.`;
        } else if (currentDiceRoll === 6) {
            // If it was a 6 but no move made, still player's turn to roll again.
            document.getElementById('dice-result').textContent = `Player ${currentPlayer} (rolled 6), roll again or select another piece.`;
        }
        currentDiceRoll = 0; // Reset roll if not used effectively
        return;
    }

    const piece = selectedPiece.element;
    const player = selectedPiece.player;
    let currentPathIndex = selectedPiece.currentPosition; // Already an int from handlePieceClick

    if (isNaN(currentPathIndex) || currentPathIndex < 0) {
        console.error("Piece on board has invalid currentPosition:", currentPathIndex);
        piece.classList.remove('selected-piece');
        selectedPiece = null;
        return;
    }

    const playerPath = playerPaths[player];
    const newPathIndex = currentPathIndex + currentDiceRoll;

    if (newPathIndex >= playerPath.length) {
        console.log(`Move for piece ${selectedPiece.id} is beyond path length (${newPathIndex} >= ${playerPath.length}). Piece cannot move.`);
        piece.classList.remove('selected-piece');
        if (currentDiceRoll !== 6) {
            currentPlayer = getNextPlayer(currentPlayer);
        }
        currentDiceRoll = 0;
        document.getElementById('dice-result').textContent = `Player ${currentPlayer}'s turn. Roll dice.`;
        selectedPiece = null;
        return;
    }

    const newCellCoords = playerPath[newPathIndex];
    const targetCellElement = getCellElement(newCellCoords.r, newCellCoords.c);

    if (!targetCellElement) {
        console.error("Target cell not found for move:", newCellCoords);
        piece.classList.remove('selected-piece');
        selectedPiece = null;
        return;
    }

    // Placeholder for capture logic (BEFORE moving the piece)
    checkAndHandleCaptures(targetCellElement, player, newCellCoords);

    targetCellElement.appendChild(piece); // Move the piece
    piece.dataset.currentPosition = newPathIndex;
    console.log(`Piece ${selectedPiece.id} moved from index ${currentPathIndex} to ${newPathIndex} at (${newCellCoords.r}, ${newCellCoords.c})`);

    if (newPathIndex === playerPath.length - 1) {
        piece.classList.add('piece-home');
        piece.removeEventListener('click', handlePieceClick);
        console.log(`Piece ${selectedPiece.id} reached home!`);
        // TODO: Check win condition
    }

    const rolledSix = currentDiceRoll === 6;
    currentDiceRoll = 0; // Dice roll is consumed

    if (!rolledSix) {
        currentPlayer = getNextPlayer(currentPlayer);
    } else {
        console.log(`Player ${player} rolled a 6 and moved, gets another turn!`);
    }

    document.getElementById('dice-result').textContent = `Player ${currentPlayer}'s turn. Roll dice.`;
    if(selectedPiece) selectedPiece.element.classList.remove('selected-piece'); // Deselect after successful move
    selectedPiece = null;

    // Centralized AI turn check after a move completes
    if (isAIPlayer(currentPlayer)) {
        // If it was a 6, AI gets another turn, handled by executeAITurn's own logic (it will re-roll)
        // If not a 6, player switched, and now it's AI's turn.
        executeAITurn(currentPlayer);
    } else {
        const rollDiceBtn = document.getElementById('roll-dice-btn');
        if (rollDiceBtn) rollDiceBtn.disabled = false; // Enable for human player
        console.log(`Human player ${currentPlayer}'s turn.`);
    }
}

function sendPieceToStart(pieceElement) {
    if (!pieceElement) return;
    const player = pieceElement.dataset.player;
    const startBox = document.querySelector(`.${player}-start-box`);
    if (!startBox) {
        console.error(`Start box not found for player ${player}`);
        return;
    }

    const pieceContainers = startBox.querySelectorAll('.start-piece-container');
    let emptyContainer = null;
    for (let container of pieceContainers) {
        if (container.childElementCount === 0) {
            emptyContainer = container;
            break;
        }
    }

    if (emptyContainer) {
        emptyContainer.appendChild(pieceElement);
        pieceElement.dataset.currentPosition = -1;
        // Reset visual positioning if it was absolutely positioned on board
        pieceElement.style.position = 'relative';
        pieceElement.style.top = 'auto';
        pieceElement.style.left = 'auto';
        console.log(`Piece ${pieceElement.dataset.pieceId} sent back to start for player ${player}.`);
    } else {
        // This case should ideally not be reached if game logic is correct (max 4 pieces)
        console.error(`No empty start container found for player ${player}. This indicates an issue.`);
    }
}

function isSafeCell(coords) {
    return safeCells.some(safeCell => safeCell.r === coords.r && safeCell.c === coords.c);
}

function checkAndHandleCaptures(targetCellElement, currentPlayerColor, newCellCoords) {
    if (isSafeCell(newCellCoords)) {
        console.log("Landed on a safe cell:", newCellCoords, "No captures possible.");
        return false; // No capture on safe cell
    }

    let captureOccurred = false;
    // Iterate over child elements of the target cell to find opponent pieces
    const childrenInCell = Array.from(targetCellElement.children);
    childrenInCell.forEach(otherPieceElement => {
        if (otherPieceElement.classList.contains('player-piece')) {
            const otherPlayer = otherPieceElement.dataset.player;
            // Ensure it's an opponent's piece and not the piece that just landed
            if (otherPlayer !== currentPlayerColor && otherPieceElement !== selectedPiece.element) {
                console.log(`Player ${currentPlayerColor} captured a piece from player ${otherPlayer} at (${newCellCoords.r}, ${newCellCoords.c})!`);
                sendPieceToStart(otherPieceElement);
                captureOccurred = true;
                // TODO: Implement bonus turn for capture if Ludo rules require it
                // For now, a capture doesn't grant an extra roll unless it was also a 6.
            }
        }
    });
    return captureOccurred;
}

// Modify handlePieceClick
function handlePieceClick(event) {
    const pieceElement = event.target.closest('.player-piece');
    if (!pieceElement || pieceElement.classList.contains('piece-home')) return;

    const piecePlayer = pieceElement.dataset.player;
    const pieceId = pieceElement.dataset.pieceId;

    if (piecePlayer !== currentPlayer) {
        console.log(`Not ${currentPlayer}'s turn. Click your own pieces (${currentPlayer}).`);
        return;
    }

    const isCurrentlySelected = pieceElement.classList.contains('selected-piece');
    const isAtStart = pieceElement.parentElement.classList.contains('start-piece-container');
    const currentPositionOnBoard = parseInt(pieceElement.dataset.currentPosition, 10);

    if (currentDiceRoll === 0) { // No active dice roll, just select/deselect
        if (isCurrentlySelected) {
            pieceElement.classList.remove('selected-piece');
            selectedPiece = null;
            console.log(`Piece ${pieceId} deselected.`);
        } else {
            if(selectedPiece) selectedPiece.element.classList.remove('selected-piece'); // Deselect any other
            pieceElement.classList.add('selected-piece');
            selectedPiece = { element: pieceElement, player: piecePlayer, id: pieceId, isAtStart: isAtStart, currentPosition: currentPositionOnBoard };
            console.log(`Piece ${pieceId} selected (no dice roll).`);
        }
        return;
    }

    // Active dice roll (currentDiceRoll > 0)
    // If piece was already selected and is clicked again, try to move it.
    // If a different piece is clicked, switch selection to it and then try to move it.
    if (selectedPiece && selectedPiece.element !== pieceElement) { // Switched to a different piece
        selectedPiece.element.classList.remove('selected-piece');
    }

    pieceElement.classList.add('selected-piece'); // Select the clicked piece
    selectedPiece = { element: pieceElement, player: piecePlayer, id: pieceId, isAtStart: isAtStart, currentPosition: currentPositionOnBoard };
    console.log(`Piece ${pieceId} targeted for move with roll ${currentDiceRoll}.`);

    if (isAtStart) {
        if (currentDiceRoll === 6) {
            movePieceFromStart(selectedPiece); // This will handle dice consumption and turn for "6"
        } else {
            console.log(`Piece ${pieceId} is at start, roll is not 6. Cannot move out.`);
            // Don't deselect, player might roll 6 next or want to select another piece.
            // pieceElement.classList.remove('selected-piece');
            // selectedPiece = null;
        }
    } else { // Piece is on board
        moveSelectedPieceOnBoard(); // This will handle dice consumption and turn
    }
}


// Modify initializePlayerPieces to add event listeners
function initializePlayerPieces(boardElement) {
    const startBoxes = {
        red: document.querySelector('.red-start-box'),
        green: document.querySelector('.green-start-box'),
        yellow: document.querySelector('.yellow-start-box'),
        blue: document.querySelector('.blue-start-box'),
    };

    players.forEach(player => {
        const pieceContainers = startBoxes[player].querySelectorAll('.start-piece-container');
        pieceContainers.forEach((container, index) => {
            const piece = document.createElement('div');
            piece.classList.add('player-piece', `${player}-piece`);
            piece.textContent = index + 1;
            piece.dataset.player = player;
            piece.dataset.pieceId = `${player}-${index}`;
            piece.dataset.currentPosition = -1; // -1 means in start area, 0-57 for path index

            piece.addEventListener('click', handlePieceClick); // Add click listener
            container.appendChild(piece);
        });
    });
}

// Update rollDice function
function rollDice() {
    const diceResultDisplay = document.getElementById('dice-result');
    if (!diceResultDisplay) {
        console.error("Dice result display element not found!");
        return 0;
    }
    const roll = Math.floor(Math.random() * 6) + 1;
    diceResultDisplay.textContent = `Player ${currentPlayer} rolled: ${roll}`;
    currentDiceRoll = roll; // Store the roll

    console.log(`Player ${currentPlayer} rolled a ${currentDiceRoll}`);

    // Basic check if any piece can move
    let canMove = false;
    document.querySelectorAll(`.player-piece[data-player='${currentPlayer}']`).forEach(p => {
        const isAtStart = !p.parentElement.classList.contains('cell');
        if ((isAtStart && currentDiceRoll === 6) || !isAtStart) {
            canMove = true;
        }
    });

    if (!canMove) {
        console.log(`Player ${currentPlayer} has no valid moves with a ${currentDiceRoll}.`);
        selectedPiece?.element.classList.remove('selected-piece');
        selectedPiece = null;
        const prevPlayer = currentPlayer;
        currentPlayer = getNextPlayer(currentPlayer);
        diceResultDisplay.textContent = `Player ${currentPlayer}'s turn. Roll dice. (${prevPlayer} had no moves with ${roll})`;
        currentDiceRoll = 0; // Reset for next player

        console.log(`No moves for ${prevPlayer} with ${roll}, turn passed to ${currentPlayer}`);
        if (isAIPlayer(currentPlayer)) {
            executeAITurn(currentPlayer);
        } else {
            const rollDiceBtn = document.getElementById('roll-dice-btn');
            if(rollDiceBtn) rollDiceBtn.disabled = false;
        }
    } else {
        console.log(`Player ${currentPlayer} can make a move with ${roll}. Click a piece.`);
        // If human player, ensure button is enabled for them to click piece.
        // AI turn is handled by executeAITurn.
        if (!isAIPlayer(currentPlayer)) {
            const rollDiceBtn = document.getElementById('roll-dice-btn');
            if(rollDiceBtn) rollDiceBtn.disabled = false; // Should already be, but good to ensure
        }
    }

    return roll;
}

// Add a class for selected pieces in CSS if not already present
// (This would be in style.css, but here as a comment reminder)
/*
.selected-piece {
    border: 3px solid gold;
    box-shadow: 0 0 10px gold;
}
*/

// Game logic will be added here later.
