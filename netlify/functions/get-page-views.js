const { google } = require('googleapis');

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
    // 환경 변수에서 GA4 설정 가져오기
    const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID; // GA4 속성 ID
    const GA4_CREDENTIALS = process.env.GA4_CREDENTIALS; // 서비스 계정 JSON

    if (!GA4_PROPERTY_ID || !GA4_CREDENTIALS) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'GA4 설정이 누락되었습니다. 환경 변수를 확인해주세요.' 
        }),
      };
    }

    // Google Analytics Data API 클라이언트 설정
    const credentials = JSON.parse(GA4_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    // URL 파라미터에서 페이지 경로 가져오기
    const { pathname } = new URL(event.rawUrl);
    const pagePath = pathname.replace('/.netlify/functions/get-page-views', '');

    // GA4에서 페이지뷰 데이터 조회
    const response = await analyticsData.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [
          {
            startDate: '2024-01-01', // 블로그 시작일로 설정
            endDate: 'today',
          },
        ],
        dimensions: [
          {
            name: 'pagePath',
          },
        ],
        metrics: [
          {
            name: 'screenPageViews',
          },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'EXACT',
              value: pagePath,
            },
          },
        },
      },
    });

    // 결과 파싱
    const rows = response.data.rows || [];
    const pageViews = rows.length > 0 ? parseInt(rows[0].metricValues[0].value) : 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        pagePath,
        pageViews,
        success: true,
      }),
    };

  } catch (error) {
    console.error('GA4 API 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '조회수 데이터를 가져오는 중 오류가 발생했습니다.',
        details: error.message,
      }),
    };
  }
};
