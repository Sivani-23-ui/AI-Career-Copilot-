const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, email, password, college, degree, yearOfStudy } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, college, degree, yearOfStudy });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        degree: user.degree,
        yearOfStudy: user.yearOfStudy,
        selectedCareer: user.selectedCareer,
        skills: user.skills,
        careerReadinessScore: user.careerReadinessScore,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        degree: user.degree,
        yearOfStudy: user.yearOfStudy,
        selectedCareer: user.selectedCareer,
        skills: user.skills,
        careerReadinessScore: user.careerReadinessScore,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      college: req.user.college,
      degree: req.user.degree,
      yearOfStudy: req.user.yearOfStudy,
      selectedCareer: req.user.selectedCareer,
      skills: req.user.skills,
      careerReadinessScore: req.user.careerReadinessScore,
    },
  });
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, college, degree, yearOfStudy, selectedCareer, skills } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, college, degree, yearOfStudy, selectedCareer, skills },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Profile updated successfully.', user: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

module.exports = { register, login, getMe, updateProfile };
