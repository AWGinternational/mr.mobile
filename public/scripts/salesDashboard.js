async function fetchTotalSales() {
    try {
        const response = await fetch('/api/sales/fetchSalesData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch sales data');
        const salesData = await response.json();

        // Calculate total sales
        const totalSales = salesData.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
        document.getElementById('totalSalesValue').textContent = `₨${totalSales.toFixed(2)}`;

        // Calculate monthly sales (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySales = salesData
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
        
        document.getElementById('monthlySales').textContent = `₨${monthlySales.toFixed(2)}`;

        return salesData;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        return [];
    }
}




async function fetchInventoryTotals() {
    try {
        const response = await fetch('/api/inventory/fetchInventoryData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch inventory data');
        const inventoryData = await response.json();

        // Calculate inventory totals
        const totals = inventoryData.reduce((acc, item) => {
            const quantity = parseInt(item.quantity) || 0;
            const cost = parseFloat(item.cost) || 0;
            const price = parseFloat(item.price) || 0;

            return {
                totalItems: acc.totalItems + quantity,
                totalCost: acc.totalCost + (cost * quantity),
                totalPrice: acc.totalPrice + (price * quantity),
                totalValue: acc.totalValue + (cost * quantity)
            };
        }, { totalItems: 0, totalCost: 0, totalPrice: 0, totalValue: 0 });

        // Update all inventory-related displays
        document.getElementById('totalInventoryValue').textContent = `₨${totals.totalValue.toFixed(2)}`;
        document.getElementById('totalCostValue').textContent = `₨${totals.totalCost.toFixed(2)}`;
        document.getElementById('totalPriceValue').textContent = `₨${totals.totalPrice.toFixed(2)}`;
        
        // Update low stock threshold to 3
        const LOW_STOCK_THRESHOLD = 3;
        const lowStockItems = inventoryData.filter(item => parseInt(item.quantity) <= LOW_STOCK_THRESHOLD)
            .map(item => ({
                name: item.productName,
                quantity: item.quantity,
                category: item.categoryName,
                threshold: LOW_STOCK_THRESHOLD
            }));
        
        document.getElementById('lowStockCount').textContent = lowStockItems.length;
        window.lowStockItems = lowStockItems;

        return { totals: inventoryData, lowStockItems };
    } catch (error) {
        console.error('Error fetching inventory data:', error);
        return null;
    }
}

// Update the initializeDashboard function
async function initializeDashboard() {
    try {
        const [salesInfo, inventoryInfo] = await Promise.all([
            fetchTotalSales(),
            fetchInventoryTotals()
        ]);

        // Update dashboard metrics
        updateDashboardMetrics(salesInfo, inventoryInfo);
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Initialize dashboard and set up auto-refresh
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    updateUserNameFromSession();
    fetchUserData()
    updateUserName();
    
    // Refresh dashboard every 5 minutes
    setInterval(initializeDashboard, 300000);

    // Add click handler for low stock card
    const lowStockCard = document.getElementById('lowStockCard');
    const modal = document.getElementById('lowStockModal');
    const closeBtn = document.querySelector('.close');

    lowStockCard.addEventListener('click', showLowStockModal);
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Keep the low stock modal functionality
function showLowStockModal() {
    const modal = document.getElementById('lowStockModal');
    const lowStockList = document.getElementById('lowStockList');
    
    if (window.lowStockItems && window.lowStockItems.length > 0) {
        lowStockList.innerHTML = window.lowStockItems.map(item => `
            <div class="low-stock-item">
                <div class="item-info">
                    <strong>${item.name}</strong>
                    <span class="category">${item.category}</span>
                </div>
                <span class="quantity ${item.quantity <= item.threshold/2 ? 'critical' : ''}">
                    ${item.quantity} items left
                </span>
            </div>
        `).join('');
    } else {
        lowStockList.innerHTML = '<p class="no-items">No items are currently low in stock.</p>';
    }
    
    modal.style.display = 'block';
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
}// No selected code provided, so I'll suggest an improvement to the existing code

// Add a function to update dashboard metrics
function updateDashboardMetrics(salesInfo, inventoryInfo) {
    // Update dashboard metrics
    const totalSales = salesInfo.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
    const totalInventoryValue = inventoryInfo.totals.totalValue;
    const totalCost = inventoryInfo.totals.totalCost;
    const totalPrice = inventoryInfo.totals.totalPrice;

    document.getElementById('totalSalesValue').textContent = `₨${totalSales.toFixed(2)}`;
    document.getElementById('totalInventoryValue').textContent = `₨${totalInventoryValue.toFixed(2)}`;
    document.getElementById('totalCostValue').textContent = `₨${totalCost.toFixed(2)}`;
    document.getElementById('totalPriceValue').textContent = `₨${totalPrice.toFixed(2)}`;
}

// Update the initializeDashboard function
async function initializeDashboard() {
    try {
        const [salesInfo, inventoryInfo] = await Promise.all([
            fetchTotalSales(),
            fetchInventoryTotals()
        ]);

        // Update dashboard metrics
        updateDashboardMetrics(salesInfo, inventoryInfo);
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}