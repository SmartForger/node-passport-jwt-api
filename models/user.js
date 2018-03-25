import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../core/config/config.dev';

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, { collection: 'User' });

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(parseInt(config.SALT_WORK_FACTOR), function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.methods.genToken = function() {
    return this.email;
}

if (!UserSchema.options.toObject) UserSchema.options.toObject = {};

UserSchema.options.toObject.transform = function(doc, ret, options) {
    return {
        email: ret.email,
        name: ret.name
    }
}

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;