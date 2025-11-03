import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

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

export function validateVideoFile(
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024 * 1024
): {valid: boolean; error?: string} {
  // Check file type
  if (!file.type.startsWith("video/")) {
    return {valid: false, error: "File phải là video"};
  }

  // Check file size (default 5GB)
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File vượt quá ${formatFileSize(maxSizeBytes)}`,
    };
  }

  return {valid: true};
}
