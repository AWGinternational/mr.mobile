
document.addEventListener('DOMContentLoaded', async function () {
    await fetchCategoryNames();
    await fetchProductsByCategory();
// fetchUserData();
    const currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = currentDate;

    const container = document.querySelector('.container');

    container.addEventListener('change', function (event) {
        if (event.target.matches('#categoryName')) {
            fetchProductsByCategory();
        } else if (event.target.matches('#productName')) {
            updatePrice();
        }
    });

    container.addEventListener('input', function (event) {
        if (event.target.matches('#quantity') || event.target.matches('#price') || event.target.matches('#cost')) {
            updateTotal();
        }
    });

    const saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', saveSalesToDatabase);

    const salesDataBody = document.getElementById('salesDataBody');
    salesDataBody.addEventListener('click', function (event) {
        if (event.target.matches('button[data-action="print"]')) {
            printReceipt(event.target.parentNode.parentNode);
        } else if (event.target.matches('button[data-action="delete"]')) {
            deleteSales(event.target.parentNode.parentNode);
        }
    });

    fetchAndRenderSalesTable();
});



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


async function attachEventListeners() {
try {
    const categoryNameSelect = document.getElementById('categoryName');
    if (categoryNameSelect) {
        categoryNameSelect.addEventListener('change', handleCategoryChange);
    }

    const productNameSelect = document.getElementById('productName');
    if (productNameSelect) {
        productNameSelect.addEventListener('change', handleProductChange);
    }

    const form = document.getElementById('salesForm');
    if (form) {
        form.addEventListener('reset', () => {
            setTimeout(() => {
                fetchCategoryNames();
            }, 0);
        });
    }
const saveButton = document.querySelector('button');
saveButton.addEventListener('click', function (event) {
    saveSalesToDatabase(event);
});
} catch (error) {
console.error('Error attaching event listeners:', error);
}
}


async function handleCategoryChange(event) {
    const selectedCategory = event.target.value;
    if (selectedCategory) {
        await fetchProductsByCategory(selectedCategory);
    }
}

