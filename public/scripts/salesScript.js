document.addEventListener('DOMContentLoaded', async function () {
    await fetchProductsByCategory();
    await fetchCategoryNames();
    updateUserNameFromSession()
    updateUserName();

    const currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = currentDate;

    await fetchAndRenderSalesTable();
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', updateCalculations);
    }

    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveSalesToDatabase);
    }

    const posDropdownBtn = document.getElementById("pos-dropdown-btn");
    const posDropdownContent = document.getElementById("pos-dropdown-content");
    
    // Toggle dropdown on button click
    posDropdownBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default link behavior
        if (posDropdownContent.style.display === "flex") {
            posDropdownContent.style.display = "none"; // Hide dropdown if already open
        } else {
            posDropdownContent.style.display = "flex"; // Show dropdown
        }
    });


    const productNameSelect = document.getElementById('productName');
    if (productNameSelect) {
        productNameSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            
            if (selectedOption && !selectedOption.disabled) {
                const skuInput = document.getElementById('sku');
                const priceInput = document.getElementById('price');
                const costInput = document.getElementById('cost');
                const quantityInput = document.getElementById('quantity');

      
                if (skuInput) skuInput.value = selectedOption.dataset.sku;
                if (priceInput) priceInput.value = selectedOption.dataset.price;
                if (costInput) costInput.value = selectedOption.dataset.cost;
                
    
                if (quantityInput) {
                    quantityInput.value = '1';
                }

       
                updateCalculations();
            }
        });
    }

    document.getElementById('salesDataBody').addEventListener('click', async (event) => {
        const target = event.target;
        
        if (target.getAttribute('data-action') === 'print') {
     
            const row = target.closest('tr');
            if (row) {
                printReceipt(row);
            }
        } else if (target.getAttribute('data-action') === 'delete') {
            const row = target.closest('tr');
            const id = row.getAttribute('data-id');
            if (id && await showConfirmationModal('Are you sure you want to delete this sale?')) {
                try {
                    const response = await fetch(`/api/sales/deleteSalesItem/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        await fetchAndRenderSalesTable();
                        if (result.inventoryUpdate && window.fetchAndRenderInventoryTable) {
                            await window.fetchAndRenderInventoryTable();
                        }
                        showMessage('Sale deleted successfully', 'success');
                    } else {
                        throw new Error(result.error || 'Failed to delete sale');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showMessage(error.message || 'Error deleting sale', 'error');
                }
            }
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const loanDropdownBtn = document.getElementById("loan-dropdown-btn");
    const loanDropdownContent = document.getElementById("loan-dropdown-content");
    
    if (loanDropdownBtn && loanDropdownContent) {
        loanDropdownBtn.addEventListener("click", function(event) {
            event.preventDefault();
            if (loanDropdownContent.style.display === "flex") {
                loanDropdownContent.style.display = "none";
            } else {
                loanDropdownContent.style.display = "flex";
            }
        });
    }
});

let currentSku = '';
let isEditing = false;
let editingId = null;

async function initializeForm() {
    await fetchCategoryNames();
    setupEventListeners();
}

async function fetchCategoryNames() {
    try {
        const response = await fetch('/api/sales/categories', { // Updated path
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categoryNames = await response.json();
        
        if (!Array.isArray(categoryNames)) {
            throw new Error('Invalid response format');
        }

        const categoryNameSelect = document.getElementById('categoryName');
        const productNameSelect = document.getElementById('productName');

        // Clear existing options
        categoryNameSelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
        productNameSelect.innerHTML = '<option value="" disabled selected>Select a category first</option>';

        // Add new options
        categoryNames.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryNameSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error in fetchCategoryNames:', error);
        // Show error to user
        const categoryNameSelect = document.getElementById('categoryName');
        if (categoryNameSelect) {
            categoryNameSelect.innerHTML = '<option value="">Error loading categories</option>';
        }
    }
}

function setupEventListeners() {
    const form = document.getElementById('salesForm');
    const categoryNameSelect = document.getElementById('categoryName');
    const productNameSelect = document.getElementById('productName');

    if (categoryNameSelect) {
        categoryNameSelect.addEventListener('change', handleCategoryChange);
    }

    if (productNameSelect) {
        productNameSelect.addEventListener('change', handleProductChange);
    }

    if (form) {
        // Remove old listeners first
        form.removeEventListener('submit', handleFormSubmit);
        form.removeEventListener('reset', handleFormReset);

        // Add new listeners
        form.addEventListener('submit', handleFormSubmit);
        form.addEventListener('reset', handleFormReset);
    }
}

async function handleCategoryChange(event) {
    const selectedCategory = event.target.value;
    console.log('Category changed to:', selectedCategory); // Debug log
    if (selectedCategory) {
        await fetchProductsByCategory(selectedCategory);
    }
}

async function fetchProductsByCategory(categoryName) {
    if (!categoryName) {
        console.log('No category name provided');
        return;
    }

    try {
        console.log('Fetching products for category:', categoryName);
        
        const response = await fetch(`/api/sales/products/category/${encodeURIComponent(categoryName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        const productNameSelect = document.getElementById('productName');
        
        // Clear existing options
        productNameSelect.innerHTML = '<option value="" disabled selected>Select a product</option>';
        
        // Add new product options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.productName;
            option.textContent = product.productName;
            option.dataset.sku = product.sku;
            option.dataset.price = product.price;
            option.dataset.cost = product.cost;
            productNameSelect.appendChild(option);
        });

        // Enable the product select
        productNameSelect.disabled = false;

    } catch (error) {
        console.error('Error fetching products:', error);
        const productNameSelect = document.getElementById('productName');
        productNameSelect.innerHTML = '<option value="">Error loading products</option>';
    }
}
function handleProductChange(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const skuInput = document.getElementById('sku');
    const priceInput = document.getElementById('price');
    const costInput = document.getElementById('cost');
    const quantityInput = document.getElementById('quantity');
    const profitInput = document.getElementById('profit');
    const totalInput = document.getElementById('total');

    if (selectedOption && !selectedOption.disabled) {
        if (skuInput) skuInput.value = selectedOption.dataset.sku;
        if (priceInput) priceInput.value = selectedOption.dataset.price;
        if (costInput) priceInput.value = selectedOption.dataset.cost;
        currentSku = selectedOption.dataset.sku;
        if (quantityInput) quantityInput.value = '1';
        const price = parseFloat((priceInput.value_)*quantityInput) || 0;
        const cost = parseFloat((costInput.value)* quantityInput) || 0;
        const quantity = 1; 

    
        const profit = (price - cost) * quantity;
        if (profitInput) profitInput.value = profit.toFixed(2);

        const total = price * quantity;
        if (totalInput) totalInput.value = total.toFixed(2);
    }
}
function updateCalculations() {
    const priceInput = document.getElementById('price');
    const costInput = document.getElementById('cost');
    const quantityInput = document.getElementById('quantity');
    const profitInput = document.getElementById('profit');
    const totalInput = document.getElementById('total');


    if (!priceInput || !costInput || !quantityInput || !profitInput || !totalInput) {
        console.error('One or more calculation inputs are missing');
        return;
    }

    const quantity = parseFloat(quantityInput.value) || 0;
    const price = parseFloat((priceInput.value)) || 0;
    const cost = parseFloat((costInput.value)) || 0;
  
    const profit = (price - cost) * quantity;
    profitInput.value = profit.toFixed(2);

    const total = price * quantity;
    totalInput.value = total.toFixed(2);
}
document.addEventListener('DOMContentLoaded', initializeForm);
// Main function to fetch and render sales table
async function fetchAndRenderSalesTable() {
    try {
        const response = await fetch('/api/sales/fetchSalesData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sales data');
        }

        const salesData = await response.json();
        renderSalesTable(salesData);
        return salesData;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        showMessage('Error fetching sales data', 'error');
    }
}

// Render sales table with fetched data
function renderSalesTable(data) {
    const tableBody = document.getElementById('salesDataBody');
    const totalSalesElement = document.getElementById('totalSalesAmount');
    
    if (!tableBody) {
        console.error('Sales table body not found');
        return;
    }
    
    tableBody.innerHTML = '';
    let totalSales = 0;
    
    if (!Array.isArray(data)) {
        console.error('Invalid sales data format:', data);
        return;
    }

    // Sort data by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    data.forEach(row => {
        const localDate = new Date(row.date).toLocaleDateString();
        const newRow = tableBody.insertRow(-1);
        newRow.setAttribute('data-id', row.id);
        
        newRow.innerHTML = `
            <td>${localDate}</td>
            <td>${row.categoryName}</td>
            <td>${row.productName}</td>
            <td>${row.quantity}</td>
            <td>${row.price}</td>
            <td>${row.discount || 0}</td>
            <td>${row.cost}</td>
            <td>${row.profit}</td>
            <td>${row.total}</td>
            <td>
                <button data-action="print" class="btn-print">Print</button>
                <button type="button" class="editButton" data-id="${row.id}">Edit</button>
                <button data-action="delete" class="btn-delete">Delete</button>
            </td>
        `;
        
        totalSales += parseFloat(row.total) || 0;
    });

    if (totalSalesElement) {
        totalSalesElement.textContent = totalSales.toFixed(2);
    }

    // Add event delegation for table actions
    tableBody.removeEventListener('click', handleTableActions);
    tableBody.addEventListener('click', handleTableActions);
}

// Handle all table actions through event delegation
async function handleTableActions(event) {
    const target = event.target;
    const row = target.closest('tr');
    
    if (!row) return;
    
    if (target.classList.contains('editButton')) {
        const id = target.getAttribute('data-id');
        if (id) {
            await populateFormForEdit(await fetchSaleById(id));
        }
    } else if (target.classList.contains('btn-delete')) {
        await handleDeleteSale(row);
    } else if (target.classList.contains('btn-print')) {
        printReceipt(row);
    }
}

// Fetch single sale by ID
async function fetchSaleById(id) {
    try {
        const response = await fetch(`/api/sales/getSaleById/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sale data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching sale:', error);
        showMessage('Error fetching sale details', 'error');
        return null;
    }
}

// Handle sale deletion
async function handleDeleteSale(row) {
    const id = row.getAttribute('data-id');
    if (!id) return;

    if (!await showConfirmationModal('Are you sure you want to delete this sale?')) {
        return;
    }

    try {
        const response = await fetch(`/api/sales/deleteSalesItem/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete sale');
        }

        await fetchAndRenderSalesTable();
        
        if (result.inventoryUpdate && window.fetchAndRenderInventoryTable) {
            await window.fetchAndRenderInventoryTable();
        }
        
        showMessage('Sale deleted successfully', 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Error deleting sale', 'error');
    }
}

// Initialize sales table functionality
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndRenderSalesTable();
    
    // Set up refresh interval (optional)
    setInterval(fetchAndRenderSalesTable, 30000); // Refresh every 30 seconds
});

