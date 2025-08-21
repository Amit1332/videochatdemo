import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
passwordHash: { type: String, required: true },
}, { timestamps: true });

userSchema.methods.toSafeJSON = function() {
return { id: this._id.toString(), name: this.name, email: this.email, createdAt: this.createdAt, updatedAt: this.updatedAt };
}

export default mongoose.model('User', userSchema);