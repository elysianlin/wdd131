
let selectElem = document.querySelector('select');
let logo = document.querySelector('img');

selectElem.addEventListener('change', changeTheme);

function changeTheme() {
    let current = selectElem.value;
    if (current == 'dark') {
        logo.setAttribute('src', 'img/logo-dark.png');
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#FFFFFF';
        selectElem.style.backgroundColor = '#1e1e1e';
        selectElem.style.color = '#FFFFFF';
    } else if (current == 'light') {{
        logo.setAttribute('src', 'https://wddbyui.github.io/wdd131/images/byui-logo-blue.webp');
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.style.color = '#000000';
        selectElem.style.backgroundColor = '#ffffff';
        selectElem.style.color = 'black';
    }}
    else {
        // default
        logo.setAttribute('src', 'https://wddbyui.github.io/wdd131/images/byui-logo-blue.webp');
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        selectElem.style.backgroundColor = '';
        selectElem.style.color = '';
    }
}           
                    