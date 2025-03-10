document.addEventListener('DOMContentLoaded', async function () {
    fetchUserData();
    updateUserNameFromSession();
    
    updateUserName();
    const categorySelect = document.getElementById('category');

    try {
        // Fetch categories from the server and populate the dropdown
        const response = await fetch('/categories');
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid categories data format');
        }

        data.forEach(function (category) {
            const option = document.createElement('option');
            option.value = category.name;
            option.text = category.name;
            categorySelect.add(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        showMessage('Failed to fetch categories. Please try again.', 'error');
    }

    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveProduct);
    }

    // Attach event listener for the "Search" button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', searchAndHighlight);
    }

    // Fetch and display products when the page is loaded
    fetchAndDisplayProducts();
});



  // Function to save a new product
  async function createProduct() {
    const messageElement = document.getElementById('message');
    messageElement.innerHTML = ''; // Clear previous messages

    try {
        const categoryNameSelect = document.getElementById('category');
        const categoryName = categoryNameSelect.options[categoryNameSelect.selectedIndex].text;
        
        const productName = document.getElementById('productName').value;
        const description = document.getElementById('description').value;
        const price = document.getElementById('price').value;
        const cost = document.getElementById('cost').value;

        // Validate input (you may add more validation)
        if (!categoryName || !productName || !description || !price || !cost) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                categoryName,
                productName,
                description,
                price,
                cost
            }),
        });

        if (response.ok) {
            showMessage('Product saved successfully!', 'success');
            fetchAndDisplayProducts(); // Refresh the product list
            setTimeout(( )=>{
                location.reload();
            } ,2000)
        } else {
            showMessage('Failed to save product. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('An error occurred. Please try again later.', 'error');
    }
}

// Function to display messages
function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.innerHTML = `<p class="${type}">${message}</p>`;
}

// Function to fetch and display products
async function fetchAndDisplayProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch products. Status: ${response.status}`);
        }

        const products = await response.json();
        if (!Array.isArray(products)) {
            throw new Error('Invalid products data format');
        }

        // Clear existing table rows
        const tableBody = document.getElementById('productTableBody');
        tableBody.innerHTML = '';

        // Populate the table with product data
        products.forEach(product => {
            const row = tableBody.insertRow();
            row.insertCell(0).innerText = product.sku;
            row.insertCell(1).innerText = product.categoryName;
            row.insertCell(2).innerText = product.productName;
            row.insertCell(3).innerText = product.description;
            row.insertCell(4).innerText = product.price;
            row.insertCell(5).innerText = product.cost;

            // Add Edit and Delete buttons in each row
            const editButton = document.createElement('button');
            editButton.innerText = 'Edit';
            editButton.onclick = () => editProduct(row); // Pass the row to editProduct function
            row.insertCell(6).appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.onclick = () => deleteProduct(row); // Pass the row to deleteProduct function
            row.insertCell(6).appendChild(deleteButton);
        });

        // Reset the form after displaying products
        document.getElementById('productForm').reset();
    } catch (error) {
        console.error('Error fetching products:', error);
        showMessage(error.message || 'Failed to fetch products. Please try again.', 'error');
    }
}

// Fetch and display products when the page is loaded

function goBack() {
    window.history.back();
}
function searchAndHighlight() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#productTableBody tr');
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



async function saveProduct() {
    const sku = document.getElementById('sku').value;

    if (sku) {
        // If SKU is present, update the existing product
        updateProduct();
    } else {
        // If SKU is not present, create a new product
        createProduct();
    }
}

async function updateProduct() {
    const sku = document.getElementById('sku').value;
    const categoryName = document.getElementById('category').value;
    const productName = document.getElementById('productName').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const cost = document.getElementById('cost').value;

    try {
        const response = await fetch(`/api/products/${sku}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                categoryName,
                productName,
                description,
                price,
                cost
            }),
        });

        if (response.ok) {
            showMessage('Product updated successfully!', 'success');
            fetchAndDisplayProducts();
            setTimeout(( )=>{
                location.reload();
            } ,2000) // Refresh the product list
            
        } else {
            showMessage('Failed to update product. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showMessage('An error occurred. Please try again later.', 'error');
    }
}

function editProduct(row) {
    const sku = row.cells[0].innerText;
    const category = row.cells[1].innerText;
    const productName = row.cells[2].innerText;
    const description = row.cells[3].innerText;
    const price = row.cells[4].innerText;
    const cost = row.cells[5].innerText;

    document.getElementById('sku').value = sku;
    document.getElementById('category').value = category;
    document.getElementById('productName').value = productName;
    document.getElementById('description').value = description;
    document.getElementById('price').value = price;
    document.getElementById('cost').value = cost;
}

async function deleteProduct(row) {
    const sku = row.cells[0].innerText;
    const confirmation = confirm('Are you sure you want to delete this product?');

    if (confirmation) {
        try {
            const response = await fetch(`/api/products/${sku}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showMessage('Product deleted successfully!', 'success');
                fetchAndDisplayProducts(); // Refresh the product list
            } else {
                showMessage('Failed to delete product. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showMessage('An error occurred. Please try again later.', 'error');
        }
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

// Add this function
function updateProfileSection(response) {
    if (response && response.user) {
        const user = response.user;
        // Update any profile-related elements if they exist
        const profileNameElement = document.getElementById('profileName');
        if (profileNameElement) profileNameElement.textContent = user.name;
        
        const profileUsernameElement = document.getElementById('profileUsername');
        if (profileUsernameElement) profileUsernameElement.textContent = user.username;
     
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
