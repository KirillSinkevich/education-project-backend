const {Schema, model} = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    // minLength: [3],
    // maxLength:[32],
    // validate: [
    //   {validator: isEmail, message: 'Please enter a valid email'},
    // ],
  },
  password: {
    type: String,
    required: [true, 'Please enter an password'],
    minLength: [6, 'Minimum password length is 6 characters']
  },
  roles: [{
    type: String,
    enum: ["admin", "student", "parent", "teacher"]
  }],
  name: {
    type: String,
    required: [true, 'Please enter name']
  },
  surname: {
    type: String,
    required: [true, 'Please enter surname']
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  // add as needed
  // isActivated: {
  //   type: Boolean,
  //   default: false,
  // },
  activationLink: {type: String},
});

// fire a function after doc saved to db
// userSchema.post('save', (doc, next) => {
//   next();
// });

// fire a function before doc saved to db
// userSchema.pre('save', async function (next) {
//   const salt = await bcrypt.genSalt();
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// static method to login user
// userSchema.statics.login = async function(email, password) {
//   const user = await this.findOne({ email });
//   if (user) {
//     const auth = await bcrypt.compare(password, user.password);
//     if (auth) {
//       return user;
//     }
//     throw Error('incorrect password');
//   }
//   throw Error('incorrect email');
// };


module.exports = model('User', userSchema);
