# 🏗️ Architecture & Data Flow - Video Uploader

> Hướng dẫn chi tiết về luồng hoạt động từ **Page** → **Component** → **Hook** → **Lib**

---

## 📊 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. PAGE LAYER (app/upload/page.tsx)                        │
│     - Route handler                                          │
│     - State management cho page-level                        │
│     - Orchestrate components                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. COMPONENT LAYER (components/upload/*)                   │
│     - UI presentation                                        │
│     - User interactions                                      │
│     - Local component state                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. HOOK LAYER (lib/hooks.ts)                               │
│     - Business logic                                         │
│     - Shared state management                                │
│     - Side effects (upload, autosave, etc.)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. LIB/UTILS LAYER (lib/utils.ts)                          │
│     - Pure functions                                         │
│     - Helpers & utilities                                    │
│     - No side effects                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Luồng hoạt động chi tiết

### **1️⃣ PAGE LAYER** (`app/upload/page.tsx`)

**Vai trò:** Entry point của trang upload, quản lý state cao nhất

#### Code flow:

```typescript
User visits /upload
    ↓
UploadPage component renders
    ↓
State initialization:
  - selectedFile: File | null
  - modalOpen: boolean
    ↓
Render UploadDropzone
    ↓
User drops/selects file
    ↓
handleFilesSelected() được gọi
    ↓
setState:
  - selectedFile = file
  - modalOpen = true
    ↓
UploadModal mở với videoFile prop
```

#### State management:

```typescript
// State ở page level
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [modalOpen, setModalOpen] = useState(false);

// Event handlers
const handleFilesSelected = (files: File[]) => {
  setSelectedFile(files[0]);
  setModalOpen(true);
};

const handleModalClose = () => {
  setModalOpen(false);
  setSelectedFile(null);
};

const handleComplete = (videoId: string) => {
  console.log("Video uploaded:", videoId);
  // Navigate or show success message
};
```

---

### **2️⃣ COMPONENT LAYER** (`components/upload/*`)

#### **A. UploadDropzone** - File selection component

**Input:**

- `onFilesSelected: (files: File[]) => void`
- `accept: string`
- `maxSizeBytes: number`

**Output:**

- Gọi callback `onFilesSelected(files)` khi user chọn file

**Flow:**

```typescript
User drags file into dropzone
    ↓
handleDragEnter() → setIsDragging(true)
    ↓
handleDrop() → e.dataTransfer.files
    ↓
processFiles(files)
    ↓
validateVideoFile(file) [từ lib/utils.ts]
    ↓
Valid?
  ✅ Yes → onFilesSelected([file])
  ❌ No  → setError(message)
```

**Dependencies:**

- `lib/utils.ts` → `validateVideoFile()`
- `react-icons/fi` → Icons

---

#### **B. UploadModal** - Main upload flow orchestrator

**Vai trò:** Quản lý toàn bộ flow upload với 4 steps

**State internal:**

```typescript
// Step management
const [currentStep, setCurrentStep] = useState(1); // 1-4

// Video data
const [videoUrl, setVideoUrl] = useState<string | null>(null);
const [videoDuration, setVideoDuration] = useState(0);

// Metadata
const [metadata, setMetadata] = useState<Partial<VideoMetadata>>({
  title: "",
  description: "",
  tags: [],
  category: "",
  language: "vi",
  // ... more fields
});

// Validation
const [errors, setErrors] = useState<Record<string, string>>({});
```

**Hooks usage:**

```typescript
// Autosave hook
const {saveDraft, loadDraft, clearDraft, hasDraft} =
  useAutosave("video-upload-draft");

// Upload progress hook
const uploadState = useUploadProgress();
// Returns: {
//   uploadProgress,
//   processingStatus,
//   uploadId,
//   videoId,
//   error,
//   startUpload(),
//   retryUpload(),
//   reset()
// }
```

**Flow diagram:**

```
Modal opens with videoFile
    ↓
useEffect: Create object URL
    ↓
videoUrl = URL.createObjectURL(videoFile)
    ↓
uploadState.startUpload(videoFile) [Hook call]
    ↓
[Step 1] Details
  - MetadataForm component
  - User fills title, description, tags
  - validateStep() on Next click
    ↓
[Step 2] Elements
  - ThumbnailSelector
  - TrimTool
  - User customizes thumbnails & trim points
    ↓
[Step 3] Checks
  - Show validation checklist
  - Confirm content policies
    ↓
[Step 4] Visibility
  - PublishControls
  - Select public/private/unlisted
  - Schedule (optional)
  - Click Publish
    ↓
handlePublish()
  - Check if processingStatus === "ready"
  - clearDraft()
  - onComplete(videoId)
```

**Component tree:**

```
UploadModal
├── UploadProgressHeader (shows current step)
├── VideoPreviewPlayer (left side)
├── ProcessingStatus (below video)
└── Right side (changes per step):
    ├── Step 1: MetadataForm
    ├── Step 2: ThumbnailSelector + TrimTool
    ├── Step 3: Checks list
    └── Step 4: PublishControls
```

---

#### **C. MetadataForm** - Form fields component

**Props:**

- `value: Partial<VideoMetadata>`
- `onChange: (metadata) => void`
- `errors?: Record<string, string>`

**Flow:**

```
User types in title input
    ↓
onChange event
    ↓
handleChange("title", value)
    ↓
Call parent onChange({ ...value, title: newValue })
    ↓
Parent updates metadata state
    ↓
Component re-renders with new value
```

**Features:**

- Title with character counter (max 100)
- Description with counter (max 5000)
- Tags as chips with autocomplete suggestions
- Category & Language dropdowns
- Toggles for comments & playlist

---

#### **D. ThumbnailSelector** - Thumbnail picker

**Flow:**

```
Component renders 3 auto thumbnails + upload button
    ↓
User clicks thumbnail
    ↓
onSelect(index)
    ↓
Parent updates metadata.thumbnailIndex
    ↓
Selected thumbnail shows checkmark
```

**Custom upload:**

```
User clicks "Upload" thumbnail slot
    ↓
File input opens
    ↓
User selects image
    ↓
FileReader reads file
    ↓
setPreviewUrl(dataURL)
    ↓
onCustomUpload(file)
    ↓
onSelect(3) // Custom index
```

---

#### **E. TrimTool** - Video trimming

**Props:**

- `duration: number` (video duration)
- `trimStart?: number`
- `trimEnd?: number`
- `onTrimChange: (start, end) => void`

**Flow:**

```
User drags start slider
    ↓
handleStartChange(value)
    ↓
Validate: start < end
    ↓
setStart(newStart)
    ↓
onTrimChange(newStart, end)
    ↓
Parent updates metadata.trimStart/trimEnd
    ↓
VideoPreviewPlayer receives new trim values
    ↓
Video playback respects trim boundaries
```

---

#### **F. VideoPreviewPlayer** - Video display

**Flow:**

```
Component mounts with videoUrl
    ↓
useEffect: Add event listeners
  - loadedmetadata → setDuration()
  - timeupdate → setCurrentTime(), onTimeUpdate()
  - play/pause → setIsPlaying()
    ↓
If trimEnd && currentTime >= trimEnd
    ↓
video.pause()
video.currentTime = trimStart
```

---

#### **G. ProcessingStatus** - Upload status display

**Props from hook:**

- `status: "uploading" | "queued" | "processing" | "ready" | "error"`
- `uploadProgress: number`
- `error?: string`
- `onRetry?: () => void`

**Conditional rendering:**

```typescript
status === "uploading"
  → Show progress bar + percentage

status === "queued"
  → Show "Waiting in queue..."

status === "processing"
  → Show "Processing video..."

status === "ready"
  → Show "✅ Ready to publish"

status === "error"
  → Show error + Retry button
```

---

#### **H. PublishControls** - Final publish step

**Flow:**

```
User selects visibility radio
    ↓
onChange({ ...value, visibility: "public" })
    ↓
User picks datetime (optional)
    ↓
onChange({ ...value, scheduledAt: datetime })
    ↓
User clicks "Save Draft"
    ↓
onSaveDraft() → calls saveDraft(metadata) from hook
    ↓
OR User clicks "Publish"
    ↓
onPublish()
  ↓
  Check canPublish (processingStatus === "ready")
  ↓
  Call API (mock) with metadata
  ↓
  onComplete(videoId)
```

---

### **3️⃣ HOOK LAYER** (`lib/hooks.ts`)

#### **A. useAutosave Hook**

**Purpose:** Save/load draft from localStorage

**API:**

```typescript
const { saveDraft, loadDraft, clearDraft, hasDraft } = useAutosave(key: string);
```

**Implementation:**

```typescript
export function useAutosave(key: string) {
  const saveDraft = useCallback(
    (metadata: Partial<VideoMetadata>) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          ...metadata,
          savedAt: new Date().toISOString(),
        })
      );
    },
    [key]
  );

  const loadDraft = useCallback(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }, [key]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  const hasDraft = useCallback(() => {
    return localStorage.getItem(key) !== null;
  }, [key]);

  return {saveDraft, loadDraft, clearDraft, hasDraft};
}
```

**Usage in UploadModal:**

```typescript
// Load draft on mount
useEffect(() => {
  if (open && hasDraft()) {
    const draft = loadDraft();
    if (draft && confirm("Restore draft?")) {
      setMetadata(draft);
    }
  }
}, [open]);

// Auto-save every 2 seconds
useEffect(() => {
  if (open && metadata.title) {
    const timer = setTimeout(() => {
      saveDraft(metadata);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [metadata, open]);
```

---

#### **B. useUploadProgress Hook**

**Purpose:** Simulate upload & processing with state management

**State:**

```typescript
interface UploadState {
  uploadProgress: number; // 0-100
  processingStatus:
    | "idle"
    | "uploading"
    | "queued"
    | "processing"
    | "ready"
    | "error";
  uploadId: string | null; // Mock upload ID
  videoId: string | null; // Mock video ID
  error: string | null;
}
```

**Flow:**

```typescript
startUpload(file)
    ↓
setState({ processingStatus: "uploading", uploadProgress: 0 })
    ↓
setInterval: Increment progress randomly
    ↓
When progress >= 100:
    ↓
    setState({ processingStatus: "queued", videoId: "video_xxx" })
    ↓
    setTimeout 2s → processingStatus = "processing"
    ↓
    setTimeout 3s → processingStatus = "ready"
```

**Mock implementation:**

```typescript
export function useUploadProgress() {
  const [state, setState] = useState<UploadState>({
    uploadProgress: 0,
    processingStatus: "idle",
    uploadId: null,
    videoId: null,
    error: null,
  });

  const startUpload = useCallback((file: File) => {
    const uploadId = `upload_${Date.now()}`;
    setState({
      uploadProgress: 0,
      processingStatus: "uploading",
      uploadId,
      videoId: null,
      error: null,
    });

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Transition through processing stages
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            uploadProgress: 100,
            processingStatus: "queued",
            videoId: `video_${Date.now()}`,
          }));

          setTimeout(() => {
            setState((prev) => ({...prev, processingStatus: "processing"}));

            setTimeout(() => {
              setState((prev) => ({...prev, processingStatus: "ready"}));
            }, 3000);
          }, 2000);
        }, 500);
      }

      setState((prev) => ({...prev, uploadProgress: Math.min(progress, 100)}));
    }, 500);
  }, []);

  const retryUpload = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      processingStatus: "uploading",
      uploadProgress: 0,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      uploadProgress: 0,
      processingStatus: "idle",
      uploadId: null,
      videoId: null,
      error: null,
    });
  }, []);

  return {...state, startUpload, retryUpload, reset};
}
```

---

### **4️⃣ LIB/UTILS LAYER** (`lib/utils.ts`)

**Purpose:** Pure utility functions, no side effects

#### **A. cn() - Tailwind class merger**

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**

```typescript
<div
  className={cn("base-class", isActive && "active-class", "conditional-class")}
/>
```

---

#### **B. formatFileSize() - Format bytes**

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
```

**Example:**

```typescript
formatFileSize(1024); // "1 KB"
formatFileSize(1048576); // "1 MB"
formatFileSize(5368709120); // "5 GB"
```

---

#### **C. formatDuration() - Format seconds to MM:SS**

```typescript
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
```

**Example:**

```typescript
formatDuration(65); // "1:05"
formatDuration(3665); // "1:01:05"
formatDuration(45); // "0:45"
```

---

#### **D. validateVideoFile() - File validation**

```typescript
export function validateVideoFile(
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024 * 1024
): {valid: boolean; error?: string} {
  // Check file type
  if (!file.type.startsWith("video/")) {
    return {valid: false, error: "File phải là video"};
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File vượt quá ${formatFileSize(maxSizeBytes)}`,
    };
  }

  return {valid: true};
}
```

**Usage:**

```typescript
const validation = validateVideoFile(file, 5 * 1024 * 1024 * 1024);
if (!validation.valid) {
  setError(validation.error);
  return;
}
// Proceed with upload
```

---

## 🔄 Complete Data Flow Example

### Scenario: User uploads video từ đầu đến cuối

```
1. User visits /upload
   ↓
   📄 app/upload/page.tsx renders
   └─ State: selectedFile=null, modalOpen=false

2. User drags video.mp4 into dropzone
   ↓
   🎨 UploadDropzone receives drop event
   ├─ processFiles([video.mp4])
   ├─ 📚 validateVideoFile(file, maxSize) [lib/utils]
   │  └─ Returns: { valid: true }
   └─ onFilesSelected([video.mp4]) [callback to page]

3. Page receives file
   ↓
   📄 page.tsx: handleFilesSelected()
   ├─ setSelectedFile(video.mp4)
   └─ setModalOpen(true)

4. UploadModal opens
   ↓
   🎨 UploadModal component mounts
   ├─ useEffect: videoUrl = URL.createObjectURL(video.mp4)
   ├─ 🔧 useUploadProgress() hook
   │  └─ startUpload(video.mp4)
   │     └─ Mock upload starts: progress 0 → 100
   ├─ 🔧 useAutosave() hook
   │  └─ Check localStorage for draft
   └─ Render Step 1 (Details)

5. User fills form (Step 1)
   ↓
   🎨 MetadataForm receives input
   ├─ User types title: "My Video"
   ├─ onChange("title", "My Video")
   ├─ handleMetadataChange({ ...metadata, title: "My Video" })
   └─ Parent state updates

   Auto-save triggered:
   ↓
   🔧 useAutosave: saveDraft(metadata)
   └─ localStorage.setItem("video-upload-draft", JSON.stringify(metadata))

6. User clicks "Next"
   ↓
   🎨 UploadModal: handleNext()
   ├─ validateStep(1)
   │  └─ Check: title not empty? ✅
   ├─ setCurrentStep(2)
   └─ Render Step 2 (Elements)

7. Step 2: Elements
   ↓
   🎨 ThumbnailSelector
   ├─ User selects thumbnail #2
   ├─ onSelect(1)
   └─ Parent: setMetadata({ ...metadata, thumbnailIndex: 1 })

   🎨 TrimTool
   ├─ User drags slider: start=5s, end=60s
   ├─ 📚 formatDuration(5) → "0:05" [lib/utils]
   ├─ onTrimChange(5, 60)
   └─ Parent: setMetadata({ ...metadata, trimStart: 5, trimEnd: 60 })

   🎨 VideoPreviewPlayer re-renders
   └─ Respects new trim values

8. User clicks "Next" → Step 3 (Checks)
   ↓
   Shows validation checklist

9. User clicks "Next" → Step 4 (Visibility)
   ↓
   🎨 PublishControls renders
   ├─ User selects "Public"
   ├─ onChange({ ...metadata, visibility: "public" })
   └─ User clicks "Publish"

10. Publish flow
    ↓
    🎨 UploadModal: handlePublish()
    ├─ Check: uploadState.processingStatus === "ready" ✅
    ├─ 🔧 clearDraft() [hook]
    │  └─ localStorage.removeItem("video-upload-draft")
    ├─ onComplete(videoId) [callback to page]
    └─ Modal closes

11. Success!
    ↓
    📄 page.tsx: handleComplete("video_123")
    └─ console.log("Video uploaded: video_123")
       (In real app: Navigate to video page or show success toast)
```

---

## 🎯 Best Practices & Patterns

### **1. Separation of Concerns**

```
Page:       Routing & high-level orchestration
Components: UI presentation & user interactions
Hooks:      Business logic & side effects
Utils:      Pure functions & helpers
```

### **2. Data Flow: Unidirectional**

```
State flows down (props)
Events flow up (callbacks)
```

### **3. Component Communication**

```typescript
// ❌ Bad: Direct sibling communication
<ComponentA onEvent={(data) => componentBRef.current.update(data)} />

// ✅ Good: Lift state up
<Parent>
  <ComponentA onChange={setState} />
  <ComponentB value={state} />
</Parent>
```

### **4. Hook Reusability**

```typescript
// Hooks can be used in multiple components
function ComponentA() {
  const {saveDraft} = useAutosave("component-a");
}

function ComponentB() {
  const {saveDraft} = useAutosave("component-b");
}
```

### **5. Pure Utils**

```typescript
// ✅ Good: Pure function
export function formatDuration(seconds: number): string {
  // No side effects, predictable output
}

// ❌ Bad: Impure function
export function formatDuration(seconds: number): string {
  console.log(seconds); // Side effect!
  return formatTime(seconds);
}
```

---

## 📝 Type Definitions

### Core Types:

```typescript
// lib/hooks.ts
export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  language: string;
  allowComments: boolean;
  addToPlaylist: boolean;
  visibility: "public" | "unlisted" | "private";
  scheduledAt?: string;
  thumbnailIndex: number;
  customThumbnail?: File;
  trimStart?: number;
  trimEnd?: number;
}

export interface UploadState {
  uploadProgress: number;
  processingStatus:
    | "idle"
    | "uploading"
    | "queued"
    | "processing"
    | "ready"
    | "error";
  uploadId: string | null;
  videoId: string | null;
  error: string | null;
}
```

---

## 🧪 Testing Strategy

### Page Level:

```typescript
// Test routing, initial state, integration
test("renders upload page with dropzone", () => {
  render(<UploadPage />);
  expect(screen.getByText("Tải video lên")).toBeInTheDocument();
});
```

### Component Level:

```typescript
// Test UI interactions, prop passing
test("UploadDropzone validates file type", () => {
  const onFilesSelected = jest.fn();
  render(<UploadDropzone onFilesSelected={onFilesSelected} />);
  // Simulate file drop...
});
```

### Hook Level:

```typescript
// Test business logic in isolation
test("useUploadProgress transitions states correctly", () => {
  const {result} = renderHook(() => useUploadProgress());
  act(() => result.current.startUpload(mockFile));
  expect(result.current.processingStatus).toBe("uploading");
});
```

### Utils Level:

```typescript
// Test pure functions
test("formatDuration formats seconds correctly", () => {
  expect(formatDuration(65)).toBe("1:05");
  expect(formatDuration(3665)).toBe("1:01:05");
});
```

---

## 🚀 Future Enhancements

1. **Real API Integration**

   - Replace mock upload with actual API calls
   - Add retry logic with exponential backoff
   - Implement resumable uploads (tus protocol)

2. **Advanced Features**

   - Client-side thumbnail extraction from video
   - Video compression before upload
   - Real-time progress via WebSocket
   - Batch upload support

3. **State Management**

   - Consider Zustand/Redux for complex state
   - Add optimistic UI updates
   - Implement undo/redo

4. **Performance**
   - Lazy load components
   - Virtualize large lists
   - Debounce autosave
   - Memoize expensive calculations

---

## 📚 Further Reading

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com/)

---

> 📝 **Note**: Đây là UI-only implementation với mock data. Trong production, cần thay thế mock logic bằng real API calls và proper error handling.
