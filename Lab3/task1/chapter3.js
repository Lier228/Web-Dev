/** DEBUGGING */
function hello(name) {
    let phrase = `Hello, ${name}!`;
    debugger;  // <-- the debugger stops here
    say(phrase);
}

for (let i = 0; i < 5; i++) {
    console.log("value,", i);
}

/** CODING STYLE */
if (n < 0) {
    alert(`Power ${n} is not supported`);
}

// backtick quotes ` allow to split the string into multiple lines
let str = `
  ECMA International's TC39 is a group of JavaScript developers,
  implementers, academics, and more, collaborating with the community
  to maintain and evolve the definition of JavaScript.
`;

if (
    id === 123 &&
    moonPhase === 'Waning Gibbous' &&
    zodiacSign === 'Libra'
) {
    letTheSorceryBegin();
}

show(parameters,
    aligned, // 5 spaces padding at the left
    one,
    after,
    another); {

}

function pow(x, n) {
    let result = 1;
    //              <--
    for (let i = 0; i < n; i++) {
        result *= x;
    }
    //              <--
    return result;
}

function pow(x, n) {
    if (n < 0) {
        alert("Negative 'n' not supported");
    } else {
        let result = 1;

        for (let i = 0; i < n; i++) {
            result *= x;
        }

        return result;
    }
}

function pow(x, n) {
    if (n < 0) {
        alert("Negative 'n' not supported");
        return;
    }
    let result = 1;
    for (let i = 0; i < n; i++) {
        result *= x;
    }
    return result;
}

// 1. Declare the functions above the code that uses them
// 2. Code first, then functions
// 3. Mixed: a function is declared where it’s first used.

function pow(x, n) {
    let result = 1;
    for (let i = 0; i < n; i++) {
        result *= x;
    }
    return result;
}
let x = prompt("x?", "");
let n = prompt("n?", "");
if (n <= 0) {
    alert(`Power ${n} is not supported,
    please enter an integer number greater than zero`);
}
else {
    alert( pow(x, n) );
}


/** COMMENTS */
// if we have a long “code sheet” like this:
// here we add whiskey
for(let i = 0; i < 10; i++) {
    let drop = getWhiskey();
    smell(drop);
    add(drop, glass);
}

// here we add juice
for(let t = 0; t < 3; t++) {
    let tomato = getTomato();
    examine(tomato);
    let juice = press(tomato);
    add(juice, glass);
}
// better variant to refactor it into functions like:
addWhiskey(glass);
addJuice(glass);
function addWhiskey(container) {
    for(let i = 0; i < 10; i++) {
        let drop = getWhiskey();
        //...
    }
}

function addJuice(container) {
    for(let t = 0; t < 3; t++) {
        let tomato = getTomato();
        //...
    }
}

// good comment
/**
 * Returns x raised to the n-th power.
 *
 * @param {number} x The number to raise.
 * @param {number} n The power, must be a natural number.
 * @return {number} x raised to the n-th power.
 */
function pow(x, n) {

}


/** NINJA CODE */
// taken from a well-known javascript library
i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

function ninjaFunction(elem) {
    // 20 lines of code working with elem
    elem = clone(elem);
    // 20 more lines, now working with the clone of the elem!
}

let user = authenticateUser();

function render() {
    let user = anotherValue();
//   ...
//   ...many lines...
//   ...
//   ...  <-- a programmer wants to work with user here and...
//   ...
}


/** AUTOMATED TESTING WITH MOCHA */
describe("pow", function() {
    it("raises to n-th power", function() {
        assert.equal(pow(2, 3), 8);
    });
});