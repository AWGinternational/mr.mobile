document.addEventListener('DOMContentLoaded', function() {
    
    function handleEnterKey(e, nextElementId) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextElementId) {
                document.getElementById(nextElementId)?.focus();
            } else {
                e.target.form.dispatchEvent(new Event('submit'));
            }
        }
    }

    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        document.getElementById('emailOrUsername')?.addEventListener('keypress', (e) => 
            handleEnterKey(e, 'password')
        );
        document.getElementById('password')?.addEventListener('keypress', (e) => 
            handleEnterKey(e, null)
        );

        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const button = document.getElementById('performlogin');
            const errorMsg = document.getElementById('errorMessage');
            
            try {
                button.classList.add('loading');
                errorMsg.style.display = 'none';

                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emailOrUsername: document.getElementById('emailOrUsername').value,
                        password: document.getElementById('password').value
                    })
                });

                const data = await response.json();

                if (data.redirectTo) {
                    button.classList.remove('loading');
                    button.classList.add('success');
                    setTimeout(() => {
                        window.location.href = data.redirectTo;
                    }, 1000);
                } else {
                    throw new Error(data.error || 'Invalid credentials');
                }
            } catch (error) {
                button.classList.remove('loading');
                errorMsg.textContent = error.message;
                errorMsg.style.display = 'block';
            }
        });
    }
});
