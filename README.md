# EcoConnect - Social Media for Environmental Enthusiasts

EcoConnect is a social media platform designed for environmentally conscious individuals to connect, share eco-friendly initiatives, organize events, and track their positive impact on the environment.

![EcoConnect Screenshot](./frontend/public/screenshot-for-readme.png)

## Features

### 📱 Core Social Features
- User profiles with personalized information and environmental interests
- Create and share eco-friendly posts with image uploads
- Like, comment and engage with other users' content
- Follow friends and like-minded individuals
- Real-time notifications for social interactions

### 🌍 Eco Events
- Create and organize environmental events (clean-ups, workshops, etc.)
- Join and participate in events near you
- Event management with attendance tracking
- Event completion tracking with impact measurements

### 🏆 Eco Points System
- Earn points for environmental contributions:
  - Creating eco-friendly posts: **10 points**
  - Receiving likes on your content: **2 points per like**
  - Receiving comments on your posts: **3 points per comment**
  - Creating environmental events: **15 points**
  - Participating in events: **Variable points (default: 25)**
  - Completing events (as organizer): **10 bonus points**
- Track your eco points breakdown
- Compete on the leaderboard with other environmentally conscious users
- Showcase your environmental impact with visual statistics

### 🎖️ Badge Reward System
- Redeem earned eco points for digital badges
- Badge categories from beginner to expert level
- Display up to three badges on your profile
- Special limited-time badges for unique achievements
- Badge shop with various environmental-themed badges
- Visual showcase of environmental commitment

### 💬 Messaging
- Direct messaging between users
- Real-time chat with online status indicators
- Support for sharing content via messages

### 🌙 Dark Mode Support
- Toggle between light and dark themes
- Persistent theme preferences

## Technology Stack

### Frontend
- React with Vite
- Tailwind CSS with DaisyUI components
- Zustand for state management
- React Router for navigation
- Lucide React for icons
- React Hot Toast for notifications

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication
- Socket.io for real-time features
- Cloudinary for image storage

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB instance
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ecoconnect.git
cd ecoconnect
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

5. Start the backend server:
```bash
npm start
```

6. Start the frontend development server:
```bash
cd ../frontend
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
