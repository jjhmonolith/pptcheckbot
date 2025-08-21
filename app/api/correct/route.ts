import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { file_id, selected_errors } = await request.json();
    
    if (!file_id) {
      return NextResponse.json(
        { detail: '파일 ID가 없습니다' },
        { status: 400 }
      );
    }

    // 파일 정보 확인
    const fileStorage = global.fileStorage || {};
    const fileInfo = fileStorage[file_id];
    
    if (!fileInfo) {
      return NextResponse.json(
        { detail: '파일을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const checkResult = fileInfo.check_result;
    if (!checkResult) {
      return NextResponse.json(
        { detail: '맞춤법 검사 결과가 없습니다' },
        { status: 400 }
      );
    }

    // 시뮬레이션 딜레이 (실제로는 PPT 수정 과정)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 수정된 파일 ID 생성
    const correctedFileId = uuidv4();
    const originalName = fileInfo.original_name;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const correctedFileName = `${path.parse(originalName).name}_수정됨_${timestamp}.pptx`;

    // 실제로는 PPT 파일을 수정하고 저장
    // 여기서는 시뮬레이션으로 원본 파일을 복사
    const tempDir = path.join(process.cwd(), 'temp');
    const correctedFilePath = path.join(tempDir, `${correctedFileId}.pptx`);
    
    // 원본 파일 복사 (실제로는 수정된 내용으로 저장)
    const fs = require('fs').promises;
    await fs.copyFile(fileInfo.file_path, correctedFilePath);

    // 수정된 파일 정보 저장
    fileStorage[correctedFileId] = {
      file_path: correctedFilePath,
      original_name: correctedFileName,
      is_corrected: true,
      parent_file_id: file_id,
      upload_time: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      corrected_file_id: correctedFileId,
      filename: correctedFileName,
      applied_corrections: selected_errors.length,
      failed_corrections: 0,
      total_corrections: selected_errors.length
    });

  } catch (error) {
    console.error('Correct error:', error);
    return NextResponse.json(
      { detail: '수정 적용 실패' },
      { status: 500 }
    );
  }
}