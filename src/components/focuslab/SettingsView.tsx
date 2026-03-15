import React, { useState, useRef } from 'react';
import { User, Moon, Sun, Monitor, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { useProfile } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

export function SettingsView({ userId, darkMode, setDarkMode }: { userId?: string; darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'app'>('profile');
  const { profile, loading, updateProfile, uploadAvatar } = useProfile(userId);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (profile && !initialized) {
    setDisplayName(profile.display_name || '');
    setBio(profile.bio || '');
    setInitialized(true);
  }

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: displayName, bio });
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
            <button onClick={() => setActiveTab('profile')}
              className={`flex-1 lg:flex-none w-full flex items-center justify-center lg:justify-start gap-3 p-4 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-red-900/20 text-white border-b-2 lg:border-b-0 lg:border-l-2 border-red-600' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <User className="w-4 h-4" /> Perfil
            </button>
            <button onClick={() => setActiveTab('app')}
              className={`flex-1 lg:flex-none w-full flex items-center justify-center lg:justify-start gap-3 p-4 text-sm font-medium transition-colors ${activeTab === 'app' ? 'bg-red-900/20 text-white border-b-2 lg:border-b-0 lg:border-l-2 border-red-600' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <Monitor className="w-4 h-4" /> Sistema
            </button>
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
                      <p className="text-zinc-500 text-sm">Focus Lab</p>
                      <p className="text-zinc-600 text-xs mt-1">Clique na foto para alterar</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome de Exibição</label>
                      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors" /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Bio / Mantra</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors h-24 resize-none" /></div>
                    <button onClick={handleSaveProfile} className="px-6 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors">Salvar Perfil</button>
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
