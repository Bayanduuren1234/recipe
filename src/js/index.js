const arr = [23, 44, 12];

let myFunction = (a) => {
  console.log(`Too bol : ${a}`);
};

const arr2 = [...arr, 44, 1223];

myFunction(arr2[1]);
