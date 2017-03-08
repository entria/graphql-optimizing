// @flow


import mongoose from 'mongoose';
import bcrypt from 'bcrypt-as-promised';

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    hidden: true,
  },
  email: {
    type: String,
    required: false,
    index: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'user',
});

Schema
  .pre('save', function (next) {
    // Hash the password
    if (this.isModified('password')) {
      this.encryptPassword(this.password)
        .then((hash) => {
          this.password = hash;
          next();
        })
        .catch(err => next(err));
    } else {
      return next();
    }
  });

Schema.methods = {
  async authenticate(plainTextPassword) {
    try {
      return await bcrypt.compare(plainTextPassword, this.password);
    } catch (err) {
      return false;
    }
  },
  encryptPassword(password) {
    return bcrypt.hash(password, 8);
  },
};


export default mongoose.model('User', Schema);
