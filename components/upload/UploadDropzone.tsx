"use client";

import {useRef, useState, DragEvent} from "react";
import {FiUploadCloud, FiVideo} from "react-icons/fi";
import {validateVideoFile} from "@/lib/utils";
import {Button} from "../ui/button";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSizeBytes?: number;
}

export default function UploadDropzone({
  onFilesSelected,
  accept = "video/*",
  maxSizeBytes = 5 * 1024 * 1024 * 1024, // 5GB default
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const validation = validateVideoFile(file, maxSizeBytes);

    if (!validation.valid) {
      setError(validation.error || "File không hợp lệ");
      return;
    }

    onFilesSelected([file]);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-16 text-center h-[420px]
          transition-all duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          }
          ${error ? "border-red-500" : ""}
          hover:border-gray-400
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop video here or click to select file"
        onKeyDown={handleKeyDown}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          aria-label="Select video file"
        />

        <div className="flex flex-col items-center justify-start w-full h-full gap-6">
          {isDragging ? (
            <FiVideo className="w-12 h-12 text-blue-500 animate-bounce" />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
              <FiUploadCloud className="w-7 h-7 text-gray-500" />
            </div>
          )}
          {/* Title drop zone */}
          <div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              {isDragging ? "Drop your videos here" : "Drop your videos here"}
            </p>
            <p className="text-sm text-gray-500">
              Or click to browse your files
            </p>
          </div>

          {/* Button */}
          <Button
            type="button"
            size={"lg"}
            className={`w-48 h-12 bg-black text-white rounded-md font-medium text-sm ${
              isDragging ? "cursor-progress" : "cursor-pointer"
            }`}
            onClick={handleButtonClick}
          >
            <p className="">Choose Videos</p>
          </Button>

          {/* Footer dropzone:  File type and size information */}
          <div>
            <p className="text-xs text-gray-500 mt-1">
              Supports MP4, MOV, AVI. Max file size: 5GB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
