````{"id":"38501","variant":"standard","title":"README.md — Drag & Drop Upload Video (UI Only, YouTube-style)"}
# 🎬 Drag & Drop Upload Video (UI Only, YouTube-style)

> Giao diện upload video với trải nghiệm tương tự YouTube — **UI only**, dùng **Next.js + TailwindCSS + shadcn/ui**.
> Gồm modal 4 bước (Details, Elements, Checks, Visibility), có preview, metadata form, thumbnails, trim, và publish controls.

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
````
