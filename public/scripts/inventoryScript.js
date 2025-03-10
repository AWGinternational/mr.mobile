// Initialize global variables
let currentSku = '';
let isEditing = false;
let editingId = null;

// Single event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initial setup
        await Promise.all([
            fetchProductsByCategory(),
            fetchSupplierNames(),
            fetchCategoryNames()
        ]);

        // Set current date
        document.getElementById('date').value = new Date().toISOString().split('T')[0];

        // Initial table load
        await fetchAndRenderInventoryTable();
        calculateTotalInventory();

       
        setupEventListeners();

    } catch (error) {
        console.error('Error during initialization:', error);
        showMessage('Error initializing page', 'error');
    }
});

updateUserNameFromSession();
    
updateUserName();

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
// Centralized event listener setup
function setupEventListeners() {
    // Save button
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveToDatabase);
    }

    // Category change
    const categoryNameSelect = document.getElementById('categoryName');
    if (categoryNameSelect) {
        categoryNameSelect.addEventListener('change', handleCategoryChange);
    }

    // Product change
    const productNameSelect = document.getElementById('productName');
    if (productNameSelect) {
        productNameSelect.addEventListener('change', handleProductChange);
    }

    // Single event listener for inventory updates
    window.addEventListener('inventoryUpdate', handleInventoryUpdate);
}

// Updated saveToDatabase function
async function saveToDatabase(event) {
    event.preventDefault();
    const form = document.getElementById('inventoryForm');
    
    // ... existing validation code ...

    try {
        const endpoint = isEditing ? `/api/inventory/updateInventory/${editingId}` : '/api/inventory/saveToDatabase';
        const response = await fetch(endpoint, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'include',
            body: JSON.stringify([formData])
        });

        if (!response.ok) {
            throw new Error('Failed to save data');
        }

        const result = await response.json();

        // Force a fresh fetch of inventory data
        await fetchAndRenderInventoryTable(true);
        calculateTotalInventory();

        // Reset form and state
        resetInventoryForm();
        showMessage(isEditing ? 'Item updated successfully' : 'Item saved successfully', 'success');
        
        isEditing = false;
        editingId = null;
        currentSku = '';

        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.textContent = 'Save';
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Failed to save data', 'error');
    }
}

// Updated fetchAndRenderInventoryTable function
async function fetchAndRenderInventoryTable(forceRefresh = false) {
    try {
        console.log('Fetching inventory data...');
        const response = await fetch('/api/inventory/fetchInventoryData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': forceRefresh ? 'no-cache' : 'default',
                'Pragma': forceRefresh ? 'no-cache' : 'default'
            },
            credentials: 'include',
            cache: 'no-store' // Prevent caching
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const inventoryData = await response.json();
        console.log('Received inventory data:', inventoryData);
        
        renderInventoryTable(inventoryData);
        calculateTotalInventory();
        
        return inventoryData;
    } catch (error) {
        console.error('Error fetching inventory data:', error);
        showMessage('Error fetching inventory data', 'error');
        throw error;
    }
}

// Updated handleInventoryUpdate function
async function handleInventoryUpdate(event) {
    console.log('Inventory update event received:', event.detail);
    try {
        await fetchAndRenderInventoryTable();
        console.log('Inventory table updated successfully');
    } catch (error) {
        console.error('Error handling inventory update:', error);
    }
}

// Make function globally available
window.fetchAndRenderInventoryTable = fetchAndRenderInventoryTable;

