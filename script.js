const add = function (a, b) {
  return a + b;
}

const subtract = function (a, b) {
  return a - b;
}

const multiply = function (a, b) {
  return a * b;
}

const divide = function (a, b) {
  return a / b;
}

const operate = function (input) {
  let split = input.split(" ");
  let a = Number(split[0]);
  let operator = split[1];
  let b = Number(split[2]);

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
}

console.log("add 6 and 2 = ", operate("6 + 2"));
console.log("subtract 6 and 2 = ", operate("6 - 2"));
console.log("multiply 6 and 2 = ", operate("6 * 2"));
console.log("divide 6 and 2 = ", operate("6 / 2"));
