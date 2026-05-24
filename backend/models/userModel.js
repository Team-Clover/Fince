import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        trim: true,
        default: '',
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
        trim: true,
    },
    walletAddress: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    userMode: {
        type: String,
        enum: ['individual', 'family', 'business'],
        default: 'individual',
        required: true,
    },
    familyCode: {
        type: String,
        default: null,
        index: true,
    },
    role: {
        type: String,
        enum: ['personal', 'business'],
        default: 'personal',
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;