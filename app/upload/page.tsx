"use client";

import {useState} from "react";
import UploadDropzone from "@/components/upload/UploadDropzone";
import UploadModal from "@/components/upload/UploadModal";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFile(null);
  };

  const handleComplete = (videoId: string) => {
    console.log("Video uploaded:", videoId);
    setModalOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 text-gray-900">
            Upload Your Videos
          </h1>
          <p className="text-gray-600">
            Drag and drop your video files or click to browse. Your videos will
            be saved to your personal library.
          </p>
        </div>

        <UploadDropzone
          onFilesSelected={handleFilesSelected}
          accept="video/*"
          maxSizeBytes={5 * 1024 * 1024 * 1024} // 5GB
        />
      </div>

      <UploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        videoFile={selectedFile}
        onCancel={handleModalClose}
        onComplete={handleComplete}
      />
    </div>
  );
}
