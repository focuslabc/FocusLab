import React, { useState, useRef, useEffect } from 'react';
import { User, Moon, Sun, Monitor, Camera, Mail, Phone, Instagram, ExternalLink, HelpCircle, Palette, Ban } from 'lucide-react';
import { motion } from 'motion/react';
import { useProfile, useIsAdmin, useBlockedUsers } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import { ThemeEditor, ThemeSelector } from './ThemeEditor';
import { supabase } from '@/integrations/supabase/client';

export function SettingsView({ userId, darkMode, setDarkMode, blockedIds: externalBlockedIds, onUnblock: externalOnUnblock }: { userId?: string; darkMode: boolean; setDarkMode: (v: boolean) => void; blockedIds?: string[]; onUnblock?: (uid: string) => void }) {
  const { isAdmin } = useIsAdmin(userId);
  const [activeTab, setActiveTab] = useState<'profile' | 'app' | 'support' | 'theme' | 'blocked'>('profile');
  const { profile, loading, updateProfile, uploadAvatar } = useProfile(userId);
  const { blockedList, unblockUser } = useBlockedUsers(userId);
  const [blockedProfiles, setBlockedProfiles] = useState<Record<string, any>>({});
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch blocked user profiles
  useEffect(() => {
    if (blockedList.length === 0) return;
    const ids = blockedList.map(b => b.blocked_id);
    supabase.from('profiles').select('*').in('user_id', ids).then(({ data }) => {
      const map: Record<string, any> = {};
      (data || []).forEach(p => { map[p.user_id] = p; });
      setBlockedProfiles(map);
    });
  }, [blockedList]);

  if (profile && !initialized) {
    setDisplayName(profile.display_name || '');
    setBio(profile.bio || '');
    setUsername(profile.username || '');
    setInitialized(true);
  }

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: displayName, bio, username });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem muito grande (máx 2MB)'); return; }
    await uploadAvatar(file);
  };

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <header className="mb-8 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Configurações</h1>
        <p className="text-zinc-500 font-medium text-sm sm:text-base">Personalize sua experiência no sistema.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm flex lg:flex-col">
            {[
              { id: 'profile' as const, icon: User, label: 'Perfil' },
              { id: 'app' as const, icon: Monitor, label: 'Sistema' },
              { id: 'theme' as const, icon: Palette, label: 'Tema' },
              { id: 'blocked' as const, icon: Ban, label: 'Bloqueados' },
              { id: 'support' as const, icon: HelpCircle, label: 'Suporte' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 lg:flex-none w-full flex items-center justify-center lg:justify-start gap-3 p-4 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-red-900/20 text-white border-b-2 lg:border-b-0 lg:border-l-2 border-red-600' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'profile' ? (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="w-5 h-5 text-red-500" /> Identidade</h2>
                  <div className="flex items-center gap-4 sm:gap-6 mb-8">
                    <div onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0 overflow-hidden relative group">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <div className="min-w-0">
                      <h3 className="text-white font-bold text-base sm:text-lg truncate">{profile?.display_name || 'Operador'}</h3>
                      {profile?.username && <p className="text-zinc-500 text-sm">@{profile.username}</p>}
                      <p className="text-zinc-600 text-xs mt-1">Clique na foto para alterar</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome de Exibição</label>
                      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors" /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">@Username</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors" placeholder="seu.usuario" /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Bio / Mantra</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors h-24 resize-none" /></div>
                    <button onClick={handleSaveProfile} className="px-6 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors">Salvar Perfil</button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'app' ? (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2"><Monitor className="w-5 h-5 text-red-500" /> Interface & Sistema</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                          {darkMode ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">{darkMode ? 'Modo Escuro' : 'Modo Claro'}</div>
                          <div className="text-zinc-500 text-xs">{darkMode ? 'Tema escuro ativado' : 'Tema claro ativado'}</div>
                        </div>
                      </div>
                      <button onClick={() => { setDarkMode(!darkMode); localStorage.setItem('focuslab-theme', !darkMode ? 'dark' : 'light'); }}
                        className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-red-900/50' : 'bg-zinc-600'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${darkMode ? 'right-1 bg-red-500' : 'left-1 bg-white'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'support' ? (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-red-500" /> Suporte</h2>
                  <p className="text-zinc-400 text-sm mb-6">Entre em contato conosco para dúvidas, sugestões ou suporte técnico.</p>
                  <div className="space-y-4">
                    <a href="https://instagram.com/focus_.lab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-black/20 border border-zinc-800 rounded-xl hover:border-red-900/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-pink-900/20 flex items-center justify-center"><Instagram className="w-5 h-5 text-pink-400" /></div>
                      <div className="flex-1 min-w-0"><p className="text-white font-medium text-sm">Instagram</p><p className="text-zinc-500 text-xs truncate">@focus_.lab</p></div>
                      <ExternalLink className="w-4 h-4 text-zinc-600" />
                    </a>
                    <a href="mailto:focuslabcontato@gmail.com" className="flex items-center gap-4 p-4 bg-black/20 border border-zinc-800 rounded-xl hover:border-red-900/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-blue-900/20 flex items-center justify-center"><Mail className="w-5 h-5 text-blue-400" /></div>
                      <div className="flex-1 min-w-0"><p className="text-white font-medium text-sm">E-mail</p><p className="text-zinc-500 text-xs truncate">focuslabcontato@gmail.com</p></div>
                      <ExternalLink className="w-4 h-4 text-zinc-600" />
                    </a>
                    <a href="tel:+5588981924454" className="flex items-center gap-4 p-4 bg-black/20 border border-zinc-800 rounded-xl hover:border-red-900/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center"><Phone className="w-5 h-5 text-emerald-400" /></div>
                      <div className="flex-1 min-w-0"><p className="text-white font-medium text-sm">Telefone</p><p className="text-zinc-500 text-xs">(88) 98192-4454</p></div>
                      <ExternalLink className="w-4 h-4 text-zinc-600" />
                    </a>
                  </div>
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h3 className="text-white font-bold text-sm mb-3">Feedback & Sugestões</h3>
                    <p className="text-zinc-500 text-xs mb-4">Preencha nosso formulário para enviar uma análise, crítica ou sugestão de melhoria.</p>
                    <a href="https://form.typeform.com/to/HkBCiPi8" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-colors">
                      <ExternalLink className="w-4 h-4" /> Abrir Formulário
                    </a>
                  </div>
                </div>
              </div>
            ) : activeTab === 'theme' ? (
              isAdmin ? <ThemeEditor /> : <ThemeSelector />
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
