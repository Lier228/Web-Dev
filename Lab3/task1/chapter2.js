"use strict";

alert(3 +
    1
    + 2);

alert("Hello");
[1, 2].forEach(alert);

let message;
message = 'Hello!';

alert(message);

let apple, APPLE; // apple != APPLE

const BIRTHDAY = '18.04.1982';
const age = someCode(BIRTHDAY);


let admin, u_name;
u_name = "John";
admin = u_name;
alert( admin );

let ourPlanetName = "Earth";
let currentUserName = "John";

let message_ = "hello";
message_ = 123456;

let n = 123;
n = 12.345;

alert( 1 / 0 );

alert( "not a number" / 2 );

const bigInt = 1234567890123456789012345678901234567890n;

let str = "Hello";
let str2 = 'Single quotes are ok too';
let phrase = 'can embed another ${str}';
alert(phrase);

let nameFieldChecked = true;
let isGreater = 4 > 1;
alert( isGreater );

alert(age);
age = undefined;
alert(age);

typeof undefined // "undefined"
typeof 0 // "number"
typeof 10n // "bigint"
typeof true // "boolean"
typeof "foo" // "string"
typeof Symbol("id") // "symbol"
typeof Math // "object"  (1)
typeof null // "object"  (2)
typeof alert // "function"  (3)


alert( `hello ${1}` );
alert( `hello ${"name"}` );
alert( `hello ${name}` );

age = prompt('How old are you?', 100);
alert('You are ${age} years old!');

let test = prompt("Test", '');

let isBoss = confirm("Are you the boss?");
alert( isBoss );

let name = prompt("What is your name?", "");
alert(name);



let value = true;
alert(typeof value); // boolean
value = String(value); // now value is a string "true"
alert(typeof value); // string

let strs = "123";
alert(typeof strs); // string
let num = Number(strs); // becomes a number 123
alert(typeof num); // number

let ages = Number("an arbitrary string instead of a number");
alert(ages); // NaN, conversion failed
alert( Number("   123   ") ); // 123
alert( Number("123z") );      // NaN (error reading a number at "z")
alert( Number(true) );        // 1
alert( Number(false) );       // 0

alert( Boolean(1) ); // true
alert( Boolean(0) ); // false

alert( Boolean("hello") ); // true
alert( Boolean("") ); // false

let x = 1;
x = -x;
alert( x );
let y = 3;
alert( y - x );
alert( 5 % 2 );
alert( 2 ** 2 );
alert( 4 ** (1/2) );

let s = "my" + "string";
alert(s);
alert( '1' + 2 ); // "12"
alert(2 + 2 + '1' ); // "41" and not "221"
alert( 6 - '2' ); // 4, converts '2' to a number
alert( '6' / '2' ); // 3, converts both operands to numbers

y = -2;
alert( +y );
alert( +true ); // 1
alert( +"" );   // 0

let apples = "2";
let oranges = "3";
alert( +apples + +oranges ); // 5

x = 2 * 2 + 1;
alert( x );

a = b = c = 2 + 2;
alert( a );
alert( b );
alert( c );
c = 2 + 2;
b = c;
a = c;

counter = 1;
a = ++counter;
counter = 1;
a = counter++;
alert(a);

counter = 0;
counter++;
++counter;
alert( counter );

counter = 1;
alert( 2 * ++counter );
counter = 1;
alert( 2 * counter++ );



a = 1, b = 1;
alert( ++a ); // 2, prefix form returns the new value
alert( b++ ); // 1, postfix form returns the old value
alert( a ); // 2, incremented once
alert( b ); // 2, incremented once

"" + 1 + 0 // "10"
"" - 1 + 0 // -1
true + false // 1
6 / "3" // 2
"2" * "3" // 6
4 + 5 + "px" // "9px"
"$" + 4 + 5 // "$45"
"4" - 2 // 2
"4px" - 2 // NaN
"  -9  " + 5 // "  -9  5"
"  -9  " - 5 // -14
null + 1 // 1
undefined + 1 // NaN
" \t \n" - 2 // -2

a = "1";
b = "2";
alert(a + b);
a = +prompt("First number?", 1);
b = +prompt("Second number?", 2);
alert(a + b);
a = prompt("First number?", 1);
b = prompt("Second number?", 2);
alert(+a + +b);



