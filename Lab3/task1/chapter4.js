/** OBJECTS */
let user = new Object(); // "object constructor" syntax
user = {};  // "object literal" syntax

user = {     // an object
    name: "John",  // by key "name" store value "John"
    age: 30        // by key "age" store value 30
};

// get property values of the object:
alert( user.name ); // John
alert( user.age ); // 30

user.isAdmin = true; // add boolean
delete user.age;

let user = {
    name: "John",
    age: 30,
    "likes birds": true  // multiword property name must be quoted
};

let user = {};
// set
user["likes birds"] = true;
// get
alert(user["likes birds"]); // true
// delete
delete user["likes birds"];


let user = {
    name: "John",
    age: 30
};
let key = prompt("What do you want to know about the user?", "name");
// access by variable
alert( user[key] ); // John (if enter "name")

let user = {
    name: "John",
    age: 30
};
key = "name";
alert( user.key ) // undefined

let fruit = prompt("Which fruit to buy?", "apple");
let bag = {
    [fruit]: 5, // the name of the property is taken from the variable fruit
};
alert( bag.apple ); // 5 if fruit="apple"

fruit = 'apple';
bag = {
    [fruit + 'Computers']: 5 // bag.appleComputers = 5
};

function makeUser(name, age) {
    return {
        name: name,
        age: age,
        // ...other properties
    };
}
let user = makeUser("John", 30);
alert(user.name); // John
// instead
function makeUser(name, age) {
    return {
        name, // same as name: name
        age,  // same as age: age
        // ...
    };
}

let user = {
    name,  // same as name:name
    age: 30
};

// these properties are all right
let obj = {
    for: 1,
    let: 2,
    return: 3
};
alert( obj.for + obj.let + obj.return );  // 6

obj = {
    0: "test" // same as "0": "test"
};
// both alerts access the same property (the number 0 is converted to string "0")
alert( obj["0"] ); // test
alert( obj[0] ); // test (same property)

let user = {};
alert( user.noSuchProperty === undefined ); // true means "no such property"

let user = { name: "John", age: 30 };
alert( "age" in user ); // true, user.age exists
alert( "blabla" in user ); // false, user.blabla doesn't exist

obj = {
    test: undefined
};
alert( obj.test ); // it's undefined, so - no such property?
alert( "test" in obj ); // true, the property does exist!

let user = {
    name: "John",
    age: 30,
    isAdmin: true
};
for (let key in user) {
    // keys
    alert( key );  // name, age, isAdmin
    // values for the keys
    alert( user[key] ); // John, 30, true
}

user = {};
user.name = "John";
user.surname = "Smith";
user.name = "Pete";
delete user.name;

function isEmpty(obj) {
    for (let key in obj) {
        // if the loop has started, there is a property
        return false;
    }
    return true;
}

function multiplyNumeric(obj) {
    for (let key in obj) {
        if (typeof obj[key] == 'number') {
            obj[key] *= 2;
        }
    }
}

/** REFERENCE AND COPY */
let user = { name: "John" };
let admin = user; // copy the reference

let user = { name: 'John' };
admin = user;
admin.name = 'Pete'; // changed by the "admin" reference
alert(user.name); // 'Pete', changes are seen from the "user" reference

let a = {};
let b = a; // copy the reference
alert( a == b ); // true, both variables reference the same object
alert( a === b ); // true

a = {};
b = {}; // two independent objects
alert( a == b ); // false

const user = {
    name: "John"
};
user.name = "Pete"; // modifying var
alert(user.name); // Pete

let user = {
    name: "John",
    age: 30
};

let clone = {}; // the new empty object

// let's copy all user properties into it
for (let key in user) {
    clone[key] = user[key];
}
// now clone is a fully independent object with the same content
clone.name = "Pete"; // changed the data in it
alert( user.name ); // still John in the original object

let user = { name: "John" };
let permissions1 = { canView: true };
let permissions2 = { canEdit: true };
// copies all properties from permissions1 and permissions2 into user
Object.assign(user, permissions1, permissions2);
// now user = { name: "John", canView: true, canEdit: true }
alert(user.name); // John
alert(user.canView); // true
alert(user.canEdit); // true

let user = { name: "John" };
Object.assign(user, { name: "Pete" });
alert(user.name); // now user = { name: "Pete" }

let clone = Object.assign({}, user);
alert(clone.name); // John
alert(clone.age); // 30

let user = {
    name: "John",
    sizes: {
        height: 182,
        width: 50
    }
};

let user = {
    name: "John",
    sizes: {
        height: 182,
        width: 50
    }
};
let clone = Object.assign({}, user);
alert( user.sizes === clone.sizes ); // true, same object
// user and clone share sizes
user.sizes.width = 60;    // change a property from one place
alert(clone.sizes.width); // 60, get the result from the other one

let user = {
    name: "John",
    sizes: {
        height: 182,
        width: 50
    }
};
let clone = structuredClone(user);
alert( user.sizes === clone.sizes ); // false, different objects
// user and clone are totally unrelated now
user.sizes.width = 60;    // change a property from one place
alert(clone.sizes.width); // 50, not related

