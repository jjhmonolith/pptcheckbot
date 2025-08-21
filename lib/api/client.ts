/**
 * PPT 맞춤법 검사 API 클라이언트
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-domain.vercel.app'  // 실제 Vercel 도메인으로 교체
  : 'http://localhost:3000';

interface AuthRequest {
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
}

interface UploadResponse {
  file_id: string;
  filename: string;
  size: number;
}

interface ErrorItem {
  slide_number: number;
  original: string;
  corrected: string;
  position: string;
  context: string;
  selected: boolean;
}

interface CheckResponse {
  file_id: string;
  total_errors: number;
  errors: ErrorItem[];
  processing_time: number;
}

interface CorrectionRequest {
  file_id: string;
  selected_errors: number[];
}

interface CorrectionResponse {
  success: boolean;
  corrected_file_id: string;
  filename: string;
  applied_corrections: number;
  failed_corrections: number;
  total_corrections: number;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async uploadRequest<T>(
    endpoint: string, 
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 사용자 인증
   */
  async authenticate(password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  /**
   * PowerPoint 파일 업로드
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.uploadRequest<UploadResponse>('/api/upload', formData);
  }

  /**
   * 맞춤법 검사 실행
   */
  async checkSpelling(fileId: string): Promise<CheckResponse> {
    const formData = new FormData();
    formData.append('file_id', fileId);

    return this.uploadRequest<CheckResponse>('/api/check', formData);
  }

  /**
   * 선택된 오류 수정 적용
   */
  async applyCorrections(request: CorrectionRequest): Promise<CorrectionResponse> {
    return this.request<CorrectionResponse>('/api/correct', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 수정된 파일 다운로드 URL 생성
   */
  getDownloadUrl(fileId: string): string {
    return `${this.baseURL}/api/download/${fileId}`;
  }

  /**
   * 임시 파일 정리
   */
  async cleanupFiles(fileId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/cleanup/${fileId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 파일 다운로드 (브라우저에서 자동 다운로드)
   */
  async downloadFile(fileId: string, filename: string): Promise<void> {
    const url = this.getDownloadUrl(fileId);
    
    // 임시 링크 생성하여 다운로드 트리거
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 싱글톤 인스턴스 생성
const apiClient = new APIClient();

export default apiClient;

// 타입 정의 export
export type {
  AuthRequest,
  AuthResponse,
  UploadResponse,
  ErrorItem,
  CheckResponse,
  CorrectionRequest,
  CorrectionResponse,
};