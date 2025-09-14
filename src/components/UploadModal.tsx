import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Upload, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onCameraCapture?: () => void;
  onStartAnalysis: (file: File) => void;
  title?: string;
  description?: string;
}

export function UploadModal({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  onCameraCapture,
  onStartAnalysis,
  title = "Upload Image",
  description = "Select a image file containing cattle or buffalo for breed identification analysis"
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['JPG', 'JPEG', 'PNG', 'WEBP', 'HEIC', 'BMP'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      toast.error('Unsupported file format. Please use JPG, PNG, WEBP, HEIC, or BMP.');
      return;
    }

    // Check file size
    if (file.size > maxFileSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartAnalysis = () => {
    if (selectedFile) {
      onStartAnalysis(selectedFile);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-green-500/30 text-white max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-black" />
            </div>
            <div>
              <DialogTitle className="text-white">{title}</DialogTitle>
              <DialogDescription className="text-gray-300">
                {description}
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 pt-4">

          {/* Drag and Drop Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${isDragOver 
                ? 'border-green-400 bg-green-500/10' 
                : selectedFile 
                  ? 'border-green-400 bg-green-500/10'
                  : 'border-green-500/50 bg-gray-900/50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-black" />
              </div>
              
              {selectedFile ? (
                <div>
                  <p className="text-green-400 font-medium">File Selected</p>
                  <p className="text-sm text-gray-300">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium mb-2">Drop your image here</p>
                  <p className="text-sm text-gray-400 mb-1">
                    JPG, PNG, WEBP, HEIC, BMP • Max 10 MB
                  </p>
                  <button
                    onClick={handleBrowseClick}
                    className="text-green-400 bg-transparent border-none hover:text-green-300 underline text-sm"
                  >
                    or click to browse
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.heic,.bmp"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Supported Formats */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span className="text-sm text-gray-400">Supported formats</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {supportedFormats.map((format) => (
                <Badge 
                  key={format} 
                  variant="secondary" 
                  className="bg-green-500/20 text-green-400 border-green-500/30"
                >
                  {format}
                </Badge>
              ))}
            </div>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Camera Capture Button */}
          {onCameraCapture && (
            <Button
              onClick={onCameraCapture}
              variant="outline"
              className="w-full bg-black border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture from Camera
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 bg-black border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartAnalysis}
              disabled={!selectedFile}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}