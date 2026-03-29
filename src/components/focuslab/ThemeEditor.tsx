import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Eye, RotateCcw, Save, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ThemeColors {
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

const DEFAULT_THEME: ThemeColors = {
  primary: '#991b1b',
  primaryLight: '#dc2626',
  accent: '#ef4444',
  gradientFrom: '#0a0a0a',
  gradientTo: '#1c1917',
  surface: '#18181b',
  surfaceBorder: '#27272a',
  text: '#ffffff',
  textMuted: '#71717a',
};

const PRESET_THEMES: { name: string; colors: ThemeColors }[] = [
  { name: 'Vermelho Clássico', colors: DEFAULT_THEME },
  { name: 'Azul Oceano', colors: { ...DEFAULT_THEME, primary: '#1e3a5f', primaryLight: '#2563eb', accent: '#3b82f6', gradientFrom: '#020617', gradientTo: '#0f172a' } },
  { name: 'Verde Floresta', colors: { ...DEFAULT_THEME, primary: '#14532d', primaryLight: '#16a34a', accent: '#22c55e', gradientFrom: '#022c22', gradientTo: '#052e16' } },
  { name: 'Roxo Neon', colors: { ...DEFAULT_THEME, primary: '#581c87', primaryLight: '#9333ea', accent: '#a855f7', gradientFrom: '#0c0a1a', gradientTo: '#1e1b4b' } },
  { name: 'Dourado Elite', colors: { ...DEFAULT_THEME, primary: '#78350f', primaryLight: '#d97706', accent: '#f59e0b', gradientFrom: '#0a0a0a', gradientTo: '#1c1917' } },
  { name: 'Ciano Cyber', colors: { ...DEFAULT_THEME, primary: '#164e63', primaryLight: '#06b6d4', accent: '#22d3ee', gradientFrom: '#020617', gradientTo: '#082f49' } },
];

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

const THEME_STORAGE_KEY = 'focuslab-custom-theme';

export function loadSavedTheme(): ThemeColors | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

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

function MiniPreview({ page, colors }: { page: { id: string; name: string }; colors: ThemeColors }) {
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-500 transition-colors">
      <div className="aspect-[16/10] relative" style={{ background: `linear-gradient(135deg, ${colors.gradientFrom}, ${colors.gradientTo})` }}>
        {/* Mini sidebar */}
        <div className="absolute left-0 top-0 bottom-0 w-[18%]" style={{ backgroundColor: colors.surface, borderRight: `1px solid ${colors.surfaceBorder}` }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="mx-1 my-1 h-[6px] rounded-sm" style={{ backgroundColor: i === 0 ? colors.primary : `${colors.textMuted}33` }} />
          ))}
        </div>
        {/* Mini content */}
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
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0 cursor-pointer">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
        <div className="w-full h-full" style={{ backgroundColor: value }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-300 truncate">{label}</p>
        <p className="text-[10px] text-zinc-600 uppercase font-mono">{value}</p>
      </div>
    </div>
  );
}

export function ThemeEditor() {
  const [colors, setColors] = useState<ThemeColors>(loadSavedTheme() || DEFAULT_THEME);
  const [previewPage, setPreviewPage] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    applyThemeToDOM(colors);
  }, [colors]);

  const updateColor = useCallback((key: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setColors(preset.colors);
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
    applyThemeToDOM(colors);
    setHasChanges(false);
    toast.success('Tema salvo com sucesso!');
  };

  const handleReset = () => {
    setColors(DEFAULT_THEME);
    localStorage.removeItem(THEME_STORAGE_KEY);
    applyThemeToDOM(DEFAULT_THEME);
    setHasChanges(false);
    toast.success('Tema restaurado ao padrão.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Palette className="w-5 h-5 text-red-500" /> Editor de Tema
        </h2>
        <p className="text-zinc-500 text-xs mb-6">Personalize as cores do app inteiro. Apenas administradores têm acesso.</p>

        {/* Presets */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Temas Prontos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_THEMES.map(preset => (
              <button key={preset.name} onClick={() => applyPreset(preset)}
                className="group p-3 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.accent})` }} />
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">{preset.name}</span>
                </div>
                <div className="flex gap-1">
                  {[preset.colors.primary, preset.colors.primaryLight, preset.colors.accent, preset.colors.gradientFrom].map((c, i) => (
                    <div key={i} className="w-4 h-2 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom colors */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Cores Personalizadas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorInput label="Primária (botões, ícones)" value={colors.primary} onChange={v => updateColor('primary', v)} />
            <ColorInput label="Primária Clara (destaques)" value={colors.primaryLight} onChange={v => updateColor('primaryLight', v)} />
            <ColorInput label="Acentuação (badges, alertas)" value={colors.accent} onChange={v => updateColor('accent', v)} />
            <ColorInput label="Gradiente – Início" value={colors.gradientFrom} onChange={v => updateColor('gradientFrom', v)} />
            <ColorInput label="Gradiente – Fim" value={colors.gradientTo} onChange={v => updateColor('gradientTo', v)} />
            <ColorInput label="Superfície (cards)" value={colors.surface} onChange={v => updateColor('surface', v)} />
            <ColorInput label="Borda (divisórias)" value={colors.surfaceBorder} onChange={v => updateColor('surfaceBorder', v)} />
            <ColorInput label="Texto Principal" value={colors.text} onChange={v => updateColor('text', v)} />
            <ColorInput label="Texto Secundário" value={colors.textMuted} onChange={v => updateColor('textMuted', v)} />
          </div>
        </div>

        {/* Gradient preview */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Preview do Gradiente</h3>
          <div className="h-20 rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.gradientFrom}, ${colors.gradientTo})` }}>
            <div className="h-full flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }} />
              <div>
                <div className="h-2 w-20 rounded" style={{ backgroundColor: colors.text }} />
                <div className="h-1.5 w-14 rounded mt-1" style={{ backgroundColor: colors.textMuted }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={!hasChanges}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-900 hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors">
            <Save className="w-4 h-4" /> Salvar Tema
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-xl font-medium text-sm transition-colors">
            <RotateCcw className="w-4 h-4" /> Restaurar Padrão
          </button>
        </div>
      </div>

      {/* Page previews */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Eye className="w-5 h-5 text-red-500" /> Preview das Páginas
        </h2>
        <p className="text-zinc-500 text-xs mb-6">Veja como o tema atual aparece em cada seção do app.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PAGES.map(page => (
            <MiniPreview key={page.id} page={page} colors={colors} />
          ))}
        </div>
      </div>
    </div>
  );
}
