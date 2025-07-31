import React, { useCallback } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { FileUpload } from '../types';

interface FileUploadAreaProps {
  onFileUpload: (files: FileUpload[]) => void;
  onClose: () => void;
  uploadedFiles: FileUpload[];
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFileUpload,
  onClose,
  uploadedFiles
}) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const fileUploads: FileUpload[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    onFileUpload(fileUploads);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-purple-400" />;
    if (type.includes('text') || type.includes('document')) return <FileText className="h-8 w-8 text-green-400" />;
    return <File className="h-8 w-8 text-cyan-400" />;
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 font-mono">Upload Files</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-400 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-cyan-400/30 rounded-xl p-8 text-center hover:border-cyan-400/50 transition-colors duration-300"
      >
        <Upload className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-2">Drag and drop files here, or</p>
        <label className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 rounded-lg cursor-pointer hover:bg-cyan-500/30 transition-all duration-200">
          <span className="text-cyan-400 font-mono">Browse Files</span>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            accept=".pdf,.docx,.txt,.jpg,.png,.gif,.mp4,.zip"
          />
        </label>
        <p className="text-xs text-gray-500 mt-3 font-mono">
          Supports: PDF, DOCX, TXT, JPG, PNG, GIF, MP4, ZIP
        </p>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 font-mono">Uploaded Files:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-900/50 border border-gray-600/50 rounded-lg">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate font-mono">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;