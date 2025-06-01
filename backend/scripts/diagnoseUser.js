/**
 * Command line tool for diagnosing user issues
 * 
 * Usage: 
 *   node scripts/diagnoseUser.js <userId>   - Check a specific user
 *   node scripts/diagnoseUser.js --stats    - Show user statistics
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  // Import the ES modules dynamically
  const { diagnoseUser, getUserStats } = await import('../src/utils/userDiagnostic.js');
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const arg = process.argv[2];
    
    if (arg === '--stats') {
      // Get general user stats
      const stats = await getUserStats();
      console.log('\nUser Statistics:');
      console.log('----------------');
      console.log(`Total users: ${stats.totalUsers}`);
      console.log(`Admin users: ${stats.adminCount}`);
      
      if (stats.recentUsers && stats.recentUsers.length > 0) {
        console.log('\nRecent users:');
        stats.recentUsers.forEach((user, i) => {
          console.log(`  ${i+1}. ${user.fullName} (${user.email}) - ID: ${user._id}`);
        });
      }
    } else {
      // Check specific user
      const userId = arg || '68205b14d60e8653c72eab9c'; // Default ID from original script
      console.log(`Checking user with ID: ${userId}`);
      
      const result = await diagnoseUser(userId);
      
      console.log('\nDiagnostics:');
      console.log('-----------');
      console.log(`Valid ID format: ${result.isValidId ? 'Yes' : 'No'}`);
      
      if (result.error) {
        console.error(`Error: ${result.error}`);
      }
      
      if (result.userExists) {
        console.log('\nUser found:');
        console.log(result.user);
      } else {
        console.log('\nUser not found');
        console.log(`Total users in database: ${result.totalUsers}`);
        
        if (result.sampleUser) {
          console.log('\nSample user from database:');
          console.log(result.sampleUser);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

main();
