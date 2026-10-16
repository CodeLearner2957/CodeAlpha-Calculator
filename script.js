const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let expression = "";
let resultShown = false;

function updateDisplay(value) {
  display.value = value || "0";
}

function calculateExpression(input) {
  const tokens = input.match(/\d*\.?\d+|[+\-*/%]/g);

  if (!tokens || tokens.join("") !== input.replace(/\s/g, "")) {
    throw new Error("Invalid expression");
  }

  let position = 0;

  function parseNumber() {
    if (tokens[position] === "-") {
      position++;
      return -parseNumber();
    }

    if (tokens[position] === "+") {
      position++;
      return parseNumber();
    }

    const value = Number(tokens[position++]);

    if (!Number.isFinite(value)) {
      throw new Error("Invalid number");
    }

    return value;
  }

  function parseTerm() {
    let value = parseNumber();

    while (["*", "/", "%"].includes(tokens[position])) {
      const operator = tokens[position++];
      const next = parseNumber();

      if ((operator === "/" || operator === "%") && next === 0) {
        throw new Error("Cannot divide by zero");
      }

      if (operator === "*") value *= next;
      if (operator === "/") value /= next;
      if (operator === "%") value %= next;
    }

    return value;
  }

  function parseExpression() {
    let value = parseTerm();

    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];
      const next = parseTerm();

      value = operator === "+" ? value + next : value - next;
    }

    return value;
  }

  const answer = parseExpression();

  if (position !== tokens.length || !Number.isFinite(answer)) {
    throw new Error("Invalid expression");
  }

  return Number.parseFloat(answer.toPrecision(12)).toString();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action === "clear") {
    expression = "";
    resultShown = false;
    updateDisplay("0");
    return;
  }

  if (action === "delete") {
    if (resultShown) {
      expression = "";
      resultShown = false;
    } else {
      expression = expression.slice(0, -1);
    }

    updateDisplay(expression);
    return;
  }

  if (action === "calculate") {
    if (!expression) return;

    try {
      expression = calculateExpression(expression);
      updateDisplay(expression);
      resultShown = true;
    } catch {
      updateDisplay("Error");
      expression = "";
      resultShown = false;
    }

    return;
  }

  if (!value) return;

  if (resultShown) {
    if ("+-*/%".includes(value)) {
      resultShown = false;
    } else {
      expression = "";
      resultShown = false;
    }
  }

  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/%]/).pop();

    if (currentNumber.includes(".")) return;
    if (!currentNumber) expression += "0";
  }

  expression += value;
  updateDisplay(expression);
});

// Keyboard support
document.addEventListener("keydown", (event) => {
  if (/^[0-9.]$/.test(event.key)) {
    event.preventDefault();
    buttons.querySelector(`[data-value="${event.key}"]`)?.click();
  } else if (["+", "-", "*", "/", "%"].includes(event.key)) {
    event.preventDefault();
    buttons.querySelector(`[data-value="${event.key}"]`)?.click();
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    buttons.querySelector('[data-action="calculate"]').click();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    buttons.querySelector('[data-action="delete"]').click();
  } else if (event.key === "Escape") {
    buttons.querySelector('[data-action="clear"]').click();
  }
});