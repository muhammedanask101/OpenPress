require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/adminModel');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);

    const rawEmail = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Super Admin';

    if (!rawEmail || !password) {
      console.warn(
        'SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set. Skipping admin seed.'
      );
      process.exit(0);
    }

    const email = Admin.normalizeEmail(rawEmail);

    const existing = await Admin.findOne({ email, deleted: false });

    if (existing) {
      console.log(`Seed admin already exists: ${existing.email}`);
      process.exit(0);
    }

    const deletedExisting = await Admin.findOne({ email, deleted: true });
    if (deletedExisting) {
      console.warn(
        `An admin with email ${email} exists but is marked deleted. ` +
        'Refusing to auto-undelete or overwrite it. Handle manually if needed.'
      );
      process.exit(1);
    }

    const admin = new Admin({
      name,
      email,
      password, // pre('save') will hash
    });

    await admin.save();

    console.log('Seed admin created:');
    console.log(`  Email: ${admin.email}`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