// Add event listener for form submission
const salesForm = document.getElementById('salesForm');
if (salesForm) {
    salesForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleFormSubmit(event);
        await fetchAndRenderSalesTable(); // Refresh table after submission
    });
}

// Add this new function to update sales totals
function updateSalesTotals(salesData) {
    const totalSalesAmountElement = document.getElementById('totalSalesAmount');
    if (!totalSalesAmountElement || !Array.isArray(salesData)) return;

    const totalSales = salesData.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
    totalSalesAmountElement.textContent = totalSales.toFixed(2);
}



function printReceipt(row) {
    const companyName = 'AWG International';
    
    const modalContainer = document.createElement('div');
    modalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    
    const printContent = document.createElement('div');
    printContent.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    printContent.innerHTML = `
        <div id="receipt-content">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2>${companyName}</h2>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Product Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${row.cells[0].innerHTML}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${row.cells[2].innerHTML}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${row.cells[3].innerHTML}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${row.cells[4].innerHTML}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${row.cells[7].innerHTML}</td>
                </tr>
            </table>
            <div>
                <h3>Instructions:</h3>
                <p>1. Items can be returned within two days of purchase.</p>
                <p>2. Thank you for choosing ${companyName}. We appreciate your business!</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="printButton" style="padding: 5px 20px; margin-right: 10px; margin-bottom: 5px;">Print</button>
                <button id="closeButton" style="padding: 5px 20px;">Close</button>
            </div>
        </div>
    `;

    modalContainer.appendChild(printContent);
    document.body.appendChild(modalContainer);

   
    document.getElementById('printButton').addEventListener('click', () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        @media print {
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${document.getElementById('receipt-content').innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
    });

    document.getElementById('closeButton').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });


    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
}

