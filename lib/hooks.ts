import {useState, useCallback} from "react";

// Types
export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  language: string;
  allowComments: boolean;
  addToPlaylist: boolean;
  visibility: "public" | "unlisted" | "private";
  scheduledAt?: string;
  thumbnailIndex: number;
  customThumbnail?: File;
  trimStart?: number;
  trimEnd?: number;
}

export interface UploadState {
  uploadProgress: number;
  processingStatus:
    | "idle"
    | "uploading"
    | "queued"
    | "processing"
    | "ready"
    | "error";
  uploadId: string | null;
  videoId: string | null;
  error: string | null;
}

// Autosave hook
export function useAutosave(key: string) {
  const saveDraft = useCallback(
    (metadata: Partial<VideoMetadata>) => {
      if (typeof window === "undefined") return false;
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            ...metadata,
            savedAt: new Date().toISOString(),
          })
        );
        return true;
      } catch (error) {
        console.error("Failed to save draft:", error);
        return false;
      }
    },
    [key]
  );

  const loadDraft = useCallback(():
    | (Partial<VideoMetadata> & {savedAt?: string})
    | null => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }, [key]);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Failed to clear draft:", error);
      return false;
    }
  }, [key]);

  const hasDraft = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }, [key]);

  return {saveDraft, loadDraft, clearDraft, hasDraft};
}

// Upload progress hook (mock)
export function useUploadProgress() {
  const [state, setState] = useState<UploadState>({
    uploadProgress: 0,
    processingStatus: "idle",
    uploadId: null,
    videoId: null,
    error: null,
  });

  const startUpload = useCallback((_file: File) => {
    const uploadId = `upload_${Date.now()}`;
    setState({
      uploadProgress: 0,
      processingStatus: "uploading",
      uploadId,
      videoId: null,
      error: null,
    });

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Simulate processing stages
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            uploadProgress: 100,
            processingStatus: "queued",
            videoId: `video_${Date.now()}`,
          }));

          setTimeout(() => {
            setState((prev) => ({...prev, processingStatus: "processing"}));

            setTimeout(() => {
              setState((prev) => ({...prev, processingStatus: "ready"}));
            }, 3000);
          }, 2000);
        }, 500);
      }

      setState((prev) => ({...prev, uploadProgress: Math.min(progress, 100)}));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const retryUpload = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      processingStatus: "uploading",
      uploadProgress: 0,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      uploadProgress: 0,
      processingStatus: "idle",
      uploadId: null,
      videoId: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startUpload,
    retryUpload,
    reset,
  };
}
