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
    document.querySelector('#html').style.color = 'red';
})

const newpara = document.createElement('p');
newpara.innerText = 'Added with JavaScript';
document.body.appendChild(newpara);
                