let btn = document.querySelector(".menu-btn");
let menu = document.querySelector("nav");

btn.addEventListener("click", toggleMenu)

function toggleMenu() {
    menu.classList.toggle('hide'); // Toggle the 'hide' class on the menu; shows/hides it; don't need a dot.
    btn.classList.toggle('change'); // Toggle the 'change' class on the btn (menu-btn) to animate it;
    
}