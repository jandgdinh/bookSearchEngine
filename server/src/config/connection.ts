// import mongoose from 'mongoose';

// mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');

// export default mongoose.connection;
// Refactor the connection.ts file to use the dotenv package to load environment variables from a .env file. This will allow us to store sensitive information like the MongoDB URI in a secure location. The dotenv package will load the environment variables from the .env file into the process.env object, making them accessible throughout the application.

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

const db = async (): Promise<typeof mongoose.connection> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected.');
    return mongoose.connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection failed.');
  }
};

export default db;

