nums = [12, 10, 8, 3]
console.log(nums.sort(compareFn))


function compareFn(a,b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
 return 0;
}


const simpleList = ["oranges", "grapes", "lemons", "apples", "Bananas", "watermelons", "coconuts", "broccoli", "mango"];
let simpleSort = simpleList.sort();
let lowerList = simpleList.map(function(item){
    return item.toLowerCase()
});
let lowerSort = lowerList.sort()
console.log(lowerSort);

let searchTerm = 'an';
let filterFruit = lowerSort.filter(searchFruit);
function searchFruit(item){
    return item.includes(searchTerm)
}

console.log(filterFruit);


 
const products = [
  {
    productName: "Wireless Mouse",
    price: 29.99
  },
  {
    productName: "Bluetooth Keyboard",
    price: 49.99
  },
  {
    productName: "Laptop Stand",
    price: 39.99
  }
];
                
function compareFn(a,b) {
  if (a.price < b.price) {
    return -1;
  } else if (a.price > b.price) {
    return 1;
  }
 return 0;
}

let productSort = products.sort(compareFn);
console.log(productSort);



const animals = [
  {
    name: "Lion",
    traits: ["brave", "strong", "fierce", "wild"]
  },
  {
    name: "Elephant",
    traits: ["large", "gentle", "smart", "wild"]
  },
  {
    name: "Fox",
    traits: ["sly", "quick", "clever", "wild"]
  },
  {
    name: "Dog",
    traits: ["loyal", "friendly", "playful", "cuddly"]
  },
  {
    name: "Cat",
    traits: ["quiet", "independent", "curious", "cuddly"]
  }
];
              

let query = 'dog';
let filteredList = animals.filter(searchList);
function searchList(item){
    return item.name.toLowerCase().includes(query.toLowerCase());
};

console.log(filteredList);

let queryTrait ='cuddly';

let filteredTraits = animals.filter(searchTraits);

function searchTraits(item){
    return item.traits.find(trait =>
        trait.toLowerCase().includes(queryTrait.toLowerCase())
    );
}

console.log(filteredTraits);

