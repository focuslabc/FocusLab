import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Eye, RotateCcw, Save, Trash2, Plus, Check, Sun, Moon, Edit3, Loader2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
  surface: string;
  surfaceBorder: string;
  text: string;
  textMuted: string;
}

export interface GlobalTheme {
  id: string;
  name: string;
  is_active: boolean;
  is_light: boolean;
  colors: ThemeColors;
}

const DEFAULT_DARK: ThemeColors = {
  primary: '#991b1b', primaryLight: '#dc2626', accent: '#ef4444',
  gradientFrom: '#0a0a0a', gradientTo: '#1c1917',
  surface: '#18181b', surfaceBorder: '#27272a',
  text: '#ffffff', textMuted: '#71717a',
};

const THEME_CACHE_KEY = 'focuslab-active-theme';

export function applyThemeToDOM(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--fl-primary', colors.primary);
  root.style.setProperty('--fl-primary-light', colors.primaryLight);
  root.style.setProperty('--fl-accent', colors.accent);
  root.style.setProperty('--fl-gradient-from', colors.gradientFrom);
  root.style.setProperty('--fl-gradient-to', colors.gradientTo);
  root.style.setProperty('--fl-surface', colors.surface);
  root.style.setProperty('--fl-surface-border', colors.surfaceBorder);
  root.style.setProperty('--fl-text', colors.text);
  root.style.setProperty('--fl-text-muted', colors.textMuted);
}

