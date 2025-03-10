function getCurrentDate() {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = String(currentDate.getMonth() + 1).padStart(2, '0');
    var day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
  
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    document.getElementById('date').value = getCurrentDate();
    
    // Setup service type change handler
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            const companyField = document.getElementById('companyField');
            if (this.value === 'Easy Load') {
                companyField.style.display = 'block';
                document.getElementById('company').required = true;
            } else {
                companyField.style.display = 'none';
                document.getElementById('company').required = false;
            }
        });
    }

    // Setup other event listeners
    setupEventListeners();
    
    // Initial data fetch
    fetchUserData();
    fetchCommissions();
});

function setupEventListeners() {
    // Get form elements
    const form = document.getElementById('commissionForm');
    const tableBody = document.getElementById('commissionTable').getElementsByTagName('tbody')[0];

    // Add submit event listener to form instead of button
    if (form) {
        form.addEventListener('submit', saveCommission);
    }

    // Add event delegation for edit buttons
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('edit-btn')) {
                const commissionId = target.dataset.id;
                if (commissionId) {
                    editCommission(commissionId);
                }
            }
        });
    }

    // Other event listeners
    const elements = {
        totalProfitButton: document.getElementById('totalProfitButton'),
        searchButton: document.getElementById('searchButton'),
        backButton: document.getElementById('back-button')
    };

    if (elements.totalProfitButton) {
        elements.totalProfitButton.addEventListener('click', calculateTotalProfit);
    }
    if (elements.searchButton) {
        elements.searchButton.addEventListener('click', searchAndHighlight);
    }
    if (elements.backButton) {
        elements.backButton.addEventListener('click', goBack);
    }

    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const filterFromDate = document.getElementById('filterFromDate');
    const filterToDate = document.getElementById('filterToDate');
    
    if (filterFromDate && filterToDate) {
        filterFromDate.value = formatDateForInput(firstDay);
        filterToDate.value = formatDateForInput(lastDay);
    }

    // Add filter buttons event listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const service = button.dataset.service;
            const fromDate = filterFromDate.value;
            const toDate = filterToDate.value;
            filterCommissions(service, fromDate, toDate);
        });
    });

    // Add date filter change listeners
    [filterFromDate, filterToDate].forEach(input => {
        if (input) {
            input.addEventListener('change', () => {
                const activeService = document.querySelector('.filter-btn.active')?.dataset.service || 'all';
                filterCommissions(activeService, filterFromDate.value, filterToDate.value);
            });
        }
    });
}

async function saveCommission(event) {
    event.preventDefault();

    try {
        // Get form elements safely with null checks
        const formElements = {
            date: document.getElementById('date'),
            phone: document.getElementById('phone'),
            amount: document.getElementById('amount'),
            service: document.getElementById('service'),
            company: document.getElementById('company'),
            discount: document.getElementById('discount'),
            commissionId: document.getElementById('commissionId')
        };

        // Validate required fields exist
        if (!formElements.date || !formElements.amount || !formElements.service) {
            throw new Error('Required form fields are missing');
        }

        const formData = {
            date: formElements.date.value || getCurrentDate(),
            phone: formElements.phone?.value || '0',
            amount: parseFloat(formElements.amount.value) || 0,
            service: formElements.service.value,
            company: formElements.service.value === 'Easy Load' ? 
                    formElements.company?.value : null,
            discount: parseFloat(formElements.discount?.value) || 0
        };

        // Calculate profit based on service type
        switch(formData.service) {
            case 'Jazz Cash':
            case 'Easy Paisa':
                formData.profit = formData.amount * 0.01; // 1%
                break;
            case 'Bank':
            case 'Receiving':
                formData.profit = formData.amount * 0.02; // 2%
                break;
            case 'Easy Load':
                formData.profit = formData.amount * 0.026; // 2.6%
                break;
            default:
                formData.profit = 0;
        }

        // Calculate discount and final profit
        formData.discountAmount = (formData.profit * (formData.discount / 100));
        formData.profit = formData.profit - formData.discountAmount;

        const isEditing = document.getElementById('commissionId').value;
        const url = isEditing ? 
            `/api/commissions/updateCommission/${isEditing}` : 
            '/api/commissions/saveCommission';

        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            showToast(isEditing ? 'Commission updated successfully' : 'Commission saved successfully', 'success');
            resetForm();
            await fetchCommissions();
        } else {
            throw new Error(data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'error');
    }
}

async function fetchCommissions() {
    try {
        const response = await fetch('/api/commissions/getCommissions', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch commissions');
        }

        displayCommissions(data.commissions);
    } catch (error) {
        console.error('Error:', error);
        showToast('Error fetching commissions', 'error');
    }
}

