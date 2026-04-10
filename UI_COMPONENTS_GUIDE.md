# 📚 UI Components Guide - Web Học Tiếng Anh

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── BasicComponents.tsx
│   │   ├── FlashcardCard.tsx
│   │   ├── QuizCard.tsx
│   │   ├── AILookupBox.tsx
│   │   ├── ImportDragDrop.tsx
│   │   ├── GroupInvite.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── FlashcardList.tsx
│   │   ├── CreateFlashcardForm.tsx
│   │   ├── GroupCard.tsx
│   │   └── index.ts
│   │
│   ├── layouts/               # Layout components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Sidebar.tsx        # Collections sidebar
│   │   ├── MainLayout.tsx
│   │   └── index.ts
│   │
│   ├── pages/                 # Full page components
│   │   ├── Dashboard.tsx
│   │   ├── FlashcardStudyPage.tsx
│   │   ├── QuizPage.tsx
│   │   ├── AILookupPage.tsx
│   │   ├── GroupsPage.tsx
│   │   ├── ImportPage.tsx
│   │   ├── CreateFlashcardPage.tsx
│   │   ├── ProgressPage.tsx
│   │   └── index.ts
│   │
│   └── hooks/                 # Custom React hooks
│       └── index.ts
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── flashcards/page.tsx
│   ├── quiz/page.tsx
│   ├── ai-lookup/page.tsx
│   ├── groups/page.tsx
│   ├── import/page.tsx
│   ├── create/page.tsx
│   ├── dashboard/page.tsx
│   ├── progress/page.tsx
│   └── globals.css
│
└── ...
```

## 🎯 UI Components

### Basic Components (BasicComponents.tsx)

#### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Click me
</Button>
```

Props:
- `children`: Button text
- `variant`: 'primary' | 'secondary' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `onClick`: () => void

#### Input
```tsx
import { Input } from '@/components/ui';

<Input
  placeholder="Enter word..."
  type="text"
  onChange={(value) => console.log(value)}
/>
```

#### Modal
```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  title="Confirm"
  onClose={() => setIsOpen(false)}
>
  Content here
</Modal>
```

---

### FlashcardCard

Hiển thị thẻ flashcard với flip animation.

```tsx
import { FlashcardCard } from '@/components/ui';

<FlashcardCard
  word="Apple"
  meaning="Quả táo"
  pronunciation="/ˈæpl/"
  example="I eat an apple every day"
  isFavorite={true}
  isFlipped={false}
  onFlip={() => setFlipped(!flipped)}
  onFavorite={() => toggleFavorite()}
  onPlaySound={() => playAudio()}
/>
```

Features:
- ✨ Flip animation
- ⭐ Mark favorite/unfavorite
- 🔊 Text-to-speech button
- 🖼️ Image support
- 📝 Pronunciation display

---

### QuizCard

Hiển thị câu hỏi trắc nghiệm.

```tsx
import { QuizCard } from '@/components/ui';

<QuizCard
  questionNum={1}
  totalQuestions={10}
  word="Beautiful"
  options=["Xấu xí", "Xinh đẹp", "Bình thường", "Tệ"]
  selectedOption={selectedIndex}
  correctOption={1}
  onSelect={(index) => handleSelect(index)}
  isAnswered={answered}
/>
```

Features:
- 📊 Progress bar
- ✅ Show correct/incorrect
- 🎯 Visual feedback
- ⏱️ Question counter

---

### AILookupBox

Tra cứu từ vựng bằng AI.

```tsx
import { AILookupBox } from '@/components/ui';

<AILookupBox
  onSearch={(word) => handleSearch(word)}
  isLoading={loading}
  result={searchResult}
/>
```

Features:
- 🔍 Real-time search
- 📖 Definition + pronunciation
- 💡 Examples & synonyms
- ➕ Quick add to flashcard button

---

### ImportDragDrop

Import từ vựng từ file hoặc paste text.

```tsx
import { ImportDragDrop } from '@/components/ui';

<ImportDragDrop
  onImportText={(text) => handleImportText(text)}
  onImportFile={(file) => handleImportFile(file)}
  isLoading={loading}
/>
```

Features:
- 📤 Drag & drop file
- 📋 Paste text area
- 👁️ Preview
- 📊 Support CSV, Excel, Text

---

### GroupInvite

Share group invitation.

```tsx
import { GroupInvite } from '@/components/ui';

<GroupInvite
  groupCode="ABC123"
  groupLink="https://flashcards.com/group/abc123"
  groupName="Business English"
  onCopyCode={() => copyCode()}
  onCopyLink={() => copyLink()}
  onShare={() => share()}
/>
```

---

### ProgressChart

Show learning progress statistics.

```tsx
import { ProgressChart } from '@/components/ui';

<ProgressChart
  totalWords={245}
  mastered={156}
  learning={62}
  unknown={27}
  weekStats={[...]}
/>
```

---

### FlashcardList

