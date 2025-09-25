import { useState } from 'react';
import { Upload, X, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export const FileUpload = ({ onFilesChange, maxFiles = 3 }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles = [...files, ...selectedFiles].slice(0, maxFiles);
    
    setFiles(newFiles);
    onFilesChange(newFiles);

    // Generate previews
    const newPreviews = [...previews];
    selectedFiles.forEach((file, index) => {
      if (files.length + index < maxFiles) {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews[files.length + index] = reader.result as string;
          setPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={files.length >= maxFiles}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {files.length >= maxFiles 
              ? `Maximum ${maxFiles} files selected`
              : `Click to upload photos/videos (${files.length}/${maxFiles})`
            }
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-accent">
                {file.type.startsWith('image/') ? (
                  <>
                    <Image className="w-4 h-4 absolute top-2 left-2 text-white bg-black/50 rounded p-0.5" />
                    {previews[index] && (
                      <img 
                        src={previews[index]} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};