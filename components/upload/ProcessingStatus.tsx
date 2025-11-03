"use client";

import {FiLoader, FiCheckCircle, FiAlertCircle} from "react-icons/fi";

interface ProcessingStatusProps {
  status: "idle" | "uploading" | "queued" | "processing" | "ready" | "error";
  uploadProgress: number;
  error?: string | null;
  onRetry?: () => void;
}

export default function ProcessingStatus({
  status,
  uploadProgress,
  error,
  onRetry,
}: ProcessingStatusProps) {
  if (status === "idle") return null;

  return (
    <div className="p-4 rounded-lg border" aria-live="polite">
      {status === "uploading" && (
        <div className="flex items-center gap-3">
          <FiLoader className="animate-spin text-blue-600" size={24} />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              Đang tải lên...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(uploadProgress)}% hoàn thành
            </p>
          </div>
        </div>
      )}

      {status === "queued" && (
        <div className="flex items-center gap-3">
          <FiLoader className="animate-spin text-yellow-600" size={24} />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Đang chờ xử lý...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Video của bạn đang trong hàng đợi
            </p>
          </div>
        </div>
      )}

      {status === "processing" && (
        <div className="flex items-center gap-3">
          <FiLoader className="animate-spin text-blue-600" size={24} />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Đang xử lý video...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quá trình này có thể mất vài phút
            </p>
          </div>
        </div>
      )}

      {status === "ready" && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <FiCheckCircle className="text-green-600" size={24} />
          <div>
            <p className="font-medium text-green-900 dark:text-green-300">
              ✅ Sẵn sàng xuất bản
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Video của bạn đã được xử lý thành công
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="font-medium text-red-900 dark:text-red-300">
                ⚠️ Có lỗi xảy ra
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                {error || "Không thể xử lý video"}
              </p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Thử lại
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
