const express = require('express');
const mysql = require('mysql');
const app = express();
const connection = require('./connect');
const session = require('express-session');
const moment = require('moment-timezone');

// Use express-session middleware
app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
}));


app.get('/staff', (req, res) => {
    try {
        const staffId = req.session.staffId;
        if (!staffId) {
            res.redirect('/login');
            return;
        }

    const bookingCountQuery = 'SELECT COUNT(bookingId) AS bookingCount FROM booking';

    connection.query(bookingCountQuery, (error, result) => {
        if (error) {
            console.error('Error counting bookings:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        const bookingCount = result[0].bookingCount;

        const query = `SELECT * FROM room_group_counts`;

        connection.query(query, (error, results, fields) => {
            if (error) {
                console.error('Error retrieving data:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            const data = results.map(result => result.count);
            const totalCustomers = results.reduce((acc, curr) => acc + curr.count, 0);
            

            // Query to count total rooms
            const totalRoomsQuery = 'SELECT COUNT(Roomid) as totalRooms FROM room';
            connection.query(totalRoomsQuery, (error, results) => {
                if (error) {
                    console.error('Error retrieving totalRooms data:', error);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalRooms = results[0].totalRooms;

                // Query to count payment types
                const paymentTypesQuery = `SELECT * FROM payment_counts`;

                connection.query(paymentTypesQuery, (error, results) => {
                    if (error) {
                        console.error('Error retrieving payment types data:', error);
                        res.status(500).json({ error: 'Internal server error' });
                        return;
                    }

                    const paymentData = results.reduce((acc, curr) => {
                        acc[curr.payment_type] = curr.count;
                        return acc;
                    }, {});

                    // Query to count ratings
                    const ratingQuery = `SELECT * FROM rating_counts`;

                    connection.query(ratingQuery, (error, results) => {
                        if (error) {
                            console.error('Error retrieving rating data:', error);
                            res.status(500).json({ error: 'Internal server error' });
                            return;
                        }

                        const ratingData = results.reduce((acc, curr) => {
                            acc[curr.rating] = curr.count;
                            return acc;
                        }, {});

                        // Query to count breakfast bookings
                        const breakfastQuery = `SELECT * FROM booking_summary`;

                        connection.query(breakfastQuery, (error, results) => {
                            if (error) {
                                console.error('Error retrieving breakfast count:', error);
                                res.status(500).json({ error: 'Internal server error' });
                                return;
                            }

                            const breakfastData = results[0];

                            // Query to count different stay durations
                            const stayDurationQuery = `SELECT * FROM booking_stay_duration_counts`;

                            connection.query(stayDurationQuery, (error, results) => {
                                if (error) {
                                    console.error('Error retrieving stay duration data:', error);
                                    res.status(500).json({ error: 'Internal server error' });
                                    return;
                                }

                                const stayDurationData = results[0];

                                //query to count customers
                                const query = 'SELECT COUNT(Name) AS nameCount FROM customer';

                                connection.query(query, (error, results) => {
                                    if (error) {
                                        console.error('Error counting names:', error);
                                        res.status(500).json({ error: 'Internal server error' });
                                        return;
                                    }
                            
                                    const nameCount = results[0].nameCount;

                                    //query to count staff
                                const staffQuery = 'SELECT COUNT(name) AS staffCount FROM staff';

                                connection.query(staffQuery, (error, results) => {
                                    if (error) {
                                        console.error('Error counting names:', error);
                                        res.status(500).json({ error: 'Internal server error' });
                                        return;
                                    }
                            
                                    const staffCount = results[0].staffCount;

                                    // Fetch staff name based on session
                                    const fetchStaffName = (staffId, callback) => {
                                        const query = 'SELECT name FROM staff WHERE id = ?';
                                        connection.query(query, [staffId], (err, results) => {
                                            if (err) {
                                                console.error('Error retrieving staff name:', err);
                                                callback(null);
                                                return;
                                            }
                                            if (results.length > 0) {
                                                callback(results[0].name);
                                            } else {
                                                callback(null);
                                            }
                                        });
                                    };

                                    // Get staffId from session
const staffId = req.session.staffId;


 // Query to count people based on different stay durations
 const countPeopleQuery = `SELECT * FROM booking_people_counts`;

connection.query(countPeopleQuery, (error, results) => {
 if (error) {
     console.error('Error counting people:', error);
     res.status(500).json({ error: 'Internal server error' });
     return;
 }

 const countPeopleData = results[0];

//Review count
 const Reviewsquery = 'SELECT COUNT(*) AS totalReviews FROM reviews';

 connection.query(Reviewsquery, (error, results, fields) => {
     if (error) {
         console.error('Error retrieving total reviews:', error);
         res.status(500).json({ error: 'Internal server error' });
         return;
     }

     const totalReviews = results[0].totalReviews;
 
//Amenities Count
     const Amenitiesquery = 'SELECT COUNT(*) AS totalAmenities FROM amenities';

     connection.query(Amenitiesquery, (error, results, fields) => {
         if (error) {
             console.error('Error retrieving total amenities:', error);
             res.status(500).json({ error: 'Internal server error' });
             return;
         }
 
         const totalAmenities = results[0].totalAmenities;

//Services Count
const Servicesquery = 'SELECT COUNT(*) AS totalServices FROM services';

connection.query(Servicesquery, (error, results, fields) => {
    if (error) {
        console.error('Error retrieving total amenities:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }

    const totalServices = results[0].totalServices;
        
//AvgRating
    const Ratingquery = 'SELECT AVG(rating) AS avgRating FROM reviews';

    connection.query(Ratingquery, (error, results, fields) => {
        if (error) {
            console.error('Error retrieving average rating:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        const avgRating = results[0].avgRating.toFixed(2); // Round to 2 decimal places


        //Services
        const ServiceTypesquery = 'SELECT COUNT(DISTINCT serviceType) AS uniqueServiceTypesCount FROM services';

        connection.query(ServiceTypesquery, (error, results, fields) => {
            if (error) {
                console.error('Error retrieving unique service types count:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
    
            const uniqueServiceTypesCount = results[0].uniqueServiceTypesCount;
         
//Amount
            const Amountquery = 'SELECT SUM(Amount) AS totalAmount FROM receipt';

    connection.query(Amountquery, (error, results, fields) => {
        if (error) {
            console.error('Error retrieving total amount:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        const totalAmount = results[0].totalAmount;


const query = `SELECT * FROM booking_year_month_counts`;

// Execute the query
connection.query(query, (err, results) => {
  if (err) {
    console.error('Error fetching booking count by month:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

  // Correctly process the results
  const bookingCounts = results.map(result => ({
    monthYear: `${result.Year}-${result.Month.toString().padStart(2, '0')}`, // Formats as "YYYY-MM"
    bookingCount: result.BookingCount, // Note the case sensitivity
    Year: result.Year
  }));

//year count
const queryYear = `SELECT * FROM booking_year_counts`;

// Execute the query
connection.query(queryYear, (err, results) => {
if (err) {
  console.error('Error fetching booking count by year:', err);
  res.status(500).json({ error: 'Internal server error' });
  return;
}

                                    // Fetch staff name
fetchStaffName(staffId, (staffName) => {
    // Render the staff page with all the data and customer details
    res.render('staff', {
        data,
        totalCustomers,
        totalRooms,
        paymentData,
        ratingData,
        breakfastData,
        stayDurationData,
        bookingCount, // Adding booking count to the rendered data
        nameCount,
        staffCount,
        staffName, // Assign the fetched staffName to the staffName variable
        countPeopleData,
        totalReviews,
        totalAmenities,
        totalServices,
        avgRating,
        uniqueServiceTypesCount,
        totalAmount,
        bookingData: JSON.stringify(bookingCounts),
        bookingDataYear: results
    });
});
});
});
});
});
});
});
});
});
});
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
} catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});



app.get('/customer', (req, res) => {
    const email = req.query.email;
    if (!email) {
        req.session.error = 'Email parameter is required';
        return res.redirect('/admin');
    }

    const query = `
        SELECT customer.*, booking.bookingId, booking.checkin, booking.No_of_people, booking.breakfast, booking.checkout, booking.roomId, booking.days, booking.payment, receipt.Amount, reviews.review, reviews.rating
        FROM customer
        LEFT JOIN booking ON customer.id = booking.customer
        LEFT JOIN receipt ON booking.bookingId = receipt.bookingID
        LEFT JOIN reviews ON customer.id = reviews.customerID
        WHERE customer.email = ?`;

    connection.query(query, [email], (error, results) => {
        if (error) {
            console.error('Error retrieving customer details:', error);
            req.session.error = 'Internal server error';
            return res.redirect('/admin');
        }

        if (results.length > 0) {
            req.session.customer = {
                id: results[0].id,
                Name: results[0].Name,
                email: results[0].email,
                phoneNumber: results[0].phoneNumber,
                address: results[0].address,
                bookings: results.map(row => ({
                    bookingId: row.bookingId,
                    checkin: row.checkin,
                    checkout: row.checkout,
                    Amount: row.Amount,
                    review: row.review,
                    rating: row.rating,
                    days: row.days,
                    payment: row.payment,
                    roomId: row.roomId,
                    No_of_people: row.No_of_people,
                    breakfast: row.breakfast
                }))
            };
        } else {
            req.session.error = 'No customer found with the specified email.';
        }
        res.redirect('/admin');
    });
});



app.post('/amenities', (req, res) => {
    const { name } = req.body;

    // Assuming you have a connection to your database
    const query = 'INSERT INTO amenities (amenity_name) VALUES (?)'; // Use 'amenity' as the table name and 'amenity_name' as the column name
    connection.query(query, [name], (error, results) => {
        if (error) {
            console.error('Error adding amenity:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // res.render('admin', { message: 'Amenity added successfully' }); // Render the admin.ejs file with the success message
        res.redirect('/admin?message=Amenity added successfully'); // Redirect to the admin route
    });
});


app.post('/amenitiesMinus', (req, res) => {
    const name = req.body.name; // Assuming this is the correct body parameter

    // Assuming deletion is based on the amenity name or an ID
    const query = 'DELETE FROM amenities WHERE amenity_name = ?'; // Adjust your query accordingly
    connection.query(query, [name], (error, results) => {
        if (error) {
            console.error('Error deleting amenity:', error);
            // Redirect with an error message
            res.redirect('/admin?message=' + encodeURIComponent('Error deleting amenity.'));
            return;
        }

        if (results.affectedRows === 0) {
            // If no rows were affected, the amenity was not found
            res.redirect('/admin?message=' + encodeURIComponent('No amenity found with the provided name.'));
        } else {
            // Redirect with a success message
            res.redirect('/admin?message=' + encodeURIComponent('Amenity deleted successfully.'));
        }
    });
});

app.get('/admin', async (req, res) => {
    try {
        const staffId = req.session.staffId;
        if (!staffId) {
            res.redirect('/login');
            return;
        }

        // Helper function to promisify connection.query calls
        const queryAsync = (query, params) => new Promise((resolve, reject) => {
            connection.query(query, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Fetching all necessary data using async/await
        const reviews = await queryAsync('SELECT * FROM review_details ORDER BY reviewID DESC');
        const staffDetails = await queryAsync('SELECT * FROM staff WHERE id = ?', [staffId]);
        const services = await queryAsync('SELECT * FROM service_details ORDER BY ServiceID DESC');
        let bookingQuery = 'SELECT b.bookingId, b.checkin, b.checkout, b.No_of_people, b.days, b.breakfast, b.payment, b.customer, b.roomId, b.staffID, r.receiptID, r.checkedin, r.checkedout FROM booking b LEFT JOIN receipt r ON b.bookingId=r.bookingID ORDER BY b.bookingId DESC';
        // const sortOption = req.query.sort;
        // if (sortOption) {
        //     bookingQuery += ` ORDER BY b.${sortOption} DESC`;
        // }
        const bookings = await queryAsync(bookingQuery);
        const rooms = await queryAsync('SELECT Roomid, Roomtype, Price, availability FROM room WHERE Roomid BETWEEN 101 AND 109');

        // Handling rooms and amenities
        const roomsAndAmenities = await Promise.all(rooms.map(async (room) => {
            const amenities = await queryAsync(`SELECT amenities.amenity_name
                                                FROM amenities
                                                INNER JOIN roomamenities ON amenities.amenity_id = roomamenities.amenity_id
                                                WHERE roomamenities.room_id = ${room.Roomid}`);
            return { room, amenities };
        }));

        // Assuming amenitiesData is the array of amenity objects fetched from the database
        const amenitiesData = await queryAsync('SELECT * FROM amenities');

        const { customerData, error } = req.session;

        // Clear the session variables after fetching data
        // req.session.customerData = null;
        // req.session.error = null;

        // Finally, render the admin page with all fetched data
        res.render('admin', { reviews, staff: staffDetails[0], services, bookings, roomsAndAmenities, amenities: amenitiesData,  req: req, message : null });//req: req, customerData: req.session.customerData, error: req.session.error
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/add-service-request', (req, res) => {
    const { customer_id, room_id, service_type } = req.body;
  
    // Assuming you have a MySQL connection pool named 'pool' initialized in your application
    connection.query(
      'INSERT INTO services (CustomerID, RoomID, ServiceType) VALUES (?, ?, ?)',
      [customer_id, room_id, service_type],
      (error, results) => {
        if (error) {
          console.error('Error inserting service request:', error);
          res.status(500).send('Error inserting service request');
          return;
        }
  
        console.log('Service request inserted successfully');
        res.redirect('/admin'); // Redirect to a different page after successful insertion
      }
    );
  });
  

app.post('/amenityAdd', async (req, res) => {
    try {
        const { roomId, amenityId } = req.body;

        // Check if the roomId and amenityId are present
        if (!roomId || !amenityId) {
            res.status(400).json({ error: 'Missing roomId or amenityId' });
            return;
        }

        // Insert the roomId and amenityId into the roomamenities table
        const insertQuery = 'INSERT INTO roomamenities (room_id, amenity_id) VALUES (?, ?)';
        connection.query(insertQuery, [roomId, amenityId], (err, result) => {
            if (err) {
                console.error('Error inserting into roomamenities table:', err);
                res.status(500).json({ error: 'Error inserting into roomamenities table' });
                return;
            }
            console.log('Amenity added successfully');
            res.redirect('/admin'); // Redirect back to the admin page
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/amenityDelete', async (req, res) => {
    const { amenityId, roomId } = req.body;

    if (!amenityId || !roomId) {
        return res.status(400).json({ error: 'Missing amenityId or roomId' });
    }

    const deleteQuery = 'DELETE FROM roomamenities WHERE amenity_id = ? AND room_id = ?';

    connection.query(deleteQuery, [amenityId, roomId], (err, results) => {
        if (err) {
            console.error('Error deleting room amenity:', err);
            return res.status(500).json({ error: 'Error deleting room amenity' });
        }
        console.log('Room amenity deleted successfully');
        res.redirect('/admin'); // Redirect back to the admin page or wherever appropriate
    });
});


// Route for handling check-in
app.post('/checkin', (req, res) => {
    const { bookingId } = req.body;
    const newYorkTime = moment().tz('America/New_York');
    const formattedDate = newYorkTime.format('YYYY-MM-DD HH:mm:ss');
//     const moment = require('moment-timezone');

// // Get the current time in UTC
// const utcTime = moment.utc();

// // Convert UTC time to Eastern Daylight Time (EDT)
// const edtTime = utcTime.tz('America/New_York');

// // Format the EDT time
// const formattedDate = edtTime.format('YYYY-MM-DD HH:mm:ss');

// console.log('Formatted EDT time:', formattedDate);


    try {
        // Insert into receipt table for check-in
        connection.query(
            'INSERT INTO receipt(checkedin, bookingID) VALUES (?, ?)',
            [formattedDate, bookingId],
            (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Error while inserting into receipt table for check-in:', insertErr);
                    res.status(500).json({ error: 'Error while inserting into receipt table for check-in' });
                    return;
                }

                console.log('Check-in successful');
                res.redirect('/admin'); // Redirect back to the admin page
            }
        );
    } catch (error) {
        console.error('Error while processing check-in:', error);
        res.status(500).json({ error: 'Error while processing check-in' });
    }
});



app.post('/checkout', (req, res) => {
    const { bookingId } = req.body;
    const newYorkTime = moment().tz('America/New_York');
    const formattedDate = newYorkTime.format('YYYY-MM-DD HH:mm:ss');
    // const moment = require('moment-timezone');

    // // Get the current time in UTC
    // const utcTime = moment.utc();
    
    // // Convert UTC time to Eastern Daylight Time (EDT)
    // const edtTime = utcTime.tz('America/New_York');
    
    // // Format the EDT time
    // const formattedDate = edtTime.format('YYYY-MM-DD HH:mm:ss');
    
    // console.log('Formatted EDT time:', formattedDate);
    
    try {
        // Update receipt table for check-out
        connection.query(
            'UPDATE receipt SET checkedout=? WHERE bookingID=?',
            [formattedDate, bookingId],
            (updateErr, updateResults) => {
                if (updateErr) {
                    console.error('Error while updating receipt table for check-out:', updateErr);
                    res.status(500).json({ error: 'Error while updating receipt table for check-out' });
                    return;
                }

                console.log('Check-out successful');

                // Update booking table for staffID
                connection.query(
                    'UPDATE booking SET staffID=? WHERE bookingid=?',
                    [req.session.staffId, bookingId],
                    (updateErr, updateResults) => {
                        if (updateErr) {
                            console.error('Error while updating booking table with staffID:', updateErr);
                            res.status(500).json({ error: 'Error while updating booking table with staffID' });
                            return;
                        }

                        console.log('StaffID updated successfully');

                        // Get the number of days for the booking
                        connection.query(
                            'SELECT days FROM booking WHERE bookingid=?',
                            [bookingId],
                            (selectErr, selectResults) => {
                                if (selectErr) {
                                    console.error('Error while fetching number of days for the booking:', selectErr);
                                    res.status(500).json({ error: 'Error while fetching number of days for the booking' });
                                    return;
                                }

                                const days = selectResults[0].days;

                                // Calculate and update price
                                connection.query(
                                    'CALL CalculateAndUpdatePrice(?, ?)',
                                    [bookingId, days],
                                    (insertErr, insertResults) => {
                                        if (insertErr) {
                                            console.error('Error while calculating and updating price:', insertErr);
                                            res.status(500).json({ error: 'Error while calculating and updating price' });
                                            return;
                                        }

                                        console.log('Price calculation and update successful');
                                        res.redirect('/admin'); // Redirect back to the admin page
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error while processing check-out:', error);
        res.status(500).json({ error: 'Error while processing check-out' });
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