let user = {};
// let's create a circular reference:
// user.me references the user itself
user.me = user;
let clone = structuredClone(user);
alert(clone.me === clone); // true

// error
structuredClone({
    f: function() {}
});

/** GARBAGE COLLECTION */
// user has a reference to the object
let user = {
    name: "John"
};
let admin = user;

function marry(man, woman) {
    woman.husband = man;
    man.wife = woman;

    return {
        father: man,
        mother: woman
    }
}
let family = marry({
    name: "John"
}, {
    name: "Ann"
});

delete family.father;
delete family.mother.husband;

/** METHODS, 'THIS' */
let user = {
    // ...
};
// first, declare
function sayHi() {
    alert("Hello!");
}
// then add as a method
user.sayHi = sayHi;

user.sayHi(); // Hello!

user = {
    sayHi: function() {
        alert("Hello");
    }
};

// method shorthand looks better, right?
user = {
    sayHi() { // same as "sayHi: function(){...}"
        alert("Hello");
    }
};

let user = {
    name: "John",
    age: 30,
    sayHi() {
        // "this" is the "current object"
        alert(this.name);
    }
};
user.sayHi(); // John

let user = {
    name: "John",
    age: 30,

    sayHi() {
        alert( user.name ); // leads to an error
    }

};
let admin = user;
user = null; // overwrite to make things obvious
admin.sayHi(); // TypeError: Cannot read property 'name' of null

user = { name: "John" };
let admin = { name: "Admin" };

function sayHi() {
    alert( this.name );
}

// use the same function in two objects
user.f = sayHi;
admin.f = sayHi;
// these calls have different this
// "this" inside the function is the object "before the dot"
user.f(); // John  (this == user)
admin.f(); // Admin  (this == admin)
admin['f'](); // Admin (dot or square brackets access the method – doesn't matter)

function sayHi() {
    alert(this);
}
sayHi(); // undefined

let user = {
    firstName: "Ilya",
    sayHi() {
        let arrow = () => alert(this.firstName);
        arrow();
    }
};
user.sayHi(); // Ilya

function makeUser() {
    return {
        name: "John",
        ref() {
            return this;
        }
    };
}
let user = makeUser();
alert( user.ref().name ); // John

let calculator = {
    sum() {
        return this.a + this.b;
    },

    mul() {
        return this.a * this.b;
    },

    read() {
        this.a = +prompt('a?', 0);
        this.b = +prompt('b?', 0);
    }
};
calculator.read();
alert( calculator.sum() );
alert( calculator.mul() );

let ladder = {
    step: 0,
    up() {
        this.step++;
        return this;
    },
    down() {
        this.step--;
        return this;
    },
    showStep() {
        alert( this.step );
        return this;
    }
};


/** Constructor, operator 'new' */
function User(name) {
    this.name = name;
    this.isAdmin = false;
}
let user = new User("Jack");
alert(user.name); // Jack
alert(user.isAdmin); // false

// create a function and immediately call it with new
let user = new function() {
    this.name = "John";
    this.isAdmin = false;

    // ...other code for user creation
    // maybe complex logic and statements
    //
};

function User() {
    alert(new.target);
}
// without "new":
User(); // undefined
// with "new":
new User(); // function User { ... }

function User(name) {
    if (!new.target) { // if you run me without new
        return new User(name); // ...I will add new for you
    }
    this.name = name;
}
let john = User("John"); // redirects call to new User
alert(john.name); // John

function BigUser() {
    this.name = "John";
    return { name: "Godzilla" };  // <-- returns this object
}
alert( new BigUser().name );  // Godzilla, got that object

function SmallUser() {
    this.name = "John";
    return; // <-- returns this
}
alert( new SmallUser().name );  // John

let user = new User; // <-- no parentheses; we can omit parentheses after new
// same as
let user = new User();

function User(name) {
    this.name = name;

    this.sayHi = function() {
        alert( "My name is: " + this.name );
    };
}

john = new User("John");
john.sayHi(); // My name is: John

/*
john = {
   name: "John",
   sayHi: function() { ... }
}
*/

obj = {};
function A() { return obj; }
function B() { return obj; }
alert( new A() == new B() ); // true

function Calculator() {
    this.read = function() {
        this.a = +prompt('a?', 0);
        this.b = +prompt('b?', 0);
    };
    this.sum = function() {
        return this.a + this.b;
    };
    this.mul = function() {
        return this.a * this.b;
    };
}

calculator = new Calculator();
calculator.read();
alert( "Sum=" + calculator.sum() );
alert( "Mul=" + calculator.mul() );

function Accumulator(startingValue) {
    this.value = startingValue;
    this.read = function() {
        this.value += +prompt('How much to add?', 0);
    };
}
let accumulator = new Accumulator(1);
accumulator.read();
accumulator.read();
alert(accumulator.value);


/** OPTIONAL CHAINING '?.'*/