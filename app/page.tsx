'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadStep, ProcessingStep, ResultsStep } from '@/components/steps';
import apiClient, { type CheckResponse, type ErrorItem } from '@/lib/api/client';

export default function Home() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.authenticate(password);
      if (response.success) {
        setIsAuthenticated(true);
        localStorage.setItem('ppt-checker-auth', 'true');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '인증에 실패했습니다');
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.trim()) {
      handleAuth();
    }
  };

  if (isAuthenticated) {
    return <MainApp />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <motion.div 
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 로고 및 제목 */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileCheck className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PPT 맞춤법 검사기
            </h1>
            <p className="text-gray-600">
              PowerPoint 교재를 자동으로 교정하는 AI 도구
            </p>
          </div>
        </div>

        {/* 인증 카드 */}
        <Card className="p-8 space-y-6">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              보안 인증
            </h2>
            <p className="text-sm text-gray-600">
              계속하려면 액세스 암호를 입력하세요
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="암호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              error={error}
              icon={<Lock className="w-4 h-4" />}
            />

            <Button
              onClick={handleAuth}
              disabled={!password.trim()}
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? '인증 중...' : '입장하기'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              암호를 잊으셨나요? 관리자에게 문의하세요
            </p>
          </div>
        </Card>

        {/* 푸터 정보 */}
        <div className="text-center text-xs text-gray-400">
          © 2025 PPT 맞춤법 검사기. AI 기반 자동 교정 시스템
        </div>
      </motion.div>
    </div>
  );
}

// 메인 애플리케이션 컴포넌트
function MainApp() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>('');
  const [checkResults, setCheckResults] = useState<CheckResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      setUploadError('');
      const response = await apiClient.uploadFile(file);
      setUploadedFile(file);
      setFileId(response.file_id);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '파일 업로드에 실패했습니다');
    }
  };

  const handleStartCheck = async () => {
    if (!fileId) return;
    
    setIsProcessing(true);
    setCurrentStep('processing');
    
    try {
      const response = await apiClient.checkSpelling(fileId);
      setCheckResults(response);
      setCurrentStep('results');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '맞춤법 검사에 실패했습니다');
      setCurrentStep('upload');
    }
    
    setIsProcessing(false);
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setCheckResults(null);
    setUploadError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PPT 맞춤법 검사기</h1>
                <p className="text-sm text-gray-600">AI 기반 자동 교정 도구</p>
              </div>
            </div>
            
            <Button onClick={handleReset} variant="outline" size="sm">
              새로 시작
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 진행 단계 표시 */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 'upload', label: '파일 업로드', icon: '📁' },
              { id: 'processing', label: '분석 중', icon: '🔍' },
              { id: 'results', label: '결과 확인', icon: '📊' },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep === step.id 
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' 
                    : index < ['upload', 'processing', 'results'].indexOf(currentStep)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {step.icon}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < 2 && (
                  <div className={`mx-6 w-12 h-0.5 ${
                    index < ['upload', 'processing', 'results'].indexOf(currentStep)
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 메인 콘텐츠 */}
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <UploadStep 
              key="upload"
              onFileUpload={handleFileUpload}
              onStartCheck={handleStartCheck}
              uploadedFile={uploadedFile}
              uploadError={uploadError}
            />
          )}
          
          {currentStep === 'processing' && (
            <ProcessingStep key="processing" fileName={uploadedFile?.name || ''} />
          )}
          
          {currentStep === 'results' && (
            <ResultsStep key="results" results={checkResults} fileId={fileId} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
