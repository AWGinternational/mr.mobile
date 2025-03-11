document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const resetButton = document.getElementById('resetButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
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
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
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
            
            // Show loading state
            resetButton.classList.add('loading');
            
            try {
                const response = await fetch('/api/users/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailValue })
                });
                
                const data = await response.json();
                
                resetButton.classList.remove('loading');
                
                if (response.ok && data.success) {
                    // Success state
                    resetButton.classList.add('success');
                    forgotPasswordForm.reset();
                    showSuccess('Password reset link has been sent to your email');
                    
                    // Disable the form to prevent multiple submissions
                    emailInput.disabled = true;
                    resetButton.disabled = true;
                } else {
                    throw new Error(data.error || 'Unable to process your request');
                }
            } catch (error) {
                resetButton.classList.remove('loading');
                showError(error.message);
                console.error('Forgot password error:', error);
            }
        });
    }
    
    // Handle Enter key
    emailInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            forgotPasswordForm.dispatchEvent(new Event('submit'));
        }
    });
});
