const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

//hiding private data
userSchema.methods.toJSON = function(){
    const user = this;

    //user is mongoose instance, so first convert it to normal object
    //then apply delete property of normal object
    userObject = user.toObject();

    delete userObject.tokens;
    delete userObject.password;

    return userObject;
}


//for relationship between user and task, it will store anything in database
userSchema.virtual('tasks', {
    ref: 'Task',
    localField : '_id',
    foreignField: 'owner'
})


userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, "thisismysecretkey");

    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login!');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login!');
    }

    return user;
}


//hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})


//delete all tasks added by user when that user delete his profile
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({owner : user._id})
    next()
})


const User = mongoose.model('User', userSchema);

module.exports = User