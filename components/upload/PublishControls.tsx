/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {VideoMetadata} from "@/lib/hooks";

interface PublishControlsProps {
  value: Partial<VideoMetadata>;
  onChange: (metadata: Partial<VideoMetadata>) => void;
  canPublish: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
}

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Công khai",
    description: "Mọi người đều có thể xem",
  },
  {
    value: "unlisted",
    label: "Không công khai",
    description: "Chỉ người có link mới xem được",
  },
  {
    value: "private",
    label: "Riêng tư",
    description: "Chỉ bạn có thể xem",
  },
] as const;

export default function PublishControls({
  value,
  onChange,
  canPublish,
  onPublish,
  onSaveDraft,
}: PublishControlsProps) {
  return (
    <div className="space-y-6">
      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Chế độ hiển thị
        </label>
        <div className="space-y-3">
          {VISIBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={value.visibility === option.value}
                onChange={(e) =>
                  onChange({...value, visibility: e.target.value as any})
                }
                className="mt-1 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <label
          htmlFor="scheduledAt"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Lên lịch xuất bản (tùy chọn)
        </label>
        <input
          id="scheduledAt"
          type="datetime-local"
          value={value.scheduledAt || ""}
          onChange={(e) => onChange({...value, scheduledAt: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          min={new Date().toISOString().slice(0, 16)}
        />
        <p className="mt-2 text-xs text-gray-500">
          💡 Để trống để xuất bản ngay lập tức
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          💾 Lưu nháp
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={!canPublish}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {value.scheduledAt ? "📅 Lên lịch" : "🚀 Xuất bản"}
        </button>
      </div>

      {!canPublish && (
        <p className="text-xs text-amber-600 text-center">
          ⚠️ Vui lòng hoàn thành xử lý video trước khi xuất bản
        </p>
      )}
    </div>
  );
}