alert( 2 > 1 );
alert( 2 == 1 );
alert( 2 != 1 );

result = 5 > 4; // assign the result of the comparison
alert( result ); // true

alert( 'Z' > 'A' ); // true
alert( 'Glow' > 'Glee' ); // true
alert( 'Bee' > 'Be' ); // true

alert( '2' > 1 ); // true, string '2' becomes a number 2
alert( '01' == 1 ); // true, string '01' becomes a number 1

alert( true == 1 ); // true
alert( false == 0 ); // true

alert( 0 === false ); // false, because the types are different; !== analogous to !=
//null becomes 0, undefined becomes NaN
alert( null === undefined ); // false
alert( null == undefined ); // true

alert( null > 0 );  // false
alert( null == 0 ); // false, undefined and null is defined such that, without any conversions, they equal each other and don’t equal anything else
alert( null >= 0 ); // true

alert( undefined > 0 ); // false
alert( undefined < 0 ); // false
alert( undefined == 0 ); // false


/* CONDITIONAL BRANCHING: IF, '?' */
let year = prompt('In which year was ECMAScript-2015 specification published?', '');
if (year == 2015) alert( 'You are right!' );
if (year == 2015) {
    alert( "That's correct!" );
    alert( "You're so smart!" );
}

// if (0) is false
// if (1) is true

year = prompt('In which year was the ECMAScript-2015 specification published?', '');
if (year == 2015) {
    alert( 'You guessed it right!' );
}
else {
    alert( 'How can you be so wrong?' ); // any value except 2015
}

year = prompt('In which year was the ECMAScript-2015 specification published?', '');
if (year < 2015) {
    alert( 'Too early...' );
}
else if (year > 2015) {
    alert( 'Too late' );
}
else {
    alert( 'Exactly!' );
}

let accessAllowed = (age > 18) ? true : false;

age = prompt('age?', 18);

message = (age < 3) ? 'Hi, baby!' :
    (age < 18) ? 'Hello!' :
        (age < 100) ? 'Greetings!' :
            'What an unusual age!';
alert( message );

let company = prompt('Which company created JavaScript?', '');
(company == 'Netscape') ?
    alert('Right!') : alert('Wrong.');

let result = (a + b < 4) ? 'Below' : 'Over';

message = (login == 'Employee') ? 'Hello' :
    (login == 'Director') ? 'Greetings' :
        (login == '') ? 'No login' :
            '';


/* LOGICAL OPERATORS */
alert( true || true );   // true
alert( false || true );  // true
alert( true || false );  // true
alert( false || false ); // false

let hour = 9;
if (hour < 10 || hour > 18) {
    alert( 'The office is closed.' );
}

alert( null || 0 || 1 ); // 1 (the first truthy value)
alert( undefined || null || 0 ); // 0 (all falsy, returns the last value)

let firstName = "";
let lastName = "";
let nickName = "SuperCoder";
alert( firstName || lastName || nickName || "Anonymous"); // SuperCoder

alert( true && true );   // true
alert( false && true );  // false
alert( true && false );  // false
alert( false && false ); // false

hour = 12;
let minute = 30;
if (hour == 12 && minute == 30) {
    alert( 'The time is 12:30' );
}

alert( 1 && 0 ); // 0
alert( 1 && 5 ); // 5

alert( null && 5 ); // null
alert( 0 && "no matter what" ); // 0
alert( 1 && 2 && null && 3 );

alert( !true );
alert( !0 );

alert( !!"non-empty string" );
alert( !!null );

alert( null || 2 || undefined );
alert( alert(1) || 2 || alert(3) );

alert(1 && null && 2);
alert( alert(1) && alert(2) );
alert( null || 2 && 3 || 4 );

let userName = prompt("Who's there?", '');
if (userName === 'Admin') {
    let pass = prompt('Password?', '');
    if (pass === 'TheMaster') {
        alert( 'Welcome!' );
    }
    else if (pass === '' || pass === null) {
        alert( 'Canceled' );
    }
    else {
        alert( 'Wrong password' );
    }
}
else if (userName === '' || userName === null) {
    alert( 'Canceled' );
}
else {
    alert( "I don't know you" );
}

