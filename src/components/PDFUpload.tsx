
import { forwardRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PDFFile {
  id: string;
  name: string;
  url: string;
  file: File;
}

interface PDFUploadProps {
  onFilesChange: (files: PDFFile[]) => void;
  uploadedFiles: PDFFile[];
}

export const PDFUpload = forwardRef<HTMLInputElement, PDFUploadProps>(
  ({ onFilesChange, uploadedFiles }, ref) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        file
      }));
      
      onFilesChange([...uploadedFiles, ...newFiles]);
    }, [uploadedFiles, onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf']
      },
      multiple: true
    });

    return (
      <input
        {...getInputProps()}
        ref={ref}
        style={{ display: 'none' }}
      />
    );
  }
);

PDFUpload.displayName = 'PDFUpload';
