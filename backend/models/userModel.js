import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    userMode: {
        type: String,
        enum: ['individual', 'family', 'business'],
        default: 'individual',
        required: true,
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;