import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ---- RED Tasks ----
export function useRedTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('red_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('position');
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
    const { error } = await supabase.from('red_tasks').update({
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null,
    }).eq('id', id);
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
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
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

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('general_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('position');
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

  const updateTaskText = useCallback(async (id: string, text: string) => {
    const { error } = await supabase.from('general_tasks').update({ text }).eq('id', id);
    if (error) toast.error('Erro');
    else await fetchTasks();
  }, [fetchTasks]);

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
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('user_id', userId);
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

  return { progress, loading, startChallenge };
}

// ---- Journal Entries ----
export function useJournalEntries(userId: string | undefined) {
  const [entries, setEntries] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', today);
    if (error) console.error(error);
    else {
      const map: Record<number, string> = {};
      (data || []).forEach(e => { map[e.question_index] = e.content; });
      setEntries(map);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveEntry = useCallback(async (questionIndex: number, content: string) => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    // Upsert: check if entry exists
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('question_index', questionIndex)
      .eq('entry_date', today)
      .maybeSingle();

    if (existing) {
      await supabase.from('journal_entries').update({ content }).eq('id', existing.id);
    } else {
      await supabase.from('journal_entries').insert({ user_id: userId, question_index: questionIndex, content, entry_date: today });
    }
    setEntries(prev => ({ ...prev, [questionIndex]: content }));
  }, [userId]);

  return { entries, loading, saveEntry };
}

// ---- Profile ----
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
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

  return { profile, loading, updateProfile };
}
