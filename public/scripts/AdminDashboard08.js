async function checkAdminAuth() {
    try {
        const response = await fetch('/api/users/current', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/login.html';
            return false;
        }
        
        const data = await response.json();
        if (!data.user || !data.user.isAdmin) {
            window.location.href = '/dashboard.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login.html';
        return false;
    }
}
document.addEventListener('DOMContentLoaded', () => {

    const isAuthenticated = checkAdminAuth();
    if (!isAuthenticated) return;

    let editingUserId = null;

  
    document.getElementById('addUserBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('userForm').addEventListener('submit', handleFormSubmit);

  
    fetchUsers();

    async function fetchUsers() {
        try {
            const response = await fetch('/api/admin/users');
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    function displayUsers(users) {
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.shopName}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.username}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-userid="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-userid="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

           
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');

            editBtn.addEventListener('click', () => openEditModal(user.id));
            deleteBtn.addEventListener('click', () => deleteUser(user.id));

            tableBody.appendChild(row);
        });
    }

 
    function openAddModal() {
        editingUserId = null;
        document.getElementById('modalTitle').textContent = 'Add New User';
        document.getElementById('userForm').reset();
        document.getElementById('userModal').style.display = 'flex';
    }

    async function openEditModal(userId) {
        editingUserId = userId;
        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('userModal').style.display = 'flex';

        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            const user = await response.json();
            
            document.getElementById('shopName').value = user.shopName;
            document.getElementById('name').value = user.name;
            document.getElementById('email').value = user.email;
            document.getElementById('phone').value = user.phone;
            document.getElementById('username').value = user.username;
            document.getElementById('password').value = '';
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    }

    function closeModal() {
        document.getElementById('userModal').style.display = 'none';
        document.getElementById('error-message').style.display = 'none';
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            shopName: document.getElementById('shopName').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            isAdmin: document.getElementById('isAdmin').checked // Add this checkbox to your form
        };
    
        try {
            const url = editingUserId 
                ? `/api/admin/users/${editingUserId}`
                : '/api/admin/users';
                
            const method = editingUserId ? 'PUT' : 'POST';
    
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            if (response.ok) {
                closeModal();
                fetchUsers();
            } else {
                const error = await response.json();
                const errorElement = document.getElementById('error-message');
                errorElement.textContent = error.message;
                errorElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    }
    // Delete user
    async function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    fetchUsers();
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    }

    // Modify the frontend fetch code in AdminDashboard08.js
    async function fetchUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                credentials: 'include' // This is important for sending cookies
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch users');
            }
            
            const users = await response.json();
            if (Array.isArray(users)) {
                displayUsers(users);
            } else {
                throw new Error('Invalid data format received');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            // Show error to user
            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="color: red; text-align: center;">
                        ${error.message || 'Error loading users. Please ensure you are logged in as an admin.'}
                    </td>
                </tr>
            `;
        }
    }
});