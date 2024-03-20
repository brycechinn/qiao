const express = require('express');
const crypto = require('crypto');
const db = require('./db');
const editJsonFile = require('edit-json-file');
const sessions = require("./sessions.js");
const app = express();
const cookieParser = require('cookie-parser');
const lodash = require("lodash");

app.use(express.json());
app.use(cookieParser());

app.post('/signup', (req, res) => {
    const { email, username, password } = req.body;

    const salt = crypto.randomBytes(16).toString('hex');

    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    try {
        try {
            db.query(`SELECT * FROM users WHERE username = '${username}'`, (error, results) => {
                if (results.length > 0) {
                    res.status(403).send('This user already exists!');
                } else {
                    db.insertUser(username, hash, salt, email);
                    res.status(200).send('User registered successfully');
                }
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Internal server error"
            })
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal server error');
    }
});

app.get("/user", (req, res) => {
    if (req.cookies?.session && sessions.data.get(`${req.cookies?.session}.secret`)) {
        try {
            db.query(`SELECT * FROM users WHERE secret = '${sessions.data.get(`${req.cookies?.session}.secret`)}'`, (error, results) => {
                if (results.length > 0) {
                    res.status(200).json({
                        data: lodash.omit(results[0], "secret", "salt", "password")
                    });
                } else {
                    res.status(401).json({
                        message: "You're not logged in!",
                    });
                }
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Internal server error"
            })
        }
    }
});

app.post("/logout", (req, res) => {
    if (req.cookies?.session && sessions.data.get(`${req.cookies?.session}.secret`)) {
        try {
            db.query(`SELECT * FROM users WHERE secret = '${sessions.data.get(`${req.cookies?.session}.secret`)}'`, (error, results) => {
                if (results.length > 0) {
                    sessions.data.unset(`${req.cookies?.session}.secret`);
                    res.status(200).json({
                        message: "Logged out!"
                    });
                } else {
                    res.status(401).json({
                        message: "You're not logged in!",
                    });
                }
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Internal server error"
            })
        }
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (req.cookies?.session && sessions.data.get(`${req.cookies?.session}.secret`)) {
        try {
            db.query(`SELECT * FROM users WHERE secret = '${sessions.data.get(`${req.cookies?.session}.secret`)}'`, (error, results) => {
                if (results.length > 0) {
                    res.status(403).json({
                        message: "Already logged in!"
                    });
                } else {
                    res.status(400).json({
                        message: "Invalid secret, retry!"
                    });
                    sessions.data.unset(`${req.cookies?.session}.secret`);
                }
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Internal server error"
            })
        }
    } else {
        db.query(`SELECT * FROM users WHERE username = '${username}'`, (error, results) => {
            if (error) {
                res.status(500).json({
                    error: error.message
                });
            } else if (results.length > 0) {
                const user = results[0];
                const now = new Date();
                if (user.is_banned && (!user.ban_expires_at || user.ban_expires_at > now)) {
                    res.status(403).json({
                        isBanned: true,
                        banExpiresAt: user.ban_expires_at,
                        message: 'User is banned'
                    })
                } else {
                    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
                    if (hash === user.password) {
                        var isValidSession = req?.cookies?.session && req.cookies?.session in sessions.data.toObject();
                        var sessId = req?.cookies?.session && req.cookies?.session in sessions.data.toObject() ? req?.cookies?.session : sessions.create();
                        sessions.data.set(`${sessId}.secret`, user.secret);
                        if(!req?.cookies?.session || !isValidSession) {
                            res.cookie("session", sessId);
                        }
                        res.status(200).json({
                            message: 'User logged in successfully',
                        });
                    } else {
                        res.status(401).json({
                            message: 'Invalid username or password'
                        });
                    }
                }
            } else {
                res.status(401).json({
                    message: `User doesn't exists!`
                })
            }
        });
    }
})

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});