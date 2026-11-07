import { connectDB } from './config/db';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

async function seed() {
  await connectDB();
  const adminEmail = 'admin@nexuschat.app';
  if (await User.findOne({ email: adminEmail })) { console.log('already seeded'); process.exit(0); }
  const hash = await bcrypt.hash('Admin@123', 10);
  await User.create({ name: 'Admin', username: 'admin', email: adminEmail, password: hash, role: 'admin', isVerified: true });
  const hash2 = await bcrypt.hash('User@123', 10);
  await User.create({ name: 'Demo User', username: 'demo', email: 'demo@nexuschat.app', password: hash2, isVerified: true });
  console.log('Seeded admin@nexuschat.app / Admin@123 and demo@nexuschat.app / User@123');
  process.exit(0);
}
seed();
