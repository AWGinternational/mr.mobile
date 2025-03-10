document.addEventListener('DOMContentLoaded', function () {
    // Add event listener to the form
    document.getElementById('submitReset').addEventListener('click', function () {
        // Get values from the input fields
        var newPassword = document.getElementById('newPassword').value;
        var confirmPassword = document.getElementById('confirmPassword').value;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            document.getElementById('errorMessage').textContent = 'Passwords do not match';
            return;
        }

        // You can add additional validation if needed

        // Perform the password reset action (e.g., make an API call)
        // You may use fetch or any other method to send the data to the server
        fetch(`/api/users/reset-password?token=${yourToken}&email=${encodeURIComponent(document.getElementById('email').value)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newPassword: newPassword,
                confirmPassword: confirmPassword,
            }),
        })
        
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            if (data.message) {
                // Password reset successful
                document.getElementById('errorMessage').style.color = '#00ff00'; // Green color for success
                document.getElementById('errorMessage').textContent = data.message;
            } else if (data.error) {
                // Password reset failed
                document.getElementById('errorMessage').style.color = '#ff0000'; // Red color for error
                document.getElementById('errorMessage').textContent = data.error;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
