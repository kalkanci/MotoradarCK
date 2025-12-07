import React from 'react';
import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export interface AlertType {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
}

const AlertBanner: React.FC<{ alert: AlertType }> = ({ alert }) => {
  const colors = {
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-200",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-200",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-200",
  };

  const iconColors = {
    warning: "text-amber-400",
    danger: "text-rose-400",
    info: "text-blue-400",
  };

  const Icons = {
    warning: AlertTriangle,
    danger: AlertOctagon,
    info: Info,
  };

  const Icon = Icons[alert.type];

  return (
    <div 
        role="alert"
        className={`relative flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-lg shadow-lg transition-all hover:scale-[1.02] ${colors[alert.type]}`}
    >
        <div className={`p-2 rounded-full bg-black/20 ${iconColors[alert.type]} backdrop-blur-md`}>
            <Icon size={20} />
        </div>
        <div className="flex-1 pr-4">
            <h4 className="font-bold text-sm tracking-wide uppercase mb-1 opacity-90">{alert.title}</h4>
            <p className="text-xs opacity-70 leading-relaxed font-sans">{alert.message}</p>
        </div>
    </div>
  );
};

export default AlertBanner;