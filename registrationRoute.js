const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const connection = require('./connect');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Import nodemailer
 
// Use express-session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to a strong, random string
  resave: true,
  saveUninitialized: true,
}));
 
// Function to generate a secret key for 2FA
const generateSecret = () => {
  return speakeasy.generateSecret();
};
 
// Function to send email
const sendEmail = async (toEmail, secret) => {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'marutifruitcanning@gmail.com',
      pass: 'ucgqsxtfpwbjcahh'
    }
  });
  let img = await QRCode.toDataURL(secret.otpauth_url);
  //const base64Image = Buffer.from(qrCodeImage).toString('base64');
  //console.log(base64Image);
  let message = {
    from: 'marutifruitcanning@gmail.com',
    to: toEmail,
    subject: '2FA QR Code',
    attachDataUrls: true,//to accept base64 content in messsage
    html: 'Scan this QR code and set up your Secret key </br> <img src="' + img + '">' ,
   
  };
  let info = await transporter.sendMail(message);
 
  console.log('Email sent: %s', info.messageId);
};
 
// Define the registration route with authentication and 2FA, commit and rollback logic
app.post('/register', async (req, res) => {
  console.log('Registration route initialized.');
  const { name, phoneNumber, address, email, password, type } = req.body;
 
  try {
    // Check if the email is already registered
    const emailExists = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT COUNT(*) AS count FROM login WHERE email = ?',
        [email],
        (error, results) => {
          if (error) {
            console.error('Error checking if email exists:', error);
            reject(error);
          } else {
            resolve(results[0].count > 0);
          }
        }
      );
    });
 
    if (emailExists) {
      return res.status(400).send('Email already registered.');
    }
 
    // Generate secret key for 2FA
    const secret = generateSecret();
 
    // Send the QR code via email
    await sendEmail(email, secret);
    console.log("password"+password);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
 
    // Begin transaction
    connection.beginTransaction(async function(err) {
      if (err) {
        console.error('Error beginning transaction:', err);
        return res.status(500).send('Registration failed.');
      }
 
      try {
        // Insert into customer or staff table
        const insertQuery = type === 'Customer' ?
          'INSERT INTO customer (name, phoneNumber, address, email) VALUES (?, ?, ?, ?)' :
          'INSERT INTO staff (name, phoneNumber, email) VALUES (?, ?, ?)';
 
        await new Promise((resolve, reject) => {
          connection.query(insertQuery, type === 'Customer' ?
            [name, phoneNumber, address, email] :
            [name, phoneNumber, email],
            function(error, results, fields) {
              if (error) {
                console.error('Error inserting into table:', error);
                reject(error);
              } else {
                resolve();
              }
            }
          );
        });
 
        const dataToEncrypt = secret.base32;
              const secretKey = crypto.randomBytes(32);
              const iv = crypto.randomBytes(16); // Initialization vector (IV)
              const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
              let encryptedData = cipher.update(dataToEncrypt, 'utf8', 'hex');
              encryptedData += cipher.final('hex');
              // Step 3: Decrypt the data
              const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
              let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
              decryptedData += decipher.final('utf8');
              console.log('Original data:', dataToEncrypt);
              console.log('Encrypted data:', encryptedData);
              console.log('Decrypted data:', decryptedData);
              let encodedSecretKey = secretKey.toString('base64');
              let encodedIV = iv.toString('base64');
              console.log(encodedSecretKey);
              console.log(encodedIV);
              // Hash the secret key
             
              // Insert into login table
              await new Promise((resolve, reject) => {
                  connection.query(
                      'INSERT INTO login (email, password, userType, secret,ckey,iv) VALUES (?, ?, ?, ?, ? ,? )',
                      [email, hashedPassword, type, encryptedData,encodedSecretKey,encodedIV], // Save the base32 secret
                      function(err, results, fields) {
                          if (err) {
                              console.error('Error inserting into login table:', err);
                              reject(err);
                          } else {
                              resolve();
                          }
                      }
                  );
              });
 
              // Commit the transaction
              connection.commit(function(err) {
                  if (err) {
                      console.error('Error committing transaction:', err);
                      return connection.rollback(function() {
                          res.status(500).send('Registration failed.');
                      });
                  }
 
                  console.log('Registration successful.');
                  // Render the display-qr view with the QR code image as a parameter
                  //res.render('authenticate', { qrCodeImage });
                  res.redirect('/authenticate');
 
              });
          } catch (error) {
              // Rollback the transaction on error
              console.error('Error during registration:', error);
              connection.rollback(function() {
                  res.status(500).send('Registration failed.');
              });
          }
      });
  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send('Registration failed.');
  }
});
 
