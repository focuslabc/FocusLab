import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, UserPlus, UserCheck, MessageCircle, Map, Ban, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileModalProps {
  userId: string;
  currentUserId: string;
  onClose: () => void;
  onSendFriendRequest: (userId: string) => void;
  onOpenDM: (userId: string) => void;
  onBlock?: (userId: string) => void;
  friendshipStatus?: 'none' | 'pending' | 'accepted';
}

const LEVELS = ['Iniciante', 'Operador', 'Executor', 'Arquiteto', 'Mestre'];

export function UserProfileModal({ userId, currentUserId, onClose, onSendFriendRequest, onOpenDM, onBlock, friendshipStatus = 'none' }: UserProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle().then(({ data }) => setProfile(data));
    supabase.rpc('get_user_streak', { uid: userId }).then(({ data }) => setStreak(data || 0));
    supabase.from('friendships').select('id', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .then(({ count }) => setFriendCount(count || 0));
  }, [userId]);

  const level = streak >= 120 ? 4 : streak >= 61 ? 3 : streak >= 31 ? 2 : streak >= 11 ? 1 : 0;

  if (!profile) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        
        <div className="flex flex-col items-center text-center mb-6">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-red-900/30" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-2xl font-bold text-zinc-500">
              {(profile.display_name || 'O')[0].toUpperCase()}
            </div>
          )}
          <h3 className="text-xl font-bold text-white">{profile.display_name || 'Operador'}</h3>
          {profile.username && <p className="text-zinc-500 text-sm">@{profile.username}</p>}
          {profile.bio && <p className="text-zinc-400 text-sm mt-2 max-w-xs">{profile.bio}</p>}
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-2">
            <Map className="w-4 h-4 text-red-500" />
            <span className="text-sm text-white font-bold">{LEVELS[level]}</span>
            <span className="text-xs text-zinc-600">({streak}d)</span>
          </div>
          <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white font-bold">{friendCount}</span>
            <span className="text-xs text-zinc-600">amigo{friendCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {userId !== currentUserId && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {friendshipStatus === 'accepted' ? (
                <div className="flex-1 py-2.5 bg-emerald-900/20 text-emerald-400 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" /> Amigos
                </div>
              ) : friendshipStatus === 'pending' ? (
                <div className="flex-1 py-2.5 bg-yellow-900/20 text-yellow-400 rounded-xl font-bold text-sm text-center">
                  Solicitação Pendente
                </div>
              ) : (
                <button onClick={() => onSendFriendRequest(userId)} className="flex-1 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" /> Adicionar Amigo
                </button>
              )}
              <button onClick={() => onOpenDM(userId)} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            {onBlock && (
              <button onClick={() => onBlock(userId)} className="w-full py-2 bg-zinc-900 hover:bg-red-900/20 text-zinc-500 hover:text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                <Ban className="w-3.5 h-3.5" /> Bloquear Usuário
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