export function loadCachedTheme(): ThemeColors | null {
  try {
    const saved = localStorage.getItem(THEME_CACHE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

export function useGlobalThemes() {
  const [themes, setThemes] = useState<GlobalTheme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = useCallback(async () => {
    const { data } = await supabase.from('global_themes').select('*').order('created_at');
    if (data) {
      const parsed = data.map((t: any) => ({
        ...t,
        colors: typeof t.colors === 'string' ? JSON.parse(t.colors) : t.colors,
      }));
      setThemes(parsed);
      // Cache active theme locally
      const active = parsed.find((t: GlobalTheme) => t.is_active);
      if (active) {
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(active.colors));
        applyThemeToDOM(active.colors);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  return { themes, loading, refetch: fetchThemes };
}

// ====== User Theme Selector (for all users) ======
export function ThemeSelector() {
  const { themes, loading, refetch } = useGlobalThemes();
  const activeTheme = themes.find(t => t.is_active);

  if (loading) return <div className="flex items-center gap-2 p-4"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /><span className="text-zinc-500 text-sm">Carregando temas...</span></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Palette className="w-5 h-5 text-red-500" /> Tema Visual
        </h2>
        <p className="text-zinc-500 text-xs mb-6">Escolha o tema visual do app. O tema ativo é gerenciado pelo administrador.</p>

        {/* Active theme display */}
        {activeTheme && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Tema Ativo</h3>
            <div className="flex items-center gap-4 p-4 bg-black/20 border border-zinc-700 rounded-xl">
              <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${activeTheme.colors.primary}, ${activeTheme.colors.accent})` }} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{activeTheme.name}</p>
                <p className="text-zinc-500 text-xs flex items-center gap-1">
                  {activeTheme.is_light ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  {activeTheme.is_light ? 'Modo Claro' : 'Modo Escuro'}
                </p>
              </div>
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        )}

        {/* All available themes */}
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Temas Disponíveis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map(theme => (
            <div key={theme.id}
              className={`p-3 rounded-xl border transition-all ${theme.is_active ? 'border-emerald-600/50 bg-emerald-900/10' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} />
                <span className="text-xs font-semibold text-zinc-300 truncate">{theme.name}</span>
              </div>
              <div className="flex gap-1 mb-2">
                {[theme.colors.primary, theme.colors.primaryLight, theme.colors.accent, theme.colors.surface].map((c, i) => (
                  <div key={i} className="flex-1 h-2 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="h-8 rounded-md overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})` }}>
                <div className="h-full flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} />
                </div>
              </div>
              {theme.is_active && <p className="text-emerald-400 text-[10px] font-bold text-center mt-2 uppercase">Ativo</p>}
              {theme.is_light && <p className="text-yellow-400 text-[10px] text-center mt-1 flex items-center justify-center gap-1"><Sun className="w-2.5 h-2.5" /> Claro</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== Admin Theme Editor (full control) ======

const PAGES = [
  { id: 'command_center', name: 'Centro de Comando' },
  { id: 'red', name: 'R.E.D.' },
  { id: 'journal', name: 'Diário' },
  { id: 'tasks', name: 'Tarefas' },
  { id: 'challenges', name: 'Desafios' },
  { id: 'weekly_goals', name: 'Metas' },
  { id: 'laboratory', name: 'Laboratório' },
  { id: 'library', name: 'Biblioteca' },
  { id: 'coworking', name: 'Co-working' },
  { id: 'settings', name: 'Configurações' },
  { id: 'login', name: 'Tela Inicial' },
  { id: 'journey', name: 'Jornada' },
];

function MiniPreview({ page, colors }: { page: { id: string; name: string }; colors: ThemeColors }) {
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-500 transition-colors">
      <div className="aspect-[16/10] relative" style={{ background: `linear-gradient(135deg, ${colors.gradientFrom}, ${colors.gradientTo})` }}>
        <div className="absolute left-0 top-0 bottom-0 w-[18%]" style={{ backgroundColor: colors.surface, borderRight: `1px solid ${colors.surfaceBorder}` }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="mx-1 my-1 h-[6px] rounded-sm" style={{ backgroundColor: i === 0 ? colors.primary : `${colors.textMuted}33` }} />
          ))}
        </div>
        <div className="absolute left-[22%] top-[10%] right-[6%] bottom-[10%]">
          {page.id === 'login' ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-4 h-4 rounded-full mb-1" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }} />
              <div className="w-10 h-1 rounded mb-1" style={{ backgroundColor: colors.text }} />
              <div className="w-6 h-[3px] rounded" style={{ backgroundColor: `${colors.textMuted}66` }} />
              <div className="mt-2 w-8 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
            </div>
          ) : page.id === 'command_center' ? (
            <div className="grid grid-cols-2 gap-1 h-full">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-sm p-1" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.surfaceBorder}` }}>
                  <div className="w-full h-[3px] rounded mb-[2px]" style={{ backgroundColor: i === 0 ? colors.primaryLight : `${colors.textMuted}44` }} />
                  <div className="w-3/4 h-[2px] rounded" style={{ backgroundColor: `${colors.textMuted}33` }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="w-2/3 h-[4px] rounded" style={{ backgroundColor: colors.text }} />
              <div className="w-1/2 h-[2px] rounded" style={{ backgroundColor: `${colors.textMuted}66` }} />
              <div className="mt-1 rounded-sm p-1" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.surfaceBorder}` }}>
                <div className="w-full h-[3px] rounded mb-[2px]" style={{ backgroundColor: `${colors.primaryLight}88` }} />
                <div className="w-3/4 h-[2px] rounded" style={{ backgroundColor: `${colors.textMuted}33` }} />
              </div>
              <div className="rounded-sm p-1" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.surfaceBorder}` }}>
                <div className="w-2/3 h-[3px] rounded mb-[2px]" style={{ backgroundColor: `${colors.accent}66` }} />
                <div className="w-1/2 h-[2px] rounded" style={{ backgroundColor: `${colors.textMuted}33` }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-2 py-1.5 text-[10px] font-semibold text-zinc-400 text-center truncate" style={{ backgroundColor: colors.surface }}>
        {page.name}
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [hex, setHex] = useState(value);
  useEffect(() => { setHex(value); }, [value]);

  const handleHexChange = (v: string) => {
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0 cursor-pointer group">
        <input type="color" value={value} onChange={e => { onChange(e.target.value); setHex(e.target.value); }} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
        <div className="w-full h-full" style={{ backgroundColor: value }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-300 truncate">{label}</p>
        <input value={hex} onChange={e => handleHexChange(e.target.value)} className="text-[10px] text-zinc-500 uppercase font-mono bg-transparent border-none focus:outline-none focus:text-zinc-300 w-20" />
      </div>
    </div>
  );
}

export function ThemeEditor() {
  const { themes, loading, refetch } = useGlobalThemes();
  const [editingTheme, setEditingTheme] = useState<GlobalTheme | null>(null);
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_DARK);
  const [themeName, setThemeName] = useState('');
  const [isLight, setIsLight] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);

  const startEditing = (theme: GlobalTheme) => {
    setEditingTheme(theme);
    setColors({ ...theme.colors });
    setThemeName(theme.name);
    setIsLight(theme.is_light);
    setShowCreateNew(false);
    applyThemeToDOM(theme.colors); // Preview while editing
  };

  const startCreatingNew = () => {
    setEditingTheme(null);
    setColors({ ...DEFAULT_DARK });
    setThemeName('');
    setIsLight(false);
    setShowCreateNew(true);
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    const next = { ...colors, [key]: value };
    setColors(next);
    applyThemeToDOM(next); // Live preview
  };

  const handleSave = async () => {
    if (!themeName.trim()) { toast.error('Dê um nome ao tema'); return; }
    setSaving(true);
    try {
      if (editingTheme) {
        const { error } = await supabase.from('global_themes').update({
          name: themeName.trim(),
          is_light: isLight,
          colors: colors as any,
        }).eq('id', editingTheme.id);
        if (error) throw error;
        toast.success('Tema atualizado!');
      } else {
        const { error } = await supabase.from('global_themes').insert({
          name: themeName.trim(),
          is_light: isLight,
          colors: colors as any,
          is_active: false,
        });
        if (error) throw error;
        toast.success('Tema criado!');
        setShowCreateNew(false);
      }
      await refetch();
      // Re-apply active theme
      const { data } = await supabase.from('global_themes').select('*').eq('is_active', true).single();
      if (data) applyThemeToDOM(typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors);
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    setSaving(false);
  };

  const handleActivate = async (themeId: string) => {
    // Deactivate all, activate selected
    await supabase.from('global_themes').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('global_themes').update({ is_active: true }).eq('id', themeId);
    await refetch();
    toast.success('Tema ativado para todos os usuários!');
  };

  const handleDelete = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme?.is_active) { toast.error('Não é possível excluir o tema ativo'); return; }
    await supabase.from('global_themes').delete().eq('id', themeId);
    if (editingTheme?.id === themeId) { setEditingTheme(null); setShowCreateNew(false); }
    await refetch();
    toast.success('Tema excluído');
  };

  const handleDuplicate = async (theme: GlobalTheme) => {
    await supabase.from('global_themes').insert({
      name: `${theme.name} (cópia)`,
      is_light: theme.is_light,
      colors: theme.colors as any,
      is_active: false,
    });
    await refetch();
    toast.success('Tema duplicado!');
  };

  const isEditing = editingTheme || showCreateNew;

  if (loading) return <div className="flex items-center gap-2 p-8"><Loader2 className="w-6 h-6 text-zinc-500 animate-spin" /><span className="text-zinc-500">Carregando temas...</span></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Theme List */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-red-500" /> Gerenciador de Temas
            </h2>
            <p className="text-zinc-500 text-xs mt-1">Gerencie todos os temas do app. O tema ativo se aplica a todos os usuários.</p>
          </div>
          <button onClick={startCreatingNew} className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>

        <div className="space-y-2">
          {themes.map(theme => (
            <div key={theme.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${theme.is_active ? 'border-emerald-600/40 bg-emerald-900/10' : 'border-zinc-800 bg-black/20 hover:border-zinc-700'}`}>
              <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm truncate">{theme.name}</p>
                  {theme.is_active && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full">ATIVO</span>}
                  {theme.is_light && <span className="text-[10px] font-bold text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full flex items-center gap-1"><Sun className="w-2.5 h-2.5" />CLARO</span>}
                </div>
                <div className="flex gap-1 mt-1">
                  {[theme.colors.primary, theme.colors.primaryLight, theme.colors.accent, theme.colors.gradientFrom, theme.colors.surface].map((c, i) => (
                    <div key={i} className="w-4 h-2 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!theme.is_active && (
                  <button onClick={() => handleActivate(theme.id)} title="Ativar" className="p-2 text-zinc-500 hover:text-emerald-400 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => startEditing(theme)} title="Editar" className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDuplicate(theme)} title="Duplicar" className="p-2 text-zinc-500 hover:text-blue-400 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                {!theme.is_active && (
                  <button onClick={() => handleDelete(theme.id)} title="Excluir" className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Editor Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">
                  {editingTheme ? `Editando: ${editingTheme.name}` : 'Novo Tema'}
                </h2>
                <button onClick={() => { setEditingTheme(null); setShowCreateNew(false); refetch(); }}
                  className="text-zinc-500 hover:text-white text-sm font-medium transition-colors">Fechar</button>
              </div>

              {/* Name & mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome do Tema</label>
                  <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors" placeholder="Ex: Meu Tema Escuro" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Modo</label>
                  <div className="flex gap-2">
                    <button onClick={() => setIsLight(false)} className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${!isLight ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-500'}`}>
                      <Moon className="w-4 h-4" /> Escuro
                    </button>
                    <button onClick={() => setIsLight(true)} className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${isLight ? 'bg-yellow-900/30 text-yellow-300' : 'bg-zinc-900 text-zinc-500'}`}>
                      <Sun className="w-4 h-4" /> Claro
                    </button>
                  </div>
                </div>
              </div>

              {/* Color pickers */}
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Cores</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <ColorInput label="Primária (botões, ícones)" value={colors.primary} onChange={v => updateColor('primary', v)} />
                <ColorInput label="Primária Clara (destaques)" value={colors.primaryLight} onChange={v => updateColor('primaryLight', v)} />
                <ColorInput label="Acentuação (badges, alertas)" value={colors.accent} onChange={v => updateColor('accent', v)} />
                <ColorInput label="Gradiente – Início (fundo)" value={colors.gradientFrom} onChange={v => updateColor('gradientFrom', v)} />
                <ColorInput label="Gradiente – Fim (fundo)" value={colors.gradientTo} onChange={v => updateColor('gradientTo', v)} />
                <ColorInput label="Superfície (cards, sidebar)" value={colors.surface} onChange={v => updateColor('surface', v)} />
                <ColorInput label="Borda (divisórias)" value={colors.surfaceBorder} onChange={v => updateColor('surfaceBorder', v)} />
                <ColorInput label="Texto Principal" value={colors.text} onChange={v => updateColor('text', v)} />
                <ColorInput label="Texto Secundário" value={colors.textMuted} onChange={v => updateColor('textMuted', v)} />
              </div>

              {/* Gradient preview */}
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Preview do Gradiente</h3>
              <div className="h-20 rounded-xl overflow-hidden mb-6" style={{ background: `linear-gradient(135deg, ${colors.gradientFrom}, ${colors.gradientTo})` }}>
                <div className="h-full flex items-center justify-center gap-4">
                  <div className="w-10 h-10 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }} />
                  <div>
                    <div className="h-2.5 w-24 rounded mb-1" style={{ backgroundColor: colors.text }} />
                    <div className="h-1.5 w-16 rounded" style={{ backgroundColor: colors.textMuted }} />
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ backgroundColor: colors.primary, color: colors.text }}>Botão</div>
                </div>
              </div>

              {/* Component previews */}
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Componentes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {/* Card */}
                <div className="rounded-xl p-3" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.surfaceBorder}` }}>
                  <div className="w-6 h-1.5 rounded mb-2" style={{ backgroundColor: colors.text }} />
                  <div className="w-10 h-1 rounded mb-1" style={{ backgroundColor: colors.textMuted }} />
                  <div className="w-8 h-1 rounded" style={{ backgroundColor: colors.textMuted }} />
                  <div className="mt-2 w-full h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                    <span className="text-[8px] font-bold" style={{ color: colors.text }}>Ação</span>
                  </div>
                </div>
                {/* Badge */}
                <div className="rounded-xl p-3 flex flex-col items-center justify-center" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.surfaceBorder}` }}>
                  <div className="px-2 py-1 rounded-full text-[8px] font-bold mb-1" style={{ backgroundColor: `${colors.accent}22`, color: colors.accent }}>Badge</div>
                  <div className="px-2 py-1 rounded-full text-[8px] font-bold mb-1" style={{ backgroundColor: `${colors.primaryLight}22`, color: colors.primaryLight }}>Tag</div>
                  <div className="px-2 py-1 rounded-full text-[8px] font-bold" style={{ backgroundColor: `${colors.primary}33`, color: colors.primary }}>Filtro</div>
                </div>
                {/* Progress */}
                <div className="rounded-xl p-3" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.surfaceBorder}` }}>
                  <div className="w-8 h-1 rounded mb-2" style={{ backgroundColor: colors.text }} />
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.surfaceBorder}` }}>
                    <div className="h-full rounded-full w-2/3" style={{ backgroundColor: colors.primaryLight }} />
                  </div>
                  <div className="mt-2 w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.surfaceBorder}` }}>
                    <div className="h-full rounded-full w-1/3" style={{ backgroundColor: colors.accent }} />
                  </div>
                </div>
                {/* Input */}
                <div className="rounded-xl p-3" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.surfaceBorder}` }}>
                  <div className="w-6 h-1 rounded mb-2" style={{ backgroundColor: colors.textMuted }} />
                  <div className="w-full h-6 rounded-lg border px-2 flex items-center" style={{ borderColor: colors.surfaceBorder, backgroundColor: `${colors.gradientFrom}88` }}>
                    <span className="text-[8px]" style={{ color: colors.textMuted }}>Digite...</span>
                  </div>
                  <div className="mt-2 w-full h-4 rounded-lg" style={{ backgroundColor: colors.primary }} />
                </div>
              </div>

              {/* Save buttons */}
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingTheme ? 'Salvar Alterações' : 'Criar Tema'}
                </button>
                <button onClick={() => { setColors(editingTheme ? { ...editingTheme.colors } : { ...DEFAULT_DARK }); }}
                  className="flex items-center gap-2 px-5 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-xl font-medium text-sm transition-colors">
                  <RotateCcw className="w-4 h-4" /> Resetar
                </button>
              </div>
            </div>

            {/* Page previews */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 mt-6">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-500" /> Preview das Páginas
              </h2>
              <p className="text-zinc-500 text-xs mb-4">Veja como o tema aparece em cada seção.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {PAGES.map(page => (
                  <MiniPreview key={page.id} page={page} colors={colors} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