// Add this new function for custom confirmation modal
function showConfirmationModal(message) {
    return new Promise((resolve) => {
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

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;

        modalContent.innerHTML = `
            <h3 style="margin-bottom: 20px; color: #333;">${message}</h3>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button id="confirmYes" style="
                    padding: 10px 25px;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.3s;
                ">Yes</button>
                <button id="confirmNo" style="
                    padding: 10px 25px;
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.3s;
                ">No</button>
            </div>
        `;

        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);

        // Add hover effects
        const yesButton = modalContent.querySelector('#confirmYes');
        const noButton = modalContent.querySelector('#confirmNo');

        yesButton.addEventListener('mouseover', () => {
            yesButton.style.backgroundColor = '#c82333';
        });
        yesButton.addEventListener('mouseout', () => {
            yesButton.style.backgroundColor = '#dc3545';
        });

        noButton.addEventListener('mouseover', () => {
            noButton.style.backgroundColor = '#5a6268';
        });
        noButton.addEventListener('mouseout', () => {
            noButton.style.backgroundColor = '#6c757d';
        });

        yesButton.addEventListener('click', () => {
            document.body.removeChild(modalContainer);
            resolve(true);
        });

        noButton.addEventListener('click', () => {
            document.body.removeChild(modalContainer);
            resolve(false);
        });
    });
}

async function fetchSupplierNames() {
    try {
        const response = await fetch('/api/inventory/fetchSupplierNames', { // Updated path
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const supplierNames = await response.json();

            if (Array.isArray(supplierNames)) {
                const supplierNameDropdown = document.getElementById('supplierName');

              
                supplierNameDropdown.innerHTML = '';

                supplierNames.forEach(supplierName => {
                    const option = document.createElement('option');
                    option.value = supplierName;
                    option.textContent = supplierName; 
                    supplierNameDropdown.appendChild(option);
                });
            } else {
                console.error('Invalid response format. Expected an array.');
            }
        } else {
            console.error('Failed to fetch supplier names');
        }
    } catch (error) {
        console.error('Error fetching supplier names:', error);
    }
}

async function initializeForm() {
    await fetchCategoryNames();
    setupEventListeners();
}

async function fetchCategoryNames() {
    try {
        const response = await fetch('/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const categoryNames = await response.json();
            console.log('Category Names:', categoryNames);

            const categoryNameSelect = document.getElementById('categoryName');
            const productNameSelect = document.getElementById('productName');

            if (!categoryNameSelect || !productNameSelect) {
                console.error('Required select elements not found');
                return;
            }

         
            categoryNameSelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
            productNameSelect.innerHTML = '<option value="" disabled selected>Select a category first</option>';

          
            categoryNames.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categoryNameSelect.appendChild(option);
            });

        } else {
            console.error('Failed to fetch category names');
        }
    } catch (error) {
        console.error('Error fetching category names:', error);
    }
}

async function handleCategoryChange(event) {
    const selectedCategory = event.target.value;
    if (selectedCategory) {
        await fetchProductsByCategory(selectedCategory);
    }
}

async function fetchProductsByCategory(categoryName) {
    if (!categoryName) {
        console.log('No category name provided');
        return;
    }

    const productNameSelect = document.getElementById('productName');
    const priceInput = document.getElementById('price');
    const costInput = document.getElementById('cost');
    const skuInput = document.getElementById('sku');

    if (!productNameSelect) {
        console.error('Product select element not found');
        return;
    }

    try {
        console.log('Fetching products for category:', categoryName);
        const response = await fetch(`/api/inventory/products/category/${encodeURIComponent(categoryName)}`, { // Updated path
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Include credentials for session handling
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        // Clear existing options
        productNameSelect.innerHTML = '<option value="" disabled selected>Select a product</option>';

        // Check if the response has the expected structure
        const products = result.data || [];

        if (!Array.isArray(products) || products.length === 0) {
            productNameSelect.innerHTML = '<option value="" disabled selected>No products found</option>';
            if (skuInput) skuInput.value = '';
            if (priceInput) skuInput.value = '';
            if (costInput) skuInput.value = '';
            return;
        }

        // Add new options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.productName;
            option.textContent = product.productName;
            // Make sure we're setting the data attributes correctly
            option.setAttribute('data-sku', product.sku || '');
            option.setAttribute('data-price', product.price || '0');
            option.setAttribute('data-cost', product.cost || '0');
            productNameSelect.appendChild(option);
        });

        productNameSelect.disabled = false;

    } catch (error) {
        console.error('Error fetching products:', error);
        productNameSelect.innerHTML = '<option value="" disabled selected>Error loading products</option>';
        if (skuInput) skuInput.value = '';
        if (priceInput) skuInput.value = '';
        if (costInput) skuInput.value = '';
    }
}

