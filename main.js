document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const expressionDisplay = document.getElementById('expression-display');
    const buttons = document.querySelectorAll('.calc-btn');
    let currentInput = '';
    let previousInput = '';
    let operation = null;
    let shouldResetDisplay = false;

    const calculate = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '×': (a, b) => a * b,
        '÷': (a, b) => b === 0 ? 'Error' : a / b,
        '%': (a) => a / 100
    };

    // Add function to format numbers with commas
    function formatNumber(num) {
        if (num === 'Error') return num;
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    // Update display function
    function updateDisplay(value) {
        display.value = formatNumber(value);
        adjustDisplayFontSize();
    }

    // Add this function to update the expression display
    function updateExpressionDisplay() {
        if (previousInput && operation) {
            expressionDisplay.textContent = `${formatNumber(previousInput)} ${operation}`;
        } else {
            expressionDisplay.textContent = '';
        }
    }

    // Function to adjust display font size
    function adjustDisplayFontSize() {
        const length = display.value.length;
        
        // Reset font size first
        display.style.fontSize = '1.75rem';
        
        // Adjust font size based on length
        if (length > 8) {
            display.style.fontSize = '1.5rem';
        }
        if (length > 12) {
            display.style.fontSize = '1.25rem';
        }
        if (length > 16) {
            display.style.fontSize = '1rem';
        }
    }

    // Add history functionality
    const calculations = [];
    const MAX_HISTORY = 10; // Increased max history items

    function addToHistory(expression, result) {
        calculations.unshift({
            expression,
            result,
            timestamp: new Date().toLocaleTimeString()
        });
        if (calculations.length > MAX_HISTORY) {
            calculations.pop();
        }
        updateHistoryList();
    }

    function updateHistoryList() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        historyList.innerHTML = calculations.length === 0 
            ? '<div class="history-empty">There\'s no history yet</div>'
            : calculations.map(calc => `
                <div class="history-item" data-result="${calc.result}">
                    <div class="history-expression">${calc.expression}</div>
                    <div class="history-result">=</div>
                    <div class="history-answer">${formatNumber(calc.result)}</div>
                    <small class="history-time">${calc.timestamp}</small>
                </div>
            `).join('');

        // Add click handlers to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const result = item.dataset.result;
                if (result) {
                    currentInput = result;
                    updateDisplay(currentInput);
                    historyModal.classList.remove('show');
                }
            });
        });
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;

            // Handle numbers and decimal
            if (!isNaN(value) || value === '.') {
                if (shouldResetDisplay) {
                    currentInput = '';
                    shouldResetDisplay = false;
                }
                if (value === '.' && currentInput.includes('.')) return;
                currentInput += value;
                updateDisplay(currentInput);
                updateExpressionDisplay();
            }
            // Handle operations
            else {
                switch (value) {
                    case 'AC':
                        currentInput = '';
                        previousInput = '';
                        operation = null;
                        updateDisplay('0');
                        expressionDisplay.textContent = '';
                        break;

                    case '+/-':
                        currentInput = (parseFloat(currentInput) * -1).toString();
                        updateDisplay(currentInput);
                        break;

                    case '%':
                        currentInput = calculate['%'](parseFloat(currentInput)).toString();
                        updateDisplay(currentInput);
                        break;

                    case '=':
                        if (operation && previousInput && currentInput) {
                            const expression = `${formatNumber(previousInput)} ${operation} ${formatNumber(currentInput)}`;
                            const result = calculate[operation](
                                parseFloat(previousInput),
                                parseFloat(currentInput)
                            );
                            currentInput = result.toString();
                            updateDisplay(currentInput);
                            addToHistory(expression, result); // Add calculation to history
                            previousInput = '';
                            operation = null;
                        }
                        break;

                    default: // For operators (+, -, ×, ÷)
                        if (currentInput) {
                            if (previousInput && operation) {
                                currentInput = calculate[operation](
                                    parseFloat(previousInput),
                                    parseFloat(currentInput)
                                ).toString();
                                updateDisplay(currentInput);
                            }
                            previousInput = currentInput;
                            operation = value;
                            shouldResetDisplay = true;
                            updateExpressionDisplay();
                        }
                }
            }
        });
    });

    // History Controls
    const historyTrigger = document.getElementById('historyTrigger');
    const historyModal = document.getElementById('historyModal');
    const closeHistory = document.getElementById('closeHistory');

    historyTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        historyModal.classList.add('show');
    });

    closeHistory.addEventListener('click', () => {
        historyModal.classList.remove('show');
    });

    // Optional: Close history when clicking outside
    document.addEventListener('click', (e) => {
        if (!historyModal.contains(e.target) && 
            !historyTrigger.contains(e.target) && 
            historyModal.classList.contains('show')) {
            historyModal.classList.remove('show');
        }
    });
});

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');

// Check for saved theme preference or default to 'light'
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'dark';

// Handle theme toggle
themeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});