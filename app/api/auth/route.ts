import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // 간단한 암호 검증 (실제로는 더 안전한 방법 사용)
    const correctPassword = process.env.APP_PASSWORD || 'ppt2025';
    
    if (password === correctPassword) {
      return NextResponse.json({ 
        success: true, 
        message: '인증 성공' 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          detail: '올바르지 않은 암호입니다' 
        },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { 
        success: false, 
        detail: '서버 오류가 발생했습니다' 
      },
      { status: 500 }
    );
  }
}