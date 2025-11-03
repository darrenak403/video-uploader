"use client";

import {useState} from "react";
import {VideoMetadata} from "@/lib/hooks";
import {cn} from "@/lib/utils";

interface MetadataFormProps {
  value: Partial<VideoMetadata>;
  onChange: (metadata: Partial<VideoMetadata>) => void;
  errors?: Record<string, string>;
}

const CATEGORIES = [
  {value: "music", label: "Âm nhạc", labelEn: "Music"},
  {value: "gaming", label: "Trò chơi", labelEn: "Gaming"},
  {value: "education", label: "Giáo dục", labelEn: "Education"},
  {value: "entertainment", label: "Giải trí", labelEn: "Entertainment"},
  {value: "sports", label: "Thể thao", labelEn: "Sports"},
  {value: "tech", label: "Công nghệ", labelEn: "Technology"},
  {value: "vlog", label: "Vlog", labelEn: "Vlog"},
  {value: "other", label: "Khác", labelEn: "Other"},
];

const LANGUAGES = [
  {value: "vi", label: "Tiếng Việt"},
  {value: "en", label: "English"},
  {value: "ja", label: "日本語"},
  {value: "ko", label: "한국어"},
  {value: "zh", label: "中文"},
];

const TAG_SUGGESTIONS = [
  "viral",
  "trending",
  "tutorial",
  "review",
  "gaming",
  "music",
  "vlog",
  "funny",
  "tech",
  "education",
];

export default function MetadataForm({
  value,
  onChange,
  errors = {},
}: MetadataFormProps) {
  const [tagInput, setTagInput] = useState("");

  const handleChange = (field: keyof VideoMetadata, val: any) => {
    onChange({...value, [field]: val});
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;

    const currentTags = value.tags || [];
    if (!currentTags.includes(trimmed) && currentTags.length < 15) {
      handleChange("tags", [...currentTags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const currentTags = value.tags || [];
    handleChange(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (
      e.key === "Backspace" &&
      !tagInput &&
      value.tags &&
      value.tags.length > 0
    ) {
      removeTag(value.tags[value.tags.length - 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={value.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          maxLength={100}
          className={cn(
            "w-full px-4 py-2 border rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            errors.title ? "border-red-500" : "border-gray-300"
          )}
          placeholder="Thêm tiêu đề mô tả video của bạn"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        <div className="flex justify-between mt-1">
          <span id="title-error" className="text-xs text-red-500">
            {errors.title}
          </span>
          <span className="text-xs text-gray-500">
            {(value.title || "").length}/100
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Mô tả
        </label>
        <textarea
          id="description"
          value={value.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          maxLength={5000}
          rows={4}
          className={cn(
            "w-full px-4 py-2 border rounded-lg resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            "border-gray-300"
          )}
          placeholder="Giới thiệu về video của bạn cho người xem"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">
            {(value.description || "").length}/5000
          </span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Tags (tối đa 15)
        </label>
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-2 min-h-[60px] dark:bg-gray-800">
          <div className="flex flex-wrap gap-2 mb-2">
            {value.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-600 dark:hover:text-blue-300"
                  aria-label={`Xóa tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="w-full bg-transparent border-none focus:outline-none dark:text-white"
            placeholder={value.tags?.length ? "" : "Nhấn Enter để thêm tag"}
            disabled={(value.tags?.length || 0) >= 15}
          />
        </div>

        {/* Tag suggestions */}
        <div className="flex flex-wrap gap-2 mt-2">
          {TAG_SUGGESTIONS.filter((s) => !value.tags?.includes(s))
            .slice(0, 5)
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                disabled={(value.tags?.length || 0) >= 15}
              >
                + {tag}
              </button>
            ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Danh mục
        </label>
        <select
          id="category"
          value={value.category || ""}
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Chọn danh mục</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div>
        <label
          htmlFor="language"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Ngôn ngữ video
        </label>
        <select
          id="language"
          value={value.language || "vi"}
          onChange={(e) => handleChange("language", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value.allowComments ?? true}
            onChange={(e) => handleChange("allowComments", e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Cho phép bình luận
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value.addToPlaylist ?? false}
            onChange={(e) => handleChange("addToPlaylist", e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Thêm vào playlist
          </span>
        </label>
      </div>
    </div>
  );
}
