const method = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

const operate = function (a, operator, b) {
  a = Number(a);
  b = Number(b);

  return method[operator](a, b);
}

console.log("add 6 and 2 = ", operate(6, "+", 2));
console.log("subtract 6 and 2 = ", operate(6, "-", 2));
console.log("multiply 6 and 2 = ", operate(6, "*", 2));
console.log("divide 6 and 2 = ", operate(6, "/", 2));
