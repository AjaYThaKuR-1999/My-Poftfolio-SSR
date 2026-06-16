const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const seedData = async () => {
    try {
        // Only connect if there's no active connection
        if (mongoose.connection.readyState === 0) {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio_db');
            console.log('MongoDB connected.');
        }

        // 1. Check if an admin user already exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists. Skipping database seeding.');
            return;
        }

        // 2. Create Admin User
        console.log('No admin user found. Creating admin user...');
        const adminUser = await User.create(
            [
                {
                    role: 'admin',
                    name: 'Ajay Thakur',
                    email: process.env.ADMIN_EMAIL,
                    password: process.env.ADMIN_PASSWORD,
                    userType: 'Admin'

                }
            ],
            {
                validateBeforeSave: false
            }
        );

        console.log('Users created:');
        console.log('Database seeding completed successfully!');
    } catch (err) {
        console.error('Seeding error:', err);
        throw err;
    }
};

// Execute if run directly
if (require.main === module) {
    seedData()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error('Fatal seeding error:', err);
            process.exit(1);
        });
}

module.exports = seedData;
