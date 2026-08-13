import { supabase } from '@/lib/supabase';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'edge';

const HANDSHAKE_SECRET = process.env.HANDSHAKE_SECRET;

const BOT_USER_AGENTS = [
  'python-requests', 'postmanruntime', 'axios', 'node-fetch', 'go-http-client',
  'java/', 'wget', 'insomnia', 'httpie', 'urllib', 'aiohttp',
  'fiddler', 'charles', 'swagger', 'httptrack', 'winhttp', 'curl/'
];

function generateHoneypotLua(reason) {
  return `-- [LURIX HUB ANTI-SKID PROTECTION]
task.spawn(function()
    pcall(function()
        if game and game:IsLoaded() and game.Players and game.Players.LocalPlayer then
            game.Players.LocalPlayer:Kick("\\n[LURIX HUB ANTI-SKID]\\nDenied: " .. "${reason}")
        end
    end)
end)
print("[Lurix Anti-Skid]: Access Denied - " .. "${reason}")
while true do task.wait(99999) end`;
}

function verifyHandshakeToken(slug, token, timestampStr) {
  
  if (!HANDSHAKE_SECRET || !token || !timestampStr) {
    return false;
  }

  const reqTime = parseInt(timestampStr, 10);
  const now = Math.floor(Date.now() / 1000);

  if (isNaN(reqTime) || Math.abs(now - reqTime) > 300) {
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
      executor: `Agent: ${userAgent.slice(0, 80)}`,
      script_slug: slug,
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    }]);
  } catch (e) {
    console.error('[Anti-Skid Log Error]:', e);
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
  const secFetchDest = request.headers.get('sec-fetch-dest') || '';
  const secFetchMode = request.headers.get('sec-fetch-mode') || '';

  const token = searchParams.get('t') || request.headers.get('x-lurix-token');
  const time = searchParams.get('ts') || request.headers.get('x-lurix-time');

  if (!HANDSHAKE_SECRET) {
    console.error('[Lurix Hub Error]: HANDSHAKE_SECRET is not set on Vercel Environment Variables!');
    return new Response(`print("[Lurix Hub Error]: Server security misconfiguration. Please contact admin.")`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const isDirectBrowserClick = secFetchDest === 'document' || secFetchMode === 'navigate';
  const isBotTool = BOT_USER_AGENTS.some(agent => userAgent.includes(agent));

  if (isDirectBrowserClick || isBotTool) {
    await logSkidAttempt(request, slug, 'Direct Browser/Bot Access Blocked', ipAddress);
    return new Response(generateHoneypotLua('Direct Browser or Bot Access Blocked'), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  const isValidHandshake = verifyHandshakeToken(slug, token, time);
  if (!isValidHandshake) {
    await logSkidAttempt(request, slug, 'Invalid Token or Time Mismatch', ipAddress);
    return new Response(generateHoneypotLua('Invalid Handshake Token or Expired Request'), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
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
      return new Response(`print("[Lurix Hub Error]: Script slug '${slug}' not found!")`, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (data.status === 'patched') {
      return new Response(`if game and game.Players.LocalPlayer then game.Players.LocalPlayer:Kick("[Lurix Hub]: This script is currently PATCHED!") end`, {
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
    return new Response(`print("[Lurix Hub Error]: Server internal error")`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
