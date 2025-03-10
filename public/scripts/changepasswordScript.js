// changepasswordScript.js
document.addEventListener('DOMContentLoaded', function () {
    const backButton=document.getElementById('back-button');
    if(backButton){
        backButton.addEventListener("click",goBack);
    }

    const changePasswordButton=document.getElementById('changePassword');
    if(changePasswordButton){
        changePasswordButton.addEventListener("click",changePassword);
    }
});
function changePassword() {
    var oldPassword = document.getElementById("oldPassword").value;
    var newPassword = document.getElementById("newPassword").value;
    var confirmNewPassword = document.getElementById("confirmNewPassword").value;

    // Validate the form fields
    if (!validatePasswordChange(oldPassword, newPassword, confirmNewPassword)) {
        return;
    }

    // Fetch API to submit the password change request
    fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            oldPassword,
            newPassword,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Handle error, e.g., display error message
            alert("Invalid old password " + data.error);
        } else if (data.message) {
            // Handle success, e.g., display success message
            alert("" + data.message);
        }
    })
    .catch(error => {
        console.error('Error during password change:', error);
        // Handle other errors as needed
        alert("An unexpected error occurred during password change. Please try again.");
    });
}

function validatePasswordChange(oldPassword, newPassword, confirmNewPassword) {
    // Clear previous error messages
    clearValidationMessages();

    if (oldPassword === "") {
        displayValidationMessage("enter old password");
        return false;
    }
    // Example validation (customize as needed):
    if (oldPassword === newPassword) {
        displayValidationMessage("newPassword", "New password should be different from the old password");
        return false;
    }

    if (newPassword.length < 8) {
        displayValidationMessage("newPassword", "New password must be at least 8 characters");
        return false;
    }

    if (newPassword !== confirmNewPassword) {
        displayValidationMessage("confirmNewPassword", "New password and confirm password do not match");
        return false;
    }

    // Add more validation as needed

    return true;
}

function clearValidationMessages() {
    // Clear previous validation messages
    var errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(element => {
        element.innerText = "";
    });
}

function displayValidationMessage(fieldId, message) {
    // Display validation message next to the specified field
    var errorElement = document.getElementById(fieldId + "-error");
    if (errorElement) {
        errorElement.innerText = message;
    }
}

function goBack() {
    window.history.back();
  }
  