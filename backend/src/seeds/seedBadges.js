import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Badge from '../models/badge.model.js';

dotenv.config();

const seedBadges = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Delete existing badges
    await Badge.deleteMany({});
    
    // Create initial badges
    const badges = [
      // Beginner badges
      {
        name: 'Eco Starter',
        description: 'First steps in becoming environmentally conscious',
        icon: 'eco-starter.png',
        cost: 50,
        category: 'beginner',
        isAvailable: true
      },
      {
        name: 'Post Enthusiast',
        description: 'Share your eco-friendly ideas with the community',
        icon: 'post-enthusiast.png',
        cost: 75,
        category: 'beginner',
        isAvailable: true
      },
      {
        name: 'Community Member',
        description: 'Actively engaging with the eco-community',
        icon: 'community-member.png',
        cost: 100,
        category: 'beginner',
        isAvailable: true
      },
      
      // Intermediate badges
      {
        name: 'Event Participant',
        description: 'Join eco events and make a real-world impact',
        icon: 'event-participant.png',
        cost: 150,
        category: 'intermediate',
        isAvailable: true
      },
      {
        name: 'Resource Saver',
        description: 'Committed to reducing waste and saving resources',
        icon: 'resource-saver.png',
        cost: 200,
        category: 'intermediate',
        isAvailable: true
      },
      {
        name: 'Content Creator',
        description: 'Creating valuable content for the eco-community',
        icon: 'content-creator.png',
        cost: 250,
        category: 'intermediate',
        isAvailable: true
      },
      
      // Advanced badges
      {
        name: 'Event Organizer',
        description: 'Taking the lead in organizing environmental events',
        icon: 'event-organizer.png',
        cost: 400,
        category: 'advanced',
        isAvailable: true
      },
      {
        name: 'Eco Influencer',
        description: 'Your posts inspire others to take action',
        icon: 'eco-influencer.png',
        cost: 500,
        category: 'advanced',
        isAvailable: true
      },
      {
        name: 'Sustainability Champion',
        description: 'Champion of sustainable practices and lifestyle',
        icon: 'sustainability-champion.png',
        cost: 600,
        category: 'advanced',
        isAvailable: true
      },
      
      // Expert badges
      {
        name: 'Community Leader',
        description: 'Leading the community towards positive change',
        icon: 'community-leader.png',
        cost: 1000,
        category: 'expert',
        isAvailable: true
      },
      {
        name: 'Earth Guardian',
        description: 'Dedicated protector of our planet',
        icon: 'earth-guardian.png',
        cost: 1500,
        category: 'expert',
        isAvailable: true
      },
      {
        name: 'Climate Hero',
        description: 'Making a significant impact on climate action',
        icon: 'climate-hero.png',
        cost: 2000,
        category: 'expert',
        isAvailable: true
      },
      
      // Special badges
      {
        name: 'Eco Pioneer',
        description: 'Among the first to join our eco-friendly platform',
        icon: 'eco-pioneer.png',
        cost: 500,
        category: 'special',
        isAvailable: true
      },
      {
        name: 'Anniversary Badge',
        description: 'Celebrating one year of environmental action',
        icon: 'anniversary.png',
        cost: 300,
        category: 'special',
        isAvailable: true,
        validUntil: new Date(2025, 11, 31) // Valid until Dec 31, 2025
      }
    ];
    
    // Insert badges
    await Badge.insertMany(badges);
    
    console.log(`${badges.length} badges have been seeded successfully`);
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error seeding badges:', error);
  }
};

// Run the seed function
seedBadges();
