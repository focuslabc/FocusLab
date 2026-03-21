import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ---- Admin Role Check ----
export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
      .then(({ data, error }) => { if (!error) setIsAdmin(!!data); setLoading(false); });
  }, [userId]);
  return { isAdmin, loading };
}

// ---- RED Tasks ----
export function useRedTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('red_tasks').select('*').eq('user_id', userId).order('position');
    if (error) console.error(error);
    else setTasks(data || []);
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = useCallback(async (t: any) => {
    if (!userId) return;
    const { error } = await supabase.from('red_tasks').insert({ ...t, user_id: userId });
    if (error) toast.error('Erro ao adicionar tarefa');
    else await fetchTasks();
  }, [userId, fetchTasks]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : null } : t));
    const { error } = await supabase.from('red_tasks').update({ completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null }).eq('id', id);
    if (error) { toast.error('Erro ao atualizar tarefa'); await fetchTasks(); }
  }, [tasks, fetchTasks]);

  const removeTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('red_tasks').delete().eq('id', id);
    if (error) { toast.error('Erro ao remover tarefa'); await fetchTasks(); }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, updates: any) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const { error } = await supabase.from('red_tasks').update(updates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar tarefa'); await fetchTasks(); }
  }, [fetchTasks]);

  const reorderTasks = useCallback(async (fromIndex: number, toIndex: number) => {
    const newTasks = [...tasks];
    const [moved] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, moved);
    const updated = newTasks.map((t, i) => ({ ...t, position: i }));
    setTasks(updated);
    for (const t of updated) {
      await supabase.from('red_tasks').update({ position: t.position }).eq('id', t.id);
    }
  }, [tasks]);

  return { tasks, loading, addTask, toggleTask, removeTask, updateTask, reorderTasks, refetch: fetchTasks };
}

// ---- Objectives ----
export function useObjective(userId: string | undefined) {
  const [objective, setObjective] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fetchObjective = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('objectives').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) console.error(error);
    else setObjective(data);
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetchObjective(); }, [fetchObjective]);

  const updateObjective = useCallback(async (updates: any) => {
    if (!objective) return;
    const { error } = await supabase.from('objectives').update(updates).eq('id', objective.id);
    if (error) toast.error('Erro ao atualizar objetivo');
    else await fetchObjective();
  }, [objective, fetchObjective]);

  const createObjective = useCallback(async (o: any) => {
    if (!userId) return;
    const { error } = await supabase.from('objectives').insert({ ...o, user_id: userId });
    if (error) toast.error('Erro ao criar objetivo');
    else await fetchObjective();
  }, [userId, fetchObjective]);

  return { objective, loading, updateObjective, createObjective };
}

// ---- General Tasks ----
export function useGeneralTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('general_tasks').select('*').eq('user_id', userId).order('position');
    if (error) console.error(error);
    else setTasks(data || []);
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Check time window: visible 04:00-23:00
  const isInWindow = useCallback(() => {
    const hour = new Date().getHours();
    return hour >= 4 && hour < 23;
  }, []);

  const addTask = useCallback(async (text: string) => {
    if (!userId) return;
    const optimistic = { id: `temp-${Date.now()}`, text, completed: false, position: tasks.length, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setTasks(prev => [...prev, optimistic]);
    const { error } = await supabase.from('general_tasks').insert({ text, user_id: userId, position: tasks.length });
    if (error) { toast.error('Erro ao adicionar tarefa'); setTasks(prev => prev.filter(t => t.id !== optimistic.id)); }
    else await fetchTasks();
  }, [userId, tasks.length, fetchTasks]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const { error } = await supabase.from('general_tasks').update({ completed: !task.completed }).eq('id', id);
    if (error) { toast.error('Erro'); await fetchTasks(); }
  }, [tasks, fetchTasks]);

  const updateTaskText = useCallback((id: string, text: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      await supabase.from('general_tasks').update({ text }).eq('id', id);
    }, 800);
  }, []);

  const removeCompleted = useCallback(async () => {
    const completedIds = tasks.filter(t => t.completed).map(t => t.id);
    if (completedIds.length === 0) return;
    setTasks(prev => prev.filter(t => !t.completed));
    const { error } = await supabase.from('general_tasks').delete().in('id', completedIds);
    if (error) { toast.error('Erro'); await fetchTasks(); }
  }, [tasks, fetchTasks]);

  return { tasks, loading, addTask, toggleTask, updateTaskText, removeCompleted, isInWindow };
}

