function getCurrentDate() {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = String(currentDate.getMonth() + 1).padStart(2, '0');
    var day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


const totalLoanEndpoint = '/api/closings/getTotalLoan';

async function fetchTotalLoan() {
    try {
        const response = await fetch(totalLoanEndpoint);
        const totalLoan = await response.json();
        return totalLoan;
    } catch (error) {
        console.error('Error fetching total loan:', error);
        throw error;
    }
}


async function updateLoanField() {
    try {
        const totalLoan = await fetchTotalLoan();
        var loanInput = document.getElementById('loan');
        loanInput.value = totalLoan;
    } catch (error) {
        console.error('Error fetching total loan:', error);
    }
}
document.addEventListener('DOMContentLoaded', function () {
    fetchUserData(); // Make sure this is called
    updateUserNameFromSession();
    
    updateUserName();
    var dateInput = document.getElementById('date');
    dateInput.value = getCurrentDate();

    // Add event listeners
    const submit = document.getElementById('submit');
    const backButton = document.getElementById('back-button');

    if (submit) {
        submit.addEventListener('click', saveClosing);
    }

    if (backButton) {
        backButton.addEventListener('click', goBack);
    }
    
    // Fetch total loan and update the loan input field when the page loads
    updateLoanField();
});


// Update saveClosing function to handle updates
async function saveClosing(event) {
    event.preventDefault();

    // Get form data
    var date = getCurrentDate();
    var telenorLoad = parseFloat(document.getElementById('telenorLoad').value) || 0;
    var zongLoad = parseFloat(document.getElementById('zongLoad').value) || 0;
    var jazzLoad = parseFloat(document.getElementById('jazzLoad').value) || 0;
    var ufoneLoad = parseFloat(document.getElementById('ufoneLoad').value) || 0;
    var easypaisa = parseFloat(document.getElementById('easypaisa').value) || 0;
    var jazzCash = parseFloat(document.getElementById('jazzCash').value) || 0;
    var loanInput = document.getElementById('loan');  // Assuming the loan input has an ID of 'loan'
  
    var cash = parseFloat(document.getElementById('cash').value) || 0;
    var bank = parseFloat(document.getElementById('bank').value) || 0;
    var credit = parseFloat(document.getElementById('credit').value) || 0;

    // Use try-catch block to handle errors with await
    try {
        // Fetch total loan and update the loan input field
        await updateLoanField();

        // Use the updated loan input field value
        var loanInput = document.getElementById('loan');
        var loan = parseFloat(loanInput.value) || 0;

        // Calculate the total
        var total = (telenorLoad + zongLoad + jazzLoad + ufoneLoad + easypaisa + jazzCash + loan + cash + bank) - credit;

        var closingData = {
            date: date,
            telenorLoad: telenorLoad,
            zongLoad: zongLoad,
            jazzLoad: jazzLoad,
            ufoneLoad: ufoneLoad,
            easypaisa: easypaisa,
            jazzCash: jazzCash,
            loan: loan,
            cash: cash,
            bank: bank,
            credit: credit,
            total: total,
        };

        const endpoint = currentEditId 
            ? `/api/closings/updateClosing/${currentEditId}`
            : '/api/closings/saveClosing';
        
        const method = currentEditId ? 'PUT' : 'POST';

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(closingData)
            });
    
            if (!response.ok) throw new Error('Failed to save closing data');
    
            const result = await response.json();
            
            showToast(currentEditId ? 'Closing updated successfully' : 'Closing saved successfully');
            currentEditId = null;
            
            // Reset form and button
            const submitBtn = document.getElementById('submit');
            submitBtn.textContent = 'Submit';
            submitBtn.classList.remove('editing');
            
            document.getElementById('closingForm').reset();
            document.getElementById('date').value = getCurrentDate();
            
            // Refresh table data
            fetchClosingData();
        } catch (error) {
            console.error('Error:', error);
            showToast(error.message, 'error');
        }
    } catch (error) {
        console.error('Error fetching total loan:', error);
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.className = `toast-notification ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

let currentEditId = null;
let closingData = []; // Add this global variable to store closing data

function fetchClosingData() {
    fetch('/api/closings/getAllClosing', {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        closingData = data; // Store the data globally
        displayClosingData(data);
    })
    .catch(error => {
        console.error('Error:', error);
        showToast(error.message, 'error');
    });
}



function displayClosingData(data) {
    const tbody = document.getElementById('closingTableBody');
    tbody.innerHTML = '';

    data.forEach(closing => {
        const row = tbody.insertRow();
        
        // Format date
        const date = new Date(closing.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Create cells array with all values
        const cellValues = [
            `${formattedDate} ${closing.updated ? '<span class="updated-badge">updated</span>' : ''}`,
            closing.telenorLoad,
            closing.zongLoad,
            closing.jazzLoad,
            closing.ufoneLoad,
            closing.easypaisa,
            closing.jazzCash,
            closing.loan,
            closing.cash,
            closing.bank,
            closing.credit,
            closing.total
        ];

        // Add cells to row
        cellValues.forEach((value, index) => {
            const cell = row.insertCell();
            if (index === 0) {
               
                cell.innerHTML = value; // Use innerHTML to render the HTML
            } else if (index === cellValues.length - 1) {
             
                cell.className = 'closing-amount total-value';
                cell.textContent = value.toLocaleString();
            } else {
              
                cell.className = 'closing-amount';
                cell.textContent = value.toLocaleString();
            }
        });

        
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button type="button" class="edit-btn" data-id="${closing.id}">
                <i class="fas fa-edit"></i>
            </button>
        `;
    });
}

