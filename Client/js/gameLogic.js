const gridContainer = document.getElementById('grid');
const words = JSON.parse(localStorage.getItem('words')) || [];
const gridSize = parseInt(localStorage.getItem('gridSize'));
let currentSolution = [];
let foundWords = new Set();
let solutions = [];

// Fetch the puzzle from the server
fetch('/generatePuzzle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words, gridSize }) // Sends data to the server as JSON string
})
    .then(response => response.json()) // Parses the JSON data in the server's response into a js object
    .then(data => {  // Handles the parsed JSON data from the server (grid and solution)
        const { grid, solution } = data;
        currentSolution = solution;
        solutions = solution;

        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Styling
        // Loop that renders each cell of the grid
        grid.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const cell = document.createElement('div'); // Creates <div> element to represent each cell
                cell.className = 'cell'; // Styling in CSS
                cell.textContent = letter; // Sets the cell’s text to the corresponding grid letter
                // Stores the letters, row and column indexes as data attributes for later use 
                cell.dataset.letter = letter;
                cell.dataset.x = colIndex;
                cell.dataset.y = rowIndex;
                gridContainer.appendChild(cell); // Appends the final cell element to the gridContainer, rendering it on the webpage
            });
        });
    })
    .catch(error => console.error('Error generating puzzle:', error));

// Highlight letters on click
gridContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('cell')) {
        event.target.classList.toggle('highlighted');
    }
});


// Function to verify if the selected (highlighted) letters form one of the words
function verifyWord() {
    const highlightedCells = Array.from(document.querySelectorAll('.cell.highlighted'));
    const selectedWord = highlightedCells.map(cell => cell.textContent).join('').toUpperCase();

    if (highlightedCells.length < 2) {
        alert("Please select more than one letter.");
        return;
    }

    // Extract positions from highlighted cells
    const selectedPositions = highlightedCells.map((cell) => ({
        x: parseInt(cell.dataset.x),
        y: parseInt(cell.dataset.y),
    }));

    // Check if the selected word matches any solution in terms of text and position
    const matchingSolution = solutions.find(
        (sol) =>
            sol.word.toUpperCase() === selectedWord &&
            JSON.stringify(sol.positions) === JSON.stringify(selectedPositions)
    );

    if (matchingSolution) {
        alert(`Correct! You found the word: ${selectedWord}`);
        foundWords.add(selectedWord);

        // Mark cells as confirmed and keep them highlighted
        highlightedCells.forEach((cell) => {
            cell.classList.remove('highlighted');
            cell.classList.add('confirmed');
            cell.style.backgroundColor = '#00ff00';
            cell.style.color = 'white';
        });

        // Check if all words have been found to proceed to victory
        if (foundWords.size === words.length) {
            alert("You found all the words! Redirecting to victory...");
            window.location.href = '/victory';
        }
    } else {
        alert("Incorrect selection. Try again.");
    }
}

// Function to show solution while holding the solution button
function showSolution(show) {
    const cells = document.querySelectorAll('.cell');

    if (show) {
        console.log('Showing solution:', solutions);

        // Highlight all solution positions
        solutions.forEach(({ word, positions }) => {
            if (!positions || positions.length === 0) {
                console.error(`Error: Missing positions for word "${word}":`, positions);
                return;
            }

            positions.forEach(({ x, y }) => {
                const cell = document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
                if (cell) {
                    cell.style.color = 'white';
                } else {
                    console.error(`Error: Cell at (${x}, ${y}) not found.`);
                }
            });
        });
    } else {
        console.log('Hiding solution...');

        // Restore the grid colors
        cells.forEach(cell => {
            if (!cell.classList.contains('confirmed')) { 
                cell.style.color = '';
            }
        });
    }
}
