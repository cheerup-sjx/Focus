/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter } from 'lucide-react';
import { Task, UserProfile } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { rankTasks } from '../utils/scoreTask';

interface TasksPoolProps {
  tasks: Task[];
  userProfile: UserProfile;
  setAppState: (state: any) => void;
}

export const TasksPool: React.FC<TasksPoolProps> = ({ tasks, userProfile, setAppState }) => {
  const activeTasks = tasks.filter(t => !t.completed);
  const sortedTasks = rankTasks(activeTasks, userProfile);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32 px-6 pt-12 max-w-md mx-auto min-h-screen bg-[#F8F9FA]">
    <header className="mb-8">
      <div className="flex items-center gap-2 mb-6">
         <h2 className="text-2xl font-black tracking-tight text-[#1D1D1F]">任务池</h2>
         <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">AI 优先</div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-white border border-black/5 rounded-xl px-4 flex items-center gap-2 h-12 shadow-sm">
          <Search size={16} className="text-gray-300" />
          <input type="text" placeholder="搜索任务池..." className="bg-transparent border-none outline-none text-sm font-medium w-full text-black placeholder:text-gray-300" />
        </div>
        <button className="w-12 h-12 bg-white border border-black/5 rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
          <Filter size={16} />
        </button>
      </div>
    </header>
    
    <div className="space-y-3">
      {sortedTasks.map(task => (
        <div key={task.id} className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4 group hover:border-[#007AFF]/30 transition-colors">
          <div className={`w-1 h-10 rounded-full transition-colors ${task.priorityScore > 85 ? 'bg-[#007AFF]' : 'bg-gray-100 group-hover:bg-blue-200'}`} />
          <div className="flex-1 min-w-0">
            <h4 className="text-[14px] font-bold leading-tight mb-1 truncate text-[#1D1D1F]">{task.title}</h4>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>{task.duration} 分钟</span>
              <span className={task.priorityScore > 85 ? 'text-[#007AFF]' : ''}>评分 {task.priorityScore}</span>
              <span>{task.deadline}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <Navbar appState="tasks" setAppState={setAppState} />
  </motion.div>
  );
};
