"use client";

import {useState, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {useUploadProgress, useAutosave, VideoMetadata} from "@/lib/hooks";
import UploadProgressHeader from "./UploadProgressHeader";
import VideoPreviewPlayer from "./VideoPreviewPlayer";
import MetadataForm from "./MetadataForm";
import ThumbnailSelector from "./ThumbnailSelector";
import TrimTool from "./TrimTool";
import ProcessingStatus from "./ProcessingStatus";
import PublishControls from "./PublishControls";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoFile?: File | null;
  onCancel?: () => void;
  onComplete?: (videoId: string) => void;
}

const STEPS = {
  DETAILS: 1,
  ELEMENTS: 2,
  CHECKS: 3,
  VISIBILITY: 4,
};

export default function UploadModal({
  open,
  onOpenChange,
  videoFile,
  onCancel,
  onComplete,
}: UploadModalProps) {
  const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [metadata, setMetadata] = useState<Partial<VideoMetadata>>({
    title: "",
    description: "",
    tags: [],
    category: "",
    language: "vi",
    allowComments: true,
    addToPlaylist: false,
    visibility: "public",
    thumbnailIndex: 0,
    trimStart: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {saveDraft, loadDraft, clearDraft, hasDraft} =
    useAutosave("video-upload-draft");
  const uploadState = useUploadProgress();

  // Load draft on mount
  useEffect(() => {
    if (open && hasDraft()) {
      const draft = loadDraft();
      if (draft && confirm("Bạn có muốn khôi phục bản nháp?")) {
        setMetadata(draft);
      }
    }
  }, [open, hasDraft, loadDraft]);

  // Create object URL for video preview
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);

      // Start upload simulation
      uploadState.startUpload(videoFile);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoFile]);

  // Autosave
  useEffect(() => {
    if (open && metadata.title) {
      const timer = setTimeout(() => {
        saveDraft(metadata);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [metadata, open, saveDraft]);

  const handleClose = () => {
    if (
      uploadState.processingStatus === "uploading" &&
      uploadState.uploadProgress < 100
    ) {
      if (
        !confirm(
          "Video đang tải lên. Bạn có chắc muốn đóng? Tiến trình sẽ bị hủy."
        )
      ) {
        return;
      }
    }

    if (metadata.title && confirm("Lưu nháp trước khi đóng?")) {
      saveDraft(metadata);
    }

    onOpenChange(false);
    onCancel?.();
    uploadState.reset();
    setCurrentStep(STEPS.DETAILS);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === STEPS.DETAILS) {
      if (!metadata.title || metadata.title.trim().length === 0) {
        newErrors.title = "Tiêu đề không được để trống";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.VISIBILITY));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, STEPS.DETAILS));
  };

  const handlePublish = () => {
    if (uploadState.processingStatus !== "ready") {
      alert("Vui lòng chờ video xử lý xong!");
      return;
    }

    clearDraft();
    onComplete?.(uploadState.videoId || "mock-video-id");
    onOpenChange(false);
    uploadState.reset();
  };

  const handleSaveDraft = () => {
    saveDraft(metadata);
    alert("✅ Đã lưu bản nháp!");
  };

  const handleMetadataChange = (newMetadata: Partial<VideoMetadata>) => {
    setMetadata(newMetadata);
  };

  const handleTrimChange = (start: number, end: number) => {
    setMetadata((prev) => ({...prev, trimStart: start, trimEnd: end}));
  };

  const canPublish = uploadState.processingStatus === "ready";
  const canNext = currentStep < STEPS.VISIBILITY;
  const canBack = currentStep > STEPS.DETAILS;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1200px] w-[92vw] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Tải video lên
            </DialogTitle>
          </div>

          <UploadProgressHeader
            currentStep={currentStep}
            uploadProgress={uploadState.uploadProgress}
            isUploading={uploadState.processingStatus === "uploading"}
          />
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Video Preview - Left */}
              <div className="lg:col-span-7">
                <VideoPreviewPlayer
                  videoUrl={videoUrl}
                  trimStart={metadata.trimStart}
                  trimEnd={metadata.trimEnd}
                  onTimeUpdate={(time) => setVideoDuration(time)}
                />

                {/* Processing Status */}
                <div className="mt-4">
                  <ProcessingStatus
                    status={uploadState.processingStatus}
                    uploadProgress={uploadState.uploadProgress}
                    error={uploadState.error}
                    onRetry={uploadState.retryUpload}
                  />
                </div>
              </div>

              {/* Form - Right */}
              <div className="lg:col-span-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -20}}
                    transition={{duration: 0.2}}
                  >
                    {currentStep === STEPS.DETAILS && (
                      <MetadataForm
                        value={metadata}
                        onChange={handleMetadataChange}
                        errors={errors}
                      />
                    )}

                    {currentStep === STEPS.ELEMENTS && (
                      <div className="space-y-6">
                        <ThumbnailSelector
                          selectedIndex={metadata.thumbnailIndex || 0}
                          onSelect={(index) =>
                            setMetadata((prev) => ({
                              ...prev,
                              thumbnailIndex: index,
                            }))
                          }
                          onCustomUpload={(file) =>
                            setMetadata((prev) => ({
                              ...prev,
                              customThumbnail: file,
                            }))
                          }
                        />

                        <TrimTool
                          duration={videoDuration || 120}
                          trimStart={metadata.trimStart}
                          trimEnd={metadata.trimEnd}
                          onTrimChange={handleTrimChange}
                        />
                      </div>
                    )}

                    {currentStep === STEPS.CHECKS && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Kiểm tra cuối cùng
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">✅</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Tiêu đề và mô tả đã đầy đủ
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">✅</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Hình thu nhỏ đã được chọn
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">✅</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Video không vi phạm bản quyền
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">✅</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Nội dung phù hợp với mọi lứa tuổi
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === STEPS.VISIBILITY && (
                      <PublishControls
                        value={metadata}
                        onChange={handleMetadataChange}
                        canPublish={canPublish}
                        onPublish={handlePublish}
                        onSaveDraft={handleSaveDraft}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              💾 Lưu nháp
            </button>

            <div className="flex gap-3">
              {canBack && (
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  ← Quay lại
                </button>
              )}

              {canNext ? (
                <button
                  onClick={handleNext}
                  disabled={currentStep === STEPS.DETAILS && !metadata.title}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Tiếp theo →
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={!canPublish}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  🚀 Xuất bản
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
