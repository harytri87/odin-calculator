const displayTop = document.querySelector("input#top");
const displayBottom = document.querySelector("input#bottom");
const btnCalculator = document.querySelector(".buttons");
const btnHistoryClear = document.querySelector(".trash");

const state = {
  "a": null,  // string when first time assigned from currentInput, then becomes a number after operate()
  "b": null,  // string (becomes null immediately after each operation)
  "operator": null, // string
  "currentInput": null, // string
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
};

const operate = function (state) {
  const a = Number(state.a);
  const b = Number(state.b);

  return methods[state.operator](a, b);
};

const addHistory = function (output) {
  const topSection = document.querySelector(".top");
  const list = document.querySelector(".list");
  const item = document.createElement("li");

  let displayInput = separateDisplayTop();

  item.innerHTML = `
    <p class="input gray">${displayInput}</p>
    <p class="output">${output}</p>
  `;
  list.insertBefore(item, list.firstChild);

  topSection.hidden = false;
};

const separateDisplayTop = function () {
  // Using this weird split because:
  // with some operations (like √),
  // the values in the state variables are different from displayTop.value.
  // For clarity to the user, we rely on displayTop.value instead.

  const parts = displayTop.value.split(" ");
  a = Number(parts[0]);
  b = Number(state.b);
  
  let displayInput = "";

  if (parts.length > 2) {
    displayInput = `${a} ${state.operator} ${parts[2]} =`;  // other operations
  } else {
    displayInput = `${a} ${state.operator} ${b} =`; // basic operations
  }

  return displayInput;
};

const updateDisplay = function () {
  displayTop.value = `${state.a} ${state.operator}`.replace(/null/g, "");
  displayBottom.value = state.currentInput ?? "0";
};

const handleNumber = function (input) {
  if (state.a !== null && state.operator === null && state.currentInput === null) {
    // operate() was triggered by "=" and user immediately enters a new number
    displayTop.value = "";
    state.a = null;
  }

  if (state.currentInput !== null) {
    if (input === "." && state.currentInput.includes(".")) return; // only one dot
    if (state.currentInput.replace(/\./g, "").length >= 16) return; // max 16 digit
  }

  if (input === "." && state.currentInput === null) {
    state.currentInput = "0.";
  } else if (input === "0" && state.currentInput === null) {
    state.currentInput = "0";
  } else {
    state.currentInput = state.currentInput === "0" ?
    input :
    `${state.currentInput}${input}`.replace("null", "");
  }
  // If the data type is a number, we can’t store the input as "0.123", it will always become ".123". Idk why.
  // Also since the inputs behave more like string (typed digit by digit and concatenated),
  // so we store them as strings anyway.

  displayBottom.value = state.currentInput;
};

const handleOperator = function (input) {
  if (state.a === null) {
    state.a = state.currentInput === null ? 0 : state.currentInput;
    state.currentInput = null;
  } else {
    state.b = state.currentInput;
    state.currentInput = null;
  }

  if (state.b !== null) {
    const output = operate(state);
    addHistory(output);

    displayTop.value = `${output} ${input}`;
    displayBottom.value = output;

    state.a = output;
    state.b = null;
    state.operator = input;
    state.currentInput = null;
  } else {
    state.operator = input;
    displayTop.value = `${state.a} ${input}`;
  }
};

const handleFunction = function (input) {
  switch (input) {
    case "=":
      // No need to check state.operator because
      // if state.a and state.currentInput are set,
      // state.operator will always have a value. ( Refers to handleOperator() )
      if (state.a !== null && state.currentInput !== null) {
        state.b = state.currentInput;
        const output = operate(state);
        addHistory(output);

        displayTop.value = separateDisplayTop();
        displayBottom.value = output;

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

        displayBottom.value = Number(displayBottom.value) * -1;
        state.currentInput = displayBottom.value
      }
      break;

      case "backspace":
        if (state.currentInput && state.currentInput.length > 1) {
          state.currentInput = state.currentInput.slice(0, -1);
        } else {
          state.currentInput = null;
        }
        updateDisplay();
        break;

      case "clear-entry":
        state.currentInput = null;
        updateDisplay();
        break;

      case "all-clear":
        state.a = null;
        state.b = null;
        state.operator = null;
        state.currentInput = null;
        updateDisplay();
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
