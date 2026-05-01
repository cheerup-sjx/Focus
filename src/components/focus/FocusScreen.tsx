/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, X } from 'lucide-react';
import { Task } from '@/src/types';
import { getBeijingTime } from '@/src/utils/timeStatus';

interface FocusScreenProps {
  task: Task;
  onClose: () => void;
  onComplete: (elapsedMinutes: number) => void;
}

export const FocusScreen: React.FC<FocusScreenProps> = ({ task, onClose, onComplete }) => {
  const [bjTime, setBjTime] = useState(getBeijingTime());
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Update Beijing Time
  useEffect(() => {
    const timer = setInterval(() => {
      setBjTime(getBeijingTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = window.setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isActive]);

  const formatElapsedTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formattedBjTime = `${bjTime.getHours().toString().padStart(2, '0')}:${bjTime.getMinutes().toString().padStart(2, '0')}`;

  const handleStartTask = () => {
    setIsActive(true);
  };

  const handleComplete = () => {
    setIsActive(false);
    // 自动计算：elapsedTime = 实际计时秒数 / 60
    // 自动 round 为整数分钟，至少为 1 分钟（如果开始了的话）
    const elapsedMinutes = Math.max(1, Math.round(elapsed / 60));
    onComplete(elapsedMinutes);
  };

  // Calculate circle progress based on task duration (in minutes)
  const totalDurationSeconds = Math.max(1, (task.duration || 30) * 60);
  const progress = Math.min(elapsed / totalDurationSeconds, 1);
  const strokeDashoffset = isNaN(progress) ? 691 : 691 * (1 - progress);

  return (
    <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-0 z-[100] bg-black flex flex-col p-10 text-white max-w-md mx-auto">
       <header className="flex justify-between items-center mt-12 mb-20">
         <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/5 text-[10px] font-bold tracking-widest uppercase text-white/60">
            <Clock size={12}/> {formattedBjTime}
         </div>
         <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5"><X size={18} /></button>
       </header>

       <div className="flex-1 flex flex-col items-center">
          <div className="relative w-56 h-56 flex items-center justify-center mb-16">
             <div className="absolute inset-0 rounded-full border-2 border-white/5" />
             <svg className="w-full h-full -rotate-90">
                <circle cx="112" cy="112" r="110" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <motion.circle 
                  cx="112" cy="112" r="110" fill="transparent" stroke="#007AFF" strokeWidth="4" strokeLinecap="round"
                  initial={{ strokeDasharray: "691", strokeDashoffset: "691" }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{ duration: 0.5 }}
                />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className="text-6xl font-light tracking-tighter tabular-nums">{formatElapsedTime(elapsed)}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mt-4">已专注</span>
             </div>
          </div>
          <div className="text-center">
             <h2 className="text-2xl font-bold tracking-tight mb-4 px-4 leading-tight">{task.title}</h2>
          </div>
       </div>

       <div className="pb-12 space-y-6 flex flex-col items-center">
          {!isActive && elapsed === 0 ? (
            <button 
              onClick={handleStartTask} 
              className="w-full h-16 bg-[#007AFF] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-transform"
            >
              任务开始
            </button>
          ) : (
            <div className="w-full h-16 flex items-center justify-center text-[#007AFF] font-black uppercase tracking-widest text-xs">
              {isActive ? "正在计时" : "已暂停"}
            </div>
          )}
          
          <button 
            onClick={handleComplete} 
            className="w-[80%] h-12 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all opacity-90 hover:opacity-100"
          >
            完成任务
          </button>
       </div>
    </motion.div>
  );
};
