'use client';

import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  accept?: string[];
  maxSize?: number;
  className?: string;
  error?: string;
  isLoading?: boolean;
}

export function Dropzone({ 
  onDrop, 
  accept = ['.pptx'], 
  maxSize = 5 * 1024 * 1024,
  className,
  error,
  isLoading 
}: DropzoneProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': accept,
    },
    maxSize,
    multiple: false,
  });

  return (
    <motion.div
      {...getRootProps()}
      className={cn('cursor-pointer', className)}
      whileHover={{ scale: isDragActive ? 1 : 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <input {...getInputProps()} />
      
      <Card className={cn(
        'p-12 border-2 border-dashed transition-all duration-200',
        isDragActive && !isDragReject && 'border-blue-400 bg-blue-50',
        isDragReject && 'border-red-400 bg-red-50',
        !isDragActive && 'hover:border-gray-300 hover:bg-gray-50'
      )}>
        <div className="text-center space-y-4">
          {isLoading ? (
            <>
              <motion.div
                className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-gray-600">파일을 처리하는 중...</p>
            </>
          ) : (
            <>
              <motion.div
                className="mx-auto w-12 h-12 flex items-center justify-center"
                animate={{ 
                  y: isDragActive ? -2 : 0,
                  scale: isDragActive ? 1.1 : 1 
                }}
                transition={{ duration: 0.2 }}
              >
                {isDragReject ? (
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                ) : acceptedFiles.length > 0 ? (
                  <FileText className="w-8 h-8 text-green-600" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </motion.div>

              <div className="space-y-2">
                {isDragActive ? (
                  <p className="text-lg font-medium text-gray-900">
                    {isDragReject ? '지원하지 않는 파일입니다' : '파일을 놓으세요'}
                  </p>
                ) : acceptedFiles.length > 0 ? (
                  <div>
                    <p className="text-lg font-medium text-green-600">
                      파일 선택됨
                    </p>
                    <p className="text-sm text-gray-500">
                      {acceptedFiles[0].name}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      PowerPoint 파일을 업로드하세요
                    </p>
                    <p className="text-sm text-gray-500">
                      파일을 끌어다 놓거나 클릭하여 선택
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  .pptx 파일만 지원 (최대 5MB)
                </p>
              </div>
            </>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}