// Update the handleProductChange function
function handleProductChange(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const skuInput = document.getElementById('sku');
    const priceInput = document.getElementById('price');
    const costInput = document.getElementById('cost');

    if (selectedOption && !selectedOption.disabled) {
        // Fix the assignments - was incorrectly using skuInput.value for all fields
        if (skuInput) skuInput.value = selectedOption.dataset.sku || '';
        if (priceInput) priceInput.value = selectedOption.dataset.price || '0';
        if (costInput) costInput.value = selectedOption.dataset.cost || '0';
        currentSku = selectedOption.dataset.sku;
        
        // Log the values for debugging
        console.log('Selected product data:', {
            sku: selectedOption.dataset.sku,
            price: selectedOption.dataset.price,
            cost: selectedOption.dataset.cost,
            actualPrice: priceInput.value,
            actualCost: costInput.value
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeForm);

// Add near the top of the file
window.fetchAndRenderInventoryTable = fetchAndRenderInventoryTable;

// Add this near the top of your file with other event listeners
window.addEventListener('inventoryUpdate', async (event) => {
    console.log('Inventory update event received:', event.detail);
    try {
        await fetchAndRenderInventoryTable();
        calculateTotalInventory();
        
        const { productName, quantity } = event.detail;
        console.log(`Inventory updated after sale. Product: ${productName}, Quantity sold: ${quantity}`);
    } catch (error) {
        console.error('Error handling inventory update:', error);
    }
});

// Update the event listener
window.addEventListener('inventoryUpdate', async (event) => {
    console.log('Inventory update event received:', event.detail);
    try {
        await fetchAndRenderInventoryTable();
        calculateTotalInventory();
        
        const { action, productName } = event.detail;
        if (action === 'sale') {
            console.log(`Inventory updated after sale for product: ${productName}`);
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
});

async function populateFormForEdit(rowData) {
    const form = document.getElementById('inventoryForm');
    
   
    const categoryNameSelect = document.getElementById('categoryName');
    const productNameSelect = document.getElementById('productName');
    
    try {
        
        await fetchCategoryNames();
        
        const productResponse = await fetch('/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!productResponse.ok) {
            throw new Error('Failed to fetch product details');
        }
        
        const products = await productResponse.json();
        const productToEdit = products.find(p => p.productName === rowData.productName || p.productName === rowData.product_name);
        
        if (productToEdit) {
           
            categoryNameSelect.value = productToEdit.categoryName;
            
        
            await fetchProductsByCategory(productToEdit.categoryName);

            productNameSelect.value = rowData.productName || rowData.product_name;
       
            form.elements.sku.value = productToEdit.sku;
            currentSku = productToEdit.sku;
        }
        
      
        form.elements.date.value = rowData.date;
        form.elements.supplierName.value = rowData.supplierName || rowData.supplier_name;
        form.elements.price.value = rowData.price;
        form.elements.cost.value = rowData.cost;
        form.elements.quantity.value = rowData.quantity;
        
        
        isEditing = true;
        editingId = rowData.id;
        
   
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.textContent = 'Update';
        }
        
        
        form.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error populating form for edit:', error);
        alert('Error loading product details for editing');
    }
}

function resetInventoryForm() {
    const form = document.getElementById('inventoryForm');
    if (!form) return;

    // Reset all form fields
    form.reset();

    // Set current date
    const currentDate = new Date().toISOString().split('T')[0];
    form.elements.date.value = currentDate;

    // Reset dropdowns
    const categoryNameSelect = document.getElementById('categoryName');
    const productNameSelect = document.getElementById('productName');
    
    if (categoryNameSelect) {
        categoryNameSelect.value = '';
    }
    
    if (productNameSelect) {
        productNameSelect.innerHTML = '<option value="" disabled selected>Select a category first</option>';
        productNameSelect.disabled = true;
    }

    // Reset other inputs
    const skuInput = document.getElementById('sku');
    const priceInput = document.getElementById('price');
    const costInput = document.getElementById('cost');
    const quantityInput = document.getElementById('quantity');

    if (skuInput) skuInput.value = '';
    if (priceInput) priceInput.value = '';
    if (costInput) priceInput.value = '';
    if (quantityInput) priceInput.value = '';

    // Reset state variables
    isEditing = false;
    editingId = null;
    currentSku = '';

    // Reset save button text
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.textContent = 'Save';
    }
}

function resetForm() {
    const form = document.getElementById('inventoryForm');
    const dateField = document.getElementById('date');
    form.reset();
    

    const productNameSelect = document.getElementById('productName');
    if (productNameSelect) {
        productNameSelect.innerHTML = '<option value="" disabled selected>Select a category first</option>';
        productNameSelect.disabled = true;
    }
    

    fetchCategoryNames();
    

    isEditing = false;
    editingId = null;
    currentSku = '';
    

    const saveButton = document.getElementById('saveButton');
    if (saveButton) saveButton.textContent = 'Save';

    if (dateField) dateField.value = dateField.value || new Date().toISOString().split('T')[0];
}


function calculateTotalInventory() {
    const tableBody = document.getElementById('inventoryDataBody');
    if (!tableBody) return;

    let totalQuantity = 0;
    let totalValue = 0;
    let totalCost = 0;
    let totalPrice = 0;

    tableBody.querySelectorAll('tr').forEach(row => {
        const quantity = parseInt(row.cells[6].textContent) || 0;
        const cost = parseFloat(row.cells[5].textContent) || 0;
        const price = parseFloat(row.cells[4].textContent) || 0;
        const total = parseFloat(row.cells[7].textContent) || 0;
        
        totalQuantity += quantity;
        totalValue += total;
        totalCost += cost * quantity;
        totalPrice += price * quantity;
    });

    // Create or update the totals container
    let totalsContainer = document.getElementById('inventoryTotals');
    if (!totalsContainer) {
        totalsContainer = document.createElement('div');
        totalsContainer.id = 'inventoryTotals';
        // Insert before the table
        const tableContainer = tableBody.closest('table');
        tableContainer.parentElement.insertBefore(totalsContainer, tableContainer);
    }

    totalsContainer.innerHTML = `
        <div class="inventory-summary">
            <div class="summary-card">
                <h3>Total Items</h3>
                <p>${totalQuantity.toLocaleString()}</p>
            </div>
            <div class="summary-card">
                <h3>Total Cost Value</h3>
                <p>PKR ${totalCost.toFixed(2).toLocaleString()}</p>
            </div>
            <div class="summary-card">
                <h3>Total Price Value</h3>
                <p>PKR ${totalPrice.toFixed(2).toLocaleString()}</p>
            </div>
            <div class="summary-card highlight">
                <h3>Total Inventory Value</h3>
                <p>PKR ${totalValue.toFixed(2).toLocaleString()}</p>
            </div>
        </div>
    `;
}

function renderInventoryTable(data) {
    const tableBody = document.getElementById('inventoryDataBody');
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Remove any existing event listeners
    const oldTableBody = document.getElementById('inventoryDataBody');
    if (oldTableBody) {
        oldTableBody.replaceWith(tableBody);
    }
    
    tableBody.innerHTML = '';

    // Sort data by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    data.forEach(row => {
        // Calculate total based on cost and quantity
        const quantity = parseInt(row.quantity) || 0;
        const cost = parseFloat(row.cost) || 0;
        const total = (quantity * cost).toFixed(2);

        const displayDate = new Date(row.date).toLocaleDateString();
        
        const newRow = tableBody.insertRow();
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
                <button type="button" class="deleteButton" data-action="delete" data-id="${row.id}">Delete</button>
            </td>
        `;

        // Add edit event listener
        const editButton = newRow.querySelector('.editButton');
        editButton.addEventListener('click', () => populateFormForEdit(row));
    });

    // Single event delegation for delete buttons
    if (!tableBody.hasDeleteListener) {
        tableBody.addEventListener('click', async (event) => {
            const deleteButton = event.target.closest('.deleteButton');
            if (!deleteButton) return;
            
            const id = deleteButton.getAttribute('data-id');
            const confirmed = await showConfirmationModal('Are you sure you want to delete this item?');
            
            if (confirmed) {
                try {
                    const response = await fetch(`/api/inventory/deleteInventory/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to delete item');
                    }

                    const row = deleteButton.closest('tr');
                    if (row) {
                        row.remove();
                        calculateTotalInventory();
                        showMessage('Item deleted successfully', 'success');
                    }
                } catch (error) {
                    console.error('Error deleting item:', error);
                    showMessage('Failed to delete item', 'error');
                }
            }
        });
        tableBody.hasDeleteListener = true;
    }
}

