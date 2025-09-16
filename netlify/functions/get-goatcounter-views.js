exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // URL 파라미터에서 페이지 경로 가져오기
    const { searchParams } = new URL(event.rawUrl);
    const pagePath = searchParams.get('pathname');
    
    if (!pagePath) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'pathname 파라미터가 필요합니다.',
          success: false
        }),
      };
    }

    console.log('GoatCounter 조회수 요청:', { pagePath });

    // GoatCounter API 호출
    const goatCounterUrl = `https://thin.goatcounter.com/api/v0/count/${encodeURIComponent(pagePath)}`;
    const response = await fetch(goatCounterUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('GoatCounter API 응답:', { pagePath, data });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          pagePath,
          viewCount: data.count || 0,
          success: true,
        }),
      };
    } else {
      console.error('GoatCounter API 오류:', { 
        status: response.status, 
        statusText: response.statusText 
      });
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'GoatCounter API 호출 실패',
          success: false,
        }),
      };
    }

  } catch (error) {
    console.error('GoatCounter 프록시 오류:', {
      message: error.message,
      stack: error.stack,
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '조회수 데이터를 가져오는 중 오류가 발생했습니다.',
        details: error.message,
        success: false,
      }),
    };
  }
};
