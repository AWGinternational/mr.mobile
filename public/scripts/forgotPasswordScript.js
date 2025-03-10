document.addEventListener('DOMContentLoaded', function () {
    const resetPasswordButton = document.getElementById('resetPassword');
    if (resetPasswordButton) {
        resetPasswordButton.addEventListener('click', resetPassword);
    }
});

function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function resetPassword() {
    const email = document.getElementById('email').value;

    if (!validateEmail(email)) {
        document.getElementById('errorMessage').innerHTML = 'Invalid email format. Please enter a valid email.';
        return;
    }

    fetch(`/api/users/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('errorMessage').style.color = '#00ff00'; // Green color for success
            document.getElementById('errorMessage').innerHTML = data.message;
        } else if (data.error) {
            document.getElementById('errorMessage').style.color = '#ff0000'; // Red color for error
            document.getElementById('errorMessage').innerHTML = data.error;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
