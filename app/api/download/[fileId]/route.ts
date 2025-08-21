import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    if (!fileId) {
      return NextResponse.json(
        { detail: '파일 ID가 없습니다' },
        { status: 400 }
      );
    }

    // 파일 정보 확인
    const fileStorage = global.fileStorage || {};
    const fileInfo = fileStorage[fileId];
    
    if (!fileInfo) {
      return NextResponse.json(
        { detail: '파일을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const filePath = fileInfo.file_path;
    const fileName = fileInfo.original_name;

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { detail: '파일이 존재하지 않습니다' },
        { status: 404 }
      );
    }

    // 파일 읽기
    const fileBuffer = await readFile(filePath);

    // 파일 다운로드 응답
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { detail: '파일 다운로드 실패' },
      { status: 500 }
    );
  }
}