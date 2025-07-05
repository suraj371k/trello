# 🎯 Trello-like Task Management System

A modern, real-time task management application built with React, Node.js, and Socket.IO. This project provides a collaborative Kanban board experience with advanced features like conflict resolution, smart task assignment, and real-time updates.

## ✨ Features

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Beautiful Interface**: Clean, modern design with smooth animations and transitions
- **Drag & Drop**: Intuitive task movement between columns
- **Real-time Status**: Live connection indicator showing real-time update status

### 📋 **Task Management**
- **Create Tasks**: Add new tasks with title, description, priority, due date, and assignment
- **Edit Tasks**: Inline editing with conflict detection
- **Delete Tasks**: Safe deletion with confirmation dialogs
- **Task Details**: Rich task cards with priority badges, due dates, and assignment info

### 🏷️ **Priority System**
- **Multiple Priorities**: Low, Medium, High priority levels with color-coded badges
- **Visual Indicators**: Color-coded priority badges for quick identification

### 👥 **User Management**
- **User Registration & Login**: Secure authentication system
- **Task Assignment**: Manual assignment to specific users
- **Smart Assignment**: Automatic assignment based on workload distribution
- **User Avatars**: Visual user identification with initials

### 🔄 **Real-time Collaboration**
- **Live Updates**: Real-time task changes across all connected users
- **Socket.IO Integration**: Instant synchronization without page refresh
- **Conflict Resolution**: Handle simultaneous edits with conflict detection modal
- **Version Control**: Optimistic locking to prevent data conflicts

### 📊 **Kanban Board**
- **Three Columns**: Todo, In Progress, Done
- **Task Counts**: Real-time task counts per column
- **Empty States**: Helpful empty state with quick task creation
- **Visual Feedback**: Drag-over effects and animations

### 🔍 **Search & Filter**
- **Search Tasks**: Search by title and description
- **Priority Filtering**: Filter tasks by priority level
- **Real-time Filtering**: Instant search results

### 📝 **Activity Logging**
- **Action Tracking**: Log all task operations (create, edit, delete, move, assign)
- **User Attribution**: Track who made each change
- **Detailed Logs**: Comprehensive activity history

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Socket.IO Client** - Real-time communication
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Cookie Parser** - Cookie handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trello
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the backend directory:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/trello
   JWT_SECRET=your_jwt_secret_here
   ```

5. **Start the development servers**

   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## 📁 Project Structure

```
trello/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── actionLog.controller.js  # Activity logging
│   │   ├── task.controller.js       # Task CRUD operations
│   │   └── user.controller.js       # User authentication
│   ├── middleware/
│   │   └── protected.js       # JWT authentication middleware
│   ├── models/
│   │   ├── ActionLog.js       # Activity log schema
│   │   ├── Task.js            # Task schema
│   │   └── User.js            # User schema
│   ├── routes/
│   │   ├── task.routes.js     # Task API routes
│   │   └── user.routes.js     # User API routes
│   ├── utils/
│   │   └── generateTokenAndSetCookie.js  # JWT utilities
│   └── server.js              # Express server with Socket.IO
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ConflictModal.jsx    # Conflict resolution modal
    │   │   ├── CreateTask.jsx       # Task creation modal
    │   │   ├── Layout.jsx           # Main layout component
    │   │   ├── Navbar.jsx           # Navigation bar
    │   │   └── Tasks.jsx            # Main Kanban board
    │   ├── pages/
    │   │   ├── Home.jsx             # Dashboard page
    │   │   ├── LoginPage.jsx        # Login page
    │   │   └── RegisterPage.jsx     # Registration page
    │   ├── store/
    │   │   ├── authStore.jsx        # Authentication state
    │   │   └── taskStore.jsx        # Task management state
    │   └── main.jsx                 # React entry point
    └── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/profile` - Get user profile
- `GET /api/users/all` - Get all users

### Tasks
- `GET /api/tasks/` - Get all tasks
- `POST /api/tasks/create` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/force` - Force update task (resolve conflicts)
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/move` - Move task between columns
- `PATCH /api/tasks/:id/assign` - Assign task to user
- `PATCH /api/tasks/:id/smart-assign` - Smart assign task

## 🔄 Real-time Features

### Socket.IO Events
- `task-created` - New task created
- `task-updated` - Task updated
- `task-deleted` - Task deleted
- `task-moved` - Task moved between columns

### Conflict Resolution
- **Version Control**: Each task has a version number
- **Conflict Detection**: Server detects version mismatches
- **Conflict Modal**: User-friendly conflict resolution interface
- **Force Update**: Option to overwrite conflicting changes

## 🎯 Key Features Explained

### Smart Assignment
The smart assignment feature automatically assigns tasks to users with the lowest current workload:
- Counts active tasks (Todo + In Progress) for each user
- Assigns new tasks to users with the fewest active tasks
- Ensures balanced workload distribution

### Conflict Resolution
When multiple users edit the same task simultaneously:
1. **Detection**: Server detects version mismatch
2. **Modal Display**: Shows both versions (server vs client)
3. **User Choice**: User can keep server version or overwrite
4. **Resolution**: Updates local state accordingly

### Real-time Updates
- **Instant Sync**: Changes appear immediately across all users
- **Connection Status**: Visual indicator of real-time connection
- **Optimistic Updates**: UI updates immediately, syncs with server
- **Error Handling**: Graceful fallback for connection issues

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by Trello's intuitive interface
- Real-time collaboration powered by Socket.IO
- Beautiful UI with Tailwind CSS

---

**Happy Task Management! 🎉**