// Remove the old deleteInventoryItem function and replace with this one
async function deleteInventoryItem(id) {
    const confirmed = await showConfirmationModal('Are you sure you want to delete this item?');
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/inventory/deleteInventory/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }

        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.remove();
            calculateTotalInventory();
        }
        showMessage('Item deleted successfully', 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to delete item', 'error');
    }
}

// Function to update inventory item
async function updateInventoryItem(id, updatedData) {
    try {
        const response = await fetch(`/api/inventory/updateInventory/${id}`, { // Updated path
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([updatedData])
        });

        if (response.ok) {
            // Update the row in the table immediately after successful update
            updateTableRow(id, updatedData);
            showMessage('Item updated successfully', 'success');
            closeEditForm(); // Add this function if you have an edit form
        } else {
            throw new Error('Failed to update item');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to update item', 'error');
    }
}

// Function to update table row with new data
function updateTableRow(id, data) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        const displayDate = new Date(data.date).toLocaleDateString();
        const total = (parseFloat(data.cost) * parseInt(data.quantity)).toFixed(2);
        
        row.innerHTML = `
            <td>${displayDate}</td>
            <td>${data.categoryName}</td>
            <td>${data.productName}</td>
            <td>${data.supplierName}</td>
            <td>${data.price}</td>
            <td>${data.cost}</td>
            <td>${data.quantity}</td>
            <td>${total}</td>
            <td>
                <button type="button" class="editButton" data-id="${id}">Edit</button>
                <button type="button" data-action="delete" data-id="${id}">Delete</button>
            </td>
        `;

        // Reattach event listeners
        const editButton = row.querySelector('.editButton');
        editButton.addEventListener('click', () => populateFormForEdit(data));

        // Update totals
        calculateTotalInventory();
    }
}

