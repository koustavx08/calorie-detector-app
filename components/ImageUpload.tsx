"use client"

import type React from "react"

import { Camera, Upload } from "lucide-react"

interface ImageUploadProps {
  onFileSelect: (file: File) => void
  onCameraClick: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

export default function ImageUpload({ onFileSelect, onCameraClick, fileInputRef }: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="glass-card p-8 text-center">
      <div
        className="border-2 border-dashed border-white/30 rounded-xl p-12 transition-all duration-300 hover:border-white/50 hover:bg-white/5"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="space-y-6">
          <div className="flex justify-center space-x-4">
            <button onClick={onCameraClick} className="btn-primary flex items-center gap-2">
              <Camera size={20} />
              Take Photo
            </button>

            <button onClick={() => fileInputRef.current?.click()} className="btn-primary flex items-center gap-2">
              <Upload size={20} />
              Upload Image
            </button>
          </div>

          <p className="text-white/70">Or drag and drop an image here</p>

          <p className="text-sm text-white/50">Supports JPG, PNG, and WebP formats</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
