import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  selectedFileName?: string;
}

export function FileUpload({ onFileSelect, accept = 'image/png,image/jpeg,image/jpg', selectedFileName }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.match(/image\/(png|jpeg|jpg)/)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group ${
        isDragging
          ? 'border-orange-400 bg-orange-500/10 scale-105'
          : 'border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800/50'
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
        <motion.div
          animate={{
            scale: isDragging ? 1.2 : 1,
            rotate: isDragging ? 5 : 0,
          }}
          transition={{ duration: 0.2 }}
          className={`p-4 rounded-full ${
            isDragging ? 'bg-orange-500/20' : 'bg-zinc-800/50 group-hover:bg-zinc-700/50'
          }`}
        >
          {selectedFileName ? (
            <ImageIcon className="w-8 h-8 text-orange-400" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-400 transition-colors" />
          )}
        </motion.div>

        <div className="text-center">
          {selectedFileName ? (
            <>
              <p className="text-orange-400 font-medium mb-1">{selectedFileName}</p>
              <p className="text-sm text-gray-500">Click or drag to change</p>
            </>
          ) : (
            <>
              <p className="text-gray-300 font-medium mb-1">
                {isDragging ? 'Drop image here' : 'Drop image here or click to browse'}
              </p>
              <p className="text-sm text-gray-500">PNG or JPG (max 10MB)</p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}