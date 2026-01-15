let title=document.querySelector('h1');
console.log(title);

title.textContent='Web Page Components';

let topic_title = document.getElementById('topics');
topic_title.style.color = 'purple';

let list = document.querySelector('.list');
list.style.border = '3px solid black';

let para = document.querySelector('p');
//para.classList.add('background');
para.style.backgroundColor = '#000';

let image = document.querySelector('img');
image.setAttribute('src', 'images/logo.png');
//image.src = 'images/logo.png';


let selectElem = document.getElementById('webdevlist');
selectElem.addEventListener('change', function(){
    let codeValue = selectElem.value;
    console.log(codeValue);
    document.querySelector('#html').style.color = '';
    document.querySelector('#css').style.color = '';
    document.querySelector('#js').style.color = '';

    document.getElementById(codeValue).style.color = 'red';
})

const newpara = document.createElement('p');
newpara.innerText = 'Added with JavaScript';
document.body.appendChild(newpara);

const newImage = document.createElement('img');
newImage.src = ('src', 'https://picsum.photos/200');
document.body.appendChild(newImage);

const newDiv = document.createElement('div');
newDiv.innerHTML = '<ul><li>One</li><li>Two</li><li>Three</li></ul>';
document.body.appendChild(newDiv);

const section = document.querySelector('section');
section.innerHTML = '<h2>DOM Basics <h2><p>This was also added through JS</p>';
document.body.appendChild(section);

const btn = document.getElementById('btn');
const text = document.getElementById('texxt');

btn.addEventListener('click', () => {
    text.classList.toogle('hightlight');
});

const username = document.querySelector('#name');
username.value = 'me';
                