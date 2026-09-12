/**
 * Seed Demo User
 * Run: node scripts/seedDemoUser.js
 *
 * Creates (or re-creates) the demo account with a properly bcrypt-hashed password.
 * Safe to run multiple times — it upserts.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DEMO_EMAIL = 'demo@careercopilot.com';
const DEMO_PASSWORD = 'Demo@12345';

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('❌  MONGODB_URI is not set. Create a .env file in the server directory.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  MongoDB connected');

  // Require the model AFTER connecting so Mongoose is ready
  const User = require('../models/User');

  // Hash the password manually (bypass the pre-save hook so we control the result)
  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(DEMO_PASSWORD, salt);

  const result = await User.findOneAndUpdate(
    { email: DEMO_EMAIL },
    {
      $set: {
        name: 'Demo Student',
        email: DEMO_EMAIL,
        password: hashed,
        college: 'Career Copilot University',
        degree: 'B.Tech Computer Science',
        yearOfStudy: '3rd Year',
        selectedCareer: '',
        skills: [],
        careerReadinessScore: 0,
      },
    },
    { upsert: true, new: true }
  );

  console.log(`✅  Demo user upserted: ${result.email} (id: ${result._id})`);
  console.log(`    Email:    ${DEMO_EMAIL}`);
  console.log(`    Password: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
  console.log('✅  Done.');
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
