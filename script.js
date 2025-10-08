const add = function (a, b) {
  return a + b;
};

const subtract = function (a, b) {
  return a - b;
};

const multiply = function (a, b) {
  return a * b;
};

const divide = function (a, b) {
  return a / b;
};

const operate = function (input) {
  const [a, operator, b] = convertOperation(input);

  switch (operator) {
    case "+":
      return add(a, b);
      break;

    case "-":
      return subtract(a, b);
      break;
      
    case "*":
      return multiply(a, b);
      break;
      
    case "/":
      return divide(a, b);
      break;
  }
};

const state = {
  allInput: "",
  currentNumber: "0",
};

const displayTop = document.querySelector("#top");
const displayBottom = document.querySelector("#bottom");
const btnCalculator = document.querySelector(".buttons")
const btnClear = document.querySelector(".trash");

const convertOperation = function (string) {
  const parts = string.split(" ");
  const a = parseFloat(parts[0]);
  const operator = parts[1];
  const b = parseFloat(parts[2]);

  return [a, operator, b];
}

const updateDisplay = function () {
  displayTop.value = state.allInput;
  displayBottom.value = state.currentNumber;
}

const addHistory = function (operation, output) {
  const topSection = document.querySelector(".top");
  const list = document.querySelector(".list");
  const item = document.createElement("li");
  const [a, operator, b] = convertOperation(operation);

  item.innerHTML = `
    <p class="input">${a} ${operator} ${b} =</p>
    <p class="output">${output}</p>
  `;
  list.insertBefore(item, list.firstChild);

  topSection.hidden = false;
}

const handleNumber = function (input) {
  if (input === "." && state.currentNumber.includes(".")) return; // only one dot
  if (displayBottom.value.replace(/\./g, "").length >= 16) return; // max 16 digit

  if (input === "." && state.currentNumber === "0") {
    state.currentNumber = "0.";
  } else {
    state.currentNumber = state.currentNumber === "0" ? input : `${state.currentNumber}${input}`;
  }

  updateDisplay();
}

const handleOperator = function (op) {
  let parts = state.allInput.split(" ");

  if (parts.length === 1) {
    state.allInput = `${displayBottom.value}`;
    parts = state.allInput.split(" ");
  }
  
  if (parts.length === 3 && state.currentNumber !== "0") {
    state.allInput += state.currentNumber;
    handleFunction("=");
    state.allInput += ` ${op} `;
  } else {
    state.allInput = `${parts[0]} ${op} `;
  }

  state.currentNumber = "0";
  updateDisplay();
}

const handleFunction = function (fn) {
  switch (fn) {
    case "=":
      let parts = state.allInput.trim().split(" ");

      if (parts.length === 2) {
        state.allInput += state.currentNumber;
        parts = state.allInput.trim().split(" ");
      }

      if (parts.length === 3 && parts[2] !== "") {
        let result = operate(state.allInput);
        addHistory(state.allInput, result);

        state.allInput = result.toString();
        state.currentNumber = result.toString();
        updateDisplay();

        state.currentNumber = "0";
      }
      break;

    case "ac":
      state.allInput = "";
      state.currentNumber = "0";
      updateDisplay();
      break;

    case "c":
      if (state.currentNumber.length > 1) {
        state.currentNumber = state.currentNumber.slice(0, -1);
      } else {
        state.currentNumber = "0";
      }
      updateDisplay();
      break;

    case "ce":
      state.currentNumber = "0";
      updateDisplay();
      break;

    case "toggle-negative":
      if (displayBottom.value !== "0") {
        state.currentNumber = (parseFloat(displayBottom.value) * -1).toString();
        updateDisplay();
      }
      break;

    default:
      console.log("function not handled:", fn);
  }
}

btnCalculator.addEventListener("click", (e) => {
  const target = e.target;
  if (!target.tagName === "button") return;

  if (target.classList.contains("number")) {
    handleNumber(target.id);
  } else if (target.classList.contains("operator")) {
    handleOperator(target.id);
  } else if (target.classList.contains("function")) {
    handleFunction(target.id);
  }
});

btnClear.addEventListener("click", (e) => {
  const topSection = document.querySelector(".top");
  const list = document.querySelector(".list");

  topSection.hidden = true;
  list.replaceChildren();
});

updateDisplay();
