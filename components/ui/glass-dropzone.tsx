'use client';

import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './glass-card';

interface GlassDropzoneProps {
  onDrop: (files: File[]) => void;
  accept?: string[];
  maxSize?: number;
  className?: string;
  error?: string;
  isLoading?: boolean;
}

export function GlassDropzone({ 
  onDrop, 
  accept = ['.pptx'], 
  maxSize = 5 * 1024 * 1024, // 5MB로 임시 제한
  className,
  error,
  isLoading 
}: GlassDropzoneProps) {
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

  const variants = {
    idle: {
      scale: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    active: {
      scale: 1.02,
      borderColor: 'rgba(99, 102, 241, 0.5)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    reject: {
      scale: 0.98,
      borderColor: 'rgba(239, 68, 68, 0.5)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
  };

  const currentVariant = isDragReject ? 'reject' : isDragActive ? 'active' : 'idle';

  return (
    <motion.div
      {...getRootProps()}
      className={cn('cursor-pointer', className)}
      variants={variants}
      animate={currentVariant}
      transition={{ duration: 0.2 }}
    >
      <input {...getInputProps()} />
      
      <GlassCard className="p-12 text-center border-2 border-dashed" variant="subtle">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <>
              <motion.div
                className="mx-auto w-16 h-16 border-4 border-white/20 border-t-indigo-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-white/80">파일을 처리하는 중...</p>
            </>
          ) : (
            <>
              <motion.div
                className="mx-auto w-16 h-16 flex items-center justify-center"
                animate={{ 
                  y: isDragActive ? -5 : 0,
                  scale: isDragActive ? 1.1 : 1 
                }}
                transition={{ duration: 0.2 }}
              >
                {isDragReject ? (
                  <AlertCircle className="w-12 h-12 text-red-400" />
                ) : acceptedFiles.length > 0 ? (
                  <FileText className="w-12 h-12 text-green-400" />
                ) : (
                  <Upload className="w-12 h-12 text-indigo-400" />
                )}
              </motion.div>

              <div className="space-y-2">
                {isDragActive ? (
                  <p className="text-lg font-medium text-white">
                    {isDragReject ? '지원하지 않는 파일입니다' : '파일을 놓으세요'}
                  </p>
                ) : acceptedFiles.length > 0 ? (
                  <div>
                    <p className="text-lg font-medium text-green-400">
                      파일 선택됨
                    </p>
                    <p className="text-sm text-white/60">
                      {acceptedFiles[0].name}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-white">
                      PowerPoint 파일을 업로드하세요
                    </p>
                    <p className="text-sm text-white/60">
                      파일을 끌어다 놓거나 클릭하여 선택
                    </p>
                  </div>
                )}

                <p className="text-xs text-white/50">
                  .pptx 파일만 지원 (최대 5MB)
                </p>
              </div>
            </>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-400/30"
            >
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}