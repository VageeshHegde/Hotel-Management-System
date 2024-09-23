// // connect.js

// const mysql = require('mysql');

// const connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'Hegde@123456',
//     database: 'cosc 640',
//     port: '3306'
// });


// // Establish the database connection
// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err.message);
//         return;
//     }
//     console.log('Connected to the database');
// });

// module.exports = connection;
// Load environment variables from .env file in local development
require('dotenv').config();

const mysql = require('mysql');

// Create connection using environment variables
const connection = mysql.createConnection({
    host: process.env.DB_HOST,          // MySQL host from Railway
    user: process.env.DB_USER,          // MySQL user from Railway
    password: process.env.DB_PASSWORD,  // MySQL password from Railway
    database: process.env.DB_NAME,      // MySQL database name from Railway
    port: process.env.DB_PORT || '3306' // Default to 3306 if no port provided
});

// Establish the database connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Export the connection for use in other files
module.exports = connection;

