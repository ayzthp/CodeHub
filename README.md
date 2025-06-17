# CodeHub - Campus Coding Arena

A modern web application built with Next.js, TypeScript, and Firebase that allows students to connect their coding profiles and showcase their skills across multiple platforms.

## 🚀 Features

- **User Authentication**: Secure signup/login with Firebase Auth
- **Multi-Platform Integration**: Connect LeetCode, Codeforces, AtCoder, and GitHub accounts
- **Real-time Stats**: Fetch and display coding statistics from all platforms
- **Beautiful Dashboard**: Modern UI with tabs for different platforms
- **Sync Functionality**: Update stats with a single click
- **Responsive Design**: Works perfectly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔧 Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Authentication > Sign-in method
4. Enable "Email/Password" authentication
5. Go to Firestore Database and create a database
6. Set up security rules for your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📝 Usage

1. **Sign Up**: Create an account with your email and password
2. **Add Handles**: Enter your handles for LeetCode, Codeforces, AtCoder, and GitHub
3. **View Dashboard**: Check your coding stats across all platforms
4. **Sync Stats**: Click "Sync Now" to update your latest statistics

## 🎨 UI Components

The app uses shadcn/ui components for a consistent and modern design:

- **Cards**: Display user information and stats
- **Forms**: Handle user input with validation
- **Tabs**: Organize different platform statistics
- **Buttons**: Interactive elements with loading states
- **Avatars**: User profile pictures
- **Toast**: Notifications for user actions

## 🔐 Security

- Firebase Authentication handles user security
- Firestore security rules ensure users can only access their own data
- Environment variables keep sensitive configuration secure

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

The app can be deployed on Vercel, Netlify, or any platform that supports Next.js:

1. **Vercel** (Recommended):
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

**Happy Coding! 🎉**
