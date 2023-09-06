const User = require('../models/user_model');

module.exports = class AddressController {
    async createAddress(req, res) {
        const userId = req.userData.userId; // Extract the user ID from the decoded JWT
        const addressData = req.body; // Address data from the request body

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Add the new address to the user's addresses array
            user.addresses.push(addressData);

            await user.save();

            res.status(201).json({ message: 'Address created successfully' });
        } catch (error) {
            console.error('Error creating address:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getAddress(req, res) {
        const userId = req.userData.userId; // Extract the user ID from the decoded JWT

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const addresses = user.addresses;

            res.status(200).json(addresses);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async updateAddress(req, res) {
        const userId = req.userData.userId; // Extract the user ID from the decoded JWT
        const addressId = req.query.addressId; // Extract the address ID from the query parameter
        const updatedAddressData = req.body; // Updated address data from the request body

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find the address by its ID in the user's addresses array
            const addressToUpdate = user.addresses.id(addressId);

            if (!addressToUpdate) {
                return res.status(404).json({ message: 'Address not found' });
            }

            // Update the address fields
            addressToUpdate.set(updatedAddressData);

            await user.save();

            res.status(200).json({ message: 'Address updated successfully' });
        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async deleteAddress(req, res) {
        const userId = req.userData.userId; // Extract the user ID from the decoded JWT
        const addressId = req.query.addressId; // Extract the address ID from the query parameter

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find the address by its ID in the user's addresses array
            const addressToRemove = user.addresses.id(addressId);

            if (!addressToRemove) {
                return res.status(404).json({ message: 'Address not found' });
            }

            user.addresses.pull(addressId); // Remove the address

            await user.save();

            res.status(200).json({ message: 'Address deleted successfully' });
        } catch (error) {
            console.error('Error deleting address:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    async getAddressById(req, res) {
        const userId = req.userData.userId; // Extract the user ID from the decoded JWT
        const addressId = req.query.addressId; // Extract the address ID from the query parameter

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find the address by its ID in the user's addresses array
            const address = user.addresses.id(addressId);

            if (!address) {
                return res.status(404).json({ message: 'Address not found' });
            }

            res.status(200).json(address);
        } catch (error) {
            console.error('Error fetching address by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
