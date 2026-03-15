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
    if (error) { console.error(error); toast.error('Erro ao carregar tarefas RED'); }
    else setTasks(data || []);
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = useCallback(async (t: { text: string; category: string; completed: boolean; position: number }) => {
    if (!userId) return;
    const { error } = await supabase.from('red_tasks').insert({ ...t, user_id: userId });
    if (error) toast.error('Erro ao adicionar tarefa');
    else { toast.success('Tarefa RED adicionada'); await fetchTasks(); }
  }, [userId, fetchTasks]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const { error } = await supabase.from('red_tasks').update({ completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null }).eq('id', id);
    if (error) toast.error('Erro ao atualizar tarefa');
    else await fetchTasks();
  }, [tasks, fetchTasks]);

  const removeTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('red_tasks').delete().eq('id', id);
    if (error) toast.error('Erro ao remover tarefa');
    else { toast.success('Tarefa removida'); await fetchTasks(); }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, updates: any) => {
    const { error } = await supabase.from('red_tasks').update(updates).eq('id', id);
    if (error) toast.error('Erro ao atualizar tarefa');
    else await fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, addTask, toggleTask, removeTask, updateTask };
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
    else { toast.success('Objeto de foco atualizado'); await fetchObjective(); }
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

  const addTask = useCallback(async (text: string) => {
    if (!userId) return;
    const { error } = await supabase.from('general_tasks').insert({ text, user_id: userId, position: tasks.length });
    if (error) toast.error('Erro ao adicionar tarefa');
    else await fetchTasks();
  }, [userId, tasks.length, fetchTasks]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const { error } = await supabase.from('general_tasks').update({ completed: !task.completed }).eq('id', id);
    if (error) toast.error('Erro');
    else await fetchTasks();
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
    const { error } = await supabase.from('general_tasks').delete().in('id', completedIds);
    if (error) toast.error('Erro');
    else await fetchTasks();
  }, [tasks, fetchTasks]);

  return { tasks, loading, addTask, toggleTask, updateTaskText, removeCompleted };
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
      // Resume
      const { error } = await supabase.from('challenge_progress').update({ paused_at: null }).eq('id', id);
      if (error) toast.error('Erro'); else { toast.success('Desafio retomado!'); await fetchProgress(); }
    } else {
      // Pause
      const { error } = await supabase.from('challenge_progress').update({ paused_at: new Date().toISOString() }).eq('id', id);
      if (error) toast.error('Erro'); else { toast.success('Desafio pausado'); await fetchProgress(); }
    }
  }, [progress, fetchProgress]);

  const stopChallenge = useCallback(async (id: string) => {
    const { error } = await supabase.from('challenge_progress').update({ is_active: false, completed_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error('Erro ao parar desafio');
    else { toast.success('Desafio encerrado'); await fetchProgress(); }
  }, [fetchProgress]);

  return { progress, loading, startChallenge, pauseChallenge, stopChallenge };
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
    if (error) toast.error('Erro ao atualizar perfil');
    else { toast.success('Perfil atualizado'); await fetchProfile(); }
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

  return { profile, loading, updateProfile, uploadAvatar };
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

// ---- Coworking Messages (realtime) ----
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
        (payload) => { setMessages(prev => [...prev, payload.new]); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const sendMessage = useCallback(async (userId: string, userName: string, content: string) => {
    if (!roomId) return;
    const { error } = await supabase.from('coworking_messages').insert({ room_id: roomId, user_id: userId, user_name: userName, content });
    if (error) toast.error('Erro ao enviar mensagem');
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