async function populateFormForEdit(rowData) {
    const form = document.getElementById('salesForm');
    
    try {
        // Set category first
        await fetchCategoryNames();
        const categorySelect = document.getElementById('categoryName');
        if (categorySelect) {
            categorySelect.value = rowData.categoryName;
        }

        // Fetch and set products
        await fetchProductsByCategory(rowData.categoryName);
        const productSelect = document.getElementById('productName');
        if (productSelect) {
            productSelect.value = rowData.productName;
        }

        // Set all form values
        const fields = [
            'date', 'sku', 'price', 'cost', 'quantity', 
            'discount', 'profit', 'total'
        ];

        fields.forEach(field => {
            const input = form.elements[field];
            if (input) {
                if (field === 'date') {
                    input.value = new Date(rowData[field]).toISOString().split('T')[0];
                } else {
                    input.value = rowData[field] || (field === 'discount' ? '0' : '');
                }
            }
        });

        // Set editing state
        isEditing = true;
        editingId = rowData.id;

        // Update save button text
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.textContent = 'Update';
        }

        // Update calculations
        updateCalculations();

        // Scroll form into view
        form.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error populating form:', error);
        showMessage('Error loading sale details', 'error');
    }
}

async function notifyInventoryUpdate(productName, quantity) {
    console.log('Notifying inventory update:', { productName, quantity });
    
    // Local event
    const event = new CustomEvent('inventoryUpdate', {
        detail: { productName, quantity, action: 'sale' }
    });
    window.dispatchEvent(event);
    
    // Try direct function call if available
    if (typeof window.fetchAndRenderInventoryTable === 'function') {
        await window.fetchAndRenderInventoryTable();
    }
    
    // Cross-tab communication
    localStorage.setItem('lastInventoryUpdate', JSON.stringify({
        timestamp: Date.now(),
        productName,
        quantity,
        action: 'sale'
    }));
}

