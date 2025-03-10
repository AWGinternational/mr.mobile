// src/controllers/supplierController.js

const supplierModel = require('../models/suppliermodel');

async function addSupplier(req, res) {
    const { supplierName, supplierAddress, contactNumber } = req.body;
    const userId = req.session.user.id;

    if (!supplierName || !supplierAddress || !contactNumber) {
        return res.status(400).json({ success: false, error: 'Invalid input' });
    }

    try {
        const result = await supplierModel.addSupplier(supplierName, supplierAddress, contactNumber, userId);

        if (!result) {
            return res.status(500).json({ success: false, error: 'Failed to add supplier' });
        }

        res.json({ success: true, message: 'Supplier added successfully', data: result });
    } catch (error) {
        console.error('Error adding supplier:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
    console.log('Received Contact Number:', contactNumber);

}


async function getAllSuppliers(req, res) {
    const userId = req.session.user.id;
    try {
        const suppliers = await supplierModel.find(userId); // Update this based on your database library
        res.json({ success: true, data: suppliers });
    } catch (error) {
        console.error('Error fetching all suppliers:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function getSupplierById(req, res) {
    const supplierId = req.params.id;
    const userId = req.session.user.id;

    try {
        const supplier = await supplierModel.getSupplierById(supplierId, userId);

        if (!supplier) {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }

        res.json({ success: true, data: supplier });
    } catch (error) {
        console.error('Error fetching supplier by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function updateSupplier(req, res) {
    const supplierId = req.params.id;
    const userId = req.session.user.id;
    const { supplierName, supplierAddress, contactNumber } = req.body;

    if (!supplierName || !supplierAddress || !contactNumber) {
        return res.status(400).json({ success: false, error: 'Invalid input' });
    }

    try {
        const updatedSupplier = await supplierModel.updateSupplier(supplierId, supplierName, supplierAddress, contactNumber, userId);

        if (!updatedSupplier) {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }

        res.json({ success: true, message: 'Supplier updated successfully', data: updatedSupplier });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function deleteSupplier(req, res) {
    try {
        const supplierId = parseInt(req.params.id);
        const userId = req.session.user.id;

        if (!supplierId || isNaN(supplierId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid supplier ID' 
            });
        }

        const result = await supplierModel.deleteSupplier(supplierId, userId);

        if (!result) {
            return res.status(404).json({ 
                success: false, 
                error: 'Supplier not found or unauthorized' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Supplier deleted successfully' 
        });
    } catch (error) {
        console.error('Error in deleteSupplier:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error' 
        });
    }
}

module.exports = {
    getAllSuppliers,
    addSupplier,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
};
