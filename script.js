const displayTop = document.querySelector("input#top");
const displayBottom = document.querySelector("input#bottom");
const btnCalculator = document.querySelector(".buttons");
const btnHistoryClear = document.querySelector(".trash");

const state = {
  "a": null,  // number (TBH string will do, operate() will make sure it's a number)
  "b": null,  // number (TBH string will do, operate() will make sure it's a number)
  "operator": null, // string
  "currentInput": null, // string
  "tempSqrtA": null,  // string
  "tempSqrtB": null,  // string
  // using null for easier if conditions
};

const methods = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => {
    if (b === 0) {
      return "Cannot divide by zero";
    }
    return a / b;
  },
  "**": (a, b) => a ** b,
};

const operate = function (state) {
  const a = Number(state.a);
  const b = Number(state.b);

  state.tempSqrtA = null;
  state.tempSqrtB = null;

  output = methods[state.operator](a, b);

  if (Math.abs(output) > 1e-16 && Math.abs(output) < 1e16) {
    return Number(output.toPrecision(16));
  }
  return output.toExponential(8);
};

const addHistory = function (output, tempSqrtA = null, tempSqrtB = null) {
  const topSection = document.querySelector(".top");
  const list = document.querySelector(".list");
  const item = document.createElement("li");
  let displayInput = "";

  if (tempSqrtA && tempSqrtB) {
    displayInput = `${tempSqrtA} ${state.operator} ${tempSqrtB} =`;
  } else if (tempSqrtA) {
    displayInput = `${tempSqrtA} ${state.operator} ${state.b} =`;
  } else if (tempSqrtB) {
    displayInput = `${state.a} ${state.operator} ${tempSqrtB} =`;
  } else {
    displayInput = `${displayTop.value} ${state.b} =`;
  }

  item.innerHTML = `
    <p class="input gray">${displayInput}</p>
    <p class="output">${addDelimiter(`${output}`)}</p>
  `;
  list.insertBefore(item, list.firstChild);

  topSection.hidden = false;
};

const updateDisplayTop = function () {
  if (displayTop.value === "") {
    displayTop.value = `${state.a} ${state.operator}`.replace(/null/g, "");
  } else {
    const parts = displayTop.value.split(" ");
    let operator = "";

    switch (state.operator) {
      case "*":
        operator = "×";
        break;

      case "/":
        operator = "÷";
        break;

      case "**":
        operator = "^";
        break;

      default:
        operator = state.operator;
        break;
    }

    parts[1] = operator;
    displayTop.value = parts.join(" ");
  }
  
  if (state.a === null) {
    displayTop.value = "";
  }
};

const addDelimiter = function (num) {
  // If we add delimiter directly into a decimal number,
  // we will have unwanted result on the decimal number
  const parts = num.split(".");
  parts[0] = Number(parts[0]).toLocaleString("en-US");

  if (parts.length > 1) {
    return parts.join(".");
  }

  return parts[0];
};

const clearDelimiter = function (num) {
  return num.replace(/,/g, "");
};

const handleNumber = function (input) {
  if (state.a !== null && state.operator === null && state.currentInput === null) {
    // operate() was triggered by "=" and user immediately enters a new number
    displayTop.value = "";
    state.a = null;
  }

  if (state.currentInput !== null) {
    if (input === "." && state.currentInput.includes(".")) return; // only one dot
    if (state.currentInput.replace(/\./g, "").length >= 15) return; // max 15 digit
  }

  if (input === "." && (state.currentInput === null || state.currentInput === "0")) {
    state.currentInput = "0.";
  } else if (input === "0" && state.currentInput === null) {
    state.currentInput = "0";
  } else {
    state.currentInput = state.currentInput === "0" ?
    input :
    `${state.currentInput}${input}`.replace("null", "");
  }

  displayBottom.value = addDelimiter(state.currentInput);
};

const handleOperator = function (input) {
  if (state.a === null && state.currentInput !== null) {
    state.a = state.currentInput === null ? 0 : Number(state.currentInput);
    state.currentInput = null;
  } else if (state.a !== null && state.currentInput !== null) {
    state.b = Number(state.currentInput);
    state.currentInput = null;
  }

  if (state.b !== null) {
    let tempSqrtA = state.tempSqrtA;
    let tempSqrtB = state.tempSqrtB;
    const output = operate(state);
    addHistory(output, tempSqrtA, tempSqrtB);
    state.a = output;
    state.operator = input;
    
    displayTop.value = `${output} ${input}`;
    updateDisplayTop();
    displayBottom.value = addDelimiter(`${output}`);

    state.b = null;
    state.currentInput = null;
  } else {
    state.operator = input;
    displayTop.value = `${state.a} ${input}`;
    updateDisplayTop();
  }
};

