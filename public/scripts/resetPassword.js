document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const emailInput = document.getElementById('email');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const resetButton = document.getElementById('resetButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.classList.add('shake');
        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 500);
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
    }
    
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }
    
    // Validate token
    if (!token) {
        showError('Invalid or missing reset token. Please request a new password reset link.');
        if (resetPasswordForm) resetPasswordForm.style.display = 'none';
    }
    
    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(toggle => {
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
    
    // Real-time password strength indicator
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthMeter = document.getElementById('passwordStrength');
            
            if (!strengthMeter) return;
            
            // Reset classes
            strengthMeter.className = 'password-strength';
            
            if (!password) {
                strengthMeter.textContent = '';
                return;
            }
            
            // Check password strength
            const hasLetter = /[A-Za-z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecial = /[^A-Za-z0-9]/.test(password);
            
            if (password.length < 8) {
                strengthMeter.textContent = 'Weak';
                strengthMeter.classList.add('weak');
            } else if (password.length >= 8 && hasLetter && hasNumber && !hasSpecial) {
                strengthMeter.textContent = 'Medium';
                strengthMeter.classList.add('medium');
            } else if (password.length >= 10 && hasLetter && hasNumber && hasSpecial) {
                strengthMeter.textContent = 'Strong';
                strengthMeter.classList.add('strong');
            } else {
                strengthMeter.textContent = 'Medium';
                strengthMeter.classList.add('medium');
            }
        });
    }
    
    // Password match validation
    if (confirmPasswordInput && newPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value && this.value === newPasswordInput.value) {
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else if (this.value) {
                this.classList.add('invalid');
                this.classList.remove('valid');
            } else {
                this.classList.remove('valid', 'invalid');
            }
        });
    }
    
    // Form submission
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();
            
            // Validate email
            const emailValue = emailInput.value.trim();
            if (!emailValue) {
                showError('Please enter your email address');
                emailInput.focus();
                return;
            }
            
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(emailValue)) {
                showError('Please enter a valid email address');
                emailInput.focus();
                return;
            }
            
            // Validate password
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (!newPassword) {
                showError('Please enter your new password');
                newPasswordInput.focus();
                return;
            }
            
            if (newPassword.length < 8) {
                showError('Password must be at least 8 characters');
                newPasswordInput.focus();
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showError('Passwords do not match');
                confirmPasswordInput.focus();
                return;
            }
            
            // Show loading state
            resetButton.classList.add('loading');
            
            try {
                const response = await fetch(`/api/users/reset-password?token=${token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: emailValue,
                        newPassword,
                        confirmPassword 
                    })
                });
                
                const data = await response.json();
                resetButton.classList.remove('loading');
                
                if (response.ok && data.success) {
                    // Success state
                    resetButton.classList.add('success');
                    resetPasswordForm.reset();
                    showSuccess('Your password has been reset successfully');
                    
                    // Disable form after successful submission
                    emailInput.disabled = true;
                    newPasswordInput.disabled = true;
                    confirmPasswordInput.disabled = true;
                    resetButton.disabled = true;
                    
                    // Redirect to login page after 3 seconds
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 3000);
                } else {
                    throw new Error(data.error || 'Unable to reset password');
                }
            } catch (error) {
                resetButton.classList.remove('loading');
                showError(error.message);
                console.error('Reset password error:', error);
            }
        });
    }
});