function handleEdit(id) {
    const closing = closingData.find(item => item.id === parseInt(id));
    if (!closing) {
        showToast('Closing data not found', 'error');
        return;
    }

    currentEditId = id;
    
    // Populate form fields
    document.getElementById('date').value = formatDateForInput(closing.date);
    document.getElementById('telenorLoad').value = closing.telenorLoad;
    document.getElementById('zongLoad').value = closing.zongLoad;
    document.getElementById('jazzLoad').value = closing.jazzLoad;
    document.getElementById('ufoneLoad').value = closing.ufoneLoad;
    document.getElementById('easypaisa').value = closing.easypaisa;
    document.getElementById('jazzCash').value = closing.jazzCash;
    document.getElementById('loan').value = closing.loan;
    document.getElementById('cash').value = closing.cash;
    document.getElementById('bank').value = closing.bank;
    document.getElementById('credit').value = closing.credit;

    // Update submit button
    const submitBtn = document.getElementById('submit');
    submitBtn.textContent = 'Update Closing';
    submitBtn.classList.add('editing');

    // Scroll to form with offset for better visibility
    const form = document.getElementById('closingForm');
    const headerOffset = 100;
    const elementPosition = form.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });

    // Focus on first editable input
    form.querySelector('input:not([readonly])').focus();
}

document.addEventListener('DOMContentLoaded', function() {

    fetchUserData();
    fetchClosingData();
    document.getElementById('closingTable').addEventListener('click', function(e) {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            handleEdit(id);
        }
    });

 
    const form = document.getElementById('closingForm');
    const inputs = form.querySelectorAll('input:not([readonly])');
    
    inputs.forEach((input, index) => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    // If it's the last input, submit the form
                    form.querySelector('button[type="submit"]').click();
                }
            }
        });
    });
});

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function findClosingById(id) {
    return closingsList.find(item => item.id === id);
}



function goBack() {
    window.history.back();
  }

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


// Add this new function to update the user name
function updateUserName() {
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (!userNameDisplay) return;

    // First try to get from session storage
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
        try {
            const userData = JSON.parse(sessionUser);
            userNameDisplay.textContent = userData.name || 'User';
            return;
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }

    // If no session data, try to fetch from server
    fetch('/api/users/current')
        .then(response => response.json())
        .then(data => {
            if (data.user && data.user.name) {
                userNameDisplay.textContent = data.user.name;
                // Store in session storage for future use
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            } else {
                userNameDisplay.textContent = 'User';
            }
        })
        .catch(error => {
            console.error('Error fetching user name:', error);
            userNameDisplay.textContent = 'User';
        });
}

function updateUserNameFromSession() {
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (!userNameDisplay) return;

    // First try from session storage
    const sessionData = sessionStorage.getItem('currentUser');
    if (sessionData) {
        try {
            const user = JSON.parse(sessionData);
            if (user && user.name) {
                userNameDisplay.textContent = user.name;
                return;
            }
        } catch (e) {
            console.error('Error parsing session data:', e);
        }
    }

    // If no session data, fetch from server
    fetch('/api/users/current')
        .then(response => response.json())
        .then(data => {
            console.log('User data:', data); // Debug log
            if (data.success && data.user && data.user.name) {
                userNameDisplay.textContent = data.user.name;
                // Store in session storage
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            } else {
                throw new Error('No user name found');
            }
        })
        .catch(error => {
            console.error('Error fetching user name:', error);
            userNameDisplay.textContent = 'Guest';
        });
}