function displayCommissions(commissions) {
    const tbody = document.querySelector('#commissionTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    commissions.forEach(comm => {
        const row = document.createElement('tr');
        row.dataset.id = comm.id; // Store ID in data attribute
        row.className = `service-row ${comm.service.toLowerCase().replace(' ', '-')}`;
        row.style.backgroundColor = getServiceColor(comm.service);
        
        row.innerHTML = `
            <td>${formatDate(comm.date)}</td>
            <td>${comm.phone === '0' ? '-' : comm.phone}</td>
            <td>₨${parseFloat(comm.amount).toFixed(2)}</td>
            <td style="background-color: ${getServiceColor(comm.service)}; color: white;">
                ${comm.service}${comm.company ? ` (${comm.company})` : ''}
            </td>
            <td>₨${parseFloat(comm.profit).toFixed(2)}</td>
            <td>${parseFloat(comm.discount).toFixed(2)}%</td>
            <td>₨${parseFloat(comm.profit - comm.discountAmount).toFixed(2)}</td>
            <td>
                <button class="finance-button edit-btn" data-id="${comm.id}">
                    <i class="fas fa-edit"></i>
                </button>
                ${comm.updated ? '<span class="updated-badge">Updated</span>' : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getServiceColor(service) {
    const colors = {
        'Jazz Cash': '#ffe6e6', // Light pink
        'Easy Paisa': '#e6ffe6', // Light green
        'Easy Load': '#e6f3ff', // Light blue
        'Bank': '#fff2e6', // Light orange
        'Receiving': '#f5e6ff'  // Light purple
    };
    return colors[service] || '#ffffff';
}

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function editCommission(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;
    
    const form = document.getElementById('commissionForm');
    const cells = row.getElementsByTagName('td');
    
    try {
        document.getElementById('date').value = formatDateForInput(cells[0].textContent);
        document.getElementById('phone').value = cells[1].textContent === '-' ? '' : cells[1].textContent;
        document.getElementById('amount').value = cells[2].textContent.replace(/[₨,\s]/g, '');
        
        const serviceText = cells[3].textContent;
        const service = serviceText.split(' (')[0];
        document.getElementById('service').value = service;
        
        // Handle Easy Load company
        const companyField = document.getElementById('companyField');
        if (service === 'Easy Load') {
            companyField.style.display = 'block';
            const company = serviceText.match(/\((.*?)\)/);
            if (company && company[1]) {
                document.getElementById('company').value = company[1];
            }
        } else {
            companyField.style.display = 'none';
        }
        
        document.getElementById('discount').value = cells[5].textContent.replace('%', '');
        document.getElementById('commissionId').value = id;
        document.querySelector('#submit').textContent = 'Update Commission';
        
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error populating form:', error);
        showToast('Error editing commission', 'error');
    }
}

function resetForm() {
    document.getElementById('commissionForm').reset();
    document.getElementById('date').value = getCurrentDate();
    document.getElementById('commissionId').value = '';
    document.querySelector('#submit').textContent = 'Save Commission';
    document.getElementById('companyField').style.display = 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.className = `toast-notification ${type} show`;
    setTimeout(() => {
        toast.className = 'toast-notification';
    }, 3000);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function searchAndHighlight() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const tableRows = document.querySelectorAll('#commissionTable tr');
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
async function filterCommissions(service, fromDate, toDate) {
    try {
        const response = await fetch('/api/commissions/getCommissions', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch commissions');
        }

        let filteredCommissions = data.commissions;

        // Filter by date if provided
        if (fromDate && toDate) {
            filteredCommissions = filteredCommissions.filter(comm => {
                const commDate = new Date(comm.date);
                const startDate = new Date(fromDate);
                const endDate = new Date(toDate);
                // Set hours to compare full days
                commDate.setHours(0, 0, 0, 0);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                return commDate >= startDate && commDate <= endDate;
            });
        }

        // Filter by service if not 'all'
        if (service && service !== 'all') {
            filteredCommissions = filteredCommissions.filter(comm => 
                comm.service.toLowerCase() === service.toLowerCase()
            );
        }

        displayCommissions(filteredCommissions);
        calculateFilteredTotals(filteredCommissions, service);

    } catch (error) {
        console.error('Error:', error);
        showToast('Error fetching commissions', 'error');
    }
}

function calculateFilteredTotals(commissions, serviceType) {
    let totals = {
        amount: 0,
        commission: 0,
        discount: 0,
        netProfit: 0
    };

    commissions.forEach(comm => {
        totals.amount += parseFloat(comm.amount) || 0;
        totals.commission += parseFloat(comm.profit) || 0;
        totals.discount += parseFloat(comm.discountAmount) || 0;
        totals.netProfit += (parseFloat(comm.profit) - parseFloat(comm.discountAmount)) || 0;
    });

    const totalProfitElement = document.getElementById('totalProfit');
    if (totalProfitElement) {
        totalProfitElement.innerHTML = `
            <div class="profit-summary">
                <h3>${serviceType === 'all' ? 'All Services' : serviceType} Summary</h3>
                <p>Total Amount: ₨${totals.amount.toFixed(2)}</p>
                <p>Total Commission: ₨${totals.commission.toFixed(2)}</p>
                <p>Total Discount: ₨${totals.discount.toFixed(2)}</p>
                <p class="net-profit">Net Profit: ₨${totals.netProfit.toFixed(2)}</p>
                <p class="record-count">(${commissions.length} records)</p>
            </div>
        `;
    }
}

function calculateTotalProfit() {
  const table = document.getElementById('commissionTable');
  const rows = table.querySelectorAll('tr');
  let totalProfit = 0;

  // Start from index 1 to skip the header row
  for (let i = 1; i < rows.length; i++) {
    const profitCell = rows[i].cells[3]; // Assuming profit is in the 4th column (index 3)
    totalProfit += parseFloat(profitCell.textContent) || 0; // Handle NaN values
  }

  // Display the total profit below the button
  const totalProfitElement = document.getElementById('totalProfit');
  totalProfitElement.textContent = `Total Profit: ${totalProfit.toFixed(2)}`;
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

// Add this to your CSS or style tag
const styles = `
    .updated-badge {
        background-color: #4CAF50;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.8em;
        margin-left: 8px;
    }
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles + `
    .profit-summary {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
    }
    .profit-summary p {
        margin: 5px 0;
        font-size: 1.1em;
    }
    .net-profit {
        font-weight: bold;
        color: #2e7d32;
        font-size: 1.2em !important;
    }
    .edit-btn {
        padding: 5px 10px;
        font-size: 1em;
    }
    .edit-btn i {
        margin-right: 0;
    }
`;
document.head.appendChild(styleSheet);