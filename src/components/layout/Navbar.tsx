/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, ListTodo, TrendingUp, User, Plus } from 'lucide-react';
import { NavIcon } from './NavIcon';
import { AppState } from '@/src/types';

interface NavbarProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ appState, setAppState }) => (
  <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-black/5 px-8 pt-4 pb-8 flex justify-between items-center z-40">
    <NavIcon icon={<Calendar size={20} />} active={appState === 'home'} label="今天" onClick={() => setAppState('home')} />
    <NavIcon icon={<ListTodo size={20} />} active={appState === 'tasks'} label="任务" onClick={() => setAppState('tasks')} />
    <div className="relative -mt-10">
      <button 
        onClick={(e) => { e.stopPropagation(); setAppState('add-task'); }}
        className="w-14 h-14 bg-[#007AFF] text-white rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center border-4 border-white active:scale-90 transition-transform"
      >
        <Plus size={28} />
      </button>
    </div>
    <NavIcon icon={<TrendingUp size={20} />} active={appState === 'insights'} label="洞察" onClick={() => setAppState('insights')} />
    <NavIcon icon={<User size={20} />} active={appState === 'profile'} label="我的" onClick={() => setAppState('profile')} />
  </nav>
);
