#!/usr/bin/env python3
"""
PowerPoint 맞춤법 검사 FastAPI 백엔드
"""

import os
import json
import tempfile
import shutil
from datetime import datetime
from typing import List, Dict, Optional
import uuid

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ppt_checker import PPTSpellChecker
from ppt_corrector import PPTAutoCorrector

# FastAPI 앱 생성
app = FastAPI(title="PPT 맞춤법 검사 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-vercel-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 임시 파일 저장소 (실제 배포시에는 Redis나 DB 사용)
temp_storage = {}

# Pydantic 모델들
class AuthRequest(BaseModel):
    password: str

class CorrectionRequest(BaseModel):
    file_id: str
    selected_errors: List[int]

class ErrorItem(BaseModel):
    slide_number: int
    original: str
    corrected: str
    position: str
    context: str
    selected: bool = True

class CheckResult(BaseModel):
    file_id: str
    total_errors: int
    errors: List[ErrorItem]
    processing_time: float

@app.get("/")
async def root():
    return {"message": "PPT 맞춤법 검사 API", "version": "1.0.0"}

@app.post("/api/auth")
async def authenticate(request: AuthRequest):
    """사용자 인증"""
    # 실제로는 더 보안적인 방법 사용
    correct_password = os.getenv("APP_PASSWORD", "ppt2025")
    
    if request.password == correct_password:
        return {"success": True, "message": "인증 성공"}
    else:
        raise HTTPException(status_code=401, detail="잘못된 암호입니다")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """PowerPoint 파일 업로드"""
    # 파일 확장자 검증
    if not file.filename or not file.filename.lower().endswith('.pptx'):
        raise HTTPException(status_code=400, detail="PPTX 파일만 지원됩니다")
    
    # 파일 크기 검증 (50MB)
    if file.size and file.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="파일 크기는 50MB를 초과할 수 없습니다")
    
    # 임시 파일 저장
    file_id = str(uuid.uuid4())
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, f"{file_id}.pptx")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 메타데이터 저장
        temp_storage[file_id] = {
            "file_path": file_path,
            "original_name": file.filename,
            "upload_time": datetime.now().isoformat(),
            "temp_dir": temp_dir
        }
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": os.path.getsize(file_path)
        }
    
    except Exception as e:
        # 오류 시 임시 파일 정리
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {str(e)}")

@app.post("/api/check", response_model=CheckResult)
async def check_spelling(file_id: str = Form(...)):
    """맞춤법 검사 실행"""
    if file_id not in temp_storage:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    
    file_info = temp_storage[file_id]
    file_path = file_info["file_path"]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="파일이 존재하지 않습니다")
    
    try:
        start_time = datetime.now()
        
        # PPT 맞춤법 검사 실행
        checker = PPTSpellChecker(file_path)
        errors = checker.check_all_slides()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # 결과를 API 모델 형식으로 변환
        error_items = []
        for error in errors:
            error_items.append(ErrorItem(
                slide_number=error['slide_number'],
                original=error['original'],
                corrected=error['corrected'],
                position=error.get('position', 'Unknown'),
                context=error.get('original', '')[:100],  # 컨텍스트를 위한 원본 텍스트 일부
                selected=True
            ))
        
        # 검사 결과 저장
        result = CheckResult(
            file_id=file_id,
            total_errors=len(error_items),
            errors=error_items,
            processing_time=processing_time
        )
        
        # 결과를 임시 저장소에 저장
        temp_storage[file_id]["check_result"] = result.dict()
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"맞춤법 검사 실패: {str(e)}")

@app.post("/api/correct")
async def apply_corrections(request: CorrectionRequest):
    """선택된 오류 수정 및 파일 생성"""
    if request.file_id not in temp_storage:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    
    file_info = temp_storage[request.file_id]
    file_path = file_info["file_path"]
    check_result = file_info.get("check_result")
    
    if not check_result:
        raise HTTPException(status_code=400, detail="맞춤법 검사 결과가 없습니다")
    
    try:
        # 선택된 오류만 필터링
        all_errors = check_result["errors"]
        selected_corrections = []
        
        for i, error_index in enumerate(request.selected_errors):
            if 0 <= error_index < len(all_errors):
                error = all_errors[error_index]
                selected_corrections.append({
                    'slide_number': error['slide_number'],
                    'original': error['original'],
                    'corrected': error['corrected'],
                    'apply': True
                })
        
        # PPT 자동 수정 실행
        corrector = PPTAutoCorrector(file_path)
        results = corrector.apply_corrections(selected_corrections)
        
        # 수정된 파일 저장
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        corrected_filename = f"{os.path.splitext(file_info['original_name'])[0]}_수정됨_{timestamp}.pptx"
        corrected_path = os.path.join(file_info["temp_dir"], corrected_filename)
        
        corrected_file_path = corrector.save_corrected_file(corrected_path)
        
        # 수정된 파일 정보 저장
        corrected_file_id = str(uuid.uuid4())
        temp_storage[corrected_file_id] = {
            "file_path": corrected_file_path,
            "original_name": corrected_filename,
            "is_corrected": True,
            "parent_file_id": request.file_id,
            "correction_results": results
        }
        
        return {
            "success": True,
            "corrected_file_id": corrected_file_id,
            "filename": corrected_filename,
            "applied_corrections": results["applied"],
            "failed_corrections": results["failed"],
            "total_corrections": results["total"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"수정 적용 실패: {str(e)}")

@app.get("/api/download/{file_id}")
async def download_file(file_id: str):
    """수정된 파일 다운로드"""
    if file_id not in temp_storage:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    
    file_info = temp_storage[file_id]
    file_path = file_info["file_path"]
    filename = file_info["original_name"]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="파일이 존재하지 않습니다")
    
    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=filename
    )

@app.delete("/api/cleanup/{file_id}")
async def cleanup_files(file_id: str):
    """임시 파일 정리"""
    if file_id in temp_storage:
        file_info = temp_storage[file_id]
        temp_dir = file_info.get("temp_dir")
        
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        
        del temp_storage[file_id]
        
        return {"success": True, "message": "파일이 정리되었습니다"}
    
    return {"success": True, "message": "파일이 이미 정리되었습니다"}

# 서버 시작 시 임시 파일 정리 (30분 후)
@app.on_event("startup")
async def startup_event():
    import asyncio
    
    async def cleanup_old_files():
        while True:
            try:
                current_time = datetime.now()
                to_delete = []
                
                for file_id, file_info in temp_storage.items():
                    upload_time = datetime.fromisoformat(file_info["upload_time"])
                    if (current_time - upload_time).total_seconds() > 1800:  # 30분
                        to_delete.append(file_id)
                
                for file_id in to_delete:
                    await cleanup_files(file_id)
                
                await asyncio.sleep(600)  # 10분마다 체크
            except Exception as e:
                print(f"정리 작업 오류: {e}")
                await asyncio.sleep(600)
    
    # 백그라운드 태스크로 실행
    asyncio.create_task(cleanup_old_files())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)