// script.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('profile-settings-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (validateForm(name, email, password)) {
            // Simulate form submission
            console.log('Form submitted:', { name, email, password });
            alert('Profile settings updated successfully!');
            form.reset();
        }
    });

    function validateForm(name, email, password) {
        if (!name || !email || !password) {
            alert('All fields are required.');
            return false;
        }
        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return false;
        }
        return true;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
});