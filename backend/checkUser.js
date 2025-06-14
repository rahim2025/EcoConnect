require('dotenv').config();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}), 'users');
    
    // The user ID you're looking for
    const userId = '68205b14d60e8653c72eab9c';
    
    // Check if this is a valid ObjectId format
    const isValidId = ObjectId.isValid(userId);
    console.log(`Is valid ObjectId format: ${isValidId}`);
    
    if (isValidId) {
      // Try to find the user
      const user = await User.findById(userId).select('_id fullName email');
      
      if (user) {
        console.log('User found:', user);
      } else {
        console.log('User not found with ID:', userId);
        
        // Let's check if there are any users in the database
        const totalUsers = await User.countDocuments();
        console.log(`Total users in database: ${totalUsers}`);
        
        // If there are users, let's get a sample one
        if (totalUsers > 0) {
          const sampleUser = await User.findOne().select('_id fullName');
          console.log('Sample user from database:', sampleUser);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkUser();
