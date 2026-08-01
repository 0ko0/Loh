import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export async function GET(request, { params }) {
  const { slug } = params;

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const acceptHeader = (request.headers.get('accept') || '').toLowerCase();
  const secFetchDest = request.headers.get('sec-fetch-dest') || '';

  const isWebBrowser =
    secFetchDest === 'document' ||
    (acceptHeader.includes('text/html') && (userAgent.includes('mozilla') || userAgent.includes('chrome') || userAgent.includes('safari')));

  if (isWebBrowser) {
    const protectedLua = `gay gay gay`;

    return new Response(protectedLua, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  try {
    const { data, error } = await supabase
      .from('scripts')
      .select('content')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return new Response(`print("[Lurix Hub Error]: Script slug '${slug}' not found!")`, {
        status: 200,
        headers: { 
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(data.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (err) {
    return new Response(`print("[Lurix Hub Error]: Server internal error")`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }
}