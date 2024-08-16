# Chat Flow APP

## Description

Chat Flow is a real-time chat application built using Next.js, React, and server side of project managed by Firebase. The app integrates emoji support, real-time notifications, and user avatars to create an engaging chat experience. Tailwind CSS is used for styling, ensuring a responsive and modern UI.

## Features

- **Real-Time Chat:** Seamless communication using Firebase for real-time updates.
- **Emoji Picker:** Integrates `emoji-picker-react` for rich chat messages.
- **User Avatars:** Generates random user avatars using `random-avatar-generator`.
- **Notifications:** Displays real-time notifications using `react-hot-toast`.

## Firebase Services

- **Authentication**: Managing user sign-in and sign-out with Firebase Authentication.
- **Firestore Database**: Storing and retrieving user data, including chat messages and chatroom information.
  
## Routes

- **`/`**: The home page where users can see available chatrooms and participate in chats.
- **`/login`**: The login page for existing users to sign in.
- **`/register`**: The registration page for new users to sign up.

## Tech Stack

- **Next.js**: React framework for server-side rendering and static site generation.
- **Firebase**: Authentication, Firestore, and real-time database.
- **React**: UI components.
- **Tailwind CSS & DaisyUI**: Utility-first CSS framework and components for styling.
- **Typescript**: For static typing.

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/marynadevk/nextjs-firebase-chat-flow.git
   cd nextjs-firebase-chat-flow
   ```
2. **Install dependencies, run:**
```sh
npm ci
```
3. **Create a .env.local file based on the provided .env.local.example**

4. **To start the development server, run:**
```sh
npm run dev
```