// Helper function to show messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('inventoryMessage') || createMessageDiv();
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Helper function to create message div if it doesn't exist
function createMessageDiv() {
    const div = document.createElement('div');
    div.id = 'inventoryMessage';
    document.body.appendChild(div);
    return div;
}

// Add this to your CSS
const style = document.createElement('style');
style.textContent = `
    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        animation: slideIn 0.5s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .success {
        background-color: #28a745;
        color: white;
    }
    
    .error {
        background-color: #dc3545;
        color: white;
    }
`;
document.head.appendChild(style);


const additionalStyles = `
    .inventory-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px;
        margin: 20px 0;
        background-color: #f8f9fa;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .summary-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .summary-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .summary-card h3 {
        color: #495057;
        margin-bottom: 10px;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .summary-card p {
        color: #0d6efd;
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
    }

    .summary-card.highlight {
        background: linear-gradient(135deg, #0d6efd11 0%, #0d6efd22 100%);
        border: 1px solid #0d6efd33;
    }

    .summary-card.highlight h3 {
        color: #0d6efd;
    }

    @media (max-width: 768px) {
        .inventory-summary {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 480px) {
        .inventory-summary {
            grid-template-columns: 1fr;
        }
    }
`;

// Update the style tag content
style.textContent += additionalStyles;