let user;
alert(user ?? "Anonymous");

firstName = null;
lastName = null;
nickName = "Supercoder";
alert(firstName ?? lastName ?? nickName ?? "Anonymous"); // Supercoder

let height = 0;
alert(height || 100); // 100
alert(height ?? 100); // 0

height = null;
let width = null;
let area = (height ?? 100) * (width ?? 50);
alert(area);

x = (1 && 2) ?? 3; // forbidden to use it with || or && without explicit parentheses.
alert(x);

let i = 0;
while (i < 3) {
    alert( i );
    i++;
}

i = 3;
while (i) {
    alert( i );
    i--;
}

i = 0;
do {
    alert( i );
    i++;
} while (i < 3);

for (let i = 0; i < 3; i++) {
    alert(i);
}

i = 0;
for (; i < 3; i++) {
    alert( i );
}

i = 0;
for (; i < 3;) {
    alert( i++ );
}

let sum = 0;
while (true) {
    let value = +prompt("Enter a number", '');
    if (!value) break;
    sum += value;
}
alert( 'Sum: ' + sum );

for (let i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    alert(i);
}

outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        let input = prompt(`Value at coords (${i},${j})`, '');
        if (!input) break outer;
    }
}

num;
do {
    num = prompt("Enter a number greater than 100?", 0);
} while (num <= 100 && num);

n = 10;
nextPrime:
    for (let i = 2; i <= n; i++) {
        for (let j = 2; j < i; j++) {
            if (i % j == 0) continue nextPrime;
        }
        alert( i );
    }

a = 2 + 2;
switch (a) {
    case 3:
        alert( 'Too small' );
        break;
    case 4:
        alert( 'Exactly!' );
        break;
    case 5:
        alert( 'Too big' );
        break;
    default:
        alert( "I don't know such values" );
}

a = "1";
b = 0;
switch (+a) {
    case b + 1:
        alert("this runs, because +a is 1, exactly equals b+1");
        break;
    default:
        alert("this doesn't run");
}

a = 3;
switch (a) {
    case 4:
        alert('Right!');
        break;
    case 3:
    case 5:
        alert('Wrong!');
        alert("Why don't you take a math class?");
        break;
    default:
        alert('The result is strange. Really.');
}

let arg = prompt("Enter a value?");
switch (arg) {
    case '0':
    case '1':
        alert( 'One or zero' );
        break;
    case '2':
        alert( 'Two' );
        break;
    case 3:
        alert( 'Never executes!' );
        break;
    default:
        alert( 'An unknown value' );
}

function showMessage() {
    let message = "Hello, I'm JavaScript!";
    alert( message );
}
showMessage();

userName = 'John';
function showMessage() {
    let message = 'Hello, ' + userName;
    alert(message);
}
showMessage();

let sayHi = function() {
    alert( "Hello" );
};

function sayHi() {
    alert( "Hello" );
}
let func = sayHi;
func();
sayHi();

function ask(question, yes, no) {
    if (confirm(question)) yes()
    else no();
}
function showOk() {
    alert( "You agreed." );
}
function showCancel() {
    alert( "You canceled the execution." );
}

ask("Do you agree?", showOk, showCancel);

function ask(question, yes, no) {
    if (confirm(question)) yes()
    else no();
}
ask(
    "Do you agree?",
    function() { alert("You agreed."); },
    function() { alert("You canceled the execution."); }
);

age = prompt("What is your age?", 18);
let welcome;
if (age < 18) {
    welcome = function() {
        alert("Hello!");
    };

} else {
    welcome = function() {
        alert("Greetings!");
    };
}
welcome();

age = prompt("What is your age?", 18);
welcome = (age < 18) ?
    function() { alert("Hello!"); } :
    function() { alert("Greetings!"); };
welcome();


age = prompt("What is your age?", 18);
welcome = (age < 18) ?
    () => alert('Hello!') :
    () => alert("Greetings!");
welcome();

alert( sum(1, 2) );

function ask(question, yes, no) {
    if (confirm(question)) yes();
    else no();
}
ask(
    "Do you agree?",
    () => alert("You agreed."),
    () => alert("You canceled the execution.")
);