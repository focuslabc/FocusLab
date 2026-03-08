import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Monitor, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<'profile' | 'app'>('profile');

  return (
    <div className="h-full w-full p-6 lg:p-12 overflow-y-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Configurações</h1>
        <p className="text-zinc-500 font-medium">Personalize sua experiência no sistema.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <button onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 p-4 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-red-900/20 text-white border-l-2 border-red-600' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <User className="w-4 h-4" /> Perfil
            </button>
            <button onClick={() => setActiveTab('app')}
              className={`w-full flex items-center gap-3 p-4 text-sm font-medium transition-colors ${activeTab === 'app' ? 'bg-red-900/20 text-white border-l-2 border-red-600' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <Monitor className="w-4 h-4" /> Sistema
            </button>
          </div>
        </div>

        <div className="flex-1">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'profile' ? (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="w-5 h-5 text-red-500" /> Identidade</h2>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer">
                      <span className="text-xs font-bold uppercase">Foto</span>
                    </div>
                    <div><h3 className="text-white font-bold text-lg">Operador Focus</h3><p className="text-zinc-500 text-sm">Nível 1 • Iniciante</p></div>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome de Exibição</label>
                      <input type="text" defaultValue="Operador" className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors" /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Bio / Mantra</label>
                      <textarea defaultValue="Foco absoluto. Execução implacável." className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors h-24 resize-none" /></div>
                  </div>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-red-500" /> Segurança</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-zinc-800">
                      <div><div className="text-white font-medium mb-1">E-mail</div><div className="text-zinc-500 text-sm">operador@focuslab.com</div></div>
                      <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition-colors">Alterar</button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-zinc-800">
                      <div><div className="text-white font-medium mb-1">Senha</div><div className="text-zinc-500 text-sm">••••••••••••</div></div>
                      <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition-colors">Alterar</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Monitor className="w-5 h-5 text-red-500" /> Interface & Sistema</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center"><Moon className="w-5 h-5 text-white" /></div>
                        <div><div className="text-white font-medium">Modo Escuro</div><div className="text-zinc-500 text-xs">O tema padrão do Focus Lab é escuro.</div></div>
                      </div>
                      <div className="w-12 h-6 bg-red-900/50 rounded-full relative cursor-not-allowed opacity-50"><div className="absolute right-1 top-1 w-4 h-4 bg-red-500 rounded-full"></div></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center"><Globe className="w-5 h-5 text-white" /></div>
                        <div><div className="text-white font-medium">Idioma</div><div className="text-zinc-500 text-xs">Português (Brasil)</div></div>
                      </div>
                      <select className="bg-black/40 border border-zinc-800 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-600"><option>PT-BR</option><option>EN-US</option></select>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-red-500" /> Notificações</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Lembretes de R.E.D.', desc: 'Alertas para início e fim de ciclos.' },
                      { label: 'Metas Trimestrais', desc: 'Atualizações semanais de progresso.' },
                      { label: 'Desafios', desc: 'Notificações de novos desafios do sistema.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
                        <div><div className="text-white text-sm font-medium">{item.label}</div><div className="text-zinc-500 text-xs">{item.desc}</div></div>
                        <button className="w-10 h-5 bg-zinc-700 rounded-full relative hover:bg-red-900/50 transition-colors group">
                          <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-400 rounded-full group-hover:bg-red-500 group-hover:translate-x-4 transition-all"></div>
                        </button>
                      </div>
                    ))}
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
