import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { detail: '파일이 없습니다' },
        { status: 400 }
      );
    }

    // 파일 확장자 검증
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return NextResponse.json(
        { detail: 'PPTX 파일만 지원됩니다' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { detail: '파일 크기는 5MB를 초과할 수 없습니다' },
        { status: 400 }
      );
    }

    // 임시 디렉토리 생성
    const tempDir = path.join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // 고유 파일 ID 생성
    const fileId = uuidv4();
    const fileName = `${fileId}.pptx`;
    const filePath = path.join(tempDir, fileName);

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 메타데이터 저장 (실제로는 DB나 Redis 사용)
    global.fileStorage = global.fileStorage || {};
    global.fileStorage[fileId] = {
      file_path: filePath,
      original_name: file.name,
      upload_time: new Date().toISOString(),
      size: file.size
    };

    return NextResponse.json({
      file_id: fileId,
      filename: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { detail: '파일 업로드 실패' },
      { status: 500 }
    );
  }
}