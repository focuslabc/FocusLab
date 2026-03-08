import React from 'react';
import { Info } from 'lucide-react';

interface EmailConfirmationHelperProps {
  show: boolean;
}

export const EmailConfirmationHelper: React.FC<EmailConfirmationHelperProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="mt-3 text-xs text-zinc-500 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex items-start gap-2">
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-400" />
      <div className="text-left">
        <p className="font-semibold text-zinc-400 mb-1">Confirme seu email</p>
        <p>Após cadastrar, você receberá um email de confirmação. Clique no link para ativar sua conta.</p>
      </div>
    </div>
  );
};
