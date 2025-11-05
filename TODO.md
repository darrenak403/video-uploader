````{"id":"38501","variant":"standard","title":"README.md — Drag & Drop Upload Video (UI Only, YouTube-style)"}
# 🎬 Drag & Drop Upload Video (UI Only, YouTube-style)

> Giao diện upload video với trải nghiệm tương tự YouTube — **UI only**, dùng **Next.js + TailwindCSS + shadcn/ui**.
> Gồm modal 4 bước (Details, Elements, Checks, Visibility), có preview, metadata form, thumbnails, trim, và publish controls.

---

## 🌞 TASK: Chuyển đổi hệ thống sang Light Mode (không phụ thuộc trình duyệt)

### Mục tiêu
Ép buộc ứng dụng luôn hiển thị ở chế độ sáng (light mode), bỏ qua cài đặt dark mode của hệ thống/trình duyệt.

### Các bước thực hiện

#### 1. Cập nhật `app/globals.css`
**Xóa hoặc vô hiệu hóa dark mode query:**

```css
/* XÓA hoặc comment đoạn này */
@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}

/* THAY BẰNG: */
@media (prefers-color-scheme: dark) {
  html {
    color-scheme: light; /* Ép buộc light mode */
  }
}
```

**Hoặc xóa hoàn toàn class `.dark`:**
```css
/* Xóa toàn bộ block .dark {...} nếu không dùng dark mode toggle */
```

#### 2. Cập nhật `app/layout.tsx` (nếu cần)
Đảm bảo không có class `dark` trong thẻ `<html>` hoặc `<body>`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

#### 3. Kiểm tra các component
- Đảm bảo không có component nào sử dụng `useTheme()` hoặc `next-themes` để toggle dark mode
- Xóa các toggle button dark/light mode nếu có

#### 4. Testing
- [ ] Kiểm tra trên browser với system dark mode
- [ ] Kiểm tra trên browser với system light mode
- [ ] App phải luôn hiển thị light mode trong cả 2 trường hợp

### Kết quả mong đợi
✅ Ứng dụng luôn hiển thị với nền trắng, text màu đen
✅ Không bị ảnh hưởng bởi cài đặt `prefers-color-scheme` của hệ thống
✅ CSS variables trong `:root` được sử dụng (không dùng `.dark`)

---

---

## 🧱 0) Chuẩn bị môi trường

- Node.js ≥ 18
- npm / yarn / pnpm
- VS Code (khuyến nghị)

---

## 🚀 1) Tạo project & cài dependencies

```bash
pnpm create next-app@latest video-uploader --ts --app
cd video-uploader

# TailwindCSS
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p

# Core libraries
pnpm add framer-motion clsx dayjs react-icons

# UI components (shadcn/ui or Radix primitives)
pnpm add @radix-ui/react-dialog @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-switch

# Dev utilities
pnpm add -D eslint prettier
```

---

## 🎨 2) Cấu hình Tailwind

**`tailwind.config.js`**

```js
content: [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
]
```

**`./styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📁 3) Cấu trúc thư mục

```
/app
  /upload
    page.tsx
/components
  /upload
    UploadDropzone.tsx
    UploadModal.tsx
    UploadProgressHeader.tsx
    VideoPreviewPlayer.tsx
    MetadataForm.tsx
    ThumbnailSelector.tsx
    TrimTool.tsx
    ProcessingStatus.tsx
    PublishControls.tsx
/lib
  hooks.ts
  utils.ts
/styles
  globals.css
README.md
```

---

## 💻 4) Các bước implement

### (1) Base layout — `/app/upload/page.tsx`
- Dropzone ở giữa: “Kéo thả video vào đây” + nút “Chọn video”.
- Khi chọn file → mở `UploadModal`.

### (2) `UploadDropzone.tsx`
- Props: `onFilesSelected(files: File[])`, `accept`, `maxSizeBytes`.
- Drag events, validation (size/type), inline error toast.

### (3) `UploadModal.tsx`
- Props:
  ```ts
  interface UploadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    videoFile?: File | null
    onCancel?: () => void
    onComplete?: (videoId: string) => void
  }
  ```
- Modal 4 bước (Details → Elements → Checks → Visibility).
- Progress header, step navigation, Next/Back buttons, Save Draft.

### (4) `UploadProgressHeader.tsx`
- Hiển thị 4 bước, highlight current step, bar progress.
- Khi uploading, hiển thị phần trăm.

### (5) `VideoPreviewPlayer.tsx`
- `<video>` autoplay muted preview.
- Hiển thị thời lượng, trạng thái HD, scrub bar.
- Props: `videoUrl`, `trimStart`, `trimEnd`.

### (6) `MetadataForm.tsx`
- Fields: Title, Description, Tags, Category, Language.
- Toggles: Allow Comments, Add to Playlist.
- Validation & counter.

### (7) `ThumbnailSelector.tsx`
- 3 ảnh auto thumbnail + upload custom thumbnail.
- Highlight ảnh chọn.
- Placeholder: `https://placehold.co/160x90`.

### (8) `TrimTool.tsx`
- Slider chọn start/end.
- Numeric input hiển thị thời gian cắt.

### (9) `ProcessingStatus.tsx`
- Hiển thị trạng thái: Uploading / Processing / Ready.
- Có retry nếu lỗi.

### (10) `PublishControls.tsx`
- Radio: Public / Unlisted / Private.
- Datetime picker để schedule.
- Nút “Save Draft” và “Publish”.

---

## 🔧 5) Hooks & logic mock

### `/lib/hooks.ts`

- `useAutosave(key)` → save/load/clear từ localStorage.
- `useUploadProgress()` → mô phỏng upload và trạng thái xử lý (queued → processing → ready).

