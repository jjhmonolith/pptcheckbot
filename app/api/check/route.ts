import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileId = formData.get('file_id') as string;
    
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

    // 시뮬레이션 딜레이 (실제로는 PPT 분석 과정)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 가짜 맞춤법 검사 결과 (실제로는 OpenAI API 호출)
    const mockResults = {
      file_id: fileId,
      total_errors: 6,
      processing_time: 2.5,
      errors: [
        {
          slide_number: 2,
          original: '됬습니다',
          corrected: '됐습니다',
          position: '제목',
          context: '프로젝트가 성공적으로 됬습니다',
          selected: true
        },
        {
          slide_number: 2,
          original: '어떻개',
          corrected: '어떻게',
          position: '본문',
          context: '어떻개 진행할지 계획을 세워야 합니다',
          selected: true
        },
        {
          slide_number: 3,
          original: '몇일',
          corrected: '며칠',
          position: '본문',
          context: '몇일 전부터 준비해왔습니다',
          selected: true
        },
        {
          slide_number: 3,
          original: '그렇치',
          corrected: '그렇지',
          position: '본문',
          context: '그렇치 않나요?',
          selected: true
        },
        {
          slide_number: 4,
          original: '할께요',
          corrected: '할게요',
          position: '결론',
          context: '다음에 더 잘 할께요',
          selected: true
        },
        {
          slide_number: 5,
          original: '안되요',
          corrected: '안 돼요',
          position: '주의사항',
          context: '이렇게 하면 안되요',
          selected: true
        }
      ]
    };

    // 결과 저장 (메모리에 임시 저장)
    fileStorage[fileId].check_result = mockResults;

    return NextResponse.json(mockResults);

  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json(
      { detail: '맞춤법 검사 실패' },
      { status: 500 }
    );
  }
}