// server/seedAdmins.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path if needed

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb://localhost:27017/campusshield'; // Or use your .env value

const users = [
  {
    name: 'Admin One',
    email: 'admin1@example.com',
    password: 'adminpassword1',
    role: 'admin',
    anonymousId: 'admin-anon-001'
  },
  {
    name: 'Admin Two',
    email: 'admin2@example.com',
    password: 'adminpassword2',
    role: 'admin',
    anonymousId: 'admin-anon-002'
  },
  {
    name: 'Moderator One',
    email: 'moderator1@example.com',
    password: 'moderatorpassword1',
    role: 'moderator',
    anonymousId: 'moderator-anon-001'
  },
  {
    name: 'Moderator Two',
    email: 'moderator2@example.com',
    password: 'moderatorpassword2',
    role: 'moderator',
    anonymousId: 'moderator-anon-002'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'userpassword',
    role: 'user',
    anonymousId: 'user-anon-001'
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    for (const user of users) {
      const existing = await User.findOne({ email: user.email });
      if (!existing) {
        console.log(`Seeding user: ${user.email}, password: ${user.password}`);
        await User.create(user); // Save plain password, let pre-save hook hash it
        console.log(`${user.role} ${user.email} created.`);
      } else {
        console.log(`${user.role} ${user.email} already exists.`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();