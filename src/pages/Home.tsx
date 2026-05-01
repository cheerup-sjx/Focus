/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Clock, Zap, ArrowDown, ListTodo, X, Info } from 'lucide-react';
import { Task, UserProfile } from '../types';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Navbar } from '../components/layout/Navbar';
import { getFocusStatus } from '../utils/timeStatus';
import { rankTasks, getScoreBreakdown, ScoreBreakdown, isMatureModel, calcHabitLearning } from '../utils/scoreTask';

interface HomeProps {
  userProfile: UserProfile;
  tasks: Task[];
  setAppState: (state: any) => void;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setActiveTask: (task: Task) => void;
  setInteractingTask: (task: Task) => void;
  setIsSkipSheetOpen: (open: boolean) => void;
}

export const Home: React.FC<HomeProps> = ({
  userProfile,
  tasks,
  setAppState,
  setUserProfile,
  setActiveTask,
  setInteractingTask,
  setIsSkipSheetOpen
}) => {
  const [statusResult, setStatusResult] = useState(
    () => getFocusStatus(userProfile.focusTime, tasks)
  );
  const [scoreDetailTask, setScoreDetailTask] = useState<Task | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusResult(getFocusStatus(userProfile.focusTime, tasks));
    }, 60000);
    return () => clearInterval(timer);
  }, [userProfile.focusTime, tasks]);

  const getColorClass = (color: string) => {
    switch(color) {
      case 'orange': return 'text-orange-500 bg-orange-50';
      case 'red': return 'text-red-500 bg-red-50';
      case 'yellow': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-[#007AFF] bg-blue-50';
    }
  };

  const getIconColor = (color: string) => {
    switch(color) {
      case 'orange': return 'text-orange-500';
      case 'red': return 'text-red-500';
      case 'yellow': return 'text-yellow-500';
      default: return 'text-[#007AFF]';
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const rankedTasks = rankTasks(activeTasks, userProfile);
  const aiActionFeed = rankedTasks.slice(0, 3);
  const aiSecondaryTasks = rankedTasks.slice(3, 7);

  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false);
  const avatarOptions = [
    { id: 'A1', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=A1' },
    { id: 'A2', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=A2' },
    { id: 'A3', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=A3' },
    { id: 'A4', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=A4' },
    { id: 'A5', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=A5' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32 px-6 pt-12 max-w-md mx-auto min-h-screen bg-[#F8F9FA]">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAvatarSheetOpen(true)}
              className="w-10 h-10 rounded-xl border border-black/5 overflow-hidden shadow-sm bg-white"
            >
              <img 
                src={userProfile.avatar || "https://api.dicebear.com/7.x/lorelei/svg?seed=Felix"} 
                alt="avatar" 
                referrerPolicy="no-referrer"
              />
            </button>
            <div>
              <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest leading-none mb-1">早间模式</p>
              <h2 className="text-xl font-bold tracking-tight">{userProfile.name}</h2>
            </div>
          </div>
          <button className="p-2 rounded-xl bg-white border border-black/5 text-[#8E8E93]">
            <Zap size={18} className="text-[#007AFF]" />
          </button>
        </div>

        {/* AI Insight Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
             <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${getColorClass(statusResult.color)}`}>
                <Brain size={14} className={getIconColor(statusResult.color)} />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-[#0066CC]">AI 状态感知</span>
          </div>
          <div className="space-y-3">
             <p className="text-[14px] font-medium text-gray-600 leading-snug">
                {statusResult.title}: <span className="text-[#1D1D1F] font-bold">{statusResult.description}</span>
             </p>
             <div className="flex gap-2">
                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-400 font-bold">智能同步已开启</span>
                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-400 font-bold">习惯学习 {calcHabitLearning(userProfile)}%</span>
             </div>
          </div>
        </motion.div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest">AI 推荐任务</h3>
        <span className="text-[10px] font-bold text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded-full">共 {activeTasks.length} 项</span>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {aiActionFeed.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white border border-black/5 p-5 rounded-[22px] shadow-sm relative overflow-hidden group cursor-pointer"
              onClick={() => { setActiveTask(task); setAppState('focus'); }}
            >
              <div className="flex justify-between items-start mb-3">
                <PriorityBadge 
                  score={task.priorityScore} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setScoreDetailTask(task); 
                  }} 
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); setInteractingTask(task); setIsSkipSheetOpen(true); }}
                  className="p-1 hover:bg-gray-50 rounded-full text-gray-300"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
              <h4 className="font-bold text-[16px] text-[#1D1D1F] leading-tight mb-2 pr-4">{task.title}</h4>
              <div className="bg-[#F2F2F7]/50 p-2.5 rounded-xl mb-4">
                <p className="text-[11px] text-[#0066CC] font-semibold leading-relaxed flex gap-1.5 items-start">
                  <Zap size={11} className="shrink-0 mt-0.5" /> <span>{task.reason}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-1 border-t border-black/[0.02]">
                <div className="flex items-center gap-1.5"><Clock size={12}/> {task.duration} 分钟</div>
                <div className="flex items-center gap-1.5">
                  <ListTodo size={12}/> 
                  {task.type === 'deep' ? '深度专注' : 
                   task.type === 'comm' ? '沟通协作' : 
                   task.type === 'creative' ? '创意探索' : 
                   task.type === 'admin' ? '日常事务' : task.type}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Why not? Section */}
      {aiSecondaryTasks.length > 0 && (
        <div className="mt-10 border-t border-black/5 pt-6">
          <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest mb-4">AI Hold List（暂缓推荐）</p>
          <div className="space-y-2 opacity-60">
            {aiSecondaryTasks.map(t => (
              <div key={t.id} className="bg-white border border-black/5 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[13px] font-bold text-gray-500">{t.title}</p>
                  <p className="text-[10px] text-gray-400 font-medium">原因：当前由于精力模型更建议处理深度任务</p>
                </div>
                <div className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full">
                  <Zap size={10} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
    <Navbar appState="home" setAppState={setAppState} />

    <AnimatePresence>
      {scoreDetailTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => setScoreDetailTask(null)}
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white rounded-t-[32px] p-8 pb-12 pointer-events-auto shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-black/[0.05] rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black tracking-tight mb-1">AI 优先级推导</h3>
                <p className="text-sm text-gray-400 font-medium">{scoreDetailTask.title}</p>
              </div>
              <button 
                onClick={() => setScoreDetailTask(null)}
                className="p-2 bg-gray-50 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const breakdown = getScoreBreakdown(scoreDetailTask, userProfile, tasks);
              const items = [
                { label: '核心价值 (重要性)', score: breakdown.importance, weight: breakdown.weights.importance, icon: 'Brain' },
                { label: '紧迫程度 (紧急度)', score: breakdown.urgency, weight: breakdown.weights.urgency, icon: 'Clock' },
                { label: '精力匹配 (时间窗)', score: breakdown.timeMatch, weight: breakdown.weights.timeMatch, icon: 'Zap' },
                { label: '习惯加权 (AI 学习)', score: breakdown.habit, weight: breakdown.weights.habit, icon: 'Info' },
                { label: '拖延抵扣 (提权)', score: breakdown.delay, weight: breakdown.weights.delay, icon: 'ArrowDown' },
              ];

              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 bg-blue-50/50 p-6 rounded-[24px] border border-blue-100/50">
                    <div className="relative">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-blue-100" />
                        <circle 
                          cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" 
                          strokeDasharray={2 * Math.PI * 36}
                          strokeDashoffset={2 * Math.PI * 36 * (1 - breakdown.total / 100)}
                          className="text-[#007AFF] transition-all duration-1000" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-[#007AFF]">{breakdown.total}</span>
                        <span className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">综合</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-blue-900 mb-1">AI 综合推荐度</p>
                      <p className="text-[11px] text-blue-600/70 font-medium leading-relaxed">
                        {isMatureModel(userProfile) 
                          ? "基于成熟期模型加权，当前任务处在高效执行窗口。" 
                          : "当前基于四象限规则评分，随使用积累 AI 将逐步学习你的习惯。"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                            {item.icon === 'Brain' && <Brain size={14} />}
                            {item.icon === 'Clock' && <Clock size={14} />}
                            {item.icon === 'Zap' && <Zap size={14} />}
                            {item.icon === 'Info' && <Info size={14} />}
                            {item.icon === 'ArrowDown' && <ArrowDown size={14} />}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-gray-700">{item.label}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">权重: {Math.round(item.weight * 100)}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-black text-[#1D1D1F]">
                            {item.score >= 0 ? `+${item.score}` : item.score}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-black/[0.03] space-y-2">
                    <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                      满足以下任一条件后自动升级为成熟期模型：
                    </p>
                    <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                      已使用 7 天 · 或累计完成/跳过任务 10 次
                    </p>
                    <p className="text-center text-[8px] text-gray-200 font-bold uppercase tracking-[0.2em] pt-2">
                      算法更新于 2 分钟前 • Focus
                    </p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}

      {isAvatarSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsAvatarSheetOpen(false)}
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white rounded-t-[32px] p-8 pb-12 pointer-events-auto shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-black/[0.05] rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight mb-1">选择你的头像</h3>
                <p className="text-sm text-gray-400 font-medium">选择一个最能代表你的 AI 背景画像</p>
              </div>
              <button 
                onClick={() => setIsAvatarSheetOpen(false)}
                className="p-2 bg-gray-50 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {avatarOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setUserProfile(prev => ({ ...prev, avatar: opt.url }));
                    setIsAvatarSheetOpen(false);
                  }}
                  className={`relative aspect-square rounded-2xl border-2 transition-all overflow-hidden ${
                    userProfile.avatar === opt.url 
                      ? 'border-[#007AFF] shadow-lg scale-105' 
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <img src={opt.url} alt={opt.id} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {userProfile.avatar === opt.url && (
                    <div className="absolute top-1 right-1 bg-[#007AFF] text-white rounded-full p-0.5">
                      <Zap size={8} fill="white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest px-8">
              更换头像将同步更新你在 AI 工作流中的所有视觉呈现
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </motion.div>
);
};