List of flashcards with status.

```tsx
import { FlashcardList } from '@/components/ui';

<FlashcardList
  cards={cardsList}
  onSelect={(id) => handleSelect(id)}
  onDelete={(id) => handleDelete(id)}
  onEdit={(id) => handleEdit(id)}
  selectedId={selectedCardId}
/>
```

---

### CreateFlashcardForm

Form to create new flashcard.

```tsx
import { CreateFlashcardForm } from '@/components/ui';

<CreateFlashcardForm
  onSubmit={(data) => handleSubmit(data)}
  isLoading={loading}
/>
```

---

### GroupCard

Group card in group listing.

```tsx
import { GroupCard } from '@/components/ui';

<GroupCard
  id="group1"
  name="Business English"
  description="Vocabulary for business"
  memberCount={12}
  cardCount={45}
  isOwner={true}
  onJoin={() => handleJoin()}
  onLeave={() => handleLeave()}
  onEdit={() => handleEdit()}
  onDelete={() => handleDelete()}
/>
```

---

## 📄 Page Components

### Dashboard
Main dashboard showing quick stats and recent collections.
**Route:** `/dashboard`

### FlashcardStudyPage
Study flashcards with navigation.
**Route:** `/flashcards`

### QuizPage
Take quizzes based on flashcards.
**Route:** `/quiz`

### AILookupPage
AI vocabulary lookup with recent searches.
**Route:** `/ai-lookup`

### GroupsPage
Manage learning groups.
**Route:** `/groups`

### ImportPage
Import vocabularies from various sources.
**Route:** `/import`

### CreateFlashcardPage
Create new flashcards manually.
**Route:** `/create`

### ProgressPage
View learning progress & achievements.
**Route:** `/progress`

---

## 🔌 Layout Components

### Header
Navigation header with menu.

```tsx
import { Header } from '@/components/layouts';

<Header />
```

### Sidebar
Collections sidebar container.

```tsx
import { Sidebar } from '@/components/layouts';

<Sidebar>
  {/* Render collection items */}
</Sidebar>
```

---

## 📍 Navigation Structure

```
Header (all pages)
  ├── Dashboard
  ├── Flashcards
  ├── 🤖 AI Tra Cứu
  ├── Quiz
  └── 👥 Nhóm Học
```

Quick actions in Dashboard:
- ➕ Tạo Flashcard → `/create`
- 📁 Import Dữ Liệu → `/import`
- 🤖 Tra Cứu AI → `/ai-lookup`

---

## 🚀 Usage Examples

### Complete Study Flow

```tsx
import { Header } from '@/components/layouts';
import { FlashcardStudyPage } from '@/components/pages';

export default function Page() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <FlashcardStudyPage />
      </main>
    </>
  );
}
```

### Combining Multiple Components

```tsx
import { FlashcardList, FlashcardCard, ProgressChart } from '@/components/ui';

export function StudySession() {
  const [selection, setSelection] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <FlashcardCard {...cardProps} />
      </div>
      <div>
        <FlashcardList
          cards={cards}
          onSelect={setSelection}
          selectedId={selection}
        />
      </div>
      <div>
        <ProgressChart {...progressProps} />
      </div>
    </div>
  );
}
```

---

## 🎨 Styling

All components use Tailwind CSS with:
- 🎯 Consistent spacing
- 🌈 Color scheme (blue, green, yellow, red, purple)
- ♿ Responsive design
- 🎭 Hover/active states

---

## 📦 Importing Components

### From UI folder
```tsx
import { FlashcardCard, QuizCard } from '@/components/ui';
```

### From layouts
```tsx
import { Header, Sidebar } from '@/components/layouts';
```

### From pages
```tsx
import { Dashboard, FlashcardStudyPage } from '@/components/pages';
```

---

## ✨ Best Practices

1. **Reusable**: Break UI into smaller components
2. **Type-safe**: Full TypeScript support
3. **Props-based**: Control via props, not global state
4. **Composable**: Stack components to build pages
5. **Accessible**: Semantic HTML
6. **Responsive**: Mobile-friendly layouts

---

## 🔄 Component Dependencies

```
Header
  └─ ( Navigation )

Page Components
  ├─ Header
  ├─ Sidebar (optional)
  └─ UI Components

UI Components
  ├─ Basic (Button, Input, Modal)
  ├─ Flashcard (FlashcardCard, FlashcardList)
  ├─ Quiz (QuizCard)
  ├─ AI (AILookupBox)
  ├─ Import (ImportDragDrop)
  ├─ Group (GroupInvite, GroupCard)
  └─ Progress (ProgressChart, CreateFlashcardForm)
```

---

## 📝 Notes

- Components are self-contained
- Props are required unless marked optional (?)
- All callback functions are optional
- Use `@/` alias for imports
- Tailwind CSS configured in `tailwind.config.js`

---

**Created:** April 10, 2026  
**Version:** 1.0.0
