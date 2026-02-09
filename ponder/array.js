let pets = ['goldfigh', 'dog', 'rhito'];
console.log(pets.length);
pets[0]='bunny';
console.log(pets);
pets.push('lizard');
console.log(pets);


const steps = ['one', 'two', 'three'];
//.for Each call a function foe every item in the array
//steps.forEach(function(item) {
//    console.log(item);
//});

steps.forEach(showSteps);

function showSteps(item) {
    console.log(item);
}

//.map() calls a function but create a new array from the original array
let myList = document.querySelector('#myList');

const stepsHtml = steps.map(listTemplate);
function listTemplate (item) {
    return `<li>${item}</li>`;
}

myList.innerHTML = stepsHtml.join('');

let grades = ['A', 'A', 'A'];
let points;
let gpaPoints = grades.map(convert);
function convert(grade) {
    switch (grade) {
        case 'A':
            points = 4;
            break;
        case 'B':
            points = 3;
            break;
        case 'C':
            points = 2;
            break;
        case 'D':
            points = 1;
            break;
        case 'F':
            points = 0;
            break;
        default:
            alert('not a valid grade');
    }
    return points;
}

console.log(gpaPoints);
console.log(grades);

//.reduce() recue sown to a single value withan accumulator
let totalPoints = gpaPoints.reduce(getTotal);
function getTotal(total, item) {
    return total + item;
}
console.log(totalPoints);
let gpaAverage = totalPoints / gpaPoints.length;
console.log(gpaAverage);

//.filter() creates a new arrray but only items that pass a certain condtion

const words = ['watermeoln', 'peach', 'apple', 'tomato', 'grape'];
const shortWords = words.filter(function(item){
    return item.length <= 6;
})

console.log(shortWords);