// ---- Challenge Progress ----
export function useChallengeProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('challenge_progress').select('*').eq('user_id', userId);
    if (error) console.error(error);
    else setProgress(data || []);
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  // Update days_completed based on actual elapsed days (excluding paused time)
  const getDaysElapsed = useCallback((item: any) => {
    if (!item) return 0;
    const start = new Date(item.started_at).getTime();
    const now = item.paused_at ? new Date(item.paused_at).getTime() : Date.now();
    return Math.floor((now - start) / 86400000);
  }, []);

  const startChallenge = useCallback(async (challengeId: number) => {
    if (!userId) return;
    const { error } = await supabase.from('challenge_progress').insert({ challenge_id: challengeId, user_id: userId });
    if (error) toast.error('Erro ao iniciar desafio');
    else { toast.success('Desafio iniciado!'); await fetchProgress(); }
  }, [userId, fetchProgress]);

  const pauseChallenge = useCallback(async (id: string) => {
    const item = progress.find(p => p.id === id);
    if (!item) return;
    if (item.paused_at) {
      const { error } = await supabase.from('challenge_progress').update({ paused_at: null }).eq('id', id);
      if (error) toast.error('Erro'); else { toast.success('Desafio retomado!'); await fetchProgress(); }
    } else {
      const { error } = await supabase.from('challenge_progress').update({ paused_at: new Date().toISOString() }).eq('id', id);
      if (error) toast.error('Erro'); else { toast.success('Desafio pausado'); await fetchProgress(); }
    }
  }, [progress, fetchProgress]);

  const stopChallenge = useCallback(async (id: string) => {
    const { error } = await supabase.from('challenge_progress').update({ is_active: false, completed_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error('Erro ao parar desafio');
    else { toast.success('Desafio encerrado'); await fetchProgress(); }
  }, [fetchProgress]);

  return { progress, loading, startChallenge, pauseChallenge, stopChallenge, getDaysElapsed };
}

// ---- Journal Entries (debounced) ----
export function useJournalEntries(userId: string | undefined) {
  const [entries, setEntries] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('journal_entries').select('*').eq('user_id', userId).eq('entry_date', today);
    if (error) console.error(error);
    else {
      const map: Record<number, string> = {};
      (data || []).forEach(e => { map[e.question_index] = e.content; });
      setEntries(map);
    }
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveEntry = useCallback((questionIndex: number, content: string) => {
    if (!userId) return;
    setEntries(prev => ({ ...prev, [questionIndex]: content }));
    if (debounceTimers.current[questionIndex]) clearTimeout(debounceTimers.current[questionIndex]);
    debounceTimers.current[questionIndex] = setTimeout(async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase.from('journal_entries').select('id').eq('user_id', userId).eq('question_index', questionIndex).eq('entry_date', today).maybeSingle();
      if (existing) await supabase.from('journal_entries').update({ content }).eq('id', existing.id);
      else await supabase.from('journal_entries').insert({ user_id: userId, question_index: questionIndex, content, entry_date: today });
    }, 800);
  }, [userId]);

  return { entries, loading, saveEntry };
}

// ---- Profile ----
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) console.error(error);
    else setProfile(data);
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: any) => {
    if (!profile) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (error) {
      if (error.code === '23505' && error.message?.includes('username')) {
        toast.error('Este @username já está em uso. Escolha outro.');
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } else { toast.success('Perfil atualizado'); await fetchProfile(); }
  }, [profile, fetchProfile]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!userId) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) { toast.error('Erro ao enviar foto'); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await updateProfile({ avatar_url: publicUrl });
  }, [userId, updateProfile]);

  return { profile, loading, updateProfile, uploadAvatar, refetch: fetchProfile };
}

// ---- Projects ----
export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) console.error(error);
    else setProjects(data || []);
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const addProject = useCallback(async (title: string, description?: string) => {
    if (!userId) return;
    const { error } = await supabase.from('projects').insert({ title, description: description || '', user_id: userId });
    if (error) toast.error('Erro ao criar projeto');
    else { toast.success('Projeto criado!'); await fetchProjects(); }
  }, [userId, fetchProjects]);

  const updateProject = useCallback(async (id: string, updates: any) => {
    const { error } = await supabase.from('projects').update(updates).eq('id', id);
    if (error) toast.error('Erro ao atualizar projeto');
    else await fetchProjects();
  }, [fetchProjects]);

  const removeProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) toast.error('Erro ao remover projeto');
    else { toast.success('Projeto removido'); await fetchProjects(); }
  }, [fetchProjects]);

  return { projects, loading, addProject, updateProject, removeProject };
}

