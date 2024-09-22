const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse POST request data
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS and define the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'images' directory
app.use(express.static(path.join(__dirname, 'images')));

// Use the registration route
const registrationRoute = require('./registrationRoute');
app.use(registrationRoute);

// Use the booking route
const roomsRoute = require('./roombooking');
app.use(roomsRoute);

// Use the admin route
const adminRoute = require('./adminactivities');
app.use(adminRoute);

// Route for rendering the signup form
app.get('/', (req, res) => {
  res.render('signUp');
});

app.get('/signUp', (req, res) => {
  res.render('signUp');
});

// Route for rendering the login form
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/authenticate', (req, res) => {
  res.render('authenticate');
});


// Route for rendering the home page
app.get('/home', (req, res) => {
  res.render('home');
});

// app.get('/home', (req, res) => {
//   const successMessage = req.query.success;
//   res.render('home', { success: successMessage });
// });

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.get('/success', (req, res) => {
  res.render('success');
})

app.get('/error', (req, res) => {
  res.render('error');
})

app.get('/staff', (req, res) => {
  res.render('staff');
});

app.get('/customer', (req, res) => {
  res.render('admin'); 
});

app.get('/amenities', (req, res) => {
  res.render('amenities');
});

// Route for handling the staff dashboard
app.get('/admin', (req, res) => {
  res.render('admin', { customer: null }); // Render the initial staff dashboard view
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Something broke! Error: ${err.message}`);
});

// 404 Not Found middleware
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