// Function to verify the 2FA token
const verifyToken = (secret, token) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return false; // Return false in case of any error
  }
};
 
 
//login route with 2FA
// Login route with 2FA
app.post('/login', async (req, res) => {
  console.log('Login route initialized.');
  const { email, password, token } = req.body; // Include token in the request body
 
  try {
    connection.query(
      'SELECT userType, password, secret,ckey,iv FROM login WHERE email = ?',
      [email],
      async (err, results) => {
        if (err) {
          console.error('Error while querying the database:', err);
          res.status(500).send('Login failed.');
        } else {
          console.log(results.length);
          if (results.length > 0) {
            const hashedPassword = results[0].password;
            const secret = results[0].secret;
            const key = results[0].ckey;
            const iv = results[0].iv;
            console.log("key"+key);
            console.log("iv"+iv);
            // Decode the encodedSecretKey and encodedIV
            const decodedSecretKey = Buffer.from(key, 'base64');
            const decodedIV = Buffer.from(iv, 'base64');
            //const hashedPasswordnew = await bcrypt.hash(password, 10);
            //console.log("hashedpasswordnew"+hashedPasswordnew);
            //console.log("hashedPassword"+hashedPassword);
            // Compare the hashed password with the provided password
            const passwordMatch = await bcrypt.compare(password, hashedPassword);
            console.log("passwordMatch"+passwordMatch);
            console.log("secret"+secret);
            if (passwordMatch) {
              if (secret) {
 
                    const decipher = crypto.createDecipheriv('aes-256-cbc', decodedSecretKey, decodedIV);
                    let decryptedData = decipher.update(secret, 'hex', 'utf8');
                    decryptedData += decipher.final('utf8');
                    console.log('Decrypted data:', decryptedData);
                    // If a secret is present, verify the token
                const isTokenValid = verifyToken(decryptedData, token);
                console.log(isTokenValid);
                if (!isTokenValid) {
                  res.status(401).send('Invalid 2FA token.');
                  return;
                }
              }
 
              const userType = results[0].userType;
              req.session.userType = userType;
 
              if (userType === 'Customer') {
                connection.query(
                  'SELECT * FROM customer WHERE email = ?',
                  [email],
                  (err, customerResults) => {
                    if (err) {
                      console.error('Error while querying the database:', err);
                      res.status(500).send('Login failed.');
                    } else {
                      console.log("line109"+customerResults);
                      const customerId = customerResults[0].id;
                      console.log("line 110"+customerId);
                      req.session.customerId = customerId;
                      const customerName = customerResults[0].Name;
                      console.log("line 113"+customerName);
                      req.session.customerName = customerName;
                      res.redirect('/home');
                    }
                  }
                );
              } else if (userType === 'Staff') {
                connection.query(
                  'SELECT * FROM staff WHERE email = ?',
                  [email],
                  (err, staffResults) => {
                    if (err) {
                      console.error('Error while querying the database:', err);
                      res.status(500).send('Login failed.');
                    } else {
                      const staffId = staffResults[0].id;
                      req.session.staffId = staffId;
                      res.redirect('/staff');
                    }
                  }
                );
              }
            } else {
              res.status(401).send('Invalid credentials.');
            }
          } else {
            res.status(401).send('Invalid credentials.');
          }
        }
      }
    );
 
  } catch (error) {
    console.error('Error while logging in:', error);
    res.status(500).send('Login failed.');
  }
});
 
// Route to generate 2FA secret for a user
app.post('/generate-2fa-secret', async (req, res) => {
  const { email } = req.body;
 
  try {
    // Generate a secret for the user
    const secret = generateSecret();
 
    // Save the secret in the database for the user
    connection.query(
      'UPDATE login SET secret = ? WHERE email = ?',
      [secret.base32, email],
      (err, result) => {
        if (err) {
          console.error('Error while updating 2FA secret:', err);
          res.status(500).send('Failed to generate 2FA secret.');
        } else {
          res.json({ secret: secret.ascii });
        }
      }
    );
 
  } catch (error) {
    console.error('Error while generating 2FA secret:', error);
    res.status(500).send('Failed to generate 2FA secret.');
  }
});
 
// Other routes and middleware...
 
module.exports = app;