// ---- Library Content ----
export function useLibraryContent(categoryId?: string) {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    let query = supabase.from('library_content').select('*').order('created_at', { ascending: false });
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error } = await query;
    if (error) console.error(error);
    else setContent(data || []);
    setLoading(false);
  }, [categoryId]);
  useEffect(() => { fetchContent(); }, [fetchContent]);

  const addContent = useCallback(async (item: { category_id: string; title: string; description?: string; content_url?: string }) => {
    const { error } = await supabase.from('library_content').insert(item);
    if (error) toast.error('Erro ao adicionar conteúdo');
    else { toast.success('Conteúdo adicionado!'); await fetchContent(); }
  }, [fetchContent]);

  const removeContent = useCallback(async (id: string) => {
    const { error } = await supabase.from('library_content').delete().eq('id', id);
    if (error) toast.error('Erro ao remover conteúdo');
    else { toast.success('Conteúdo removido'); await fetchContent(); }
  }, [fetchContent]);

  return { content, loading, addContent, removeContent };
}

// ---- Coworking Rooms ----
export function useCoworkingRooms(userId: string | undefined) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    const { data, error } = await supabase.from('coworking_rooms').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) console.error(error);
    else setRooms(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const createRoom = useCallback(async (name: string, roomType: string, description?: string, meetLink?: string) => {
    if (!userId) return;
    const { error } = await supabase.from('coworking_rooms').insert({ name, room_type: roomType, description: description || '', created_by: userId, meet_link: meetLink || '' });
    if (error) toast.error('Erro ao criar sala');
    else { toast.success('Sala criada!'); await fetchRooms(); }
  }, [userId, fetchRooms]);

  const deleteRoom = useCallback(async (id: string) => {
    const { error } = await supabase.from('coworking_rooms').delete().eq('id', id);
    if (error) toast.error('Erro ao remover sala');
    else { toast.success('Sala removida'); await fetchRooms(); }
  }, [fetchRooms]);

  return { rooms, loading, createRoom, deleteRoom };
}