const summaryStyles = `
    .inventory-summary {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        padding: 15px;
        margin-bottom: 20px;
        background-color: #f8f9fa;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .summary-card {
        flex: 1;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
        min-width: 200px;
    }

    .summary-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .summary-card h3 {
        color: #495057;
        margin: 0 0 8px 0;
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .summary-card p {
        color: #0d6efd;
        font-size: 1.2rem;
        font-weight: bold;
        margin: 0;
    }

    .summary-card.highlight {
        background: linear-gradient(135deg, #0d6efd11 0%, #0d6efd22 100%);
        border: 1px solid #0d6efd33;
    }

    .summary-card.highlight h3 {
        color: #0d6efd;
    }

    @media (max-width: 1200px) {
        .inventory-summary {
            flex-wrap: wrap;
        }
        .summary-card {
            flex: 1 1 calc(50% - 10px);
            min-width: calc(50% - 10px);
        }
    }

    @media (max-width: 768px) {
        .summary-card {
            flex: 1 1 100%;
        }
    }
`;

// Replace existing additionalStyles with new summaryStyles
style.textContent += summaryStyles;

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

// Add this near the top of your file with other event listeners
window.addEventListener('inventoryUpdated', async () => {
    await fetchAndRenderInventoryTable();
});

// Add event listener for inventory updates
window.addEventListener('inventoryUpdate', async () => {
    console.log('Inventory update event received in inventory script');
    await fetchAndRenderInventoryTable();
});

window.addEventListener('DOMContentLoaded', function() {
    // Make the function available globally
    window.fetchAndRenderInventoryTable = fetchAndRenderInventoryTable;
    window.calculateTotalInventory = calculateTotalInventory;
});

// Update event listener for inventory changes
document.addEventListener('inventoryUpdate', async (event) => {
    console.log('Inventory update event received:', event.detail);
    try {
        await fetchAndRenderInventoryTable();
        calculateTotalInventory();
        console.log('Inventory table updated successfully');
    } catch (error) {
        console.error('Error handling inventory update:', error);
    }
}, false);

// Make fetchAndRenderInventoryTable globally available


