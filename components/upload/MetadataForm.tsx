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

  const handleChange = (field: keyof VideoMetadata, val: unknown) => {
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
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Title <span className="text-red-500">(required)</span>
        </label>
        <input
          id="title"
          type="text"
          value={value.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          maxLength={100}
          className={cn(
            "w-full px-3 py-2.5 border rounded-md text-sm",
            "focus:outline-none focus:ring-2 focus:ring-black",
            "bg-white border-gray-300 text-gray-900",
            errors.title ? "border-red-500" : "border-gray-300"
          )}
          placeholder="Sabrina Carpenter - Tears (Official Music Video)"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        <div className="flex justify-between mt-1.5">
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
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          value={value.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          maxLength={5000}
          rows={3}
          className={cn(
            "w-full px-3 py-2.5 border rounded-md resize-none text-sm",
            "focus:outline-none focus:ring-2 focus:ring-black",
            "bg-white border-gray-300 text-gray-900"
          )}
          placeholder="Tell viewers about your video..."
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-500">0/5000</span>
          <span className="text-xs text-gray-500">
            {(value.description || "").length}/5000
          </span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Tags
        </label>
        <div className="border border-gray-300 rounded-md p-2 min-h-[48px] bg-white focus-within:ring-2 focus-within:ring-black">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {value.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-800 rounded text-xs font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-gray-600 text-sm"
                  aria-label={`Remove tag ${tag}`}
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
            className="w-full bg-transparent border-none focus:outline-none text-gray-900 text-sm px-1"
            placeholder={value.tags?.length ? "" : "Press Enter to add tags"}
            disabled={(value.tags?.length || 0) >= 15}
          />
        </div>

        {/* Tag suggestions */}
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-2">Suggested tags:</p>
          <div className="flex flex-wrap gap-2">
            {TAG_SUGGESTIONS.filter((s) => !value.tags?.includes(s))
              .slice(0, 8)
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-200"
                  disabled={(value.tags?.length || 0) >= 15}
                >
                  #{tag}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Category and Language in grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Category
          </label>
          <select
            id="category"
            value={value.category || ""}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900 text-sm"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Language
          </label>
          <select
            id="language"
            value={value.language || "en"}
            onChange={(e) => handleChange("language", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900 text-sm"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={value.allowComments ?? true}
            onChange={(e) => handleChange("allowComments", e.target.checked)}
            className="w-4 h-4 text-black rounded focus:ring-2 focus:ring-black"
          />
          <span className="text-sm text-gray-900 group-hover:text-gray-600">
            Allow comments
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={value.addToPlaylist ?? false}
            onChange={(e) => handleChange("addToPlaylist", e.target.checked)}
            className="w-4 h-4 text-black rounded focus:ring-2 focus:ring-black"
          />
          <span className="text-sm text-gray-900 group-hover:text-gray-600">
            Add to playlist
          </span>
        </label>
      </div>
    </div>
  );
}
