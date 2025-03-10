document.addEventListener('DOMContentLoaded', function() {
    // Initialize form
    const form = document.getElementById('customerForm');
    if (form) {
        setupFormListener(form);
    }

    // Initialize search
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            searchAndHighlight(searchTerm);
        });
    }

    // Fetch and display customers
    fetchAndDisplayCustomers();
});

// Add the missing searchAndHighlight function
function searchAndHighlight(searchTerm) {
    const tableRows = document.querySelectorAll('#customerTableBody tr');
    let found = false;

    tableRows.forEach(row => {
        const rowContent = row.textContent.toLowerCase();
        if (rowContent.includes(searchTerm)) {
            // Highlight the entire row
            row.style.backgroundColor = '#d35400';
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found = true;
        } else {
            row.style.backgroundColor = ''; // Reset background color
        }
    });

    if (!found) {
        showMessage('No matching records found', 'warning');
    }
}

// Update the setupFormListener function
async function setupFormListener(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const customerData = Object.fromEntries(formData);

        const isEditing = form.dataset.editId;
        const url = isEditing 
            ? `/customers/update/${form.dataset.editId}`
            : '/customers/add';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(isEditing ? 'Customer updated successfully' : 'Customer added successfully', 'success');
                form.reset();
                form.dataset.editId = '';
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.textContent = 'Submit';
                await fetchAndDisplayCustomers();
            } else {
                showMessage(data.error || 'Failed to save customer', 'error');
            }
        } catch (error) {
            showMessage('Error submitting form', 'error');
            console.error('Error:', error);
        }
    });
}

// Update fetchAndDisplayCustomers to handle empty results
async function fetchAndDisplayCustomers() {
    try {
        const response = await fetch('/customers/all');
        if (!response.ok) {
            throw new Error('Failed to fetch customers');
        }
        
        const customers = await response.json();
        const tableBody = document.getElementById('customerTableBody');
        
        if (!tableBody) {
            console.error('Customer table body not found!');
            return;
        }
        
        tableBody.innerHTML = '';

        if (customers.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="5" class="text-center">No customers found</td>
            `;
            tableBody.appendChild(noDataRow);
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.dataset.id = customer.id;
            row.innerHTML = `
                <td>${customer.name || ''}</td>
                <td>${customer.address || '-'}</td>
                <td>${customer.cnic || ''}</td>
                <td>${customer.phone_number || ''}</td>
                <td class="action-buttons">
                    <button class="finance-button edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="finance-button delete-btn" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        attachButtonListeners();
    } catch (error) {
        showMessage('Error fetching customers', 'error');
        console.error('Error:', error);
    }
}

function attachButtonListeners() {
    const tableBody = document.getElementById('customerTableBody');
    tableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const row = button.closest('tr');
        const customerId = row.dataset.id;

        if (button.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this customer?')) {
                await deleteCustomer(customerId);
            }
        } else if (button.classList.contains('edit-btn')) {
            populateFormForEdit(row);
        }
    });
}

function populateFormForEdit(row) {
    const form = document.getElementById('customerForm');
    const cells = row.cells;
    
    form.elements.name.value = cells[0].textContent;
    form.elements.address.value = cells[1].textContent !== '-' ? cells[1].textContent : '';
    form.elements.cnic.value = cells[2].textContent;
    form.elements.phone.value = cells[3].textContent;
    
    form.dataset.editId = row.dataset.id;
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Update Customer';
    
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteCustomer(id) {
    try {
        const response = await fetch(`/customers/delete/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Customer deleted successfully', 'success');
            fetchAndDisplayCustomers();
        } else {
            showMessage('Failed to delete customer', 'error');
        }
    } catch (error) {
        showMessage('Error deleting customer', 'error');
        console.error('Error:', error);
    }
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert-message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.finance-container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => messageDiv.remove(), 3000);
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

// Ensure the function runs after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
   
    updateUserName();
    updateUserNameFromSession();
});

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