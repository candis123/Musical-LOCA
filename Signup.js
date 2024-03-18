const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3012;

// Connection URI
const uri = 'mongodb+srv://root:root123@cluster0.e4b4mzs.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas cluster
mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        // Start the server after successful connection
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error);
    });

// Define mongoose schema for user
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    bio: String,
    password: String
});

// Define mongoose model with database name
const User = mongoose.model('User', userSchema, 'users');

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Handle POST request to /signup
app.post('/signup', (req, res) => {
    const { name, email, username, bio, password } = req.body;

    // Create a new user instance
    const newUser = new User({
        name,
        email,
        username,
        bio,
        password
    });

    // Save the new user to the database
    newUser.save()
        .then(() => {
            console.log('User signed up successfully');
            // Send a response to the client indicating successful signup
            res.status(200).json({ message: 'User signed up successfully' });
        })
        .catch((error) => {
            console.error('Error inserting user:', error);
            res.status(500).json({ error: 'An error occurred while signing up.' });
        });
});

// Handle 404 Not Found errors
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});
