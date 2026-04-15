const { db } = require('../config/firebase');

// @desc    Login user (Simple username/password matching)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Query Firestore for user with username
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userData = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;

    // Simple password check (As requested)
    if (userData.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      id: userId,
      username: userData.username,
      name: userData.name,
      role: userData.role,
      message: 'Logged in successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();

    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const newUser = {
      username,
      password, // In a real app, hash this!
      name,
      role, // 'client' or 'helper'
      createdAt: new Date().toISOString()
    };

    const docRef = await usersRef.add(newUser);

    res.status(201).json({
      id: docRef.id,
      ...newUser,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  signup
};
