import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Upload,
  Download,
  Users,
  Shield,
  AlertTriangle,
  FileText,
  Image,
  File,
  Trash2,
  LogOut,
  Settings,
  MessageSquare,
  X,
  Zap,
  Lock,
  Unlock,
  Eye,
} from 'lucide-react';
import type { HubState, ChatMessage, SharedFile, OnlineUser } from '../types';
import { generateId, formatTimestamp, formatFileSize, generateExtractionCode } from '../types';
import gsap from 'gsap';

interface TheHubProps {
  hubState: HubState;
  onUpdateHubState: (updates: Partial<HubState>) => void;
}

const MOCK_USERS = [
  { codename: 'PHANTOM_X', joinTime: Date.now() - 3600000 },
  { codename: 'DARK_MATTER', joinTime: Date.now() - 1800000 },
  { codename: 'ZERO_DAY', joinTime: Date.now() - 900000 },
  { codename: 'GHOST_PROTOCOL', joinTime: Date.now() - 300000 },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    codename: 'PHANTOM_X',
    content: 'The package has been secured. Awaiting extraction.',
    timestamp: Date.now() - 300000,
    type: 'normal',
  },
  {
    id: '2',
    codename: 'DARK_MATTER',
    content: 'Confirmed. Uploading intel files to the exchange.',
    timestamp: Date.now() - 240000,
    type: 'normal',
  },
  {
    id: '3',
    codename: 'SYSTEM',
    content: 'New secure channel established. All communications are end-to-end encrypted.',
    timestamp: Date.now() - 180000,
    type: 'system',
  },
  {
    id: '4',
    codename: 'ZERO_DAY',
    content: 'Has anyone verified the authenticity of the latest drop?',
    timestamp: Date.now() - 120000,
    type: 'normal',
  },
  {
    id: '5',
    codename: 'GHOST_PROTOCOL',
    content: 'Verified. Clean files, no trackers detected. Safe to download.',
    timestamp: Date.now() - 60000,
    type: 'normal',
  },
];

const MOCK_FILES: SharedFile[] = [
  {
    id: 'f1',
    name: 'classified_intel.pdf',
    size: 2457600,
    type: 'application/pdf',
    uploadedBy: 'DARK_MATTER',
    uploadTime: Date.now() - 240000,
    extractionCode: 'X7K9',
  },
  {
    id: 'f2',
    name: 'satellite_imagery.jpg',
    size: 4194304,
    type: 'image/jpeg',
    uploadedBy: 'PHANTOM_X',
    uploadTime: Date.now() - 300000,
    extractionCode: 'M2P4',
  },
  {
    id: 'f3',
    name: 'encrypted_data.zip',
    size: 10485760,
    type: 'application/zip',
    uploadedBy: 'ZERO_DAY',
    uploadTime: Date.now() - 120000,
    extractionCode: 'Q9R1',
  },
];

