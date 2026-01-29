const menuButton = document.querySelector('#btn'); 
const nav = document.querySelector('#main-nav');

menuButton.addEventListener('click', () => {
    const itOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', itOpen);
}
);

const gallery = document.querySelector('.gallery'); //find the element with class .gallery from the HTML
const modal = document.querySelector('dialog'); //find the dialog element from the HTML
const modalImage = modal.querySelector('img');//find the <img> inside the dialog
const closeButton = modal.querySelector('.close-viewer');//selects the X close button insdie the dialog

gallery.addEventListener('click', openModal); //instead of adding a listener to every image, we put one listener on .gallery. Let the click bubble up. Figure out which image was clicked using event.target

function openModal(e) { //e is the event parameter. it sotres information about the click
    
    const img = e.target; // e.target is the actual element that was clicked
    const src = img.getAttribute('src'); // read the file path src; alternative text alt
    const alt = img.getAttribute('alt');
    const full = src.replace('sm','full'); //replace() swaps 'sm' with 'full'
    modalImage.src = full; // sets the large image source copeies alt text for accessiblility
    modalImage.alt = alt;
    modal.showModal(); //dispaly the modal dialog
}

closeButton.addEventListener('click', () => { // when X is clicked: modal.close() hides the dialog
    modal.close();
});

modal.addEventListener('click', (event) => { //the dialog itself also has a click listener. if the use clocks on the backgrond overlay- close; on the image - do nothing.
    if (event.target === modal) {
        modal.close();
    }
});
          