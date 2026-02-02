const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

menuBtn.addEventListener('click', function(){
    menu.classList.toggle('open');
});

const gallery = document.querySelector('.gallery'); 
const modal = document.getElementById('viewer');
const modalImg = modal.querySelector('img');
const closeBtn = document.getElementById('closeBtn');


gallery.addEventListener('click',function (e){
    if (e.target.tagName === 'IMG'){
        const img = e.target;
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');
        const full = src.replace('sm','full');
        modalImg.src = full;
        modalImg.alt = alt;
        modal.showModal();
    }
})

closeBtn.addEventListener('click', function(){
    modal.close();
})

modal.addEventListener('click', function(e){
    if (e.target === modal) {
        modal.close();
    }
})

modal.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){
        modal.close();
    }
})