# 🚀 Quick Start Guide

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- VS Code (recommended)

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
cd "e:\web học tiếng anh\FE-WebHocTiengAnh"
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 3. Built Production Ready
```bash
npm run build
npm start
```

---

## 🗺️ Navigation Guide

### Main Routes

| Icon | Page | URL | Purpose |
|------|------|-----|---------|
| 🏠 | Dashboard | `/` or `/dashboard` | Main hub |
| 📚 | Flashcards | `/flashcards` | Study cards |
| 🎯 | Quiz | `/quiz` | Practice test |
| 🤖 | AI Lookup | `/ai-lookup` | Dictionary |
| 👥 | Groups | `/groups` | Team learning |
| ➕ | Create Card | `/create` | Add new |
| 📁 | Import | `/import` | Bulk import |
| 📊 | Progress | `/progress` | Statistics |

---

## 🎯 Quick Actions

From Dashboard, access:
1. **➕ Tạo Flashcard** → `/create`
2. **📁 Import Dữ Liệu** → `/import`
3. **🤖 Tra Cứu AI** → `/ai-lookup`

---

## 📱 Page Features

### 🏠 Dashboard
- Welcome message
- Quick stats (Total/Mastered/Streak/Groups)
- Recent collections
- Learning progress chart

### 📚 Flashcards
- Main learning interface
- Flip card to see answer
- Star to mark favorite
- Navigation (Prev/Next)
- Sidebar with card list
- Status indicators

### 🎯 Quiz
- Multiple choice questions
- Progress bar
- Visual feedback (✅/❌)
- Results summary

### 🤖 AI Lookup
- Search vocabulary
- Get definition + examples
- See synonyms/antonyms
- Quick add to collection
- Recent searches

### 📁 Import
- Drag & drop files (CSV/Excel)
- Paste text from ChatGPT
- Format support
- Data preview
- Auto-parse option

### ➕ Create
- Form with fields:
  - Word (required)
  - Meaning (required)
  - Pronunciation (optional)
  - Example (optional)
  - Image URL (optional)

### 👥 Groups
- Browse groups
- Create new group
- Join group (code/link)
- Manage members
- Share resources

### 📊 Progress
- Learning statistics
- Progress charts
- Achievements unlocked
- Learning goals
- Weekly activity

---

## 🎨 Component Usage Examples

### Using FlashcardCard
```tsx
import { FlashcardCard } from '@/components/ui';

<FlashcardCard
  word="Amazing"
  meaning="Tuyệt vời"
  pronunciation="/əˈmeɪzɪŋ/"
  example="This is an amazing experience!"
  isFavorite={true}
  isFlipped={false}
  onFlip={() => toggle()}
  onFavorite={() => favorite()}
/>
```

### Using QuizCard
```tsx
import { QuizCard } from '@/components/ui';

<QuizCard
  questionNum={1}
  totalQuestions={10}
  word="Beautiful"
  options={["Ugly", "Beautiful", "Average", "Bad"]}
  selectedOption={0}
  correctOption={1}
  onSelect={(idx) => select(idx)}
  isAnswered={answered}
/>
```

### Using AILookupBox
```tsx
import { AILookupBox } from '@/components/ui';

const [result, setResult] = useState(null);

<AILookupBox
  onSearch={(word) => fetch(word)}
  isLoading={loading}
  result={result}
/>
```

---

## 📖 Project Structure

```
FE-WebHocTiengAnh/
│
├── src/
│   ├── app/                 # Next.js pages
│   ├── components/
│   │   ├── ui/             # Reusable UI
│   │   ├── layouts/        # Layouts
│   │   ├── pages/          # Page components
│   │   └── hooks/          # Custom hooks
│   ├── store/              # Redux state
│   ├── services/           # API services
│   ├── config/             # Configuration
│   └── types/              # TypeScript types
│
├── public/                 # Static files
├── node_modules/           # Dependencies
├── .env.local             # Environment variables
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind config
├── next.config.js         # Next.js config
│
└── Documentation:
    ├── README.md
    ├── UI_COMPONENTS_GUIDE.md
    ├── COMPONENT_STRUCTURE.md
    ├── PROJECT_STRUCTURE.md
    ├── FEATURES_IMPLEMENTED.md
    └── QUICK_START.md (this file)
```

---

## 🔧 Configuration

### Import Aliases (tsconfig.json)
```json
"paths": {
  "@/*": ["./src/*"]
}
```

This allows:
```tsx
// ✅ Use this
import { Button } from '@/components/ui';

// Instead of
// import { Button } from '../../../components/ui';
```

---

## 🎨 Styling Guide

### Tailwind Classes Used
- **Colors**: blue, green, yellow, red, purple, gray
- **Spacing**: p-*, m-*, gap-* (4 = 1rem)
- **Sizes**: w-full, max-w-*, h-*
- **Responsive**: md:, lg: breakpoints

### Common Patterns
```tsx
// Card container
<div className="bg-white rounded-xl shadow-lg p-6">

// Button
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flex layout
<div className="flex justify-between items-center">
```

---

## 📊 Build Information

```
Routes Generated:     10 pages
Components Created:   20+ components
Page Size:           ~98 kB
Build Status:        ✅ Success
TypeScript:          ✅ Strict Mode
ESLint:              ✅ Pass
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Module Not Found
```tsx
// Check import path uses @/ alias
import { Component } from '@/components/...';
```

---

## 🔐 Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📚 Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm start         # Start prod server
npm run lint      # Lint code
```

---

## 🌟 Key Features

✨ **20+ Reusable Components**
- Fully typed with TypeScript
- Responsive design
- Tailwind CSS styling
- Self-contained

✨ **8 Complete Pages**
- Dashboard with stats
- Study mode for flashcards
- Quiz/practice system
- AI vocabulary lookup
- Import data tools
- Group learning
- Progress tracking

✨ **Production Ready**
- Type-safe codebase
- ESLint configured
- Optimized build
- Next.js best practices

---

## 🎓 Learning Path

1. **Start with Dashboard** → Understand the UI
2. **Create a Flashcard** → Test form component
3. **Study Flashcards** → Experience interactive component
4. **Take a Quiz** → See quiz mechanics
5. **Try AI Lookup** → Understand data flow
6. **Import Data** → Practice file handling
7. **Check Progress** → View statistics

---

## 📞 Support

### Documentation Files
- `README.md` - Overview
- `UI_COMPONENTS_GUIDE.md` - Component details
- `COMPONENT_STRUCTURE.md` - File organization
- `FEATURES_IMPLEMENTED.md` - Feature list

### Common Issues

**Q: How to add a new component?**
A: Create in `src/components/ui/MyComponent.tsx`, export from `src/components/ui/index.ts`

**Q: How to create a new page?**
A: Create `src/app/newpage/page.tsx` automatically becomes `/newpage`

**Q: How to use Redux?**
A: Already configured in `src/store/`, use `useAppDispatch` and `useAppSelector`

---

## 🚀 Ready to Build!

Your project is **fully set up** and ready for:
1. Backend API integration
2. Database connection
3. Authentication
4. Advanced features

**Happy coding! 🎉**

---

**Last Updated:** April 10, 2026  
**Version:** 1.0.0  
**Status:** ✅ Ready to use
