document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('signupPassword');
    const signupButton = document.getElementById('signupButton');
    const errorMsg = document.getElementById('error-message');
    const passwordToggle = document.querySelector('.password-toggle');
    
    // Form validation patterns
    const patterns = {
        name: /^[A-Za-z\s]{3,50}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^\d{10,11}$/,
        username: /^[A-Za-z0-9_]{3,20}$/,
        password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
    };
    
    // Validation messages
    const validationMessages = {
        name: 'Name should contain only letters and spaces (3-50 characters)',
        email: 'Please enter a valid email address',
        phone: 'Phone number should be 10-11 digits',
        username: 'Username should be 3-20 characters (letters, numbers, underscore)',
        password: 'Password must be at least 8 characters with letters and numbers'
    };
    
    // Function to show error message
    function showError(message) {
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            
            // Add shake animation to error message
            errorMsg.classList.add('shake');
            setTimeout(() => {
                errorMsg.classList.remove('shake');
            }, 500);
        }
    }
    
    // Function to hide error message
    function hideError() {
        if (errorMsg) {
            errorMsg.style.display = 'none';
        }
    }
    
    // Password visibility toggle
    if (passwordToggle && passwordInput) {
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
    
    // Real-time validation for input fields
    function validateInput(input, pattern) {
        // Check if input element exists before manipulating it
        if (!input) return false;
        
        if (input.value.trim() === '') {
            input.classList.remove('valid', 'invalid');
            return true; // Empty is not invalid yet
        } else if (pattern.test(input.value)) {
            input.classList.add('valid');
            input.classList.remove('invalid');
            return true;
        } else {
            input.classList.add('invalid');
            input.classList.remove('valid');
            return false;
        }
    }
    
    // Add input event listeners for real-time validation
    if (nameInput) {
        nameInput.addEventListener('input', () => validateInput(nameInput, patterns.name));
    }
    if (emailInput) {
        emailInput.addEventListener('input', () => validateInput(emailInput, patterns.email));
    }
    if (phoneInput) {
        phoneInput.addEventListener('input', () => validateInput(phoneInput, patterns.phone));
    }
    if (usernameInput) {
        usernameInput.addEventListener('input', () => validateInput(usernameInput, patterns.username));
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', () => validateInput(passwordInput, patterns.password));
    }
    
    // Form submission handler
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();
            
            // Check if all required elements exist
            if (!nameInput || !emailInput || !phoneInput || !usernameInput || !passwordInput) {
                showError('Form elements are missing. Please refresh the page and try again.');
                return;
            }
            
            // Validate all fields before submission
            // Check name
            if (!nameInput.value.trim()) {
                showError('Please enter your full name');
                nameInput.focus();
                return;
            } else if (!validateInput(nameInput, patterns.name)) {
                showError(validationMessages.name);
                nameInput.focus();
                return;
            }
            
            // Check email
            if (!emailInput.value.trim()) {
                showError('Please enter your email address');
                emailInput.focus();
                return;
            } else if (!validateInput(emailInput, patterns.email)) {
                showError(validationMessages.email);
                emailInput.focus();
                return;
            }
            
            // Check phone
            if (!phoneInput.value.trim()) {
                showError('Please enter your phone number');
                phoneInput.focus();
                return;
            } else if (!validateInput(phoneInput, patterns.phone)) {
                showError(validationMessages.phone);
                phoneInput.focus();
                return;
            }
            
            // Check username
            if (!usernameInput.value.trim()) {
                showError('Please choose a username');
                usernameInput.focus();
                return;
            } else if (!validateInput(usernameInput, patterns.username)) {
                showError(validationMessages.username);
                usernameInput.focus();
                return;
            }
            
            // Check password
            if (!passwordInput.value) {
                showError('Please create a password');
                passwordInput.focus();
                return;
            } else if (!validateInput(passwordInput, patterns.password)) {
                showError(validationMessages.password);
                passwordInput.focus();
                return;
            }
            
            // Show loading state
            if (signupButton) {
                signupButton.classList.add('loading');
            }
            
            try {
                const response = await fetch('/api/users/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                        phone: phoneInput.value.trim(),
                        username: usernameInput.value.trim(),
                        password: passwordInput.value
                    })
                });
                
                const data = await response.json();
                
                if (signupButton) {
                    signupButton.classList.remove('loading');
                }
                
                if (response.ok) {
                    // Success state
                    if (signupButton) {
                        signupButton.classList.add('success');
                    }
                    
                    // Redirect after animation completes
                    setTimeout(() => {
                        window.location.href = '/signup-success.html';
                    }, 1000);
                } else {
                    throw new Error(data.error || 'Failed to create account. Please try again.');
                }
            } catch (error) {
                if (signupButton) {
                    signupButton.classList.remove('loading');
                }
                showError(error.message);
                console.error('Signup error:', error);
            }
        });
    }
    
    // Add keyboard navigation
    const inputs = [nameInput, emailInput, phoneInput, usernameInput, passwordInput];
    inputs.forEach((input, index) => {
        if (!input) return;
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < inputs.length - 1) {
                    // Move to next field
                    inputs[index + 1]?.focus();
                } else {
                    // Submit form on the last field
                    signupForm?.dispatchEvent(new Event('submit'));
                }
            }
        });
    });
});
