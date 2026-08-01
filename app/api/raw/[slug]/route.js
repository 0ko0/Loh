import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HANDSHAKE_SECRET = process.env.HANDSHAKE_SECRET || 'LURIX_HUB_SUPER_SECRET_KEY_2026';

const SKID_USER_AGENTS = [
  'mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera', 'trident',
  'curl', 'python', 'postmanruntime', 'axios', 'node-fetch', 'go-http-client',
  'java', 'wget', 'insomnia', 'httpie', 'requests', 'urllib', 'aiohttp',
  'fiddler', 'charles', 'postman', 'swagger', 'bot', 'spider', 'crawler',
  'libwww-perl', 'httptrack', 'winhttp', 'dalvik'
];

function generateHoneypotLua(ipAddress, reason) {
  return `-- [LURIX HUB ANTI-SKID PROTECTION SYSTEM]
-- STATUS: ACCESS DENIED - UNAUTHORIZED REQUEST DETECTED
-- IP LOGGED: ${ipAddress} | REASON: ${reason}

task.spawn(function()
    pcall(function()
        if game and game:IsLoaded() and game.Players and game.Players.LocalPlayer then
            game.Players.LocalPlayer:Kick("\\n[LURIX HUB ANTI-SKID]\\nDetector: Unauthorized HTTP Request / Raw Snipping Attempt!\\nIP Address: ${ipAddress}\\nStatus: Logged to Security Database.")
        end
    end)
end)

print("[Lurix Anti-Skid]: Access Denied. Skid request logged.")
while true do task.wait(99999) end`;
}

function verifyHandshakeToken(slug, token, timestampStr) {
  if (!token || !timestampStr) return false;
  
  const reqTime = parseInt(timestampStr, 10);
  const now = Math.floor(Date.now() / 1000);

  if (isNaN(reqTime) || Math.abs(now - reqTime) > 120) {
    return false;
  }

  const expectedHash = crypto
    .createHash('sha256')
    .update(`${slug}:${timestampStr}:${HANDSHAKE_SECRET}`)
    .digest('hex');

  return token.toLowerCase() === expectedHash.toLowerCase();
}

async function logSkidAttempt(request, slug, reason, ipAddress) {
  try {
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    await supabase.from('execution_logs').insert([{
      roblox_username: `[SKID_DETECTED]`,
      roblox_id: '0',
      discord_user: `Reason: ${reason}`,
      executor: `Tool/Agent: ${userAgent.slice(0, 50)}`,
      script_slug: slug,
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    }]);
  } catch (e) {
    console.error('Failed to log skid:', e);
  }
}

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
  const { searchParams } = new URL(request.url);

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.ip || '127.0.0.1');

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const acceptHeader = (request.headers.get('accept') || '').toLowerCase();
  const secFetchDest = request.headers.get('sec-fetch-dest') || '';
  const secFetchMode = request.headers.get('sec-fetch-mode') || '';

  const token = searchParams.get('t') || request.headers.get('x-lurix-token');
  const time = searchParams.get('ts') || request.headers.get('x-lurix-time');

  const isKnownSkidTool = SKID_USER_AGENTS.some(agent => userAgent.includes(agent));
  const isWebBrowser = secFetchDest === 'document' || secFetchMode === 'navigate' || acceptHeader.includes('text/html');

  if (isKnownSkidTool || isWebBrowser) {
    await logSkidAttempt(request, slug, 'Browser/Scraper Agent Detected', ipAddress);
    return new Response(generateHoneypotLua(ipAddress, 'Browser or Scraper Tool Detected'), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const isValidHandshake = verifyHandshakeToken(slug, token, time);
  if (!isValidHandshake) {
    await logSkidAttempt(request, slug, 'Invalid or Missing Dynamic Handshake Token', ipAddress);
    return new Response(generateHoneypotLua(ipAddress, 'Invalid Security Token / Spoofed Request'), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  }

  try {
    const { data, error } = await supabase
      .from('scripts')
      .select('content, status')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return new Response(`print("[Lurix Hub]: Script '${slug}' not found or deleted!")`, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (data.status === 'patched') {
      return new Response(`if game and game.Players.LocalPlayer then game.Players.LocalPlayer:Kick("[Lurix Hub]: Script is currently PATCHED!") end`, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return new Response(data.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(`print("[Lurix Hub]: Server internal error")`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
