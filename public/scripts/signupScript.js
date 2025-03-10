signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = document.getElementById('signup');
    const errorMsg = document.getElementById('error-message');
    
    try {
        button.classList.add('loading');
        errorMsg.style.display = 'none';

        const response = await fetch('/api/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                username: document.getElementById('username').value,
                password: document.getElementById('signupPassword').value
            })
        });

        const data = await response.json();

        if (data.message) {
            button.classList.remove('loading');
            button.classList.add('success');
            setTimeout(() => {
                window.location.href = '/signup-success.html';
            }, 1000);
        } else {
            throw new Error(data.error || 'Signup failed');
        }
    } catch (error) {
        button.classList.remove('loading');
        errorMsg.textContent = error.message;
        errorMsg.style.display = 'block';
    }
});


// Password visibility toggle
document.querySelectorAll('.toggle-password').forEach(toggle => {
toggle.addEventListener('click', function() {
    const input = this.parentElement.querySelector('input');
    if (input.type === 'password') {
        input.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
});
});
