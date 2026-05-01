import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Brain, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { Task, UserProfile } from '../types';
import {
  calcPersonaLabel,
  calcWeekPattern
} from '../utils/insightCalc';
import {
  calcHabitLearning,
  isMatureModel
} from '../utils/scoreTask';
import { Navbar } from '../components/layout/Navbar';

interface ProfileProps {
  userProfile: UserProfile;
  tasks: Task[];
  completedToday: number;
  setAppState: (state: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({
  userProfile,
  tasks,
  completedToday,
  setAppState
}) => {
  const persona  = useMemo(
    () => calcPersonaLabel(userProfile),
    [userProfile]
  );
  const pattern  = useMemo(
    () => calcWeekPattern(tasks, userProfile),
    [tasks, userProfile]
  );
  const learning = calcHabitLearning(userProfile);
  const mature   = isMatureModel(userProfile);

  const totalActions = userProfile.habitData?.totalActions ?? 0;
  const daysUsed     = userProfile.habitData?.daysUsed     ?? 0;

  // 距离切换成熟期还差多少
  const actionsLeft = Math.max(0, 10 - totalActions);
  const daysLeft    = Math.max(0, 7  - daysUsed);
  const switchHint  = mature
    ? '已进入习惯适应期，推荐准确度持续提升'
    : actionsLeft <= daysLeft
      ? `再完成或跳过 ${actionsLeft} 次任务后升级`
      : `再使用 ${daysLeft} 天后升级`;

  // 任务类型分布
  const typeCounts: Record<string, number> = {};
  tasks.forEach(t => {
    typeCounts[t.type] = (typeCounts[t.type] ?? 0) + 1;
  });
  const total = tasks.length || 1;
  const typeLabel: Record<string, string> = {
    deep: '深度', comm: '沟通', creative: '创意', admin: '事务'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto min-h-screen
                 bg-[#F8F9FA] pb-40 overflow-y-auto"
    >
      {/* ── Header ── */}
      <header className="px-6 pt-12 pb-6">
        <p className="text-[10px] font-black text-[#8E8E93]
                      uppercase tracking-widest mb-1">
          AI 记忆
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {userProfile.name} 的工作画像
        </h1>
      </header>

      <div className="px-6 space-y-4">

        {/* ══ Section 1：AI 工作画像 ══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[28px] p-6
                     border border-black/5 shadow-sm"
        >
          <p className="text-[10px] font-black text-[#8E8E93]
                        uppercase tracking-widest mb-4">
            AI 画像
          </p>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50
                            flex items-center justify-center shrink-0">
              <Brain size={22} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 mb-1">
                {persona.title}
              </h2>
              <p className="text-[13px] text-gray-500
                            font-medium leading-relaxed">
                {persona.desc}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ══ Section 2：AI 学习进度 ══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[28px] p-6
                     border border-black/5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-[#8E8E93]
                          uppercase tracking-widest">
              AI 学习
            </p>
            <span className={`text-[10px] font-black px-2 py-1
                             rounded-full uppercase tracking-wider
                             ${mature
                               ? 'bg-green-50 text-green-600'
                               : 'bg-blue-50 text-blue-500'}`}>
              {mature ? '习惯适应期' : '规则学习期'}
            </span>
          </div>

          {/* 进度条 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${learning}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-[#007AFF] rounded-full"
              />
            </div>
            <span className="text-[15px] font-black text-[#007AFF]
                             min-w-[40px] text-right">
              {learning}%
            </span>
          </div>

          <p className="text-[12px] text-gray-400 font-medium">
            {switchHint}
          </p>
        </motion.div>

        {/* ══ Section 3：历史数据 ══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-[28px] p-6
                     border border-black/5 shadow-sm"
        >
          <p className="text-[10px] font-black text-[#8E8E93]
                        uppercase tracking-widest mb-4">
            历史数据
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* 累计行为次数 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4">
              <p className="text-[9px] font-black text-gray-400
                            uppercase tracking-widest mb-1">
                有效反馈
              </p>
              <p className="text-[22px] font-black
                            text-gray-900 tracking-tighter">
                {totalActions}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                次
              </p>
            </div>

            {/* 今日完成 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4">
              <p className="text-[9px] font-black text-gray-400
                            uppercase tracking-widest mb-1">
                今日完成
              </p>
              <p className="text-[22px] font-black
                            text-gray-900 tracking-tighter">
                {completedToday}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                个任务
              </p>
            </div>
          </div>

          {/* 任务类型分布 */}
          {tasks.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-400
                            uppercase tracking-widest mb-3">
                任务类型分布
              </p>
              <div className="space-y-2">
                {Object.entries(typeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={type}>
                        <div className="flex justify-between
                                        items-center mb-1">
                          <span className="text-[12px] font-bold
                                           text-gray-700">
                            {typeLabel[type] ?? type}
                          </span>
                          <span className="text-[11px] font-black
                                           text-gray-400">
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100
                                        rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-[#007AFF] rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </motion.div>

      </div>
      <Navbar appState="profile" setAppState={setAppState} />
    </motion.div>
  );
};