async function updateInventoryDisplay() {
    try {
        const response = await fetch('/api/inventory/fetchInventoryData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch inventory data');
        }

        const inventoryData = await response.json();
        
        // Get inventory table
        const inventoryTable = document.getElementById('inventoryDataBody');
        if (inventoryTable) {
            // Clear existing rows
            inventoryTable.innerHTML = '';
            
            // Render new rows
            inventoryData.forEach(row => {
                const quantity = parseInt(row.quantity) || 0;
                const cost = parseFloat(row.cost) || 0;
                const total = (quantity * cost).toFixed(2);
                const displayDate = new Date(row.date).toLocaleDateString();
                
                const newRow = inventoryTable.insertRow(-1);
                newRow.setAttribute('data-id', row.id);
                newRow.innerHTML = `
                    <td>${displayDate}</td>
                    <td>${row.categoryName || row.category_name}</td>
                    <td>${row.productName || row.product_name}</td>
                    <td>${row.supplierName || row.supplier_name}</td>
                    <td>${row.price}</td>
                    <td>${row.cost}</td>
                    <td>${quantity}</td>
                    <td>${total}</td>
                    <td>
                        <button type="button" class="editButton" data-id="${row.id}">Edit</button>
                        <button type="button" data-action="delete" data-id="${row.id}">Delete</button>
                    </td>
                `;
            });

            // Update totals if the function exists
            if (typeof calculateTotalInventory === 'function') {
                calculateTotalInventory();
            }
        }

    } catch (error) {
        console.error('Error updating inventory display:', error);
    }
}

async function saveSalesToDatabase(event) {
    event.preventDefault();
    const form = document.getElementById('salesForm');
    
    try {
        const saleData = [{
            date: form.elements.date.value,
            categoryName: form.elements.categoryName.value,
            productName: form.elements.productName.value,
            sku: form.elements.sku.value,
            quantity: parseInt(form.elements.quantity.value),
            price: parseFloat(form.elements.price.value),
            discount: parseFloat(form.elements.discount.value || 0),
            cost: parseFloat(form.elements.cost.value),
            profit: parseFloat(form.elements.profit.value),
            total: parseFloat(form.elements.total.value)
        }];

        const saveResponse = await fetch('/api/sales/saveSalesToDatabase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'include',
            body: JSON.stringify(saleData)
        });

        const result = await saveResponse.json();

        if (!saveResponse.ok) {
            throw new Error(result.error || 'Failed to save sale');
        }

        // Clear form
        const currentDate = form.elements.date.value;
        form.reset();
        form.elements.date.value = currentDate;

        // Force refresh both tables
        await Promise.all([
            fetchAndRenderSalesTable(),
            window.fetchAndRenderInventoryTable && window.fetchAndRenderInventoryTable(true)
        ]);

        showMessage('Sale completed successfully', 'success');

        // Reset form state
        resetCategoryAndProduct();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Failed to complete sale', 'error');
    }
}

