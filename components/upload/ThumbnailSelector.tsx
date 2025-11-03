"use client";

import {useRef, useState} from "react";
import {FiUpload, FiCheck} from "react-icons/fi";
import {cn} from "@/lib/utils";

interface ThumbnailSelectorProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  onCustomUpload?: (file: File) => void;
  customThumbnailUrl?: string;
}

export default function ThumbnailSelector({
  selectedIndex,
  onSelect,
  onCustomUpload,
  customThumbnailUrl,
}: ThumbnailSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    customThumbnailUrl || null
  );

  // Generate placeholder thumbnails (in real app, capture from video)
  const autoThumbnails = [
    `https://placehold.co/160x90/1e40af/ffffff?text=10%`,
    `https://placehold.co/160x90/7e22ce/ffffff?text=50%`,
    `https://placehold.co/160x90/be123c/ffffff?text=90%`,
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      onSelect(3); // Custom thumbnail index
    };
    reader.readAsDataURL(file);

    onCustomUpload?.(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Hình thu nhỏ
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Chọn hoặc tải lên hình ảnh thể hiện nội dung video của bạn
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Auto thumbnails */}
        {autoThumbnails.map((url, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
              "hover:border-blue-400 hover:scale-105",
              selectedIndex === index
                ? "border-blue-600 ring-2 ring-blue-600"
                : "border-gray-300 dark:border-gray-700"
            )}
          >
            <img
              src={url}
              alt={`Thumbnail tự động ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {selectedIndex === index && (
              <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiCheck className="text-white" size={16} />
                </div>
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white">
              {index === 0 ? "10%" : index === 1 ? "50%" : "90%"}
            </div>
          </button>
        ))}

        {/* Custom upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
            "hover:border-blue-400 hover:scale-105",
            "flex flex-col items-center justify-center gap-2",
            selectedIndex === 3
              ? "border-blue-600 ring-2 ring-blue-600"
              : "border-gray-300 dark:border-gray-700 border-dashed"
          )}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Thumbnail tùy chỉnh"
                className="w-full h-full object-cover"
              />
              {selectedIndex === 3 && (
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <FiCheck className="text-white" size={16} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <FiUpload
                className="text-gray-400 dark:text-gray-500"
                size={20}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                Tải lên
              </span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Tải lên thumbnail tùy chỉnh"
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        💡 Gợi ý: Sử dụng hình ảnh 1280x720 (16:9) để có chất lượng tốt nhất
      </p>
    </div>
  );
}
