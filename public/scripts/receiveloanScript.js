document.addEventListener('DOMContentLoaded', async function(){
    fetchUserData();
    const searchButton=document.getElementById('searchButton');
    if(searchButton){
searchButton.addEventListener('click', searchTransaction);
    }
    const searchButtonTable=document.getElementById('searchButtonTable');
    if(searchButtonTable){
        searchButtonTable.addEventListener('click', searchAndHighlight )
    }
    const loanTypeSelect = document.getElementById('loan_type');
    if (loanTypeSelect) {
        loanTypeSelect.addEventListener('change', toggleInstallmentOption);
    }
    toggleInstallmentOption();
} );


document.getElementById('date').valueAsDate = new Date();
   
function calculateRemainingAmount() {
    const totalInstallments = parseFloat(document.getElementById('total_installment').value) || 0;
    const installmentNumber = parseFloat(document.getElementById('installment_number').value) || 0;
    const installmentAmount = parseFloat(document.getElementById('installment_amount').value) || 0;

    const remainingAmount = (totalInstallments - installmentNumber) * installmentAmount;

    document.getElementById('remaining_amount').value = remainingAmount.toFixed(2);
}

document.getElementById('installment_number').addEventListener('input', calculateRemainingAmount);

async function toggleInstallmentOption() {
    var loanType = document.getElementById('loan_type').value;
    var installmentFields = document.getElementById('installmentFields');

    if (loanType === 'monthly_installment') {
        const transactionId = document.getElementById('transaction_id').value;
        try {
            const response = await fetch('/receiveloans/monthly_installment_amount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transaction_id: transactionId }),
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('installment_amount').value = data.monthly_installment_amount;
                document.getElementById('total_installment').value = data.installment;

                // Calculate and update remaining amount
                calculateRemainingAmount();

                installmentFields.style.display = 'block';
            } else {
                alert('Failed to fetch monthly installment amount.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching monthly installment amount.');
        }
    } else {
        // If "Full Amount" is selected, reset the values to 0
        document.getElementById('installment_amount').value = '0';
        document.getElementById('total_installment').value = '0';
        document.getElementById('installment_number').value = '0';
        document.getElementById('remaining_amount').value = '0';

        calculateRemainingAmount();  // Ensure remaining amount is updated

        installmentFields.style.display = 'none';
    }
}

async function searchTransaction() {
    const transactionId = document.getElementById('transaction_id').value;

    try {
        const response = await fetch('/receiveloans/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transaction_id: transactionId }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('name').value = data.name;
            document.getElementById('amount').value = data.amount;
        } else {
            alert('Loan not found for the given transaction ID');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while searching for the loan.');
    }
}

document.getElementById('receiveLoanForm').addEventListener('submit', async function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();
    document.getElementById('date').valueAsDate = new Date();
    // Get form data using FormData
    const formData = new FormData(this);
    const loanType = formData.get('loan_type');
    if (loanType === 'full_amount') {
        formData.set('installment_amount', '0');
        formData.set('total_installment', '0');
        formData.set("installment_number", '0');
        formData.set("remaining_amount", '0');
    }
    try {
        // Send a POST request to the server
        const response = await fetch('/receiveloans/submit_loan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        // Check if the response is okay (status code 2xx)
        if (response.ok) {
            // Parse the JSON response
            const data = await response.json();
            console.log('Form submitted successfully:', data);

            // Display success message
            document.getElementById('successMessage').innerHTML = 'Loan submitted successfully';
            // Clear the form
            this.reset();
            // Fetch and display updated data
            fetchDataAndDisplay();
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            // Log an error if the response status is not okay
            console.error('Failed to submit form:', response.statusText);
        }
    } catch (error) {
        // Log an error if an exception occurs during the request
        console.error('An error occurred during form submission:', error);
    }
});

function attachDeleteButtonEvents() {
    const deleteButtons = document.querySelectorAll('#loanTableBody button');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const transactionId = this.getAttribute('data-transaction-id');
            deleteLoan(transactionId);
        });
    });
}

