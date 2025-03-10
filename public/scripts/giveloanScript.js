document.addEventListener('DOMContentLoaded', async function() {
    // Set current date
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Initialize event listeners
    initializeEventListeners();
    
    // Fetch initial data
    await Promise.all([
        fetchCustomerNames(),
        fetchAndDisplayLoanData(),
        fetchUserData()
    ]);
});

function initializeEventListeners() {
    // Form input handlers
    const loanForm = document.getElementById('loanForm');
    if (loanForm) {
        loanForm.addEventListener('submit', handleFormSubmit);

        // Add input event listeners for amount and installment calculations
        const amountInput = document.getElementById('amount');
        const installmentInput = document.getElementById('installment');
        
        if (amountInput) {
            amountInput.addEventListener('input', calculateMonthlyInstallment);
        }
        if (installmentInput) {
            installmentInput.addEventListener('input', calculateMonthlyInstallment);
        }
    }

    // Other button handlers
    const totalLoanBtn = document.getElementById('totalLoan');
    const searchBtn = document.getElementById('searchButton');

    if (totalLoanBtn) {
        totalLoanBtn.addEventListener('click', calculateTotalLoan);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', searchAndHighlight);
    }
}

async function fetchCustomerNames() {
    try {
        const response = await fetch('/giveloans/customer_names', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch customer names: ${response.statusText}`);
        }

        const customerNames = await response.json();
        const nameSelect = document.getElementById('name');
        
        if (nameSelect) {
            // Clear existing options
            nameSelect.innerHTML = '<option value="">Select Customer</option>';

            // Add customer names
            if (Array.isArray(customerNames)) {
                customerNames.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    nameSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error fetching customer names:', error);
        showMessage('Error loading customer names', 'error');
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        // Validate required fields
        if (!data.name || !data.amount || !data.installment) {
            showMessage('Please fill all required fields', 'error');
            return;
        }

        const response = await fetch('/giveloans/submit_loan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to submit loan');
        }

        showMessage('Loan submitted successfully', 'success');
        event.target.reset();
        document.getElementById('date').valueAsDate = new Date();
        await fetchAndDisplayLoanData();
        await loadCustomerHistory(data.name);

    } catch (error) {
        console.error('Error submitting loan:', error);
        showMessage('Failed to submit loan', 'error');
    }
}

function calculateMonthlyInstallment() {
    const amount = parseFloat(document.getElementById('amount')?.value) || 0;
    const installments = parseInt(document.getElementById('installment')?.value) || 1;
    const monthlyAmount = Math.floor(amount / installments);
    
    const monthlyInstallmentField = document.getElementById('monthlyInstallmentAmount');
    if (monthlyInstallmentField) {
        monthlyInstallmentField.value = monthlyAmount.toFixed(2);
    }
}

function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('successMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `alert-message ${type}`;
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'alert-message';
        }, 3000);
    }
}

function attachDeleteButtonEvents() {
    const deleteButtons = document.querySelectorAll('#loanTableBody button');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const transactionId = this.getAttribute('data-transaction-id');
            deleteLoan(transactionId);
        });
    });
}
// Function to fetch and display loan data
async function fetchAndDisplayLoanData() {
    try {
        const response = await fetch('/giveloans/loans');
        if (!response.ok) {
            throw new Error('Failed to fetch loan data.');
        }

        const data = await response.json();
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
                <td>${loan.installment}</td>
                <td>₨${parseFloat(loan.monthly_installment).toFixed(2)}</td>
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

        // Add single event listener for the table
        setupTableListeners(tableBody);
    } catch (error) {
        console.error('Error fetching loan data:', error);
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

// Initial fetch and display
fetchAndDisplayLoanData();

function deleteLoan(transactionId) {
    const confirmDelete = confirm('Are you sure you want to delete this loan?');

    if (confirmDelete) {
        // Perform the deletion
        fetch(`/giveloans/delete_loan/${transactionId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                // Refresh the table after deletion
                fetchAndDisplayLoanData();
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

async function calculateTotalLoan() {
    try {
        const tableRows = document.querySelectorAll('#loanTableBody tr');
        let totalLoan = 0;

        tableRows.forEach(row => {
            const amountColumn = row.querySelector('td:nth-child(4)'); // Adjust the column index based on your table structure
            if (amountColumn) {
                const amount = parseFloat(amountColumn.textContent) || 0;
                totalLoan += amount;
            }
        });

        // Update the total_loan column in the database
        const response = await fetch('/giveloans/update_total_loan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ totalLoan }),
        });

        if (!response.ok) {
            throw new Error('Failed to update total loan in the database.');
        }

        // Display success message or handle as needed
        document.getElementById('totalLoanDisplay').textContent = `Total Loan: ${totalLoan.toFixed(2)}`;
        console.log('Total loan updated successfully!');
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error updating total loan:', error);
    }
}
function searchAndHighlight() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
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

  // Call the fetchCustomerNames function when the page loads
  fetchCustomerNames();

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

function displayCommissions(data) {
    const tableBody = document.getElementById('loanTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    data.forEach(loan => {
        const row = document.createElement('tr');
        row.dataset.id = loan.transaction_id;
        row.innerHTML = `
            <td>${formatDate(loan.date)}</td>
            <td>${loan.transaction_id}</td>
            <td>${loan.name}</td>
            <td>₨${parseFloat(loan.amount).toFixed(2)}</td>
            <td>${loan.installment}</td>
            <td>₨${parseFloat(loan.monthly_installment).toFixed(2)}</td>
            <td>
                <button class="finance-button edit-btn" onclick="editLoan('${loan.transaction_id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="finance-button delete-btn" onclick="deleteLoan('${loan.transaction_id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function editLoan(transactionId) {
    const row = document.querySelector(`tr[data-id="${transactionId}"]`);
    if (!row) return;

    const cells = row.getElementsByTagName('td');
    
    try {
        // Populate form with loan data
        document.getElementById('date').value = formatDateForInput(cells[0].textContent);
        document.getElementById('name').value = cells[2].textContent;
        document.getElementById('amount').value = cells[3].textContent.replace(/[₨,\s]/g, '');
        document.getElementById('installment').value = cells[4].textContent;
        document.getElementById('monthlyInstallmentAmount').value = cells[5].textContent.replace(/[₨,\s]/g, '');
        
        // Add hidden input for transaction ID if it doesn't exist
        let hiddenInput = document.getElementById('transactionId');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'transactionId';
            document.getElementById('loanForm').appendChild(hiddenInput);
        }
        hiddenInput.value = transactionId;

        // Change submit button text
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.textContent = 'Update Loan';
        
        // Scroll to form
        document.getElementById('loanForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error in editLoan:', error);
        showMessage('Error loading loan data', 'error');
    }
}

function setupTableListeners(tableBody) {
    // Remove any existing listeners
    const oldTable = tableBody.cloneNode(true);
    tableBody.parentNode.replaceChild(oldTable, tableBody);

    // Add new listener
    oldTable.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const transactionId = target.dataset.id;
        if (!transactionId) return;

        if (target.classList.contains('delete-btn')) {
            await handleDelete(transactionId);
        } else if (target.classList.contains('edit-btn')) {
            await editLoan(transactionId);
        }
    });
}

async function handleDelete(transactionId) {
    if (!confirm('Are you sure you want to delete this loan?')) {
        return;
    }

    try {
        const response = await fetch(`/giveloans/delete_loan/${transactionId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete loan');
        }

        showMessage('Loan deleted successfully', 'success');
        await fetchAndDisplayLoanData();
    } catch (error) {
        console.error('Error deleting loan:', error);
        showMessage('Failed to delete loan', 'error');
    }
}

async function loadCustomerHistory(customerName) {
    try {
        const response = await fetch(`/giveloans/customer-history/${encodeURIComponent(customerName)}`);
        if (!response.ok) throw new Error('Failed to fetch customer history');
        
        const data = await response.json();
        updateCustomerStats(data.loanHistory, data.creditScore);
        updatePaymentHistory(data.recentPayments);
    } catch (error) {
        console.error('Error loading customer history:', error);
        showMessage('Error loading customer history', 'error');
    }
}

function updateCustomerStats(history, creditScore) {
    // Update loan amounts
    document.getElementById('totalAmountBorrowed').textContent = 
        formatCurrency(history.total_amount_borrowed || 0);
    document.getElementById('remainingAmount').textContent = 
        formatCurrency(history.total_remaining || 0);
    
    // Update loan counts
    document.getElementById('activeLoanCount').textContent = 
        (history.total_loans - history.completed_loans) || 0;
    document.getElementById('completedLoans').textContent = 
        history.completed_loans || 0;
    
    // Update credit score with color indicator
    const scoreElement = document.getElementById('creditScore');
    const score = Math.round(creditScore?.credit_score || 0);
    scoreElement.textContent = score;
    scoreElement.className = `stat-value ${getCreditScoreClass(score)}`;

    // Calculate and update payment rate
    const paymentRate = history.total_loans > 0 
        ? ((history.completed_loans / history.total_loans) * 100).toFixed(0)
        : 0;
    document.getElementById('paymentRate').textContent = paymentRate;
}

function updatePaymentHistory(payments = []) {
    const paymentList = document.querySelector('.payment-list');
    if (!paymentList) return;

    if (!payments.length) {
        paymentList.innerHTML = '<p class="text-center">No payment history available</p>';
        return;
    }

    paymentList.innerHTML = payments.map(payment => `
        <div class="payment-item">
            <div class="payment-info">
                <div class="payment-date">${formatDate(payment.payment_date)}</div>
                <div class="transaction-id">ID: ${payment.transaction_id}</div>
            </div>
            <div class="payment-amount">
                <span class="amount">₨${formatCurrency(payment.amount)}</span>
                <span class="remaining">Remaining: ₨${formatCurrency(payment.remaining_amount)}</span>
            </div>
        </div>
    `).join('');
}

function getCreditScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
}

function formatCurrency(amount) {
    return parseFloat(amount || 0).toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

document.getElementById('name').addEventListener('change', function() {
    if (this.value) {
        loadCustomerHistory(this.value);
    }
});

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}