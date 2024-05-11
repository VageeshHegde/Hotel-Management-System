const express = require('express');
const mysql = require('mysql');
const app = express();
const connection = require('./connect');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static("./images"));
app.use(bodyParser.urlencoded({ extended: false }));

// Use express-session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  name: 'hotel'
}));

app.get('/home', (req, res) => {
  let q1 = 'SELECT Roomid, Roomtype, Price, availability FROM room WHERE Roomid BETWEEN 101 AND 109';

  try {
    const customerId = req.session.customerId;
    if (!customerId) {
      res.redirect('/login');
      return res.status(401).send('Unauthorized');
    }

    let rooms;
    connection.query(q1, (err, results) => {
      if (err) throw err;
      rooms = results;

      // Fetch overall average rating
      const fetchOverallRating = (callback) => {
        const query = 'SELECT AVG(rating) AS avgRating FROM reviews';
        connection.query(query, (err, results) => {
          if (err) throw err;
          callback(results[0].avgRating);
        });
      };

      fetchOverallRating(avgRating => {
        // Fetch customer name
        const fetchCustomerName = (customerId, callback) => {
          const query = 'SELECT name FROM customer WHERE id = ?';
          connection.query(query, [customerId], (err, results) => {
            if (err) throw err;
            callback(results[0].name);
          });
        };

        // Fetch amenities for each room
        const fetchAmenities = (roomId, callback) => {
          const query = `SELECT amenities.amenity_name
                         FROM amenities
                         INNER JOIN roomamenities ON amenities.amenity_id = roomamenities.amenity_id
                         WHERE roomamenities.room_id = ${roomId}`;
          connection.query(query, (err, results) => {
            if (err) throw err;
            callback(results);
          });
        };

        // Array to store the amenities for each room
        const amenities = [];

        // Counter to keep track of fetched amenities
        let counter = 0;

        // Loop through each room
        for (let i = 0; i < rooms.length; i++) {
          fetchAmenities(rooms[i].Roomid, amenitiesData => {
            amenities.push(amenitiesData);
            counter++;

            if (counter === rooms.length) {
              fetchCustomerName(req.session.customerId, customerName => {
                // Render the template with the fetched data
                res.render('home', {
                  rooms,
                  avgRating,
                  customerName,
                  amenities,
                  error: '' 
                });
              });
            }
          });
        }
      });
    });
  } catch (err) {
    console.log(err);
    res.send('Some error in DB');
  }
});

// Handle the "/book" endpoint
app.post('/book', async (req, res) => {
  const { roomId, checkInDate, checkOutDate, numberOfPeople, breakfastPreference, paymentMode } = req.body;
  connection.query(
      'SELECT COUNT(*) AS count FROM booking WHERE roomId = ? AND (checkout <= ? AND checkin >= ?)',
      [roomId, checkOutDate, checkInDate],
      function (error, results, fields) {
          if (error) {
              console.error('Error while querying:', error);
              // Handle the error
              res.redirect('/error'); // Redirect to error.ejs
          } else {
              const count = results[0].count;
              console.log('Count:', count);
              if (count === 0) {
                  // Proceed with insertion
                  connection.query(
                      'INSERT INTO booking (checkin, checkout, No_of_people, breakfast, payment, customer, roomId) VALUES (?, ?, ?, ?, ?, ?, ?)',
                      [checkInDate, checkOutDate, numberOfPeople, breakfastPreference, paymentMode, req.session.customerId, roomId],
                      function (error, results, fields) {
                          if (error) {
                              console.error('Error while inserting:', error);
                              // Handle the error
                              res.redirect('/error'); // Redirect to error.ejs
                          } else {
                              console.log('Insertion successful.');
                              // Handle success
                              res.redirect('/success'); // Redirect to success.ejs
                          }
                      }
                  );
              } else {
                  console.log('Room is already booked for the selected dates');
                  // Handle room already booked
                  res.redirect('/error'); // Redirect to error.ejs
              }
          }
      });
});


//profile
app.get('/profile', (req, res) => {
  try {
    const customerId = req.session.customerId;
    if (!customerId) {
      res.redirect('/login');
      return res.status(401).send('Unauthorized');
    }

    connection.query('SELECT booking.roomId, booking.checkin, booking.checkout, booking.days, booking.breakfast, booking.payment, booking.No_of_people, receipt.receiptID, receipt.Amount, customer.name AS customerName, customer.phoneNumber, customer.address, customer.email, room.Roomtype FROM booking LEFT JOIN receipt ON booking.bookingId = receipt.bookingId LEFT JOIN customer ON booking.customer = customer.id LEFT JOIN room ON booking.roomId = room.Roomid WHERE booking.customer = ? ORDER BY booking.checkin DESC', [customerId], (err, results) => {
      if (err) {
        console.error('Error while querying the database:', err);
        return res.status(500).json({ error: 'Error fetching available bookings' });
      }

      // Query customer details based on the session ID
      connection.query('SELECT * FROM customer WHERE id = ?', [customerId], (err, customerResults) => {
        if (err) {
          console.error('Error while querying the database:', err);
          return res.status(500).json({ error: 'Error fetching customer details' });
        }

      console.log('Customer details:', customerResults[0]);
      console.log(results);
      res.render('profile', { bookings: results, customer: customerResults[0] });
    });
  });
  } catch (error) {
    console.error('Error while fetching available rooms:', error);
    res.status(500).json({ error: 'Error fetching available rooms' });
  }
});


app.post('/review', async (req, res) => {
  try {
    const customerId = req.session.customerId;
    console.log("line 81" + customerId);
    const { review, rating } = req.body;

    connection.query(
      'INSERT INTO reviews(review,customerID,rating) VALUES (?,?,?)',
      [review, customerId, rating]
    );
    res.redirect('/profile');
  }
  catch (error) {
    console.error('Error while inserting review:', error);
    res.status(500).send('Insert failed.');
  }
});


app.get('/logoutg', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Failed to destroy session:', err);
      return res.status(500).json({ message: 'Failed to destroy session' });
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
    res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
    res.setHeader('Expires', '0'); // Proxies.
    res.clearCookie('hotel');

    console.log('Session destroyed. Logging out.');
    res.render('login');
  });
});


module.exports = app;