// Add this new function to reset category and product dropdowns
function resetCategoryAndProduct() {
    const categorySelect = document.getElementById('categoryName');
    const productSelect = document.getElementById('productName');
    
    if (categorySelect) {
        categorySelect.value = '';
    }
    
    if (productSelect) {
        productSelect.innerHTML = '<option value="" disabled selected>Select a category first</option>';
        productSelect.disabled = true;
    }
}

// Add this new function to update inventory table
async function updateInventoryTable() {
    try {
        const response = await fetch('/api/inventory/fetchInventoryData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            cache: 'no-cache'
        });

        if (!response.ok) throw new Error('Failed to fetch inventory');

        const data = await response.json();
        const inventoryTable = document.getElementById('inventoryDataBody');
        
        if (inventoryTable) {
            inventoryTable.innerHTML = '';
            data.forEach(item => {
                const row = inventoryTable.insertRow();
                const quantity = parseInt(item.quantity) || 0;
                const cost = parseFloat(item.cost) || 0;
                row.innerHTML = `
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.categoryName || item.category_name}</td>
                    <td>${item.productName || item.product_name}</td>
                    <td>${item.supplierName || item.supplier_name}</td>
                    <td>${item.price}</td>
                    <td>${item.cost}</td>
                    <td>${quantity}</td>
                    <td>${(quantity * cost).toFixed(2)}</td>
                    <td>
                        <button type="button" class="editButton" data-id="${item.id}">Edit</button>
                        <button type="button" data-action="delete" data-id="${item.id}">Delete</button>
                    </td>
                `;
            });
            
            // Update inventory totals if the function exists
            if (typeof calculateTotalInventory === 'function') {
                calculateTotalInventory();
            }
        }
    } catch (error) {
        console.error('Error updating inventory table:', error);
    }
}

// Add event listener for inventory updates
window.addEventListener('inventoryUpdate', async (event) => {
    console.log('Inventory update event received:', event.detail);
    if (typeof fetchAndRenderInventoryTable === 'function') {
        await fetchAndRenderInventoryTable();
    }
});

