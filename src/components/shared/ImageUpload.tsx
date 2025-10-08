import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CloudUpload,
  FileImage,
  CheckCircle
} from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => Promise<void>;
  currentImage?: string;
  onRemoveImage?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  onRemoveImage,
  accept = 'image/*',
  maxSize = 5,
  className = '',
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Please select an image file'
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: `File size must be less than ${maxSize}MB`
      });
      return;
    }

    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null
      });

      // Simulate progress for demo purposes
      const progressInterval = setInterval(() => {
        setUploadState(prev => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 200);

      await onImageUpload(file);
      
      clearInterval(progressInterval);
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset progress after a delay
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, progress: 0 }));
      }, 1000);

    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  }, [onImageUpload, maxSize]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      fileInputRef.current.files = event.dataTransfer.files;
      handleFileSelect({ target: { files: event.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {currentImage ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <img
                src={currentImage}
                alt="Current profile"
                className="w-full h-full object-cover"
              />
              {onRemoveImage && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={onRemoveImage}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Image uploaded</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-cyan-500/50 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center">
            {uploadState.isUploading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CloudUpload className="h-8 w-8 text-cyan-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Uploading image...</p>
                  <Progress value={uploadState.progress} className="mt-2 max-w-xs mx-auto" />
                  <p className="text-xs text-gray-400 mt-1">{uploadState.progress}%</p>
                </div>
              </div>
            ) : uploadState.error ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center">
                    <X className="h-8 w-8 text-red-500" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-400">Upload failed</p>
                  <p className="text-xs text-gray-400 mt-1">{uploadState.error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-cyan-900/20 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-cyan-500" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Upload an image</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click to browse or drag and drop
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Max {maxSize}MB
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {accept}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p>Supported formats: JPG, PNG, WebP</p>
        <p>Maximum file size: {maxSize}MB</p>
        <p>Recommended size: 400x400 pixels</p>
      </div>
    </div>
  );
};

export default ImageUpload;