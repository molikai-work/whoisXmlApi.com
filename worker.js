/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// ?domain=cloudflare.com&format=json

// 添加事件監聽器
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 處理傳入的請求
async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  try {
    // 從請求中獲取 URL
    const url = new URL(request.url)

    // 從 URL 查詢參數中獲取域名
    const domain = url.searchParams.get('domain')

    // 獲取返回格式，預設為 JSON
    const format = url.searchParams.get('format') || 'json';

    // 域名格式驗證
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domain.match(domainRegex)) {
      return new Response(JSON.stringify({
        code: 400,
        msg: '提供的域名參數無效。',
        timestamp: Date.now()
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // 如果沒有提供域名參數
    if (!domain) {
      return new Response(JSON.stringify({
        code: 400,
        msg: '請使用「domain」查詢參數提供域名。',
        timestamp: Date.now()
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // 校驗格式是否允許，如果不允許則預設為 JSON
    if (format !== 'json' && format !== 'xml') {
      return new Response(JSON.stringify({
        code: 400,
        msg: '指定的格式無效。僅允許「json」和「xml」。',
        timestamp: Date.now()
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // whoisxmlapi.com API 機密
    const apikey = "" // 在 whoisxmlapi.com 申請 API 機密

    // 構建發送請求的 URL
    const api_url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apikey}&domainName=${domain}&outputFormat=${format}`

    // 發送請求獲取 WHOIS 資訊
    const response = await fetch(api_url)

    // 檢查回應狀態
    if (!response.ok) {
      return new Response(JSON.stringify({
        code: 400,
        msg: '無法獲取此域名的 WHOIS 資訊。',
        timestamp: Date.now()
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // 解析回應
    let responseData;
    if (format === 'json') {
      responseData = await response.json();
    } else if (format === 'xml') {
      responseData = await response.text();
    }

    // 返回獲取的資訊
    if (format === 'json') {
      return new Response(JSON.stringify(responseData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    } else if (format === 'xml') {
      return new Response(responseData, {
        headers: {
          'Content-Type': 'application/xml',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  } catch (error) {
    // 錯誤處理
    return new Response(JSON.stringify({
      code: 500,
      msg: `Error: ${error.message}`,
      timestamp: Date.now()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