async function updateSale(id, data) {
    try {
        const response = await fetch(`/api/sales/updateSalesItem/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify([data])
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update sale');
        }

        // Update both sales and inventory tables
        await fetchAndRenderSalesTable();
        if (result.inventoryUpdate && window.fetchAndRenderInventoryTable) {
            await window.fetchAndRenderInventoryTable();
        }
        
        showMessage('Sale updated successfully', 'success');
        resetForm();
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Error updating sale', 'error');
    }
}

// Add these helper functions at the top
function showMessage(message, type) {
    const messageDiv = document.getElementById('salesMessage') || createMessageDiv();
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function createMessageDiv() {
    const div = document.createElement('div');
    div.id = 'salesMessage';
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(div);
    return div;
}

// Update the handleProductChange function
function handleProductChange(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const skuInput = document.getElementById('sku');
    const priceInput = document.getElementById('price');
    const costInput = document.getElementById('cost');
    const quantityInput = document.getElementById('quantity');
    const profitInput = document.getElementById('profit');
    const totalInput = document.getElementById('total');

    if (selectedOption && !selectedOption.disabled) {
        // Fix the value assignments
        if (skuInput) skuInput.value = selectedOption.dataset.sku || '';
        if (priceInput) priceInput.value = selectedOption.dataset.price || '0';
        if (costInput) costInput.value = selectedOption.dataset.cost || '0'; // Fix: was using priceInput
        currentSku = selectedOption.dataset.sku;
        
        // Set default quantity
        if (quantityInput) quantityInput.value = '1';
        
        // Calculate initial values
        const price = parseFloat(priceInput.value) || 0;
        const cost = parseFloat(costInput.value) || 0;
        const quantity = parseInt(quantityInput.value) || 1;

        // Calculate profit and total
        const profit = (price - cost) * quantity;
        if (profitInput) profitInput.value = profit.toFixed(2);

        const total = price * quantity;
        if (totalInput) totalInput.value = total.toFixed(2);

        // Log for debugging
        console.log('Product change values:', {
            sku: selectedOption.dataset.sku,
            price: price,
            cost: cost,
            profit: profit,
            total: total
        });
    }
}

// Update the fetchAndRenderSalesTable function
async function fetchAndRenderSalesTable(forceRefresh = false) {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/sales/fetchSalesData?t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': forceRefresh ? 'no-cache' : 'default',
                'Pragma': forceRefresh ? 'no-cache' : 'default'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch sales data');
        }

        const salesData = await response.json();
        console.log('Fetched sales data:', salesData);
        
        renderSalesTable(salesData);
        return salesData;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        showMessage('Error fetching sales data', 'error');
    }
}

// Update the renderSalesTable function
function renderSalesTable(data) {
    const tableBody = document.getElementById('salesDataBody');
    const totalSalesElement = document.getElementById('totalSalesAmount');
    
    if (!tableBody) {
        console.error('Sales table body not found');
        return;
    }
    
    // Clear existing content
    tableBody.innerHTML = '';
    let totalSales = 0;
    
    if (!Array.isArray(data)) {
        console.error('Invalid sales data format:', data);
        return;
    }

    // Sort data by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    data.forEach(row => {
        const localDate = new Date(row.date).toLocaleDateString();
        const newRow = tableBody.insertRow(-1);
        newRow.setAttribute('data-id', row.id);
        newRow.innerHTML = `<td>${localDate}</td>
                          <td>${row.categoryName}</td>
                          <td>${row.productName}</td>
                          <td>${row.quantity}</td>
                          <td>${row.price}</td>
                          <td>${row.discount || 0}</td>
                          <td>${row.cost}</td>
                          <td>${row.profit}</td>
                          <td>${row.total}</td>
                          <td>
                            <button data-action="print">Print</button>
                            <button type="button" class="editButton" data-id="${row.id}">Edit</button>
                            <button data-action="delete">Delete</button>
                          </td>`;
        
        // Add to total sales
        totalSales += parseFloat(row.total) || 0;
    });

    // Update total sales amount if element exists
    if (totalSalesElement) {
        totalSalesElement.textContent = totalSales.toFixed(2);
    }

    // Attach edit button listeners
    document.querySelectorAll('.editButton').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.getAttribute('data-id');
            const rowData = data.find(item => item.id == id);
            if (rowData) {
                await populateFormForEdit(rowData);
            }
        });
    });
}

// Add this function to handle form submissions
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('salesForm');
    
    try {
        const formData = {
            date: form.elements.date.value,
            categoryName: form.elements.categoryName.value,
            productName: form.elements.productName.value,
            sku: form.elements.sku.value,
            quantity: parseInt(form.elements.quantity.value),
            price: parseFloat(form.elements.price.value),
            discount: parseFloat(form.elements.discount.value || 0),
            cost: parseFloat(form.elements.cost.value),
            profit: parseFloat(form.elements.profit.value),
            total: parseFloat(form.elements.total.value)
        };

        const endpoint = isEditing ? 
            `/api/sales/updateSalesItem/${editingId}` : 
            '/api/sales/saveSalesToDatabase';

        const response = await fetch(endpoint, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            credentials: 'include',
            body: JSON.stringify([formData])
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to process sale');
        }

        const result = await response.json();

        // Force refresh the sales table with fresh data
        await fetchAndRenderSalesTable(true);
        
        // Update inventory if available
        if (window.fetchAndRenderInventoryTable) {
            await window.fetchAndRenderInventoryTable(true);
        }

        // Reset form and show success message
        resetForm();
        showMessage(isEditing ? 'Sale updated successfully' : 'Sale completed successfully', 'success');

        // Reset edit state
        isEditing = false;
        editingId = null;

        // Update save button text
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.textContent = 'Save';
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Failed to process sale', 'error');
    }
}

// Add this helper function
function resetForm() {
    const form = document.getElementById('salesForm');
    if (!form) return;

    form.reset();

    // Set current date
    const dateInput = form.elements.date;
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Reset dropdowns
    resetCategoryAndProduct();

    // Clear editing state
    isEditing = false;
    editingId = null;

    // Reset button text
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.textContent = 'Save';
    }
}

// Updated handleFormSubmit function to handle both new sales and updates
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('salesForm');
    
    try {
        const formData = {
            date: form.elements.date.value,
            categoryName: form.elements.categoryName.value,
            productName: form.elements.productName.value,
            sku: form.elements.sku.value,
            quantity: parseInt(form.elements.quantity.value),
            price: parseFloat(form.elements.price.value),
            discount: parseFloat(form.elements.discount.value || 0),
            cost: parseFloat(form.elements.cost.value),
            profit: parseFloat(form.elements.profit.value),
            total: parseFloat(form.elements.total.value)
        };

        const endpoint = isEditing ? 
            `/api/sales/updateSalesItem/${editingId}` : 
            '/api/sales/saveSalesToDatabase';

        const response = await fetch(endpoint, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'include',
            body: JSON.stringify([formData])
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to process sale');
        }

        // Immediately fetch fresh sales data
        const freshSalesData = await fetchLatestSalesData();
        renderSalesTable(freshSalesData);

        // Update inventory if needed
        if (window.fetchAndRenderInventoryTable) {
            await window.fetchAndRenderInventoryTable(true);
        }

        // Reset form and show success message
        resetForm();
        showMessage(isEditing ? 'Sale updated successfully' : 'Sale completed successfully', 'success');

        // Reset edit state
        isEditing = false;
        editingId = null;

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Failed to process sale', 'error');
    }
}

// Add new function to fetch latest sales data
async function fetchLatestSalesData() {
    const response = await fetch('/api/sales/fetchSalesData', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch sales data');
    }

    const data = await response.json();
    console.log('Fresh sales data fetched:', data);
    return data;
}

// Update the delete handler
async function handleDeleteSale(target) {
    const row = target.closest('tr');
    if (!row) return;

    const id = row.getAttribute('data-id');
    if (!id) return;

    try {
        const response = await fetch(`/api/sales/deleteSalesItem/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete sale');
        }

        // Immediately fetch fresh data
        const freshSalesData = await fetchLatestSalesData();
        renderSalesTable(freshSalesData);

        // Update inventory if needed
        if (result.inventoryUpdate && window.fetchAndRenderInventoryTable) {
            await window.fetchAndRenderInventoryTable(true);
        }

        showMessage('Sale deleted successfully', 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Error deleting sale', 'error');
    }
}

// Update the renderSalesTable function to properly handle the data
function renderSalesTable(data) {
    const tableBody = document.getElementById('salesDataBody');
    const totalSalesElement = document.getElementById('totalSalesAmount');
    
    if (!tableBody) {
        console.error('Sales table body not found');
        return;
    }
    
    // Clear existing content
    tableBody.innerHTML = '';
    let totalSales = 0;
    
    if (!Array.isArray(data)) {
        console.error('Invalid sales data format:', data);
        return;
    }

    // Sort data by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    data.forEach(row => {
        const localDate = new Date(row.date).toLocaleDateString();
        const newRow = tableBody.insertRow(-1);
        newRow.setAttribute('data-id', row.id);
        
        newRow.innerHTML = `
            <td>${localDate}</td>
            <td>${row.categoryName}</td>
            <td>${row.productName}</td>
            <td>${row.quantity}</td>
            <td>${row.price}</td>
            <td>${row.discount || 0}</td>
            <td>${row.cost}</td>
            <td>${row.profit}</td>
            <td>${row.total}</td>
            <td>
                <button data-action="print" class="btn-print">Print</button>
                <button type="button" class="editButton" data-id="${row.id}">Edit</button>
                <button data-action="delete" class="btn-delete">Delete</button>
            </td>
        `;
        
        totalSales += parseFloat(row.total) || 0;
    });

    // Update total sales amount
    if (totalSalesElement) {
        totalSalesElement.textContent = totalSales.toFixed(2);
    }

    // Reattach event listeners
    attachTableEventListeners(tableBody);
}

// Add function to attach event listeners to table actions
function attachTableEventListeners(tableBody) {
    tableBody.addEventListener('click', async (event) => {
        const target = event.target;
        
        if (target.classList.contains('editButton')) {
            const row = target.closest('tr');
            const id = target.getAttribute('data-id');
            if (row && id) {
                const data = await fetchLatestSalesData();
                const rowData = data.find(item => item.id == id);
                if (rowData) {
                    await populateFormForEdit(rowData);
                }
            }
        } else if (target.classList.contains('btn-delete')) {
            await handleDeleteSale(target);
        } else if (target.classList.contains('btn-print')) {
            const row = target.closest('tr');
            if (row) {
                printReceipt(row);
            }
        }
    });
}

// Add a single handleFormReset function
function handleFormReset() {
    setTimeout(() => {
        fetchCategoryNames();
    }, 0);
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