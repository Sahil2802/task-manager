import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('URI:', uri?.replace(/:[^:]*@/, ':****@')); // Hide password

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB!');
    console.log('Connection state:', mongoose.connection.readyState);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    process.exit(1);
  });

// Timeout after 10 seconds
setTimeout(() => {
  console.error('⏱️ Connection timeout after 10 seconds');
  process.exit(1);
}, 10000);
