import mongoose from 'mongoose';

export async function connectDatabase(mongoUri) {
if (!mongoUri) throw new Error('MONGODB_URI is not set');
mongoose.set('strictQuery', true);
await mongoose.connect(mongoUri);
return mongoose.connection;
}