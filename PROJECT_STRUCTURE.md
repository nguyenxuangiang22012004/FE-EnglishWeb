public/
│── favicon.ico         # Website favicon
│── images/             # Images and media
│   └── logo.png       # Logo

src/
├── app/               # Next.js app router
│   ├── layout.tsx     # Root layout component
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles
│
├── components/        # Vue components
│   ├── ui/            # Reusable UI components (Button, Modal, Input)
│   ├── layouts/       # Layout components (MainLayout, etc.)
│   ├── hooks/         # Custom React hooks (useAuth, etc.)
│   ├── utils/         # Utility functions
│   └── pages/         # Page-specific components
│
├── store/             # Redux state management
│   ├── slices/        # Redux slices (authSlice, etc.)
│   └── index.ts       # Store configuration
│
├── services/          # API services
│   ├── authService.ts # Authentication API calls
│   └── userService.ts # User API calls
│
├── config/            # Configuration files
│   ├── axios.ts       # Axios instance with interceptors
│   ├── env.ts         # Environment variables
│   └── themes.ts      # Theme configuration
│
├── types/             # TypeScript type definitions
│   ├── auth.ts        # Authentication types
│   └── index.ts       # Common types
│
├── privateRoutes.ts   # Protected routes configuration
├── publicRoutes.ts    # Public routes configuration
└── index.tsx          # App entry point

Configuration Files:
├── .env.local         # Environment variables (local)
├── .env.example       # Environment variables example
├── .gitignore         # Git ignore rules
├── .eslintrc.json     # ESLint configuration
├── tsconfig.json      # TypeScript configuration
├── next.config.js     # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration
├── package.json       # Project dependencies
├── package-lock.json  # Locked versions
└── README.md          # Project documentation