async function fetchDataAndDisplay() {
    try {
        const response = await fetch('/receiveloans/fetch_all');
        const data = await response.json();

        if (response.ok) {
            const tableBody = document.getElementById('loanTableBody');
            if (!tableBody) return;

            tableBody.innerHTML = '';
            data.forEach(loan => {
                const localDate = new Date(loan.date).toLocaleDateString();
                const row = document.createElement('tr');
                row.dataset.id = loan.transaction_id;
                row.innerHTML = `
                    <td>${localDate}</td>
                    <td>${loan.transaction_id}</td>
                    <td>${loan.name}</td>
                    <td>₨${parseFloat(loan.amount).toFixed(2)}</td>
                    <td>${loan.loan_type}</td>
                    <td>${loan.installment_number || '-'}</td>
                    <td>₨${parseFloat(loan.remaining_amount || 0).toFixed(2)}</td>
                    <td class="action-buttons">
                        <button class="finance-button edit-btn" data-id="${loan.transaction_id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="finance-button delete-btn" data-id="${loan.transaction_id}" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Add event listeners to buttons
            attachTableButtonListeners();
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error loading loans', 'error');
    }
}

// Add this function for button event listeners
function attachTableButtonListeners() {
    const table = document.getElementById('loanTableBody');
    if (!table) return;

    table.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const transactionId = button.dataset.id;
        if (!transactionId) return;

        if (button.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this loan?')) {
                await deleteLoan(transactionId);
            }
        } else if (button.classList.contains('edit-btn')) {
            await editLoan(transactionId);
        }
    });
}

window.addEventListener('load', fetchDataAndDisplay);
function searchAndHighlight() {
    const searchTerm = document.getElementById('searchInputTable').value.toLowerCase();
    const tableRows = document.querySelectorAll('#loanTableBody tr');
    let found = false;
    tableRows.forEach(row => {
        const rowContent = row.textContent.toLowerCase();
        if (rowContent.includes(searchTerm)) {
            // Highlight the entire row or specific cells as needed
            row.style.backgroundColor = '#d35400';
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found = true; 
        } else {
            row.style.backgroundColor = ''; // Reset background color
        }
    });
    if (!found) {
        alert('Term not found!');
    }
}

function deleteLoan(transactionId) {
    const confirmDelete = confirm('Are you sure you want to delete this loan?');

    if (confirmDelete) {
        // Perform the deletion
        fetch(`/receiveloans/delete_loan/${transactionId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                // Refresh the table after deletion
                fetchDataAndDisplay();
                console.log('Loan deleted successfully!');
            } else {
                console.error('Failed to delete loan.');
            }
        })
        .catch(error => {
            console.error('Error deleting loan:', error);
        });
    }
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

async function displayLoanData(data) {
    const tableBody = document.getElementById('loanTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    data.forEach(loan => {
        const localDate = new Date(loan.date).toLocaleDateString();
        const row = document.createElement('tr');
        row.dataset.id = loan.transaction_id;
        
        row.innerHTML = `
            <td>${localDate}</td>
            <td>${loan.transaction_id}</td>
            <td>${loan.name}</td>
            <td>₨${parseFloat(loan.amount).toFixed(2)}</td>
            <td>${loan.loan_type}</td>
            <td>${loan.installment_number || '-'}</td>
            <td>₨${parseFloat(loan.remaining_amount || 0).toFixed(2)}</td>
            <td>
                <button class="finance-button edit-btn" data-id="${loan.transaction_id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="finance-button delete-btn" data-id="${loan.transaction_id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to buttons
    attachTableButtonListeners();
}

function attachTableButtonListeners() {
    const table = document.getElementById('loanTableBody');
    if (!table) return;

    table.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const transactionId = button.dataset.id;
        if (!transactionId) return;

        if (button.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this loan?')) {
                await deleteLoan(transactionId);
            }
        } else if (button.classList.contains('edit-btn')) {
            await editLoan(transactionId);
        }
    });
}

async function editLoan(transactionId) {
    // Find the loan data from the table
    const row = document.querySelector(`tr[data-id="${transactionId}"]`);
    if (!row) return;

    const cells = row.getElementsByTagName('td');
    
    // Populate form
    document.getElementById('transaction_id').value = cells[1].textContent;
    document.getElementById('name').value = cells[2].textContent;
    document.getElementById('amount').value = cells[3].textContent.replace(/[₨,\s]/g, '');
    document.getElementById('loan_type').value = cells[4].textContent;
    
    if (cells[4].textContent === 'monthly_installment') {
        document.getElementById('installmentFields').style.display = 'block';
        document.getElementById('installment_number').value = cells[5].textContent;
        document.getElementById('remaining_amount').value = cells[6].textContent.replace(/[₨,\s]/g, '');
    }

    // Change submit button text
    const submitButton = document.querySelector('input[type="submit"]');
    submitButton.value = 'Update Loan';
    
    // Scroll to form
    document.getElementById('receiveLoanForm').scrollIntoView({ behavior: 'smooth' });
}