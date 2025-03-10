

document.addEventListener('DOMContentLoaded', function () {
   
        const backButton=document.getElementById('back-button');
        if(backButton){
            backButton.addEventListener("click",goBack);
        }
   

    fetchUserData();

    // Add click event listeners to navigation links
    document.querySelectorAll('nav a').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            showContent(link.dataset.content);
        });
    });

    // Add change event listener to file input for displaying image preview
    
});

function fetchUserData() {
    // Make a fetch request to get user data
    fetch('/api/users/current')
        .then(response => {
            if (response.status === 401) {
                // Redirect to the login page or handle unauthorized access
                window.location.href = '/login.html';
                throw new Error('User not authenticated');
            }
            return response.json();
        })
        .then(user => {
            // Store the user data in session storage
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            // Log the stored user data for debugging
            console.log('Stored currentUser:', JSON.stringify(user));

            // Update the profile section immediately
            updateProfileSection(user);
        })
        .catch(error => {
            console.error('Error fetching user information:', error);
        });
}

// Function to update the profile section with the provided user data
function updateProfileSection(response) {
    // Ensure that the response object is not null or undefined
    if (response && response.user && response.user.name && response.user.username && response.user.email) {
        // Update the profile section in the settings.html
        document.getElementById('profileName').value = response.user.name;
        document.getElementById('profileUsername').value = response.user.username;
        document.getElementById('profileEmail').value = response.user.email;
        document.getElementById('profilePhone').value = response.user.phone;
    } else {
        console.error('Invalid user object:', response);
    }
}


function showContent(contentId) {
    // Hide all content sections
    document.querySelectorAll('.content').forEach(function (content) {
        content.classList.add('hidden');
    });

    // Show the selected content section
    document.getElementById(contentId + 'Content').classList.remove('hidden');
}

function displayImage(section, input) {
    var file = input.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById(section + 'Preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
function goBack() {
    window.history.back();
  }