const handleOtherOperator = function (input) {
  switch (input) {
    case "%":
      if (state.operator === null) return;

      if (state.operator === "+" || state.operator === "-") {
        state.currentInput = (state.a * (state.currentInput / 100)).toString();
      } else if (state.operator === "*" || state.operator === "/") {
        state.currentInput = (state.currentInput / 100).toString();
      }

      displayBottom.value = addDelimiter(`${state.currentInput}`);
      break;
  
    case "sqrt":
      if (state.currentInput === null) return;

      displayBottom.value = addDelimiter(`${Math.sqrt(state.currentInput)}`);
      
      if (state.a === null) {
        state.tempSqrtA = `√(${state.currentInput})`;
        displayTop.value += state.tempSqrtA;
        state.a = Number(clearDelimiter(displayBottom.value));
        state.currentInput = null;
      } else {
        state.tempSqrtB = `√(${state.currentInput})`;
        displayTop.value += ` ${state.tempSqrtB}`;
        state.b = Number(clearDelimiter(displayBottom.value));
        state.currentInput = clearDelimiter(displayBottom.value);
      }
      break;

    default:
      break;
  }
};

const handleFunction = function (input) {
  switch (input) {
    case "=":
      // No need to check state.operator because
      // if state.a and state.currentInput are set,
      // state.operator will always have a value. ( Refers to handleOperator() )
      if (state.a !== null && state.currentInput !== null) {
        state.b = Number(state.currentInput);
        let tempSqrtA = state.tempSqrtA;
        let tempSqrtB = state.tempSqrtB;
        const output = operate(state);
        addHistory(output, tempSqrtA, tempSqrtB);

        displayTop.value = `${state.a} ${state.operator} ${state.b} =`;
        updateDisplayTop();
        displayBottom.value = addDelimiter(`${output}`);

        state.a = output;
        state.b = null;
        state.operator = null;
        state.currentInput = null;

        // If user immediately enters a new number -> continue handleNumber() 
        //  or user immediately toggle-negative below -> check the extra if

        // If user presses an operator -> go to handleOperator() with state.a already filled
      }
      break;
      
    case "toggle-negative":
      if (displayBottom.value !== "0") {
        if (state.a !== null && state.operator === null && state.currentInput === null) {
          // operate() was triggered by "=" and user immediately press the toggle
          displayTop.value = "";
          state.a = state.currentInput;
        }

        displayBottom.value = addDelimiter(`${Number(clearDelimiter(displayBottom.value)) * -1}`);
        state.currentInput = clearDelimiter(displayBottom.value);
      }
      break;

      case "backspace":
        if (state.currentInput && state.currentInput.length > 1) {
          state.currentInput = state.currentInput.slice(0, -1);
        } else {
          state.currentInput = null;
        }
        displayTop.value = state.a ?? "a";
        updateDisplayTop();
        displayBottom.value = state.currentInput ? addDelimiter(state.currentInput) : "0";
        break;

      case "clear-entry":
        state.currentInput = null;
        displayTop.value = state.a ?? "a";
        updateDisplayTop();
        displayBottom.value = "0";
        break;

      case "all-clear":
        state.a = null;
        state.b = null;
        state.operator = null;
        state.currentInput = null;
        updateDisplayTop();
        displayBottom.value = "0";
        break;
  
    default:
      break;
  }
};

btnCalculator.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName !== "BUTTON") return;  // to prevent clicking empty spaces between buttons
  
  // compare by CSS selector
  if (target.matches(".number")) {
    handleNumber(target.id);
  } else if (target.matches(".operator")) {
    handleOperator(target.id);
  } else if (target.matches(".other-operator")) {
    handleOtherOperator(target.id);
  } else if (target.matches(".function")) {
    handleFunction(target.id);
  }
});

btnHistoryClear.addEventListener("click", () => {
  const topSection = document.querySelector(".top");
  const list = document.querySelector(".list");
  
  list.replaceChildren();
  topSection.hidden = true;
});

document.addEventListener("keydown", (event) => {
  const input = event.key;
  
  switch (input) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case ".":
      handleNumber(input);
      break;

    case "+":
    case "-":
    case "*":
    case "/":
      handleOperator(input);
      break;

    case "^":
      handleOperator("**");
      break;

    case "%":
      handleOtherOperator(input);
      break;
    case "r": // root
      handleOtherOperator("sqrt");
      break;

    case "=":
    case "Enter":
      handleFunction("=");
      break;

    case "n": // negative
      handleFunction("toggle-negative");
      break;

    case "Backspace":
      handleFunction("backspace");
      break;

    case "Escape":
      handleFunction("all-clear");
      break;

    case "c":
      handleFunction("clear-entry");
      break;

    default:
      break;
  }
});