export default function TheHub({ hubState, onUpdateHubState }: TheHubProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'users'>('chat');
  const [messageInput, setMessageInput] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const sosFlashRef = useRef<HTMLDivElement>(null);

  // Initialize with mock data
  useEffect(() => {
    const currentUser: OnlineUser = {
      codename: hubState.codename,
      joinTime: Date.now(),
      isAdmin: hubState.isAdmin,
      lastActive: Date.now(),
    };

    onUpdateHubState({
      messages: MOCK_MESSAGES,
      files: MOCK_FILES,
      onlineUsers: [...MOCK_USERS.map(u => ({
        ...u,
        isAdmin: false,
        lastActive: Date.now(),
      })), currentUser],
    });

    // Entrance animation
    gsap.fromTo(
      hubRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hubState.messages]);

  // SOS flash effect
  useEffect(() => {
    if (hubState.sosActive && sosFlashRef.current) {
      sosFlashRef.current.classList.add('animate-sos-flash');
      setTimeout(() => {
        sosFlashRef.current?.classList.remove('animate-sos-flash');
        onUpdateHubState({ sosActive: false });
      }, 4000);
    }
  }, [hubState.sosActive]);

  const sendMessage = useCallback(() => {
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: generateId(),
      codename: hubState.codename,
      content: replyingTo
        ? `[Reply to ${replyingTo}] ${messageInput.trim()}`
        : messageInput.trim(),
      timestamp: Date.now(),
      type: 'normal',
      replyTo: replyingTo || undefined,
    };

    onUpdateHubState({
      messages: [...hubState.messages, newMessage],
    });

    setMessageInput('');
    setReplyingTo(null);

    // Simulate reply
    setTimeout(() => {
      const replies = [
        'Copy that. Standing by.',
        'Intel confirmed. Good work.',
        'Roger. Moving to secure position.',
        'Acknowledged. Eyes on target.',
        'Solid copy. Over.',
      ];
      const randomReply: ChatMessage = {
        id: generateId(),
        codename: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)].codename,
        content: replies[Math.floor(Math.random() * replies.length)],
        timestamp: Date.now(),
        type: 'normal',
      };
      onUpdateHubState({
        messages: [...hubState.messages, newMessage, randomReply],
      });
    }, 2000 + Math.random() * 3000);
  }, [messageInput, hubState, onUpdateHubState, replyingTo]);

  const handleSos = useCallback(() => {
    const sosMessage: ChatMessage = {
      id: generateId(),
      codename: hubState.codename,
      content: 'SOS ALERT — ALL OPERATIVES REPORT STATUS IMMEDIATELY',
      timestamp: Date.now(),
      type: 'sos',
    };

    onUpdateHubState({
      messages: [...hubState.messages, sosMessage],
      sosActive: true,
    });

    setShowSosConfirm(false);
  }, [hubState, onUpdateHubState]);

  const handleFileUpload = useCallback((file: File) => {
    const newFile: SharedFile = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: hubState.codename,
      uploadTime: Date.now(),
      extractionCode: generateExtractionCode(),
    };

    onUpdateHubState({
      files: [...hubState.files, newFile],
    });

    // System message
    const sysMessage: ChatMessage = {
      id: generateId(),
      codename: 'SYSTEM',
      content: `User ${hubState.codename} uploaded [${file.name}] to the Crypt Exchange.`,
      timestamp: Date.now(),
      type: 'system',
    };

    onUpdateHubState({
      messages: [...hubState.messages, sysMessage],
      files: [...hubState.files, newFile],
    });
  }, [hubState, onUpdateHubState]);

  const handleDownload = useCallback((file: SharedFile) => {
    setDownloadingId(file.id);

    setTimeout(() => {
      setDownloadingId(null);

      // System message
      const sysMessage: ChatMessage = {
        id: generateId(),
        codename: 'SYSTEM',
        content: `User ${hubState.codename} extracted [${file.name}] using code ${file.extractionCode}.`,
        timestamp: Date.now(),
        type: 'system',
      };

      onUpdateHubState({
        messages: [...hubState.messages, sysMessage],
      });
    }, 1500);
  }, [hubState, onUpdateHubState]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div ref={hubRef} className="fixed inset-0 bg-void flex flex-col opacity-0">
      {/* SOS Flash Overlay */}
      <div
        ref={sosFlashRef}
        className="absolute inset-0 pointer-events-none z-50 border-4 border-transparent"
      />

      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-midnight border-b border-teal/15 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal" />
            <span className="font-bold text-sm tracking-[0.2em] text-[#E0E0E0]">
              SOUL
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-teal/10 border border-teal/20">
            <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
            <span className="font-mono text-[10px] text-teal tracking-wider">
              {hubState.onlineUsers.length} OPERATIVES ONLINE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-teal/60 tracking-wider hidden sm:inline">
            {hubState.codename}
          </span>
          {hubState.isAdmin && (
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="p-2 hover:bg-crimson/10 border border-crimson/30 text-crimson transition-all duration-200"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowSosConfirm(true)}
            className="p-2 hover:bg-crimson/10 border border-crimson/30 text-crimson transition-all duration-200"
            title="SOS Alert"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-teal/10 border border-teal/30 text-teal transition-all duration-200"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="flex bg-midnight/50 border-b border-teal/10">
        {[
          { id: 'chat' as const, label: 'MARITIME TERMINAL', icon: MessageSquare },
          { id: 'files' as const, label: 'CRYPT EXCHANGE', icon: Upload },
          { id: 'users' as const, label: 'SOULS', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-[10px] tracking-[0.15em] transition-all duration-300 border-b-2 ${
              activeTab === tab.id
                ? 'text-teal border-teal bg-teal/5'
                : 'text-teal/40 border-transparent hover:text-teal/60 hover:bg-teal/5'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {hubState.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`animate-fade-in-up ${
                    msg.type === 'system'
                      ? 'flex justify-center'
                      : msg.type === 'sos'
                      ? 'flex justify-center'
                      : 'flex'
                  }`}
                >
                  {msg.type === 'system' && (
                    <div className="px-4 py-2 bg-teal/5 border border-teal/20 max-w-lg">
                      <p className="font-mono text-[10px] text-teal/60 tracking-wider text-center">
                        {formatTimestamp(msg.timestamp)} {msg.content}
                      </p>
                    </div>
                  )}

                  {msg.type === 'sos' && (
                    <div className="px-6 py-3 bg-crimson/10 border-2 border-crimson animate-pulse">
                      <p className="font-mono text-xs text-crimson font-bold tracking-[0.2em] text-center">
                        {formatTimestamp(msg.timestamp)} {msg.content}
                      </p>
                    </div>
                  )}

                  {msg.type === 'normal' && (
                    <div className="max-w-lg">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-mono text-[10px] text-teal/40">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                        <span
                          className={`font-mono text-xs font-bold tracking-wider ${
                            msg.codename === hubState.codename
                              ? 'text-teal'
                              : 'text-[#E0E0E0]'
                          }`}
                        >
                          {msg.codename}
                        </span>
                        {msg.codename !== hubState.codename && (
                          <button
                            onClick={() => setReplyingTo(msg.codename)}
                            className="font-mono text-[10px] text-teal/30 hover:text-teal transition-colors"
                          >
                            REPLY
                          </button>
                        )}
                      </div>
                      <div
                        className={`px-4 py-2 border ${
                          msg.codename === hubState.codename
                            ? 'bg-teal/10 border-teal/30 ml-4'
                            : 'bg-midnight/50 border-teal/10'
                        }`}
                      >
                        <p className="font-mono text-xs text-[#E0E0E0]/80 leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-midnight border-t border-teal/15">
              {replyingTo && (
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className="font-mono text-[10px] text-teal/50">
                    Replying to {replyingTo}
                  </span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-teal/30 hover:text-crimson"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Transmit message..."
                  className="flex-1 bg-void border border-teal/20 focus:border-teal px-4 py-2 font-mono text-sm text-[#E0E0E0] placeholder:text-teal/20 outline-none transition-all duration-300"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-teal text-void hover:bg-teal-light transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="h-full flex flex-col p-4">
            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed p-6 mb-4 text-center transition-all duration-300 ${
                dragOver
                  ? 'border-teal bg-teal/10'
                  : 'border-teal/20 hover:border-teal/40 bg-midnight/30'
              }`}
            >
              <Upload className="w-6 h-6 text-teal/40 mx-auto mb-2" />
              <p className="font-mono text-xs text-teal/60 tracking-wider">
                DROP MANIFEST HERE
              </p>
              <p className="font-mono text-[10px] text-teal/30 mt-1">
                or click to browse
              </p>
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="absolute inset-0 cursor-pointer"
              />
            </div>

            {/* File Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {hubState.files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-midnight/50 border border-teal/15 hover:border-teal/40 p-4 transition-all duration-200 group animate-fade-in-up"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-teal/60">{getFileIcon(file.type)}</span>
                        <span className="font-mono text-xs text-[#E0E0E0] truncate max-w-[120px]">
                          {file.name}
                        </span>
                      </div>
                      {hubState.isAdmin && (
                        <button className="text-crimson/40 hover:text-crimson opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-teal/40">SIZE</span>
                        <span className="text-teal/60">{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-teal/40">SOURCE</span>
                        <span className="text-teal/60">{file.uploadedBy}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-teal/40">EXTRACTION</span>
                        <span className="text-teal font-bold tracking-wider">{file.extractionCode}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.id}
                      className="w-full py-2 bg-teal/10 border border-teal/30 hover:bg-teal/20 hover:border-teal/50 font-mono text-[10px] text-teal tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {downloadingId === file.id ? (
                        <div className="w-3 h-3 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          EXTRACT
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {hubState.files.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-teal/30">
                  <File className="w-8 h-8 mb-2" />
                  <p className="font-mono text-xs tracking-wider">NO FILES IN EXCHANGE</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-2">
              {hubState.onlineUsers.map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-midnight/50 border border-teal/10 hover:border-teal/30 px-4 py-3 transition-all duration-200 animate-slide-in-right"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-teal/10 border border-teal/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-teal/60" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-teal rounded-full border-2 border-void" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[#E0E0E0] tracking-wider">
                          {user.codename}
                        </span>
                        {user.isAdmin && (
                          <span className="px-1.5 py-0.5 bg-crimson/20 border border-crimson/40 font-mono text-[9px] text-crimson tracking-wider">
                            ADMIN
                          </span>
                        )}
                        {user.codename === hubState.codename && (
                          <span className="px-1.5 py-0.5 bg-teal/20 border border-teal/40 font-mono text-[9px] text-teal tracking-wider">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-teal/40">
                        Connected {formatTimestamp(user.joinTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-teal/30" />
                    <span className="font-mono text-[10px] text-teal/40">
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* SOS Confirmation Modal */}
      {showSosConfirm && (
        <div className="absolute inset-0 bg-void/80 flex items-center justify-center z-40">
          <div className="bg-midnight border-2 border-crimson p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-crimson" />
              <h3 className="font-mono text-sm text-crimson font-bold tracking-[0.2em]">
                SOS ALERT
              </h3>
            </div>
            <p className="font-mono text-xs text-[#E0E0E0]/70 mb-6 leading-relaxed">
              This will broadcast an emergency alert to all operatives in the harbor. Use only in critical situations.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSosConfirm(false)}
                className="flex-1 py-2 border border-teal/30 font-mono text-xs text-teal tracking-wider hover:bg-teal/10 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleSos}
                className="flex-1 py-2 bg-crimson text-white font-mono text-xs tracking-wider hover:bg-crimson/80 transition-all"
              >
                BROADCAST
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdmin && hubState.isAdmin && (
        <div className="absolute inset-0 bg-void/80 flex items-center justify-center z-40">
          <div className="bg-midnight border border-crimson/40 p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-crimson" />
                <h3 className="font-mono text-sm text-crimson font-bold tracking-[0.2em]">
                  ADMIN TERMINAL
                </h3>
              </div>
              <button
                onClick={() => setShowAdmin(false)}
                className="text-teal/40 hover:text-teal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-void p-3 border border-teal/10">
                <p className="font-mono text-[10px] text-teal/40 tracking-wider">OPERATIVES</p>
                <p className="font-mono text-2xl text-teal font-bold">{hubState.onlineUsers.length}</p>
              </div>
              <div className="bg-void p-3 border border-teal/10">
                <p className="font-mono text-[10px] text-teal/40 tracking-wider">FILES</p>
                <p className="font-mono text-2xl text-teal font-bold">{hubState.files.length}</p>
              </div>
              <div className="bg-void p-3 border border-teal/10">
                <p className="font-mono text-[10px] text-teal/40 tracking-wider">MESSAGES</p>
                <p className="font-mono text-2xl text-teal font-bold">{hubState.messages.length}</p>
              </div>
              <div className="bg-void p-3 border border-teal/10">
                <p className="font-mono text-[10px] text-teal/40 tracking-wider">STATUS</p>
                <p className="font-mono text-sm text-teal font-bold tracking-wider flex items-center gap-1">
                  <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
                  ACTIVE
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 mb-6">
              <h4 className="font-mono text-[10px] text-teal/60 tracking-[0.2em]">CONTROLS</h4>

              <div className="flex items-center justify-between bg-void p-3 border border-teal/10">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-teal/40" />
                  <span className="font-mono text-xs text-[#E0E0E0]/70">Lock Uploads</span>
                </div>
                <button className="px-3 py-1 bg-teal/10 border border-teal/30 font-mono text-[10px] text-teal tracking-wider hover:bg-teal/20 transition-all">
                  ENABLE
                </button>
              </div>

              <div className="flex items-center justify-between bg-void p-3 border border-teal/10">
                <div className="flex items-center gap-2">
                  <Unlock className="w-3 h-3 text-teal/40" />
                  <span className="font-mono text-xs text-[#E0E0E0]/70">Lock Downloads</span>
                </div>
                <button className="px-3 py-1 bg-teal/10 border border-teal/30 font-mono text-[10px] text-teal tracking-wider hover:bg-teal/20 transition-all">
                  ENABLE
                </button>
              </div>

              <div className="flex items-center justify-between bg-void p-3 border border-teal/10">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-teal/40" />
                  <span className="font-mono text-xs text-[#E0E0E0]/70">Monitor Mode</span>
                </div>
                <button className="px-3 py-1 bg-crimson/10 border border-crimson/30 font-mono text-[10px] text-crimson tracking-wider hover:bg-crimson/20 transition-all">
                  ACTIVATE
                </button>
              </div>
            </div>

            {/* Message Log */}
            <div>
              <h4 className="font-mono text-[10px] text-teal/60 tracking-[0.2em] mb-2">RECENT ACTIVITY</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {hubState.messages.slice(-5).reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className="font-mono text-[10px] text-teal/40 py-1 border-b border-teal/5"
                  >
                    {formatTimestamp(msg.timestamp)} {msg.codename}: {msg.content.substring(0, 50)}...
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
