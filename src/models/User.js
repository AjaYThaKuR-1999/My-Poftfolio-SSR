const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    location: {
        type: String,
    },
    bio: {
        type: String,
        maxlength: 250
    },
    userType: {
        type: String,
        enum: ['developer', 'recruiter', 'project_provider', 'hobbyist', 'other'],
        required: true
    },
    seeking: {
        type: String,
        enum: ['hiring_talent', 'freelance_work', 'collaboration', 'networking', 'exploration', 'other'],
        required: true
    },
    profilePicture: {
        type: String,
    },
    socialProfileLinks: [{
        label: {
            type: String,
            enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'github', 'website'],
        },
        link: {
            type: String,
        }
    }],
    resume: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true, versionKey: false
    }
)

// Encrypt password using bcrypt and enforce role constraint
UserSchema.pre('save', async function () {

    if (!this.isModified('password')) {

        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
