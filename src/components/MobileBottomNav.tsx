import React from 'react';
import { CloudRain, Bell, Layers, Sliders } from 'lucide-react';

export type MobileTab = 'home' | 'alerts' | 'widgets' | 'settings';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  alertsCount?: number;
}

export default function MobileBottomNav({ activeTab, onTabChange, alertsCount = 0 }: MobileBottomNavProps) {
  const tabs = [
    { id: 'home' as MobileTab, label: 'Inicio', icon: CloudRain },
    { id: 'alerts' as MobileTab, label: 'Alertas', icon: Bell, badge: alertsCount > 0 ? alertsCount : undefined },
    { id: 'widgets' as MobileTab, label: 'Widgets', icon: Layers },
    { id: 'settings' as MobileTab, label: 'Ajustes', icon: Sliders },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#060a13]/95 border-t border-white/5 backdrop-blur-lg py-2 flex justify-around items-center">
      <div className="w-full max-w-md mx-auto flex justify-around items-center px-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 py-1 px-3 text-center cursor-pointer group focus:outline-none select-none"
            >
              <div
                className={`absolute inset-x-0 -top-2 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-400 scale-110'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-[8px] font-mono font-bold text-white px-1 py-0.5 rounded-full min-w-[14px] text-center leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              
              <span
                className={`text-[10px] font-sans font-bold tracking-wider transition-colors duration-200 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export type { MobileBottomNavProps };
