# 🔍 TracePoint — Lost & Found System
### Haramaya University

A full-featured Lost & Found web app built with React + Firebase.

## ✨ Features
- Report Lost/Found items with photo upload
- Search & filter by category, location, keyword
- Claim system with proof of ownership
- Real-time in-app notifications
- User authentication (register, login, forgot password)
- Admin dashboard: manage items, approve/reject claims, promote users

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Firebase Setup
1. Create a project at https://console.firebase.google.com
2. Enable: Authentication (Email/Password), Firestore, Storage
3. Add a Web App and copy config

### 3. Environment
```bash
cp .env.example .env
# Fill in your Firebase credentials
```

### 4. Run
```bash
npm start
```

## 🔐 Firestore Rules
Paste in Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (request.auth.uid == resource.data.reportedBy ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    match /claims/{claimId} {
      allow read, create: if request.auth != null;
      allow update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.auth.uid == userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    match /notifications/{notifId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 👑 First Admin
After registering: go to Firestore → users collection → your doc → set role to "admin".

## 📦 Deploy
```bash
npm run build
firebase deploy
```
