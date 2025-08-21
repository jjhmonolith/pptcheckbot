'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Download, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { Progress } from '@/components/ui/progress';
import apiClient, { type CheckResponse, type ErrorItem } from '@/lib/api/client';

// 업로드 단계 컴포넌트
interface UploadStepProps {
  onFileUpload: (files: File[]) => void;
  onStartCheck: () => void;
  uploadedFile: File | null;
  uploadError: string;
}

export function UploadStep({ onFileUpload, onStartCheck, uploadedFile, uploadError }: UploadStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          PowerPoint 파일 업로드
        </h2>
        <p className="text-gray-600">
          맞춤법 검사를 진행할 PPT 파일을 선택해주세요
        </p>
      </div>

      <Dropzone
        onDrop={onFileUpload}
        accept={['.pptx']}
        error={uploadError}
      />

      {uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{uploadedFile.name}</h3>
                <p className="text-sm text-gray-500">
                  크기: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button onClick={onStartCheck} size="lg">
              맞춤법 검사 시작
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// 처리 중 단계 컴포넌트
interface ProcessingStepProps {
  fileName: string;
}

export function ProcessingStep({ fileName }: ProcessingStepProps) {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('파일 분석 중...');

  // 가짜 진행률 시뮬레이션
  useState(() => {
    const tasks = [
      '파일 분석 중...',
      '텍스트 추출 중...',
      'AI 맞춤법 검사 중...',
      '결과 생성 중...'
    ];
    
    let currentProgress = 0;
    let taskIndex = 0;
    
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      
      setProgress(currentProgress);
      
      const newTaskIndex = Math.floor((currentProgress / 100) * tasks.length);
      if (newTaskIndex < tasks.length && newTaskIndex !== taskIndex) {
        taskIndex = newTaskIndex;
        setCurrentTask(tasks[taskIndex]);
      }
    }, 300);
    
    return () => clearInterval(interval);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          분석 진행 중
        </h2>
        <p className="text-gray-600">
          {fileName}를 처리하고 있습니다...
        </p>
      </div>

      <Card className="p-8">
        <div className="text-center space-y-6">
          <motion.div
            className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <RotateCcw className="w-8 h-8 text-blue-600" />
          </motion.div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentTask}
            </h3>

            <Progress 
              value={progress} 
              showPercentage 
              className="max-w-sm mx-auto"
              size="lg"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600">
              잠시만 기다려주세요. 파일 크기에 따라 시간이 소요될 수 있습니다.
            </p>
            <p className="text-xs text-gray-400">
              평균 처리 시간: 30초 ~ 2분
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// 결과 단계 컴포넌트
interface ResultsStepProps {
  results: CheckResponse | null;
  fileId: string;
}

export function ResultsStep({ results, fileId }: ResultsStepProps) {
  const [selectedErrors, setSelectedErrors] = useState<number[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string>('');

  // 초기 선택된 오류들
  useState(() => {
    if (results?.errors) {
      setSelectedErrors(
        results.errors
          .map((_, index) => index)
          .filter((_, index) => results.errors[index].selected)
      );
    }
  });

  const toggleError = (index: number) => {
    setSelectedErrors(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAll = () => {
    setSelectedErrors(results?.errors?.map((_, index) => index) || []);
  };

  const deselectAll = () => {
    setSelectedErrors([]);
  };

  const handleApplyCorrections = async () => {
    if (!fileId || selectedErrors.length === 0) return;
    
    setIsApplying(true);
    setError('');
    
    try {
      const response = await apiClient.applyCorrections({
        file_id: fileId,
        selected_errors: selectedErrors
      });
      
      if (response.success) {
        // 수정된 파일 자동 다운로드
        await apiClient.downloadFile(response.corrected_file_id, response.filename);
        
        // 성공 알림
        alert(`${response.applied_corrections}개의 오류가 수정되었습니다! 파일이 다운로드됩니다.`);
        
        // 파일 정리
        await apiClient.cleanupFiles(fileId);
        await apiClient.cleanupFiles(response.corrected_file_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정 적용에 실패했습니다');
    }
    
    setIsApplying(false);
  };

  if (!results) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          검사 결과
        </h2>
        <p className="text-gray-600">
          총 {results.total_errors}개의 맞춤법 오류를 발견했습니다
        </p>
      </div>

      {/* 전체 선택 컨트롤 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-gray-900">
            <span className="font-medium">{selectedErrors.length}</span>
            <span className="text-gray-600"> / {results.errors.length} 오류 선택됨</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={selectAll} variant="outline" size="sm">
              전체 선택
            </Button>
            <Button onClick={deselectAll} variant="outline" size="sm">
              선택 해제
            </Button>
          </div>
        </div>
      </Card>

      {/* 오류 목록 */}
      <div className="space-y-3">
        {results.errors.map((error: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedErrors.includes(index) 
                  ? 'ring-2 ring-blue-200 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleError(index)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {selectedErrors.includes(index) ? (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                      슬라이드 {error.slide_number}
                    </span>
                    <span className="text-xs text-gray-500">{error.position}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-red-600 font-mono bg-red-50 px-2 py-1 rounded text-sm border">
                        {error.original}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-mono bg-green-50 px-2 py-1 rounded text-sm border">
                        {error.corrected}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 오류 메시지 */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600 text-center">{error}</p>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="text-center pt-4">
        <Button
          onClick={handleApplyCorrections}
          disabled={selectedErrors.length === 0}
          isLoading={isApplying}
          size="lg"
          className="px-8"
        >
          <Download className="w-4 h-4 mr-2" />
          {isApplying ? '수정 적용 중...' : `${selectedErrors.length}개 오류 수정 후 다운로드`}
        </Button>
      </div>
    </motion.div>
  );
}