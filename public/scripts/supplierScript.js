document.addEventListener('DOMContentLoaded', async function(){
    fetchUserData();
    updateUserNameFromSession();
    
    updateUserName();
    const saveButton = document.getElementById('saveButton');
    if(saveButton){
        // Only add the save event listener if we're not in edit mode
        if(!saveButton.hasAttribute('data-editing-id')){
            saveButton.addEventListener('click', saveSupplier);
        }
    }
});

function clearTable() {
    const tableBody = document.querySelector('#supplierTable tbody');
    tableBody.innerHTML = ''; // Clear the existing rows

    // Clear data from local storage
    localStorage.removeItem('suppliersData');
}





async function saveSupplier() {
    // Get form data
    const supplierName = document.getElementById('supplierName').value;
    const supplierAddress = document.getElementById('supplierAddress').value;
    const contactNumber = document.getElementById('contactNumber').value;

    // Validate data
    if (!supplierName || !supplierAddress || !contactNumber) {
        alert('Please fill in all fields.');
        return;
    }

    // Create a data object
    const data = {
        supplierName,
        supplierAddress,
        contactNumber
    };

    try {
        // Send data to the server
        const response = await fetch('/suppliers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Check if the request was successful
        if (response.ok) {
            // Parse the response if needed
            const result = await response.json();
            console.log('Result:', result);

            // Update the table with the received data
            await addRow(result);

            // Clear form fields
            document.getElementById('supplierForm').reset();
            location.reload();
        } else {
            // Handle error responses
            console.error('Error saving supplier:', response.statusText);
            alert('Failed to save supplier. Please try again.');
        }
    } catch (error) {
        console.error('Error saving supplier:', error);
        alert(`Failed to save supplier. Please try again. Error: ${error.message}`);
    }
}

function createButton(text, onclick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onclick;
    return button;
}

async function addRow(result) {
    console.log('Adding row to the table:', result);

    // Check if the required properties exist
    if (!result || (!result.data && !result.id)) {
        console.warn('Incomplete data received. Skipping adding row.');
        return;
    }

    // Extract the supplier data from the result
    const supplierData = result.data || result;

    // Log the properties of the result
    console.log('Supplier Name:', supplierData.supplier_name || '');
    console.log('Supplier Address:', supplierData.supplier_address || '');
    console.log('Contact Number:', supplierData.contact_number || '');

    // Get the table body
    const tableBody = document.querySelector('#supplierTable tbody');

    // Create a new row
    const newRow = tableBody.insertRow();

    // Create cells and populate data
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);

    // Access the properties of result correctly
    cell1.textContent = supplierData.supplier_name || '';
    cell2.textContent = supplierData.supplier_address || '';
    cell3.textContent = supplierData.contact_number || '';

    // Create Edit and Delete buttons
    const editButton = createButton('Edit', () => editSupplier(result.id || supplierData.id));
    const deleteButton = createButton('Delete', () => deleteSupplier(result.id || supplierData.id));
    deleteButton.setAttribute('data-id', result.id || supplierData.id); // Set the correct data-id attribute

    // Append buttons to the cell
    cell4.className = 'action-buttons';
    cell4.appendChild(editButton);
    cell4.appendChild(deleteButton);

    console.log('Row added successfully:', newRow);
}

async function editSupplier(supplierId) {
    console.log('Editing supplier with ID:', supplierId);

    try {
        const response = await fetch(`/suppliers/${supplierId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch existing data');
        }

        const existingData = await response.json();
        console.log('Existing Data:', existingData);

        // Update the form fields with existing data
        document.getElementById('supplierName').value = existingData.data.supplier_name;
        document.getElementById('supplierAddress').value = existingData.data.supplier_address;
        document.getElementById('contactNumber').value = existingData.data.contact_number;

        // Change the save button to update button
        const saveButton = document.querySelector('#supplierForm button');
        saveButton.textContent = 'Update';
        saveButton.setAttribute('data-editing-id', supplierId);
        
        // Remove old event listeners and add the update listener
        const newButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newButton, saveButton);
        newButton.addEventListener('click', () => updateSupplier(supplierId));
    } catch (error) {
        console.error('Error fetching existing data:', error);
        alert('Failed to fetch existing data. Please try again.');
    }
}

async function fetchAndRenderSuppliers() {
    try {
        // Fetch data from the server
        const response = await fetch('/suppliers');

        if (!response.ok) {
            console.error('Error fetching supplier data:', response.statusText);
            alert('Failed to fetch supplier data. Please try again.');
            return;
        }

        const responseData = await response.json();

        if (responseData.success && Array.isArray(responseData.data)) {
            const data = responseData.data;

            console.log('Fetched Supplier Data:', data);

            // Store the fetched data in local storage
            localStorage.setItem('suppliersData', JSON.stringify(data));

            // Render the data
            renderSuppliers(data);
        } else {
            console.error('Invalid data format:', responseData);
            alert('Invalid data format received from the server.');
        }
    } catch (error) {
        console.error('Error fetching and rendering supplier data:', error);
        alert('Failed to fetch and render supplier data. Please try again.');
    }
}

function renderSuppliers(data) {
    // Clear the table before rendering
    clearTable();

    // Render each supplier in the table
    data.forEach(supplier => addRow(supplier));
}

function clearTable() {
    const tableBody = document.querySelector('#supplierTable tbody');
    tableBody.innerHTML = ''; // Clear the existing rows
}

async function deleteSupplier(supplierId) {
    console.log('Deleting supplier with ID:', supplierId);

    try {
        const response = await fetch(`/suppliers/${supplierId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Important for session handling
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('Supplier deleted successfully');
            removeRowFromTable(supplierId);
            location.reload(); // Refresh the page to show updated data
        } else {
            console.error('Error deleting supplier:', data.error);
            alert(data.error || 'Failed to delete supplier. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Failed to delete supplier. Please try again.');
    }
}

function removeRowFromTable(supplierId) {
    const tableBody = document.querySelector('#supplierTable tbody');
    const rowToRemove = Array.from(tableBody.rows).find(row => {
        const idCell = row.cells[3].querySelector('.action-buttons button[data-id]');
        return idCell && idCell.getAttribute('data-id') === supplierId.toString();
    });

    if (rowToRemove) {
        rowToRemove.remove();
    } else {
        console.error('Row not found for deletion');
    }
}

async function updateSupplier(supplierId) {
    console.log('Updating supplier with ID:', supplierId);

    const updatedData = {
        supplierName: document.getElementById('supplierName').value,
        supplierAddress: document.getElementById('supplierAddress').value,
        contactNumber: document.getElementById('contactNumber').value,
    };

    try {
        const response = await fetch(`/suppliers/${supplierId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('Supplier updated successfully');
            
            // Reset the form and button
            const saveButton = document.querySelector('#supplierForm button');
            saveButton.textContent = 'Save';
            saveButton.removeAttribute('data-editing-id');
            
            // Remove old event listeners and add the save listener
            const newButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newButton, saveButton);
            newButton.addEventListener('click', saveSupplier);
            
            // Clear the form
            document.getElementById('supplierForm').reset();
            
            // Refresh the page to show updated data
            location.reload();
        } else {
            console.error('Error updating supplier:', result.error);
            alert(result.error || 'Failed to update supplier. Please try again.');
        }
    } catch (error) {
        console.error('Error updating supplier:', error);
        alert('Failed to update supplier. Please try again.');
    }
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

// Fetch and render suppliers on page load
window.addEventListener('load', fetchAndRenderSuppliers);
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