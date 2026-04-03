import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Send, ArrowLeft, UserPlus, UserCheck, X, Loader2, MessageCircle, Heart } from 'lucide-react';
import { useFriendships, usePrivateMessages, searchUsers } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';

export function FriLabsView({ userId }: { userId: string }) {
  const { friends, pendingRequests, loading, sendRequest, acceptRequest, declineRequest, removeFriend, getFriendUserId } = useFriendships(userId);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [dmProfile, setDmProfile] = useState<any>(null);
  const [tab, setTab] = useState<'friends' | 'chats'>('chats');
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // Collect unique DM partner IDs from friends
  const friendUserIds = friends.map(f => getFriendUserId(f));

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const results = await searchUsers(q);
      setSearchResults(results.filter(r => r.user_id !== userId));
      setSearching(false);
    }, 400);
  };

  useEffect(() => {
    if (!activeDM) { setDmProfile(null); return; }
    supabase.from('profiles').select('*').eq('user_id', activeDM).maybeSingle().then(({ data }) => setDmProfile(data));
  }, [activeDM]);

  if (activeDM) {
    return <DMChat userId={userId} otherUserId={activeDM} otherProfile={dmProfile} onBack={() => setActiveDM(null)} />;
  }

  const getFriendshipStatus = (uid: string) => {
    const accepted = friends.find(f => f.requester_id === uid || f.addressee_id === uid);
    if (accepted) return 'accepted';
    const pending = pendingRequests.find(f => f.requester_id === uid);
    if (pending) return 'pending';
    return 'none';
  };

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" /> FriLabs
      </h1>
      <p className="text-zinc-500 font-medium mb-4 text-sm sm:text-base">Encontre amigos e converse. <span className="text-zinc-600">({friends.length} amigo{friends.length !== 1 ? 's' : ''})</span></p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('chats')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 ${tab === 'chats' ? 'bg-red-900 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
          <MessageCircle className="w-4 h-4" /> Conversas
        </button>
        <button onClick={() => setTab('friends')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 ${tab === 'friends' ? 'bg-red-900 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
          <Users className="w-4 h-4" /> Amigos ({friends.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-lg relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Buscar por @username ou nome..."
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-600" />
        {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-10 max-h-60 overflow-y-auto">
            {searchResults.map(u => {
              const status = getFriendshipStatus(u.user_id);
              return (
                <div key={u.user_id} className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">{(u.display_name || 'O')[0]}</div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.display_name}</p>
                    {u.username && <p className="text-zinc-500 text-xs">@{u.username}</p>}
                  </div>
                  {status === 'accepted' ? (
                    <button onClick={() => { setActiveDM(u.user_id); setSearchResults([]); setSearchQuery(''); }} className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-lg text-xs font-bold"><MessageCircle className="w-3 h-3 inline mr-1" />Chat</button>
                  ) : status === 'pending' ? (
                    <span className="text-yellow-500 text-xs font-bold">Pendente</span>
                  ) : (
                    <button onClick={() => sendRequest(u.user_id)} className="px-3 py-1.5 bg-red-900/30 text-red-400 rounded-lg text-xs font-bold"><UserPlus className="w-3 h-3 inline mr-1" />Adicionar</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Solicitações Pendentes ({pendingRequests.length})</h3>
          <div className="space-y-2">
            {pendingRequests.map(req => (
              <PendingRequestCard key={req.id} request={req} onAccept={() => acceptRequest(req.id)} onDecline={() => declineRequest(req.id)} />
            ))}
          </div>
        </div>
      )}

      {tab === 'chats' ? (
        /* DM List */
        <div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Conversas Privadas</h3>
          {loading ? <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" /> :
            friends.length === 0 ? (
              <div className="py-12 text-center"><MessageCircle className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><p className="text-zinc-500 font-medium">Nenhuma conversa ainda</p><p className="text-zinc-600 text-sm mt-1">Adicione amigos para começar a conversar.</p></div>
            ) : (
              <div className="space-y-2 max-w-2xl">
                {friends.map(f => {
                  const friendId = getFriendUserId(f);
                  return <DMListItem key={f.id} friendUserId={friendId} onOpen={() => setActiveDM(friendId)} />;
                })}
              </div>
            )}
        </div>
      ) : (
        /* Friends List */
        <div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Amigos ({friends.length})</h3>
          {loading ? <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" /> :
            friends.length === 0 ? (
              <div className="py-12 text-center"><Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><p className="text-zinc-500 font-medium">Nenhum amigo ainda</p><p className="text-zinc-600 text-sm mt-1">Use a busca para encontrar operadores.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {friends.map(f => (
                  <FriendCard key={f.id} friendUserId={getFriendUserId(f)} onOpenDM={(uid) => { setActiveDM(uid); setTab('chats'); }} onRemove={() => removeFriend(f.id)} />
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function DMListItem({ friendUserId, onOpen }: { friendUserId: string; onOpen: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    supabase.from('profiles').select('*').eq('user_id', friendUserId).maybeSingle().then(({ data }) => setProfile(data));
  }, [friendUserId]);

  return (
    <button onClick={onOpen} className="w-full flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-xl hover:border-red-900/30 transition-all text-left">
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-500">{(profile?.display_name || 'O')[0]}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold truncate">{profile?.display_name || 'Operador'}</p>
        {profile?.username && <p className="text-zinc-500 text-xs">@{profile.username}</p>}
      </div>
      <MessageCircle className="w-4 h-4 text-zinc-600" />
    </button>
  );
}

function PendingRequestCard({ request, onAccept, onDecline }: { request: any; onAccept: () => void; onDecline: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    supabase.from('profiles').select('*').eq('user_id', request.requester_id).maybeSingle().then(({ data }) => setProfile(data));
  }, [request.requester_id]);

  return (
    <div className="flex items-center gap-3 p-3 bg-black/20 border border-yellow-900/20 rounded-xl">
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-zinc-800" />}
      <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{profile?.display_name || 'Operador'}</p>{profile?.username && <p className="text-zinc-500 text-xs">@{profile.username}</p>}</div>
      <button onClick={onAccept} className="px-3 py-1.5 bg-emerald-900/30 text-emerald-400 rounded-lg text-xs font-bold">Aceitar</button>
      <button onClick={onDecline} className="px-3 py-1.5 bg-red-900/30 text-red-400 rounded-lg text-xs font-bold">Recusar</button>
    </div>
  );
}

function FriendCard({ friendUserId, onOpenDM, onRemove }: { friendUserId: string; onOpenDM: (uid: string) => void; onRemove: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    supabase.from('profiles').select('*').eq('user_id', friendUserId).maybeSingle().then(({ data }) => setProfile(data));
  }, [friendUserId]);

  return (
    <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-3">
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-500">{(profile?.display_name || 'O')[0]}</div>}
      <div className="flex-1 min-w-0"><p className="text-white text-sm font-bold truncate">{profile?.display_name || 'Operador'}</p>{profile?.username && <p className="text-zinc-500 text-xs">@{profile.username}</p>}</div>
      <button onClick={() => onOpenDM(friendUserId)} className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors"><MessageCircle className="w-4 h-4" /></button>
    </div>
  );
}

function DMChat({ userId, otherUserId, otherProfile, onBack }: { userId: string; otherUserId: string; otherProfile: any; onBack: () => void }) {
  const { messages, sendMessage } = usePrivateMessages(userId, otherUserId);
  const [input, setInput] = useState('');
  const [myProfile, setMyProfile] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle().then(({ data }) => setMyProfile(data));
  }, [userId]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        {otherProfile?.avatar_url ? <img src={otherProfile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">{(otherProfile?.display_name || 'O')[0]}</div>}
        <div><p className="text-white font-bold text-sm">{otherProfile?.display_name || 'Operador'}</p>{otherProfile?.username && <p className="text-zinc-500 text-xs">@{otherProfile.username}</p>}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && <p className="text-center text-zinc-600 text-sm py-8">Nenhuma mensagem ainda.</p>}
        {messages.map((msg: any) => {
          const isMine = msg.sender_id === userId;
          const senderProfile = isMine ? myProfile : otherProfile;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
              {!isMine && (senderProfile?.avatar_url ? <img src={senderProfile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover mt-1 shrink-0" /> : <div className="w-6 h-6 rounded-full bg-zinc-800 mt-1 shrink-0" />)}
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isMine ? 'bg-red-900/30 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'}`}>
                {msg.content}
              </div>
              {isMine && (myProfile?.avatar_url ? <img src={myProfile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover mt-1 shrink-0" /> : <div className="w-6 h-6 rounded-full bg-zinc-800 mt-1 shrink-0" />)}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-600" />
          <button onClick={handleSend} className="p-3 bg-red-900 hover:bg-red-800 text-white rounded-xl transition-colors"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
