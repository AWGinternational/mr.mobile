document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailOrUsernameInput = document.getElementById('emailOrUsername');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    const passwordToggle = document.querySelector('.password-toggle');
    
    // Function to show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Add shake animation to error message
        errorMessage.classList.add('shake');
        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 500);
    }
    
    // Function to hide error message
    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Function to show success message
    function showSuccess(message) {
        // Create success message element if it doesn't exist
        let successMessage = document.getElementById('successMessage');
        if (!successMessage) {
            successMessage = document.createElement('div');
            successMessage.id = 'successMessage';
            successMessage.style.background = 'rgba(6, 214, 160, 0.2)';
            successMessage.style.color = '#06d6a0';
            successMessage.style.padding = '12px';
            successMessage.style.borderRadius = '8px';
            successMessage.style.marginBottom = '24px';
            successMessage.style.fontSize = '14px';
            successMessage.style.textAlign = 'center';
            
            // Insert before the form
            loginForm.parentNode.insertBefore(successMessage, loginForm);
        }
        
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }
    
    // Password visibility toggle
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                passwordToggle.classList.remove('fa-eye');
                passwordToggle.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                passwordToggle.classList.remove('fa-eye-slash');
                passwordToggle.classList.add('fa-eye');
            }
        });
    }
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();
            
            // Basic form validation
            if (!emailOrUsernameInput.value.trim()) {
                showError('Please enter your email or username');
                emailOrUsernameInput.focus();
                return;
            }
            
            if (!passwordInput.value) {
                showError('Please enter your password');
                passwordInput.focus();
                return;
            }
            
            // Show loading state
            loginButton.classList.add('loading');
            
            try {
                console.log('Attempting login with:', emailOrUsernameInput.value.trim());
                
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emailOrUsername: emailOrUsernameInput.value.trim(),
                        password: passwordInput.value
                    }),
                    credentials: 'include' // Important: include cookies for session
                });
                
                const data = await response.json();
                console.log('Login response:', response.status, data);
                
                if (response.ok && data.success) {
                    // Success state
                    loginButton.classList.remove('loading');
                    loginButton.classList.add('success');
                    
                    // Store user info in localStorage for persistence
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Show message if provided in response
                    if (data.message) {
                        showSuccess(data.message);
                        // Wait a bit longer before redirect if there's a message
                        setTimeout(() => {
                            window.location.href = data.redirectTo || '/dashboard.html';
                        }, 2000);
                    } else {
                        // Normal redirect timing
                        setTimeout(() => {
                            window.location.href = data.redirectTo || '/dashboard.html';
                        }, 1000);
                    }
                } else {
                    throw new Error(data.error || 'Invalid email/username or password');
                }
            } catch (error) {
                loginButton.classList.remove('loading');
                showError(error.message);
                console.error('Login error:', error);
            }
        });
    }
    
    // Add keyboard navigation - press Enter to move between fields or submit
    emailOrUsernameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput?.focus();
        }
    });
    
    passwordInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});
