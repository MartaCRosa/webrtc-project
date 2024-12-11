// DOM Elements
const gridContainer = document.getElementById('grid');
const words = JSON.parse(localStorage.getItem('words')) || [];
const gridSize = parseInt(localStorage.getItem('gridSize'));
let currentSolution = [];
let foundWords = new Set();

// Fetch the puzzle from the server
fetch('/generatePuzzle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words, gridSize })
})
    .then(response => response.json())
    .then(data => {
        const { grid, solution } = data;
        currentSolution = solution;

        // Render the grid
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        grid.forEach(row => {
            row.forEach(letter => {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = letter;
                cell.dataset.letter = letter;
                gridContainer.appendChild(cell);
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

// Verify if the selected letters form a word
function verifyWord() {
    const highlightedCells = Array.from(document.querySelectorAll('.cell.highlighted'));
    const selectedWord = highlightedCells.map(cell => cell.textContent).join('').toUpperCase();

    if (words.includes(selectedWord) && !foundWords.has(selectedWord)) {
        alert(`Correct! ${selectedWord} found.`);
        foundWords.add(selectedWord);

        // Mark the cells as confirmed
        highlightedCells.forEach(cell => {
            cell.classList.remove('highlighted');
            cell.classList.add('confirmed');
        });

        // Check for victory condition
        if (foundWords.size === words.length) {
            alert("You found all the words! Redirecting to victory...");
            window.location.href = '/victory';
        }
    } else {
        alert("Incorrect or already found! Try again.");
    }
}

// Show solution while holding the button
function showSolution(show) {
    const cells = document.querySelectorAll('.cell');
    if (show) {
        cells.forEach(cell => {
            const letter = cell.textContent;
            cell.style.color = words.some(word => word.includes(letter)) ? 'white' : 'transparent';
        });
    } else {
        cells.forEach(cell => {
            cell.style.color = ''; // Reset to default
        });
    }
}