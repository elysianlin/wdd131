document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('credit-card-form');
    const cardNumberInput = document.getElementById('CardNumber');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');

    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = formattedValue;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        const inputMonth = parseInt(monthInput.value, 10) || 0;
        const inputYear = parseInt(yearInput.value, 10) || 0;
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');

        if (cardNumber.length !== 16) {
            alert('Please enter a valid 16-digit credit card number.');
            return; 
        }

        if (inputMonth < 1 || inputMonth > 12) {
            alert('Please enter a valid expiration month (1-12).');
            return; 
        }

        if (inputYear < currentYear || (inputYear === currentYear && inputMonth < currentMonth)) {
            alert('This credit card has expired. Please use a valid card.');
            return;
        }

        alert('Card submitted successfully!');
        form.reset(); 
    });
});