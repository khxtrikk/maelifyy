// import mongoose from 'mongoose';


// export const connectDB = async () => {
//     await mongoose.connect('mongodb+srv://greatstack:dbdb-pass@cluster0.tpvloxt.mongodb.net/FOOD-DELIVERY');
//     console.log('Database connected');
// }

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export { connectDB };