// Update the saveToDatabase function
async function saveToDatabase(event) {
    event.preventDefault();
    const form = document.getElementById('inventoryForm');

    if (!form.elements.date.value) {
        alert('Please select a date');
        return;
    }

    const skuInput = form.elements.sku;
    const productNameSelect = form.elements.productName;
    const categoryNameSelect = form.elements.categoryName;
  
    if (!skuInput.value) {
        const selectedProduct = Array.from(productNameSelect.options)
            .find(option => option.value === productNameSelect.value);
            
        if (selectedProduct && selectedProduct.dataset.sku) {
            skuInput.value = selectedProduct.dataset.sku;
        } else if (currentSku) {
            skuInput.value = currentSku;
        }
    }
    
    if (!skuInput.value) {
        alert('Error: No SKU available for this product');
        return;
    }

    const formData = {
        date: form.elements.date.value,
        categoryName: form.elements.categoryName.value,
        productName: form.elements.productName.value,
        supplierName: form.elements.supplierName.value,
        sku: form.elements.sku.value,
        price: parseFloat(form.elements.price.value),
        cost: parseFloat(form.elements.cost.value),
        quantity: parseInt(form.elements.quantity.value),
        total: (parseFloat(form.elements.cost.value) * parseInt(form.elements.quantity.value)).toFixed(2)
    };

    // Add validation for required fields
    if (!formData.price && formData.price !== 0) {
        showMessage('Price is required', 'error');
        return;
    }

    if (!formData.cost && formData.cost !== 0) {
        showMessage('Cost is required', 'error');
        return;
    }

    try {
        // Check if product with same SKU exists
        const skuCheckResponse = await fetch(`/api/inventory/check-sku/${skuInput.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const skuCheck = await skuCheckResponse.json();
        const isExistingSku = skuCheck.exists;

        // Confirm if user wants to update existing product
        if (isExistingSku && !isEditing) {
            const confirmed = await showConfirmationModal(
                'This product already exists. Do you want to update the quantity?'
            );
            if (!confirmed) {
                return;
            }
        }

        const endpoint = isEditing ? `/api/inventory/updateInventory/${editingId}` : '/api/inventory/saveToDatabase';  // Updated path
        const saveResponse = await fetch(endpoint, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([formData])
        });

        if (saveResponse.ok) {
            if (isEditing) {
                // Immediately update the specific row in the table
                const row = document.querySelector(`tr[data-id="${editingId}"]`);
                if (row) {
                    const displayDate = new Date(formData.date).toLocaleDateString();
                    const total = (parseFloat(formData.cost) * parseInt(formData.quantity)).toFixed(2);
                    
                    row.innerHTML = `
                        <td>${displayDate}</td>
                        <td>${formData.categoryName}</td>
                        <td>${formData.productName}</td>
                        <td>${formData.supplierName}</td>
                        <td>${formData.price}</td>
                        <td>${formData.cost}</td>
                        <td>${formData.quantity}</td>
                        <td>${total}</td>
                        <td>
                            <button type="button" class="editButton" data-id="${editingId}">Edit</button>
                            <button type="button" data-action="delete" data-id="${editingId}">Delete</button>
                        </td>
                    `;

                    // Reattach event listeners
                    const newEditButton = row.querySelector('.editButton');
                    newEditButton.addEventListener('click', () => populateFormForEdit(formData));

                    // Update totals
                    calculateTotalInventory();
                }
            }

            // Reset form and show success message
            resetInventoryForm();
            showMessage(isEditing ? 'Item updated successfully' : 'Item saved successfully', 'success');

            // Only do a full refresh if not editing
            if (!isEditing) {
                await fetchAndRenderInventoryTable();
            }

            // Additional reset operations
            isEditing = false;
            editingId = null;
            currentSku = '';
            
            const saveButton = document.getElementById('saveButton');
            if (saveButton) {
                saveButton.textContent = 'Save';
            }

            await fetchCategoryNames();
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Failed to save data', 'error');
    }
}

// Single event listener for inventory updates
function handleInventoryUpdate(event) {
    console.log('Inventory update event received:', event.detail);
    fetchAndRenderInventoryTable()
        .then(() => console.log('Inventory table updated successfully'))
        .catch(error => console.error('Error handling inventory update:', error));
}

// Clean up event listeners
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initial setup
        await Promise.all([
            fetchProductsByCategory(),
            fetchSupplierNames(),
            fetchCategoryNames()
        ]);

        // Set current date
        const currentDate = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = currentDate;

        // Initial table load
        await fetchAndRenderInventoryTable();
        calculateTotalInventory();

        // Single event listener for inventory updates
        window.removeEventListener('inventoryUpdate', handleInventoryUpdate);
        window.addEventListener('inventoryUpdate', handleInventoryUpdate);

    } catch (error) {
        console.error('Error during initialization:', error);
        showMessage('Error initializing page', 'error');
    }
});

// Make fetchAndRenderInventoryTable globally available
window.fetchAndRenderInventoryTable = fetchAndRenderInventoryTable;

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
