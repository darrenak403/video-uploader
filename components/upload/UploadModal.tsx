"use client";

import {useState, useEffect, useRef} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {useUploadProgress, useAutosave, VideoMetadata} from "@/lib/hooks";
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

  // Use refs to track if we've already processed these to prevent infinite loops
  const draftCheckedRef = useRef(false);
  const videoFileRef = useRef<File | null>(null);

  // Load draft on mount - only run once when modal opens
  useEffect(() => {
    if (open && !draftCheckedRef.current) {
      draftCheckedRef.current = true;
      if (hasDraft()) {
        const draft = loadDraft();
        if (draft && confirm("Bạn có muốn khôi phục bản nháp?")) {
          setMetadata(draft);
        }
      }
    }
    if (!open) {
      draftCheckedRef.current = false;
    }
  }, [open, hasDraft, loadDraft]);

  // Create object URL for video preview - only run when videoFile actually changes
  useEffect(() => {
    if (videoFile && videoFile !== videoFileRef.current) {
      videoFileRef.current = videoFile;
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);

      // Start upload simulation
      uploadState.startUpload(videoFile);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
    if (!videoFile && videoFileRef.current) {
      videoFileRef.current = null;
      setVideoUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <DialogContent className="max-w-[1000px] w-[92vw] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Upload Video
            </DialogTitle>
          </div>

          {/* Draft notification */}
          {hasDraft() && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <p className="text-sm text-blue-700">
                We found a saved draft for this video.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const draft = loadDraft();
                    if (draft) setMetadata(draft);
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Restore Draft
                </button>
                <button
                  onClick={clearDraft}
                  className="px-3 py-1 bg-black text-white text-xs font-medium rounded hover:bg-gray-800"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Steps Navigation */}
          <div className="flex items-center gap-4 border-b border-gray-200">
            <button
              onClick={() => setCurrentStep(STEPS.DETAILS)}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                currentStep === STEPS.DETAILS
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white text-xs mr-2">
                1
              </span>
              Details
            </button>
            <button
              onClick={() =>
                currentStep > STEPS.DETAILS && setCurrentStep(STEPS.ELEMENTS)
              }
              disabled={currentStep < STEPS.ELEMENTS}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                currentStep === STEPS.ELEMENTS
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 ${
                  currentStep >= STEPS.ELEMENTS
                    ? "bg-black text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </span>
              Video Elements
            </button>
            <button
              onClick={() =>
                currentStep > STEPS.ELEMENTS && setCurrentStep(STEPS.CHECKS)
              }
              disabled={currentStep < STEPS.CHECKS}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                currentStep === STEPS.CHECKS
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 ${
                  currentStep >= STEPS.CHECKS
                    ? "bg-black text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </span>
              Checks
            </button>
            <button
              onClick={() =>
                currentStep > STEPS.CHECKS && setCurrentStep(STEPS.VISIBILITY)
              }
              disabled={currentStep < STEPS.VISIBILITY}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                currentStep === STEPS.VISIBILITY
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 ${
                  currentStep >= STEPS.VISIBILITY
                    ? "bg-black text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                4
              </span>
              Visibility
            </button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Video Preview - Left */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <VideoPreviewPlayer
                    videoUrl={videoUrl}
                    trimStart={metadata.trimStart}
                    trimEnd={metadata.trimEnd}
                    onTimeUpdate={(time) => setVideoDuration(time)}
                  />
                  <div className="mt-3 px-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Video Preview
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4 •{" "}
                      {videoFile
                        ? (videoFile.size / (1024 * 1024)).toFixed(2)
                        : 0}{" "}
                      MB • 5:03
                    </p>
                  </div>
                </div>

                {/* Processing Status */}
                <ProcessingStatus
                  status={uploadState.processingStatus}
                  uploadProgress={uploadState.uploadProgress}
                  error={uploadState.error}
                  onRetry={uploadState.retryUpload}
                />
              </div>

              {/* Form - Right */}
              <div className="bg-white rounded-lg shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -20}}
                    transition={{duration: 0.2}}
                    className="p-6"
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Final Checks
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <span className="text-xl">✅</span>
                            <span className="text-gray-700">
                              Title and description are complete
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <span className="text-xl">✅</span>
                            <span className="text-gray-700">
                              Thumbnail has been selected
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <span className="text-xl">✅</span>
                            <span className="text-gray-700">
                              No copyright violations detected
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <span className="text-xl">✅</span>
                            <span className="text-gray-700">
                              Content is suitable for all audiences
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
        <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Save Draft
            </button>

            <div className="flex gap-3">
              {canBack && (
                <button
                  onClick={handleBack}
                  className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}

              {canNext ? (
                <button
                  onClick={handleNext}
                  disabled={currentStep === STEPS.DETAILS && !metadata.title}
                  className="px-6 py-2 bg-black text-white rounded-md font-medium text-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={!canPublish}
                  className="px-6 py-2 bg-black text-white rounded-md font-medium text-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
