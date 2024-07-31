import mongoose from 'mongoose';

export  const  ConnectDB = async  () => {
const mongoDBConnectionURL = process.env.MONGO_DB_CONNECTION_URL;
// console.log('MONGO_DB_CONNECTION_URL:', mongoDBConnectionURL);
  try {
    await mongoose.connect(mongoDBConnectionURL);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}
