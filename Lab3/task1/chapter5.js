/** METHODS OF PRIMITIVES */
let john = {
    name: "John",
    sayHi: function() {
        alert("Hi buddy!");
    }
};
john.sayHi(); // Hi buddy!


let str = "Hello";
alert( str.toUpperCase() ); // HELLO

let n = 1.23456;
alert( n.toFixed(2) ); // 1.23

alert( typeof 0 ); // "number"
alert( typeof new Number(0) ); // "object"!

let zero = new Number(0);
if (zero) { // zero is true, because it's an object
    alert( "zero is truthy!?!" );
}

let num = Number("123");

alert(null.test); // error

str = "Hello";
str.test = 5;
alert(str.test); // res may be: undefined (no strict mode) or an error (strict mode).

/** NUMBERS */

let billion = 1000000000;
billion = 1_000_000_000;

billion = 1e9;  // 1 billion, literally: 1 and 9 zeroes
alert( 7.3e9 );  // 7.3 billions (same as 7300000000 or 7_300_000_000)

1e3 === 1 * 1000; // e3 means *1000
1.23e6 === 1.23 * 1000000; // e6 means *1000000

let mcs = 0.000001;
mcs = 1e-6; // five zeroes to the left from 1

// -3 divides by 1 with 3 zeroes
1e-3 === 1 / 1000; // 0.001

// -6 divides by 1 with 6 zeroes
1.23e-6 === 1.23 / 1000000; // 0.00000123

// an example with a bigger number
1234e-2 === 1234 / 100; // 12.34, decimal point moves 2 times

alert( 0xff ); // 255
alert( 0xFF ); // 255 (the same, case doesn't matter)

let a = 0b11111111; // binary form of 255
let b = 0o377; // octal form of 255
alert( a == b ); // true, the same number 255 at both sides

num = 255;
alert( num.toString(16) );  // ff
alert( num.toString(2) );   // 11111111

alert( 123456..toString(36) ); // 2n9c