const mongoose = require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL
// Use local or Atlas URL based on your environment setup
const mongoURL = process.env.MONGODB_URL ;

if (!mongoURL) {
    console.error('MongoDB URI is not defined in the environment variables');
    process.exit(1); // Exit if the URI is not available
}

// Set up MongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,  // Ensure SSL/TLS is enabled
    tlsAllowInvalidCertificates: true, // Add this if using self-signed or dev certificates (use cautiously)
    serverSelectionTimeoutMS: 5000, // Add timeout for connection attempts
});

// Get the default connection
const db = mongoose.connection;

// Define event listeners for database connection
db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Export the database connection
module.exports = db;
