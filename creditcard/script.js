document.addEventListener('DOMContentLoaded', function() {

    const cardNumberInput = document.querySelector('input[name="cardNumber"]') || document.querySelector('#creditCardNumber');
    const monthInput = document.querySelector('input[name="expMonth"]') || document.querySelector('#month');
    const yearInput = document.querySelector('input[name="expYear"]') || document.querySelector('#year');
    const sumitBtn = document.querySelector('button[type="submit"]') || document.querySelector('#submitBtn');

    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        e.target.value = formattedValue.trim();
    });

    const checkExpiry = () => {
        const month = parseInt(monthInput.value);
        const year = parseInt('20' + yearInput.value);

        if (month && year) {
            const now = now Date();
            const expiryDate = new Date(year,month -1);
            if (expiryDate < now) {
                displayError('Card has expired');
                sumitBtn.disabled = true;
            } else {
                displayError('');
                sumitBtn.disabled = false;
            }
            return true;
        }
    };

    const form = document.querySelector('form') || submitGtn.closest('form');

    if (document.querySelector('form')) {
        document.querySelector('form').onsubmit = (e) => {
            e.preventDefault();
            if (checkExpiry()) {
                alert('card submitted successfully!');
            }
        }; 
    } else {
        submitBtn.addEventListener('click', function() {
            if (checkExpiry()) {
                alert('card submitted successfully!');
            }
        });
    }   
});