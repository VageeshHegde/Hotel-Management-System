// connect.js

const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Hegde@123456',
    database: 'cosc 640',
    port: '3306'
});


// Establish the database connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database');
});

module.exports = connection;