// ---- Coworking Messages (realtime with optimistic updates) ----
export function useCoworkingMessages(roomId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) { setMessages([]); setLoading(false); return; }
    
    const fetchMessages = async () => {
      const { data, error } = await supabase.from('coworking_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
      if (error) console.error(error);
      else setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();

    const channel = supabase.channel(`room-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'coworking_messages', filter: `room_id=eq.${roomId}` },
        (payload) => { 
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            const filtered = prev.filter(m => !m._optimistic || m.content !== (payload.new as any).content || m.user_id !== (payload.new as any).user_id);
            return [...filtered, payload.new];
          });
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const sendMessage = useCallback(async (userId: string, userName: string, content: string, avatarUrl?: string, replyTo?: string) => {
    if (!roomId) return;
    const optimisticMsg = { id: `temp-${Date.now()}`, room_id: roomId, user_id: userId, user_name: userName, content, avatar_url: avatarUrl || null, reply_to: replyTo || null, created_at: new Date().toISOString(), _optimistic: true };
    setMessages(prev => [...prev, optimisticMsg]);
    const insertData: any = { room_id: roomId, user_id: userId, user_name: userName, content, avatar_url: avatarUrl || null };
    if (replyTo) insertData.reply_to = replyTo;
    const { error } = await supabase.from('coworking_messages').insert(insertData);
    if (error) { toast.error('Erro ao enviar mensagem'); setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id)); }
  }, [roomId]);

  return { messages, loading, sendMessage };
}

// ---- Fetch any profile by userId ----
export function usePublicProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (!userId) return;
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [userId]);
  return profile;
}

// ---- Check username availability (uses security definer function) ----
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_username_available', { uname: username });
  if (error) {
    // Fallback to direct query if function doesn't exist
    const { data: profileData } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
    return !profileData;
  }
  return !!data;
}

// ---- Daily Streaks ----
export function useDailyStreaks(userId: string | undefined) {
  const [streak, setStreak] = useState(0);

  const fetchStreak = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.rpc('get_user_streak', { uid: userId });
    if (!error) setStreak(data || 0);
  }, [userId]);

  useEffect(() => { fetchStreak(); }, [fetchStreak]);

  const recordDay = useCallback(async (redCompleted: number, redTotal: number) => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('daily_streaks').upsert(
      { user_id: userId, streak_date: today, red_completed: redCompleted, red_total: redTotal },
      { onConflict: 'user_id,streak_date' }
    );
    if (!error) await fetchStreak();
  }, [userId, fetchStreak]);

  return { streak, recordDay };
}

// ---- Friendships ----
export function useFriendships(userId: string | undefined) {
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('friendships').select('*').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    if (error) { console.error(error); setLoading(false); return; }
    const accepted = (data || []).filter(f => f.status === 'accepted');
    const pending = (data || []).filter(f => f.status === 'pending' && f.addressee_id === userId);
    setFriends(accepted);
    setPendingRequests(pending);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchFriendships(); }, [fetchFriendships]);

  const sendRequest = useCallback(async (addresseeId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('friendships').insert({ requester_id: userId, addressee_id: addresseeId });
    if (error) {
      if (error.code === '23505') toast.error('Solicitação já enviada');
      else toast.error('Erro ao enviar solicitação');
    } else { toast.success('Solicitação enviada!'); await fetchFriendships(); }
  }, [userId, fetchFriendships]);

  const acceptRequest = useCallback(async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', friendshipId);
    if (error) toast.error('Erro');
    else { toast.success('Amizade aceita!'); await fetchFriendships(); }
  }, [fetchFriendships]);

  const declineRequest = useCallback(async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', friendshipId);
    if (error) toast.error('Erro');
    else { toast.success('Solicitação recusada'); await fetchFriendships(); }
  }, [fetchFriendships]);

  const removeFriend = useCallback(async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error) toast.error('Erro');
    else { toast.success('Amizade removida'); await fetchFriendships(); }
  }, [fetchFriendships]);

  const getFriendUserId = useCallback((friendship: any) => {
    if (!userId) return '';
    return friendship.requester_id === userId ? friendship.addressee_id : friendship.requester_id;
  }, [userId]);

  return { friends, pendingRequests, loading, sendRequest, acceptRequest, declineRequest, removeFriend, getFriendUserId };
}

// ---- Private Messages (FriLabs) ----
export function usePrivateMessages(userId: string | undefined, otherUserId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !otherUserId) { setMessages([]); setLoading(false); return; }

    const fetchMessages = async () => {
      const { data, error } = await supabase.from('private_messages').select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });
      if (error) console.error(error);
      else setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();

    const channel = supabase.channel(`dm-${[userId, otherUserId].sort().join('-')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages' },
        (payload) => {
          const msg = payload.new as any;
          if ((msg.sender_id === userId && msg.receiver_id === otherUserId) || (msg.sender_id === otherUserId && msg.receiver_id === userId)) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, otherUserId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !otherUserId) return;
    const { error } = await supabase.from('private_messages').insert({ sender_id: userId, receiver_id: otherUserId, content });
    if (error) toast.error('Erro ao enviar mensagem');
  }, [userId, otherUserId]);

  return { messages, loading, sendMessage };
}

// ---- Addiction Habits ----
export function useAddictionHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('addiction_habits').select('*').eq('user_id', userId).eq('is_active', true).order('created_at', { ascending: false });
    if (error) console.error(error);
    else setHabits(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const addHabit = useCallback(async (habit: any) => {
    if (!userId) return;
    const { error } = await supabase.from('addiction_habits').insert({ ...habit, user_id: userId });
    if (error) toast.error('Erro ao criar hábito');
    else { toast.success('Hábito registrado!'); await fetchHabits(); }
  }, [userId, fetchHabits]);

  const updateHabit = useCallback(async (id: string, updates: any) => {
    const { error } = await supabase.from('addiction_habits').update(updates).eq('id', id);
    if (error) toast.error('Erro ao atualizar');
    else await fetchHabits();
  }, [fetchHabits]);

  const removeHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('addiction_habits').update({ is_active: false }).eq('id', id);
    if (error) toast.error('Erro ao remover');
    else { toast.success('Hábito removido'); await fetchHabits(); }
  }, [fetchHabits]);

  return { habits, loading, addHabit, updateHabit, removeHabit };
}

// ---- Addiction Daily Logs ----
export function useAddictionLogs(habitId: string | undefined) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!habitId) return;
    const { data, error } = await supabase.from('addiction_daily_logs').select('*').eq('habit_id', habitId).order('log_date', { ascending: false }).limit(30);
    if (error) console.error(error);
    else setLogs(data || []);
    setLoading(false);
  }, [habitId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const logDay = useCallback(async (userId: string, didOld: boolean, didNew: boolean, cravingLevel: number, note: string) => {
    if (!habitId) return;
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('addiction_daily_logs').upsert(
      { habit_id: habitId, user_id: userId, log_date: today, did_old_routine: didOld, did_new_routine: didNew, craving_level: cravingLevel, note },
      { onConflict: 'habit_id,log_date' }
    );
    if (error) toast.error('Erro ao registrar');
    else { toast.success('Registro salvo!'); await fetchLogs(); }
  }, [habitId, fetchLogs]);

  return { logs, loading, logDay };
}

// ---- Search Users ----
export async function searchUsers(query: string): Promise<any[]> {
  const { data, error } = await supabase.from('profiles').select('*')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(10);
  if (error) { console.error(error); return []; }
  return data || [];
}
