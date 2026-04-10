# Web Học Tiếng Anh - Frontend

A modern Next.js web application for learning English, built with TypeScript, Tailwind CSS, and Redux Toolkit.

## 🚀 Features

- **Authentication**: User login/registration with JWT
- **Lessons**: Browse and learn English lessons
- **Progress Tracking**: Track your learning progress
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type-Safe**: Full TypeScript support
- **State Management**: Redux Toolkit for state management

## 📁 Project Structure

```
src/
├── app/               # Next.js app directory
├── components/        # React components
│   ├── ui/           # Reusable UI components
│   ├── layouts/      # Layout components
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions
│   └── pages/        # Page components
├── services/         # API services
├── config/           # Configuration files
├── types/            # TypeScript type definitions
├── store/            # Redux store
└── public/           # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Node Version**: 18+

## 💻 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

### Start

Start the production server:

```bash
npm start
```

## 📝 Environment Variables

See `.env.example` for all available environment variables.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Web Học Tiếng Anh Development Team
