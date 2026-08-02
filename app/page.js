'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Terminal, 
  Key, 
  Gamepad2, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Youtube, 
  MessageSquare 
} from 'lucide-react';

export default function Home() {
  const [siteTitle, setSiteTitle] = useState('LURIX HUB');
  const [badgeText, setBadgeText] = useState('Online & Active');
  
  const [supportedGames, setSupportedGames] = useState([
    { name: 'Stand Upright', logo: '/logo.png', status: 'Fully Supported', tag: 'ROBLOX' }
  ]);

  const [loaderScript, setLoaderScript] = useState('loadstring(game:HttpGet("https://api.jnkie.com/api/v1/luascripts/public/4ec630b95743ef465a8e6ac5e840b9f4cf535f42ae3bd2bc766a8fdd3fb04e86/download"))()');
  const [currentKey, setCurrentKey] = useState('a5dcf214-d194-4be8-8bac-2bb357f152c7');
  const [youtubeLink, setYoutubeLink] = useState('https://www.youtube.com/@owizk');
  const [discordLink, setDiscordLink] = useState('');

  const [toasts, setToasts] = useState([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

useEffect(() => {
  async function loadData() {
    try {
      
      const PUBLIC_KEYS = [
        'site_title', 
        'badge_text', 
        'supported_games', 
        'loader_script', 
        'current_key', 
        'youtube_link', 
        'discord_link'
      ];

      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', PUBLIC_KEYS);

      if (data) {
        data.forEach(item => {
          if (item.key === 'site_title') setSiteTitle(item.value || 'LURIX HUB');
          if (item.key === 'badge_text') setBadgeText(item.value || 'Online & Active');
          if (item.key === 'supported_games') {
            try {
              const parsed = JSON.parse(item.value);
              if (Array.isArray(parsed) && parsed.length > 0) setSupportedGames(parsed);
            } catch(e) {}
          }
          if (item.key === 'loader_script') setLoaderScript(item.value || '');
          if (item.key === 'current_key') setCurrentKey(item.value || '');
          if (item.key === 'youtube_link') setYoutubeLink(item.value || 'https://www.youtube.com/@owizk');
          if (item.key === 'discord_link') setDiscordLink(item.value || '');
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }
  loadData();
}, []);

  const triggerFeedback = (type = 'success') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [15, 30, 15] : [30, 50, 30]);
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      } else {
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
      }

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  };

  const notifyBilingual = ({ textVN, textEN, type = 'success', duration = 3500 }) => {
    const id = Date.now();
    const newToast = { id, textVN, textEN, type };
    setToasts(prev => [...prev, newToast]);
    triggerFeedback(type);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
        
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  };

  const handleCopyScript = async () => {
    const success = await copyToClipboard(loaderScript);
    if (success) {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
      notifyBilingual({
        textVN: 'Đã copy script loader',
        textEN: 'Script loader copied to clipboard'
      });
    }
  };

  const handleCopyKey = async () => {
    const success = await copyToClipboard(currentKey);
    if (success) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      notifyBilingual({
        textVN: 'Đã copy key',
        textEN: 'Access Key copied to clipboard'
      });
    }
  };

  const copyYouTubeLink = async () => {
    await copyToClipboard(youtubeLink);
    notifyBilingual({
      textVN: 'Đã copy link kênh YouTube',
      textEN: 'YouTube channel link copied'
    });
  };

  const handleDiscordClick = () => {
    if (discordLink && discordLink.trim()) {
      window.open(discordLink, '_blank', 'noopener,noreferrer');
    } else {
      notifyBilingual({
        textVN: 'Server Discord chưa được tạo',
        textEN: 'Discord server has not been created yet',
        type: 'warning'
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#050608] text-[#f3f5fc] flex justify-center items-center p-3 md:p-6 relative overflow-x-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="fixed w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] bg-[#6E96FF] -top-[100px] -left-[100px] rounded-full blur-[100px] sm:blur-[140px] opacity-20 pointer-events-none animate-pulse" />
      <div className="fixed w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[#4158D0] -bottom-[80px] -right-[80px] rounded-full blur-[100px] sm:blur-[140px] opacity-15 pointer-events-none animate-pulse" />

      {/* Toast Notification Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-[440px] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto bg-[#0a0d16]/95 backdrop-blur-2xl border ${
              t.type === 'warning' ? 'border-[#FFB800] shadow-[0_0_25px_rgba(255,184,0,0.25)]' : 'border-[#6E96FF] shadow-[0_0_25px_rgba(110,150,255,0.35)]'
            } rounded-2xl p-3 px-4 flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-3`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
              t.type === 'warning' ? 'bg-[#FFB800]/15 border-[#FFB800]/30 text-[#FFB800]' : 'bg-[#6E96FF]/15 border-[#6E96FF]/30 text-[#6E96FF]'
            }`}>
              {t.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 truncate">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#6E96FF]/20 text-[#6E96FF] border border-[#6E96FF]/30 font-mono">VN</span> {t.textVN}
              </div>
              <div className="text-[11px] font-semibold text-[#949db1] flex items-center gap-2 truncate">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/15 font-mono">EN</span> {t.textEN}
              </div>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-[#949db1] hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Container Card */}
      <div className="z-10 w-full max-w-[600px] my-auto">
        <div className="bg-[#0c0f17]/90 backdrop-blur-3xl border border-[#6E96FF]/25 rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(110,150,255,0.1)]">
          
          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-[#ffffff] to-[#6E96FF] bg-clip-text text-transparent mb-2.5 drop-shadow-[0_0_25px_rgba(110,150,255,0.4)] uppercase break-words">
              {siteTitle}
            </h1>
            <div className="inline-flex items-center gap-2 bg-[#6E96FF]/10 border border-[#6E96FF]/30 text-[#6E96FF] px-3.5 py-1.5 rounded-full text-xs font-extrabold">
              <span className="w-2 h-2 bg-[#00ff88] rounded-full shadow-[0_0_8px_#00ff88] animate-ping"></span>
              {badgeText}
            </div>
          </div>

          {/* Supported Games Section */}
          <div className="mb-5 space-y-2.5">
            <div className="text-[11px] font-extrabold text-[#949db1] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#6E96FF]" /> Supported Game
            </div>

            {supportedGames.map((game, index) => (
              <div key={index} className="bg-[#080a0f]/90 border border-[#6E96FF]/25 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-[#6E96FF] hover:shadow-[0_0_20px_rgba(110,150,255,0.2)] transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={game.logo || '/logo.png'}
                    alt={game.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#6E96FF]/50 shadow-[0_0_12px_rgba(110,150,255,0.3)] shrink-0 bg-[#6E96FF]/10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=150&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm sm:text-base text-white tracking-wide truncate">{game.name}</div>
                    <div className="text-[11px] text-[#00ff88] font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full shadow-[0_0_6px_#00ff88] shrink-0"></span>
                      <span className="truncate">{game.status || 'Fully Supported'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#6E96FF]/15 text-[#6E96FF] border border-[#6E96FF]/30 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black font-mono tracking-wider shrink-0">
                  {game.tag || 'ROBLOX'}
                </div>
              </div>
            ))}
          </div>

          {/* Script Loader Box */}
          <div className="mb-5">
            <div className="text-[11px] font-extrabold text-[#949db1] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#6E96FF]" /> Script loader
            </div>
            <div className="bg-[#080a0f]/90 border border-white/10 rounded-2xl p-2.5 px-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 hover:border-[#6E96FF]/60 transition-all">
              <div className="flex-1 min-w-0 overflow-x-auto py-1">
                <span className="font-mono text-xs text-[#d8deed] whitespace-nowrap block">
                  {loaderScript}
                </span>
              </div>
              <button
                onClick={handleCopyScript}
                className="bg-[#6E96FF] text-[#04060a] font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_4px_15px_rgba(110,150,255,0.4)] transition-all shrink-0 cursor-pointer active:scale-95"
              >
                {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedScript ? 'Copied' : 'Copy Script'}
              </button>
            </div>
          </div>

          {/* Key Box */}
          <div className="mb-5">
            <div className="text-[11px] font-extrabold text-[#949db1] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#6E96FF]" /> Access Key
            </div>
            <div className="bg-[#080a0f]/90 border border-white/10 rounded-2xl p-2.5 px-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 hover:border-[#6E96FF]/60 transition-all">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={currentKey}
                  readOnly
                  className="font-mono text-xs sm:text-sm text-[#6E96FF] font-extrabold bg-transparent border-none outline-none w-full"
                />
              </div>
              <button
                onClick={handleCopyKey}
                className="bg-[#6E96FF] text-[#04060a] font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_4px_15px_rgba(110,150,255,0.4)] transition-all shrink-0 cursor-pointer active:scale-95"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey ? 'Copied' : 'Copy Key'}
              </button>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <button
              onClick={copyYouTubeLink}
              className="bg-[#0a0d14]/80 border border-white/10 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-white font-extrabold text-xs sm:text-sm hover:border-[#FF0055] hover:bg-[#FF0055]/10 hover:text-[#FF0055] hover:shadow-[0_0_20px_rgba(255,0,85,0.3)] transition-all cursor-pointer active:scale-95"
            >
              <Youtube className="w-4 h-4 text-red-500" /> YouTube Channel
            </button>

            <button
              onClick={handleDiscordClick}
              className="bg-[#0a0d14]/80 border border-white/10 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-white font-extrabold text-xs sm:text-sm hover:border-[#5865F2] hover:bg-[#5865F2]/10 hover:text-[#5865F2] hover:shadow-[0_0_20px_rgba(88,101,242,0.3)] transition-all cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Discord Server
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-[11px] text-[#949db1] font-semibold">
            <strong>{siteTitle}</strong> &copy; {new Date().getFullYear()}
          </div>

        </div>
      </div>
    </main>
  );
}