async function fetchProductsByCategory(categoryName) {
    const productNameSelect = document.getElementById('productName');
    const priceInput = document.getElementById('price');
    const costInput = document.getElementById('cost');
    const skuInput = document.getElementById('sku');

    if (!productNameSelect) {
        console.error('Product select element not found');
        return;
    }

    try {
        const response = await fetch(`/products/category/${encodeURIComponent(categoryName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const products = await response.json();
            console.log('Products for category:', products);

  
            productNameSelect.innerHTML = '<option value="" disabled selected>Select a product</option>';

           
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.productName;
                option.textContent = product.productName;
                option.dataset.sku = product.sku;
                option.dataset.price = product.price;
                option.dataset.cost = product.cost;
                productNameSelect.appendChild(option);
            });

   
            if (skuInput) skuInput.value = '';
            if (priceInput) priceInput.value = '';
            if (costInput) costInput.value = '';


            productNameSelect.disabled = false;

        } else {
            console.error('Failed to fetch products for category');
            productNameSelect.innerHTML = '<option value="" disabled selected>Error loading products</option>';
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        productNameSelect.innerHTML = '<option value="" disabled selected>Error loading products</option>';
    }
}



function handleProductChange(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const skuInput = document.getElementById('sku');
    const priceInput = document.getElementById('price');
    const costInput = document.getElementById('cost');

    if (selectedOption && !selectedOption.disabled) {
        if (skuInput) skuInput.value = selectedOption.dataset.sku;
        if (priceInput) priceInput.value = selectedOption.dataset.price;
        if (costInput) costInput.value = selectedOption.dataset.cost;
        currentSku = selectedOption.dataset.sku;
    }
}

document.addEventListener('DOMContentLoaded', initializeForm);

function updatePrice() {
var productNameSelect = document.getElementById("productName");
var selectedProduct = productNameSelect.options[productNameSelect.selectedIndex];

if (selectedProduct) {
var price = selectedProduct.getAttribute("data-price");
var cost= selectedProduct.getAttribute("data-cost");
document.getElementById("price").value = price || 0;
document.getElementById("cost").value = cost || 0;
} else {
document.getElementById("price").value = 0;
document.getElementById("cost").value = 0;

}
}



function updateTotal() {
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const costInput=document.getElementById('cost');
const totalInput = document.getElementById('total');
const profitInput = document.getElementById('profit');

const quantity = parseFloat(quantityInput.value) || 0; 
const price = parseFloat(priceInput.value) || 0;
const cost= parseFloat(costInput.value) || 0;
const total = (quantity * price).toFixed(2);
const profit=(quantity* (price-cost)).toFixed(2);
profitInput.value=profit;
totalInput.value = total;
}

async function saveSalesToDatabase(event) {
event.preventDefault();


const form = document.getElementById('salesForm');
const data = {
date: form.elements.date.value,
categoryName: form.elements.categoryName.value,
productName: form.elements.productName.value,
quantity: parseFloat(form.elements.quantity.value),
price: parseFloat(form.elements.price.value),
cost: parseFloat(form.elements.cost.value),
profit: parseFloat(form.elements.profit.value),
total: parseFloat(form.elements.total.value),
};


try {
const response = await fetch('/api/sales/saveSalesToDatabase', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(data),
});


if (response.ok) {
    console.log('Data saved to the sales table in the database');
    setTimeout(() => {
        location.reload();
    }, 1000);
    document.getElementById('total').value = '0.00';
    fetchAndRenderSalesTable();
    form.reset();
} else {
    console.error('Failed to save data to the sales table in the database');
}
} catch (error) {
console.error('Error saving to the sales table in the database:', error);
}
}

async function fetchAndRenderSalesTable() {
try {
const response = await fetch('/api/sales/fetchSalesData', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
});

if (response.ok) {
    const salesData = await response.json();
    renderSalesTable(salesData);
} else {
    console.error('Failed to fetch sales data');
}
} catch (error) {
console.error('Error fetching sales data:', error);
}
}



function renderSalesTable(data) {
const tableBody = document.getElementById('salesDataBody');
const totalSalesAmountElement = document.getElementById('totalSalesAmount');

if (!tableBody || !totalSalesAmountElement) {
console.error('Error: Table body or total sales amount element not found.');
return;
}

tableBody.innerHTML = '';
let totalSales = 0;

data.forEach(row => {
const localDate = new Date(row.date).toLocaleDateString();
const newRow = tableBody.insertRow(-1);
newRow.setAttribute('data-id', row.id);
newRow.innerHTML = `<td>${localDate}</td>
                    <td>${row.categoryName}</td>
                    <td>${row.productName}</td>
                    <td>${row.quantity}</td>
                    <td>${row.price}</td>
                    <td>${row.cost}</td>
                    <td>${row.profit}</td>
                    <td>${row.total}</td>
                    <td>
                    <button data-action="print">Print</button>
                    <button data-action="delete">Delete</button>

                    </td>`;

totalSales += parseFloat(row.total) || 0;
});

totalSalesAmountElement.textContent = totalSales.toFixed(2);
}


function printReceipt(row) {
const companyName = 'AWG International';

const receiptContent = `
<div style="text-align: center; margin-bottom: 20px;">
    <h2>${companyName}</h2>
</div>
<div>
    <table style="width: 100%;">
        <tr>
            <th>Date</th>
        
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            
        </tr>
        <tr>
            <td>${row.cells[0].innerHTML}</td>
       
            <td>${row.cells[2].innerHTML}</td>
            <td>${row.cells[3].innerHTML}</td>
            <td>${row.cells[4].innerHTML}</td>
            <td>${row.cells[7].innerHTML}</td>
            
        </tr>
    </table>
</div>
<div style="margin-top: 20px;">
    <h3>Instructions:</h3>
    <p>1. Items can be returned within two days of purchase.</p>
    <p>2. Thank you for choosing ${companyName}. We appreciate your business!</p>
</div>
`;

const printFrame = document.createElement('iframe');
printFrame.style.display = 'none';
document.body.appendChild(printFrame);

printFrame.contentDocument.open();
printFrame.contentDocument.write(`
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
        }
        div {
            margin-bottom: 10px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        h2, h3 {
            margin: 0;
        }
        p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    ${receiptContent}
</body>
</html>
`);
printFrame.contentDocument.close();

printFrame.contentWindow.onload = function () {
printFrame.contentWindow.print();
document.body.removeChild(printFrame);
};


}

function getTotalSales() {
const totalSalesAmountElement = document.getElementById('totalSalesAmount');
const totalSales = parseFloat(totalSalesAmountElement.textContent) || 0;
console.log('Total Sales in sales.html:', totalSales);
return totalSales;
}






async function deleteSales(button) {
    try {
        const row = button.closest('tr');
        const saleId = row.getAttribute('data-id');

        console.log('Attempting to delete sale with ID:', saleId);

        const response = await fetch(`/api/sales/deleteSalesData/${saleId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

        let responseData;
        try {
            responseData = await response.json();
        } catch (jsonError) {
            responseData = await response.text(); 
        }

        if (response.ok) {
            row.remove();
            const totalSalesAmountElement = document.getElementById('totalSalesAmount');
            const deletedAmount = parseFloat(row.cells[7].textContent) || 0;
            const currentTotal = parseFloat(totalSalesAmountElement.textContent) || 0;
            const newTotal = Math.max(0, currentTotal - deletedAmount);
            totalSalesAmountElement.textContent = newTotal.toFixed(2);

            alert('Sales entry deleted successfully');
        } else {
            console.error('Delete failed:', responseData);
            alert('Failed to delete sales entry: ' + responseData);
        }
    } catch (error) {
        console.error('Error in deleteSales:', error);
        alert('Failed to delete sales entry: ' + error.message);
    }
}


// function fetchUserData() {
//     // Make a fetch request to get user data
//     fetch('/api/users/current')
//         .then(response => {
//             if (response.status === 401) {
//                 // Redirect to the login page or handle unauthorized access
//                 window.location.href = '/login.html';
//                 throw new Error('User not authenticated');
//             }
//             return response.json();
//         })
//         .then(user => {
//             // Store the user data in session storage
//             sessionStorage.setItem('currentUser', JSON.stringify(user));

//             // Log the stored user data for debugging
//             console.log('Stored currentUser:', JSON.stringify(user));

//             // Update the profile section immediately
//             updateProfileSection(user);
//         })
//         .catch(error => {
//             console.error('Error fetching user information:', error);
//         });
// }
// function updateProfileSection(user) {
//     // Update the profile section with user information
//     const profileSection = document.getElementById('profileSection');

//     if (profileSection) {
//         profileSection.innerHTML = `
//         <p>Welcome, ${user.firstName} ${user.lastName}!</p>
//         <p>Email: ${user.email}</p>
//         `;
//     }
// }














// document.addEventListener('DOMContentLoaded', async function () {
//     await fetchCategoryNames();
// fetchUserData();
//     const currentDate = new Date().toISOString().split('T')[0];
//     document.getElementById('date').value = currentDate;

//     const container = document.querySelector('.container');

//     container.addEventListener('change', function (event) {
//         if (event.target.matches('#categoryName')) {
//             fetchProductsByCategory();
//         } else if (event.target.matches('#productName')) {
//             updatePrice();
//         }
//     });

//     container.addEventListener('input', function (event) {
//         if (event.target.matches('#quantity') || event.target.matches('#price') || event.target.matches('#cost')) {
//             updateTotal();
//         }
//     });

//     const saveButton = document.getElementById('saveButton');
//     saveButton.addEventListener('click', saveSalesToDatabase);

//     const salesDataBody = document.getElementById('salesDataBody');
//     salesDataBody.addEventListener('click', function (event) {
//         if (event.target.matches('button[data-action="print"]')) {
//             printReceipt(event.target.parentNode.parentNode);
//         } else if (event.target.matches('button[data-action="delete"]')) {
//             deleteSales(event.target.parentNode.parentNode);
//         }
//     });

//     fetchAndRenderSalesTable();
// });








// async function fetchCategoryNames() {
//     try {
//         const response = await fetch('/categories', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (response.ok) {
//             const categoryNames = await response.json();
//             console.log('Category Names:', categoryNames);

//             const categoryNameSelect = document.getElementById('categoryName');
//             const productNameSelect = document.getElementById('productName');

//             categoryNameSelect.innerHTML = '';
//             productNameSelect.innerHTML = '<option value="" disabled selected>Select a category</option>';

//             categoryNames.forEach(category => {
//                 const option = document.createElement('option');
//                 option.value = category.name; 
//                 option.textContent = category.name; 
//                 categoryNameSelect.appendChild(option);
//             });

            
//             categoryNameSelect.addEventListener('change', fetchProductsByCategory);
//         } else {
//             console.error('Failed to fetch category names');
//         }
//     } catch (error) {
//         console.error('Error fetching category names:', error);
//     }
// }


// async function attachEventListeners() {
// try {
// const categoryNameSelect = document.getElementById('categoryName');
// categoryNameSelect.addEventListener('change', function () {
//     fetchProductsByCategory();
// });

// const saveButton = document.querySelector('button');
// saveButton.addEventListener('click', function (event) {
//     saveSalesToDatabase(event);
// });
// } catch (error) {
// console.error('Error attaching event listeners:', error);
// }
// }


// async function fetchProductsByCategory() {
//     const categoryNameSelect = document.getElementById('categoryName');
//     const selectedCategory = categoryNameSelect.value.trim();

  

//     try {
//         const response = await fetch(`/api/products?categoryName=${encodeURIComponent(selectedCategory)}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (response.ok) {
//             const products = await response.json();
//             console.log('Frontend Products for', selectedCategory, ':', products);
//             console.log('Total Products Count:', products.length);

//             // Detailed product logging
//             products.forEach((product, index) => {
//                 console.log(`Product ${index + 1} Details:`, {
//                     name: product.productName,
//                     category: product.categoryName,
//                     fullProductInfo: product
//                 });
//             });

//             const productNameSelect = document.getElementById('productName');
//             productNameSelect.innerHTML = '<option value="" disabled selected>Select a product</option>';

//             if (products.length === 0) {
//                 const noProductOption = document.createElement('option');
//                 noProductOption.value = '';
//                 noProductOption.textContent = 'No products available';
//                 noProductOption.disabled = true;
//                 productNameSelect.appendChild(noProductOption);
//             } else {
//                 const filteredProducts = products.filter(product => 
//                     product.categoryName && 
//                     product.categoryName.trim().toLowerCase() === selectedCategory.toLowerCase()
//                 );

//                 console.log('Filtered Products:', filteredProducts);

//                 filteredProducts.forEach(product => {
//                     const option = document.createElement('option');
//                     option.value = product.productName;
//                     option.textContent = product.productName;
//                     option.dataset.price = product.price;
//                     option.dataset.cost = product.cost;
//                     productNameSelect.appendChild(option);
//                 });
//             }

//             updatePrice();
//             updateTotal();
//         } else {
//             console.error('Failed to fetch products');
//             alert('Failed to fetch products for the selected category');
//         }
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         alert('An error occurred while fetching products');
//     }
// }


// function updatePrice() {
// var productNameSelect = document.getElementById("productName");
// var selectedProduct = productNameSelect.options[productNameSelect.selectedIndex];

// if (selectedProduct) {
// var price = selectedProduct.getAttribute("data-price");
// var cost= selectedProduct.getAttribute("data-cost");
// document.getElementById("price").value = price || 0;
// document.getElementById("cost").value = cost || 0;
// } else {
// document.getElementById("price").value = 0;
// document.getElementById("cost").value = 0;

// }
// }



// function updateTotal() {
// const quantityInput = document.getElementById('quantity');
// const priceInput = document.getElementById('price');
// const costInput=document.getElementById('cost');
// const totalInput = document.getElementById('total');
// const profitInput = document.getElementById('profit');

// const quantity = parseFloat(quantityInput.value) || 0; 
// const price = parseFloat(priceInput.value) || 0;
// const cost= parseFloat(costInput.value) || 0;
// const total = (quantity * price).toFixed(2);
// const profit=(quantity* (price-cost)).toFixed(2);
// profitInput.value=profit;
// totalInput.value = total;
// }

// async function saveSalesToDatabase(event) {
// event.preventDefault();


// const form = document.getElementById('salesForm');
// const data = {
// date: form.elements.date.value,
// categoryName: form.elements.categoryName.value,
// productName: form.elements.productName.value,
// quantity: parseFloat(form.elements.quantity.value),
// price: parseFloat(form.elements.price.value),
// cost: parseFloat(form.elements.cost.value),
// profit: parseFloat(form.elements.profit.value),
// total: parseFloat(form.elements.total.value),
// };


// try {
// const response = await fetch('/api/sales/saveSalesToDatabase', {
// method: 'POST',
// headers: {
// 'Content-Type': 'application/json',
// },
// body: JSON.stringify(data),
// });


// if (response.ok) {
//     console.log('Data saved to the sales table in the database');
//     setTimeout(() => {
//         location.reload();
//     }, 1000);
//     document.getElementById('total').value = '0.00';
//     fetchAndRenderSalesTable();
//     form.reset();
// } else {
//     console.error('Failed to save data to the sales table in the database');
// }
// } catch (error) {
// console.error('Error saving to the sales table in the database:', error);
// }
// }

// async function fetchAndRenderSalesTable() {
// try {
// const response = await fetch('/api/sales/fetchSalesData', {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });

// if (response.ok) {
//     const salesData = await response.json();
//     renderSalesTable(salesData);
// } else {
//     console.error('Failed to fetch sales data');
// }
// } catch (error) {
// console.error('Error fetching sales data:', error);
// }
// }



// function renderSalesTable(data) {
// const tableBody = document.getElementById('salesDataBody');
// const totalSalesAmountElement = document.getElementById('totalSalesAmount');

// if (!tableBody || !totalSalesAmountElement) {
// console.error('Error: Table body or total sales amount element not found.');
// return;
// }

// tableBody.innerHTML = '';
// let totalSales = 0;

// data.forEach(row => {
// const localDate = new Date(row.date).toLocaleDateString();
// const newRow = tableBody.insertRow(-1);
// newRow.setAttribute('data-id', row.id);
// newRow.innerHTML = `<td>${localDate}</td>
//                     <td>${row.categoryName}</td>
//                     <td>${row.productName}</td>
//                     <td>${row.quantity}</td>
//                     <td>${row.price}</td>
//                     <td>${row.cost}</td>
//                     <td>${row.profit}</td>
//                     <td>${row.total}</td>
//                     <td>
//                     <button data-action="print">Print</button>
//                     <button data-action="delete">Delete</button>

//                     </td>`;

// totalSales += parseFloat(row.total) || 0;
// });

// totalSalesAmountElement.textContent = totalSales.toFixed(2);
// }


// function printReceipt(row) {
// const companyName = 'AWG International';

// const receiptContent = `
// <div style="text-align: center; margin-bottom: 20px;">
//     <h2>${companyName}</h2>
// </div>
// <div>
//     <table style="width: 100%;">
//         <tr>
//             <th>Date</th>
        
//             <th>Product Name</th>
//             <th>Quantity</th>
//             <th>Price</th>
//             <th>Total</th>
            
//         </tr>
//         <tr>
//             <td>${row.cells[0].innerHTML}</td>
       
//             <td>${row.cells[2].innerHTML}</td>
//             <td>${row.cells[3].innerHTML}</td>
//             <td>${row.cells[4].innerHTML}</td>
//             <td>${row.cells[7].innerHTML}</td>
            
//         </tr>
//     </table>
// </div>
// <div style="margin-top: 20px;">
//     <h3>Instructions:</h3>
//     <p>1. Items can be returned within two days of purchase.</p>
//     <p>2. Thank you for choosing ${companyName}. We appreciate your business!</p>
// </div>
// `;

// const printFrame = document.createElement('iframe');
// printFrame.style.display = 'none';
// document.body.appendChild(printFrame);

// printFrame.contentDocument.open();
// printFrame.contentDocument.write(`
// <html>
// <head>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             font-size: 14px;
//         }
//         div {
//             margin-bottom: 10px;
//         }
//         table {
//             border-collapse: collapse;
//             width: 100%;
//         }
//         th, td {
//             border: 1px solid #ddd;
//             padding: 8px;
//             text-align: left;
//         }
//         th {
//             background-color: #f2f2f2;
//         }
//         h2, h3 {
//             margin: 0;
//         }
//         p {
//             margin: 5px 0;
//         }
//     </style>
// </head>
// <body>
//     ${receiptContent}
// </body>
// </html>
// `);
// printFrame.contentDocument.close();

// printFrame.contentWindow.onload = function () {
// printFrame.contentWindow.print();
// document.body.removeChild(printFrame);
// };


// }

// function getTotalSales() {
// const totalSalesAmountElement = document.getElementById('totalSalesAmount');
// const totalSales = parseFloat(totalSalesAmountElement.textContent) || 0;
// console.log('Total Sales in sales.html:', totalSales);
// return totalSales;
// }






// async function deleteSales(button) {
//     try {
//         const row = button.closest('tr');
//         const saleId = row.getAttribute('data-id');

//         console.log('Attempting to delete sale with ID:', saleId);

//         const response = await fetch(`/api/sales/deleteSalesData/${saleId}`, {
//             method: 'DELETE',
//             headers: { 'Content-Type': 'application/json' }
//           });

//         let responseData;
//         try {
//             responseData = await response.json();
//         } catch (jsonError) {
//             responseData = await response.text(); // Fallback to plain text
//         }

//         if (response.ok) {
//             row.remove();
//             const totalSalesAmountElement = document.getElementById('totalSalesAmount');
//             const deletedAmount = parseFloat(row.cells[7].textContent) || 0;
//             const currentTotal = parseFloat(totalSalesAmountElement.textContent) || 0;
//             const newTotal = Math.max(0, currentTotal - deletedAmount);
//             totalSalesAmountElement.textContent = newTotal.toFixed(2);

//             alert('Sales entry deleted successfully');
//         } else {
//             console.error('Delete failed:', responseData);
//             alert('Failed to delete sales entry: ' + responseData);
//         }
//     } catch (error) {
//         console.error('Error in deleteSales:', error);
//         alert('Failed to delete sales entry: ' + error.message);
//     }
// }

