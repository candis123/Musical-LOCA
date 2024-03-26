const fileUpload = require('express-fileupload');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const mysql = require('mysql');

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: "thisismysecrctekey",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    resave: false
}));

// MySQL connection setup
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "musical_loca"
});

// Route for serving login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Signup handler
app.post('/signup', (req, res) => {
    const { name, email, username, bio, password, verifypassword } = req.body;

    con.query(`SELECT * FROM user WHERE username = '${username}' AND password = '${password}'`, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }

        if (Object.keys(result).length > 0) {
            console.log("failed registration");
            // Redirect or send failure response
            res.sendFile(path.join(__dirname, 'failReg.html')); // Sending failReg.html on unsuccessful registration
        } else {
            const userPage = () => {
                req.session.user = {
                    name: name,
                    email: email,
                    username: username,
                    bio: bio,
                    password: password,
                    verifypassword: verifypassword
                };

                res.redirect('/Profilepage.html'); // Redirect to Profilepage.html
            };

            const sql = `INSERT INTO user (name, email, username, bio, password, verifypassword) VALUES (?, ?, ?, ?, ?, ?)`;
            con.query(sql, [name, email, username, bio, password, verifypassword], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Internal Server Error");
                }
                userPage();
            });
        }
    });
});

// Login handler
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Username or password missing");
    }

    con.query(`SELECT * FROM user WHERE username = ? AND password = ?`, [username, password], (err, result) => {
        if (err) {
            console.log("Database error:", err);
            return res.status(500).send("Internal Server Error");
        }

        if (result.length > 0) {
            req.session.user = result[0];
            console.log("User logged in:", req.session.user.username);
            res.redirect('/ProfilePage.html'); // Redirect to profile page on successful login
        } else {
            console.log("Login failed for username:", username);
            res.sendFile(path.join(__dirname, 'failLog.html')); // Sending failLog.html on unsuccessful login
        }
    });
});
//Profile Page handling
const expressFileUpload = require('express-fileupload');
app.use(expressFileUpload());

// Profile update handler
app.post('/updateProfile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('User not logged in');
    }

    const userId = req.session.user.id;
    const bio = req.body.bio;
    const zip_code = req.body.zip_code; // Matching your schema's zip_code column
    let profilePicPath = req.session.user.profile_pic_path; // Fallback to existing path

    if (req.files && req.files.profilePicture) {
        // Assuming you handle file storage properly elsewhere
        const profilePicture = req.files.profilePicture;
        profilePicPath = `/path/to/storage/${profilePicture.name}`; // Update with actual storage logic
        profilePicture.mv(profilePicPath, err => {
            if (err) return res.status(500).send('Failed to upload image');
        });
    }

    // Update the user's profile information in the database
    const sql = `UPDATE user SET bio = ?, profile_pic_path = ?, zip_code = ? WHERE id = ?`;
    con.query(sql, [bio, profilePicPath, zip_code, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Failed to update profile");
        }
        // Optionally update session data here if needed
        req.session.user.bio = bio;
        req.session.user.profile_pic_path = profilePicPath;
        req.session.user.zip_code = zip_code;

        res.send("Profile updated successfully");
    });
});



// Serving static files from the current directory
app.use(express.static(__dirname));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