---

## ✨ 6) Animations & responsive

- Dùng **Framer Motion** cho chuyển bước (slide + fade).
- Progress bar smooth transition.
- Desktop: `grid lg:grid-cols-12`, video (7 col) + form (5 col).
- Mobile: dọc, có scroll cho modal body.

---

## ♿ 7) Accessibility

- Modal: `role="dialog"`, trap focus, đóng bằng ESC.
- Inputs: `aria-invalid`, `aria-describedby`.
- Processing: `aria-live="polite"`.
- Alt text cho thumbnails.
- Focus trả về nút “Choose Videos” sau khi đóng modal.

---

## 🌍 8) i18n strings (VN + EN)

| Key | Vietnamese | English |
|-----|-------------|----------|
| upload.title | Tải video lên | Upload your video |
| upload.dropzone | Kéo thả video vào đây | Drop your videos here |
| form.title | Tiêu đề (bắt buộc) | Title (required) |
| form.description | Mô tả | Description |
| form.thumbnail | Hình thu nhỏ | Thumbnail |
| form.publish | Chế độ hiển thị | Visibility |
| status.uploading | Đang tải lên... | Uploading... |
| status.processing | Đang xử lý... | Processing... |
| status.ready | Sẵn sàng | Ready |

---

## ✅ 9) QA Test cases

| Case | Expected result |
|------|------------------|
| Upload small MP4 | Modal mở, preview video hiển thị |
| Title trống | “Next” bị disable, hiện lỗi inline |
| File quá lớn | Hiển thị lỗi “File vượt quá 5GB” |
| Network fail | Hiển thị retry/resume |
| Đóng modal giữa upload | Hỏi “Lưu nháp?” và lưu localStorage |
| Mở lại modal | Gợi ý “Khôi phục bản nháp?” |
| Keyboard nav | Tab qua tất cả controls |
| Mobile view | Layout dọc, scrollable nội dung |

---

## 🧪 10) Scripts & Run

```bash
pnpm dev
```

Truy cập: **http://localhost:3000/upload**

---

## 📘 11) Optional nâng cao

- Capture thumbnail client-side (canvas tại 10%, 50%, 90%).
- Kết hợp tus hoặc multipart upload (AWS S3).
- WebSocket để cập nhật real-time.
- Unit test (React Testing Library).

---

## 💾 12) Commit & README

```bash
git init
git add .
git commit -m "feat: upload modal UI skeleton"
```

---

## 🧰 13) VS Code Task (tùy chọn)

**`.vscode/tasks.json`**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev:next",
      "type": "shell",
      "command": "pnpm dev",
      "group": "build",
      "presentation": { "reveal": "always" }
    }
  ]
}
```

---

### 📎 Summary
- ✅ 4-step modal UI như YouTube Upload
- ✅ Responsive, accessible, autosave
- ✅ Mock upload + progress + status
- ✅ Hoàn toàn frontend (UI-only, no backend)

---

> 🧑‍💻 Next step:
> Run `pnpm dev` → mở `/upload` → test modal flow!
> Nếu muốn tự động tạo `UploadModal.tsx` (shadcn + Tailwind + framer-motion) → yêu cầu thêm prompt `"Generate UploadModal.tsx code"`.

---

## 🔁 TASK: Integrate Video.js for robust video handling

Mục tiêu: Thay thế hoặc bọc player hiện tại bằng Video.js để có playback ổn định, hỗ trợ seek/trim programmatic, HLS later, và cùng một API cho các component khác.

Commands to install (run in project root):

```bash
# Install Video.js and types (you can use npm/yarn/pnpm)
pnpm add video.js
pnpm add -D @types/video.js
```

Files to add/modify (planned):
- add: `components/upload/VideoJsPlayer.tsx` (wrapper React + Video.js)
- modify: `components/upload/VideoPreviewPlayer.tsx` to use `VideoJsPlayer` (or replace usages in `UploadModal.tsx`)
- modify: `app/globals.css` to import Video.js CSS if needed

Implementation checklist (acceptance criteria):
- [ ] Add Video.js dependency and types to project (`package.json`)
- [ ] Create `VideoJsPlayer.tsx` with props: `videoUrl`, `trimStart?`, `trimEnd?`, `onTimeUpdate?`, `autoplay?`, `muted?`, `poster?`, `aspectRatio?`
  - Initialize Video.js on mount, dispose on unmount
  - Programmatic seek to `trimStart` and loop between `trimStart`/`trimEnd`
  - Emit `timeupdate` via `onTimeUpdate`
  - Responsive + support vertical 9:16 layout
- [ ] Update `VideoPreviewPlayer.tsx` to render `VideoJsPlayer` when `videoUrl` is present
- [ ] Preserve `URL.revokeObjectURL` cleanup in `UploadModal`/Preview
- [ ] Add manual test steps to QA section below

Implementation notes:
- Use dynamic import of `video.js` inside `useEffect` to avoid SSR issues, and import its CSS (either in `globals.css` or via dynamic import)
- Keep the wrapper API minimal so `TrimTool`, `ThumbnailSelector` can interact via props/callbacks
- If `@types/video.js` is not perfect, use `any` for the player instance to avoid type blocking

Manual integration test (add to QA):
- Start dev server: `pnpm dev`
- Open `http://localhost:3000/upload`
- Select a sample MP4
- Verify: video loads and plays via Video.js UI
- Verify: trimming — set `trimStart` and `trimEnd` (via TrimTool) and confirm player loops between start and end
- Verify: `onTimeUpdate` in UploadModal receives current time updates
- Verify: object URL revoked on modal close (no memory leak)

Estimated work: 2-3 edits + dependency install. After you confirm, I can start implementing the wrapper and update components.
````
