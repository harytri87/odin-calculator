const displayTop = document.querySelector("input#top");
const displayBottom = document.querySelector("input#bottom");
const btnCalculator = document.querySelector(".buttons");
const btnHistoryClear = document.querySelector(".trash");

const state = {
  "a": null,  // string when first time assigned from currentInput, then becomes a number after operate()
  "b": null,  // string (becomes null immediately after each operation)
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
  return methods[state.operator](a, b);
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
    <p class="output">${output}</p>
  `;
  list.insertBefore(item, list.firstChild);

  topSection.hidden = false;
};

const updateDisplayTop = function () {
  if (displayTop.value === "") {
    displayTop.value = `${state.a} ${state.operator}`.replace(/null/g, "");
  } else {
    const parts = displayTop.value.split(" ");

    parts[1] = state.operator === "**" ? "^" : state.operator;

    displayTop.value = parts.join(" ");
  }
  
  if (state.a === null) {
    displayTop.value = "";
  }
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
    displayBottom.value = output;

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
        displayBottom.value = state.currentInput;
      } else if (state.operator === "*" || state.operator === "/") {
        state.currentInput = (state.currentInput / 100).toString();
        displayBottom.value = state.currentInput;
      }
      break;
  
    case "sqrt":
      if (state.currentInput === null) return;

      displayBottom.value = Math.sqrt(state.currentInput);
      
      if (state.a === null) {
        state.tempSqrtA = `√(${state.currentInput})`;
        displayTop.value += state.tempSqrtA;
        state.a = displayBottom.value;
        state.currentInput = null;
      } else {
        state.tempSqrtB = `√(${state.currentInput})`;
        displayTop.value += ` ${state.tempSqrtB}`;
        state.b = displayBottom.value;
        state.currentInput = displayBottom.value;
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
        state.b = state.currentInput;
        let tempSqrtA = state.tempSqrtA;
        let tempSqrtB = state.tempSqrtB;
        const output = operate(state);
        addHistory(output, tempSqrtA, tempSqrtB);

        displayTop.value = `${state.a} ${state.operator} ${state.b} =`;
        updateDisplayTop();
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
        displayTop.value = state.a ?? "a";
        updateDisplayTop();
        displayBottom.value = state.currentInput ?? "0";
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
