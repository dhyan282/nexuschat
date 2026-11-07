import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { getSocket } from '@/socket/client';
import { useAuthStore } from '@/stores/authStore';
import { Conversation, Message, User } from '@/types';
import { Button, Input, Avatar, Modal } from '@/components/ui';
import { Search, Plus, Send, Paperclip, Smile, MoreVertical, Users, Phone, Video, Settings, LogOut, MessageSquare, Hash, Star, Archive, Bell, X, Check, CheckCheck } from 'lucide-react';

export default function Dashboard() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user)!;
  const token = useAuthStore(s => s.accessToken)!;
  const logout = useAuthStore(s => s.logout);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRight, setShowRight] = useState(true);
  const [showNewConv, setShowNewConv] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojis = ['😀','😂','😍','😊','😎','🤔','👍','👎','❤️','🔥','🎉','💯','✅','❌','⭐','🚀','💡','📌','📎','📁'];
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const typingTimer = useRef<any>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/conversations')).data,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['messages', activeId],
    queryFn: async () => activeId ? (await api.get(`/messages/${activeId}`)).data : [],
    enabled: !!activeId,
  });

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });
  const unreadNotifCount = notifications.filter((n: any) => !n.read).length;

  const activeConv = conversations.find(c => c._id === activeId);

  // socket
  useEffect(() => {
    const socket = getSocket(token);
    socket.on('message:new', (msg: Message) => {
      qc.setQueryData<Message[]>(['messages', (msg as any).conversationId], (old = []) => {
        if (old.some(m => m._id === msg._id)) return old;
        return [...old, msg];
      });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    });
    socket.on('typing:start', ({ userId }: any) => {
      if (userId !== user._id) setTypingUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
    });
    socket.on('typing:stop', ({ userId }: any) => {
      setTypingUsers(prev => prev.filter(u => u !== userId));
    });
    socket.on('user:online', ({ userId }: any) => setOnlineUsers(prev => new Set(prev).add(userId)));
    socket.on('user:offline', ({ userId }: any) => setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; }));
    socket.on('message:read', ({ userId }: any) => {
      qc.invalidateQueries({ queryKey: ['messages', activeId] });
    });
    socket.on('notification:new', (n: any) => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        new Notification(n.title || 'New message', { body: n.body || '', icon: '/vite.svg' });
      }
    });
    socket.on('message:delete', ({ messageId }: any) => {
      qc.setQueryData<Message[]>(['messages', activeId], (old = []) => old.map(m => m._id === messageId ? { ...m, deletedAt: new Date().toISOString(), content: '' } : m));
    });
    socket.on('message:reaction', ({ messageId, reactions }: any) => {
      qc.setQueryData<Message[]>(['messages', activeId], (old = []) => old.map(m => m._id === messageId ? { ...m, reactions } : m));
    });
    return () => { socket.off('message:new'); socket.off('typing:start'); socket.off('typing:stop'); socket.off('user:online'); socket.off('user:offline'); socket.off('message:read'); socket.off('message:delete'); socket.off('message:reaction'); socket.off('notification:new'); };
  }, [token, activeId]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // mark read on open
  useEffect(() => {
    if (activeId) {
      api.post(`/messages/${activeId}/read`, {}).catch(() => {});
      const socket = getSocket(token);
      const last = messages[messages.length - 1];
      if (last) socket.emit('message:read', { conversationId: activeId, messageId: last._id });
    }
  }, [activeId, messages.length]);

  function onTyping() {
    const socket = getSocket(token);
    socket.emit('typing:start', { conversationId: activeId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('typing:stop', { conversationId: activeId }), 1200);
  }

  const sendMutation = useMutation({
    mutationFn: async () => {
      const socket = getSocket(token);
      return new Promise((resolve, reject) => {
        socket.emit('message:send', { conversationId: activeId, content: text }, (res: any) => {
          if (res?.error) reject(new Error(res.error));
          else {
            if (res?.message) {
              qc.setQueryData<Message[]>(['messages', activeId], (old = []) => {
                if (old.some(m => m._id === res.message._id)) return old;
                return [...old, res.message];
              });
            }
            resolve(res);
          }
        });
      });
    },
    onSuccess: () => { setText(''); },
  });

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    try { await sendMutation.mutateAsync(); } catch {}
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !activeId) return;
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('files', f));
    try {
      const { data } = await api.post('/files/upload', fd);
      const attachments = Array.isArray(data) ? data : [data];
      const socket = getSocket(token);
      socket.emit('message:send', { conversationId: activeId, content: '', attachments }, (res: any) => {
        if (res?.error) console.error(res.error);
      });
    } catch (err) { console.error(err); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function createConv(type: string, name?: string, participants: string[] = []) {
    const { data } = await api.post('/conversations', { type, name, participants });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    setActiveId(data._id);
    setShowNewConv(false);
  }

  const filtered = conversations.filter(c => {
    const label = c.type === 'direct' ? (c.participants.find(p => p._id !== user._id)?.name || '') : (c.name || '');
    return label.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="h-screen flex bg-bg text-white overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-sidebar flex flex-col border-r border-slate-800">
        <div className="p-4 flex items-center gap-2 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold">N</div>
          <span className="font-semibold text-lg">NexusChat</span>
          <div className="ml-auto relative">
            <button className="text-muted hover:text-white relative" onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={20} />
              {unreadNotifCount > 0 && <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] rounded-full px-1">{unreadNotifCount}</span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-8 w-72 bg-card border border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  <button className="text-xs text-primary" onClick={() => { api.post('/notifications/read-all'); qc.invalidateQueries({ queryKey: ['notifications'] }); }}>Mark all read</button>
                </div>
                {notifications.length === 0 && <div className="p-3 text-muted text-sm">No notifications</div>}
                {notifications.map((n: any) => (
                  <div key={n._id} className={`p-3 border-b border-slate-800 text-sm ${n.read ? 'opacity-60' : ''}`}>
                    <div className="font-medium">{n.title}</div>
                    <div className="text-muted text-xs">{n.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-muted" size={16} />
            <Input className="pl-9" placeholder="Search conversations" value={search} onChange={(e: any) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="px-3 pb-2 flex gap-2">
          <Button className="flex-1 text-sm" onClick={() => setShowNewConv(true)}><Plus size={16} className="inline mr-1" />New</Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Section title="Direct Messages">
            {filtered.filter(c => c.type === 'direct').map(c => (
              <ConvItem key={c._id} conv={c} user={user} active={activeId === c._id} onlineUsers={onlineUsers} onClick={() => setActiveId(c._id)} />
            ))}
          </Section>
          <Section title="Groups">
            {filtered.filter(c => c.type === 'group').map(c => (
              <ConvItem key={c._id} conv={c} user={user} active={activeId === c._id} onlineUsers={onlineUsers} onClick={() => setActiveId(c._id)} />
            ))}
          </Section>
          <Section title="Channels">
            {filtered.filter(c => c.type === 'channel').map(c => (
              <ConvItem key={c._id} conv={c} user={user} active={activeId === c._id} onlineUsers={onlineUsers} onClick={() => setActiveId(c._id)} />
            ))}
          </Section>
        </div>
        <div className="p-3 border-t border-slate-800 flex items-center gap-2">
          <Avatar src={user.avatar} name={user.name} size={36} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted truncate">@{user.username}</div>
          </div>
          <button onClick={() => { logout(); }} className="text-muted hover:text-white"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* MIDDLE */}
      <main className="flex-1 flex flex-col">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-muted">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <header className="px-4 py-3 border-b border-slate-800 flex items-center gap-3 bg-sidebar/50">
              <Avatar src={activeConv.avatar || (activeConv.type === 'direct' ? activeConv.participants.find(p => p._id !== user._id)?.avatar : undefined)} name={activeConv.type === 'direct' ? (activeConv.participants.find(p => p._id !== user._id)?.name || '') : (activeConv.name || '')} size={40} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{activeConv.type === 'direct' ? activeConv.participants.find(p => p._id !== user._id)?.name : activeConv.name}</div>
                <div className="text-xs text-muted">{activeConv.type === 'direct' ? (onlineUsers.has(activeConv.participants.find(p => p._id !== user._id)?._id || '') ? 'Online' : 'Offline') : `${activeConv.participants.length} members`}</div>
              </div>
              <button className="text-muted hover:text-white" onClick={() => setShowRight(!showRight)}><MoreVertical size={20} /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map(m => <MessageBubble key={m._id} m={m} user={user} conv={activeConv} />)}
              {typingUsers.length > 0 && (
                <div className="text-xs text-muted italic">typing...</div>
              )}
              <div ref={messagesEnd} />
            </div>
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-slate-800 flex items-center gap-2">
              <button type="button" className="text-muted hover:text-white" onClick={() => fileInputRef.current?.click()}><Paperclip size={20} /></button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} />
              <Input className="flex-1" placeholder="Type a message..." value={text} onChange={(e: any) => { setText(e.target.value); onTyping(); }} />
              <div className="relative">
                <button type="button" className="text-muted hover:text-white" onClick={() => setShowEmoji(!showEmoji)}><Smile size={20} /></button>
                {showEmoji && (
                  <div className="absolute bottom-10 right-0 bg-card border border-slate-700 rounded-lg p-2 grid grid-cols-5 gap-1 z-50 shadow-xl">
                    {emojis.map(e => (
                      <button key={e} type="button" className="text-xl hover:bg-slate-800 rounded p-1" onClick={() => { setText(t => t + e); setShowEmoji(false); }}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={!text.trim()}><Send size={16} /></Button>
            </form>
          </>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      {showRight && activeConv && (
        <aside className="w-72 bg-sidebar border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold">Conversation info</span>
            <button className="text-muted" onClick={() => setShowRight(false)}><X size={18} /></button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
            <div>
              <div className="text-xs text-muted mb-2">Members</div>
              {activeConv.participants.map(p => (
                <div key={p._id} className="flex items-center gap-2 py-1">
                  <Avatar src={p.avatar} name={p.name} size={28} />
                  <span className="text-sm">{p.name}</span>
                  {onlineUsers.has(p._id) && <span className="w-2 h-2 rounded-full bg-success ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      <Modal open={showNewConv} onClose={() => setShowNewConv(false)} title="New conversation">
        <NewConvForm onCreate={createConv} />
      </Modal>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="px-2 py-2">
      <div className="text-xs text-muted uppercase tracking-wider px-2 mb-1">{title}</div>
      {children}
    </div>
  );
}

function ConvItem({ conv, user, active, onlineUsers, onClick }: any) {
  const other = conv.type === 'direct' ? conv.participants.find((p: any) => p._id !== user._id) : null;
  const label = conv.type === 'direct' ? (other?.name || 'Direct') : (conv.name || 'Group');
  const unread = conv.unreadCounts?.[user._id] || 0;
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800 ${active ? 'bg-slate-800' : ''}`}>
      <Avatar src={conv.avatar || other?.avatar} name={label} size={36} />
      <div className="flex-1 min-w-0 text-left">
        <div className="text-sm font-medium truncate">{label}</div>
        <div className="text-xs text-muted truncate">{conv.lastMessage?.content || 'No messages yet'}</div>
      </div>
      {unread > 0 && <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">{unread}</span>}
      {conv.type === 'direct' && other && onlineUsers.has(other._id) && <span className="w-2 h-2 rounded-full bg-success" />}
    </button>
  );
}

function MessageBubble({ m, user, conv }: any) {
  const isMine = (typeof m.senderId === 'string' ? m.senderId : m.senderId?._id) === user._id;
  const sender = typeof m.senderId === 'object' ? m.senderId : null;
  const read = (m.readBy || []).length > 0;
  if (m.deletedAt) {
    return <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}><div className="text-xs text-muted italic px-3 py-2">Message deleted</div></div>;
  }
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isMine && <Avatar src={sender?.avatar} name={sender?.name || '?'} size={28} />}
      <div className={`max-w-[70%] px-3 py-2 rounded-2xl ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-card text-white rounded-bl-sm'}`}>
        {!isMine && conv.type !== 'direct' && <div className="text-xs text-primary font-semibold mb-1">{sender?.name}</div>}
        {m.replyTo && <div className="text-xs opacity-70 border-l-2 border-white/30 pl-2 mb-1">{typeof m.replyTo === 'object' ? (m.replyTo as any).content : ''}</div>}
        <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
        {m.attachments?.map((a: any, i: number) => (
          a.type?.startsWith('image/') ? (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block mt-1">
              <img src={a.url} alt={a.name} className="max-w-[240px] rounded-lg" />
            </a>
          ) : (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs underline mt-1 bg-black/20 rounded px-2 py-1">
              <Paperclip size={12} /> {a.name} ({Math.round(a.size/1024)}KB)
            </a>
          )
        ))}
        <div className="flex items-center gap-1 mt-1 justify-end">
          <span className="text-[10px] opacity-60">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {m.editedAt && <span className="text-[10px] opacity-60">(edited)</span>}
          {isMine && (read ? <CheckCheck size={12} className="text-blue-300" /> : <Check size={12} className="opacity-60" />)}
        </div>
        {m.reactions && m.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">{m.reactions.map((r: any) => <span key={r.emoji} className="text-xs bg-black/20 rounded-full px-2">{r.emoji} {r.users.length}</span>)}</div>
        )}
      </div>
    </div>
  );
}

function NewConvForm({ onCreate }: any) {
  const [type, setType] = useState('direct');
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  async function searchUsers(q: string) {
    setQuery(q);
    if (!q) { setResults([]); return; }
    const { data } = await api.get('/users/search', { params: { q } });
    setResults(data);
  }

  return (
    <div className="space-y-3">
      <select className="w-full px-3 py-2 rounded-lg bg-card border border-slate-700" value={type} onChange={e => setType(e.target.value)}>
        <option value="direct">Direct message</option>
        <option value="group">Group</option>
        <option value="channel">Channel</option>
      </select>
      {type !== 'direct' && <Input placeholder="Name" value={name} onChange={(e: any) => setName(e.target.value)} />}
      <Input placeholder="Search users" value={query} onChange={(e: any) => searchUsers(e.target.value)} />
      <div className="max-h-40 overflow-y-auto space-y-1">
        {results.map(u => (
          <button key={u._id} onClick={() => setSelected(s => s.includes(u._id) ? s.filter(x => x !== u._id) : [...s, u._id])}
            className={`w-full text-left px-2 py-1 rounded ${selected.includes(u._id) ? 'bg-primary/30' : 'hover:bg-slate-800'}`}>
            {u.name} <span className="text-muted text-xs">@{u.username}</span>
          </button>
        ))}
      </div>
      <Button className="w-full" onClick={() => onCreate(type, name, selected)} disabled={selected.length === 0}>Create</Button>
    </div>
  );
}

