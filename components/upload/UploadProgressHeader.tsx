"use client";

import {cn} from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  labelVi: string;
}

const STEPS: Step[] = [
  {id: 1, label: "Details", labelVi: "Chi tiết"},
  {id: 2, label: "Elements", labelVi: "Yếu tố"},
  {id: 3, label: "Checks", labelVi: "Kiểm tra"},
  {id: 4, label: "Visibility", labelVi: "Hiển thị"},
];

interface UploadProgressHeaderProps {
  currentStep: number;
  uploadProgress: number;
  isUploading: boolean;
}

export default function UploadProgressHeader({
  currentStep,
  uploadProgress,
  isUploading,
}: UploadProgressHeaderProps) {
  return (
    <div className="w-full">
      {/* Steps */}
      <div className="flex items-center justify-between px-8 py-4">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  currentStep === step.id
                    ? "bg-blue-600 text-white"
                    : currentStep > step.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  "ml-3 text-sm font-medium hidden sm:inline",
                  currentStep === step.id
                    ? "text-blue-600 dark:text-blue-400"
                    : currentStep > step.id
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {step.labelVi}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors",
                  currentStep > step.id
                    ? "bg-green-600"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            isUploading
              ? "bg-blue-600"
              : uploadProgress === 100
              ? "bg-green-600"
              : "bg-blue-600"
          )}
          style={{width: `${uploadProgress}%`}}
        />
      </div>

      {/* Upload percentage */}
      {isUploading && uploadProgress < 100 && (
        <div className="px-8 py-2 text-xs text-gray-600 dark:text-gray-400">
          Đang tải lên... {Math.round(uploadProgress)}%
        </div>
      )}
    </div>
  );
}
