const CustomerModel = require('../models/customerModel');

const customerController = {
    async createCustomer(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const result = await CustomerModel.createCustomer(req.body, req.session.user.id);
            res.status(201).json({ success: true, id: result });
        } catch (error) {
            console.error('Create customer error:', error);
            if (error.message === 'CNIC already exists') {
                res.status(400).json({ error: 'CNIC already exists' });
            } else {
                res.status(500).json({ error: 'Failed to create customer' });
            }
        }
    },

    async getAllCustomers(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const customers = await CustomerModel.getCustomers(req.session.user.id);
            res.json(customers);
        } catch (error) {
            console.error('Get customers error:', error);
            res.status(500).json({ error: 'Failed to fetch customers' });
        }
    },

    async updateCustomer(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { id } = req.params;
            const success = await CustomerModel.updateCustomer(id, req.body, req.session.user.id);
            
            if (success) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Customer not found' });
            }
        } catch (error) {
            console.error('Update customer error:', error);
            res.status(500).json({ error: 'Failed to update customer' });
        }
    },

    async deleteCustomer(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { id } = req.params;
            const success = await CustomerModel.deleteCustomer(id, req.session.user.id);
            
            if (success) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Customer not found' });
            }
        } catch (error) {
            console.error('Delete customer error:', error);
            res.status(500).json({ error: 'Failed to delete customer' });
        }
    }
};

module.exports = customerController;