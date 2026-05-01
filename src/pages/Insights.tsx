import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Clock, Target, Zap, TrendingUp,
  CheckCircle, SkipForward, Brain, AlertCircle
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import {
  calcDailyReview,
  calcWeekPattern
} from '../utils/insightCalc';
import { Navbar } from '../components/layout/Navbar';

interface InsightViewProps {
  completedToday: number;
  skippedToday: number;
  completedTasksToday: (Task & { completedAt: number })[];
  userProfile: UserProfile;
  tasks: Task[];
  setAppState: (state: any) => void;
}

export const Insights: React.FC<InsightViewProps> = ({
  completedToday,
  skippedToday,
  completedTasksToday,
  userProfile,
  tasks,
  setAppState
}) => {
  const review = useMemo(
    () => calcDailyReview(
      completedToday, skippedToday,
      completedTasksToday, userProfile
    ),
    [completedToday, skippedToday, completedTasksToday, userProfile]
  );

  const pattern = useMemo(
    () => calcWeekPattern(tasks, userProfile),
    [tasks, userProfile]
  );

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
          AI 复盘
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          今日复盘
        </h1>
      </header>

      {/* ══ Section 1：今日复盘 ══ */}
      <section className="px-6 space-y-3 mb-10">
        <p className="text-[10px] font-black text-[#8E8E93]
                      uppercase tracking-widest px-1 mb-3">
          今日状态
        </p>

        {/* 卡片1：任务完成情况 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[24px] p-5
                     border border-black/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50
                            flex items-center justify-center">
              <CheckCircle size={16} className="text-blue-500" />
            </div>
            <span className="text-[11px] font-black text-[#8E8E93]
                             uppercase tracking-widest">
              任务完成
            </span>
          </div>
          <p className="text-[15px] font-semibold text-gray-900 leading-snug">
            {review.taskSummary}
          </p>
          {review.adoptionSummary && (
            <p className="text-[12px] text-gray-400 font-medium mt-2">
              {review.adoptionSummary}
            </p>
          )}
        </motion.div>

        {/* 卡片2：专注时段利用质量 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[24px] p-5
                     border border-black/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50
                            flex items-center justify-center">
              <Zap size={16} className="text-purple-500" />
            </div>
            <span className="text-[11px] font-black text-[#8E8E93]
                             uppercase tracking-widest">
              专注时段
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[15px] font-semibold text-gray-900">
              {review.focusQuality.label}
            </p>
            {review.focusUtilRate > 0 && (
              <span className="text-[13px] font-black text-blue-500">
                {review.focusUtilRate}%
              </span>
            )}
          </div>
          {/* 利用率进度条 */}
          {review.focusUtilRate > 0 && (
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${review.focusUtilRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          )}
          <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
            {review.focusQuality.desc}
          </p>
        </motion.div>

        {/* 卡片3：一句话总结 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-black rounded-[24px] p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-blue-400" />
            <span className="text-[10px] font-black text-white/40
                             uppercase tracking-widest">
              AI 总结
            </span>
          </div>
          <p className="text-[14px] font-semibold text-white leading-relaxed">
            {review.finalSummary}
          </p>
        </motion.div>
      </section>

      {/* ══ Section 2：本周规律 ══ */}
      <section className="px-6 space-y-3">
        <p className="text-[10px] font-black text-[#8E8E93]
                      uppercase tracking-widest px-1 mb-3">
          你的工作规律
        </p>

        {/* 效率最高时段 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] p-5
                     border border-black/5 shadow-sm
                     flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-green-50
                          flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#8E8E93]
                          uppercase tracking-widest mb-1">
              效率最高时段
            </p>
            <p className="text-[14px] font-bold text-gray-900">
              {pattern.peakPeriod}
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              AI 会优先在这个时段推荐深度任务
            </p>
          </div>
        </motion.div>

        {/* 最容易拖延的类型 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-[24px] p-5
                     border border-black/5 shadow-sm
                     flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-50
                          flex items-center justify-center shrink-0">
            <SkipForward size={18} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#8E8E93]
                          uppercase tracking-widest mb-1">
              最容易推迟的任务
            </p>
            <p className="text-[14px] font-bold text-gray-900">
              {pattern.procrastinationType}
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              AI 会对这类任务适当提前推荐
            </p>
          </div>
        </motion.div>

        {/* 最难开始的任务类型 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[24px] p-5
                     border border-black/5 shadow-sm
                     flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-50
                          flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#8E8E93]
                          uppercase tracking-widest mb-1">
              最难独立开始
            </p>
            <p className="text-[14px] font-bold text-gray-900">
              {pattern.hardType}
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              遇到此类任务时 AI 会给出更具体的切入建议
            </p>
          </div>
        </motion.div>

        {/* 累计行为次数 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-[24px] p-5
                     border border-black/5 shadow-sm
                     flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50
                          flex items-center justify-center shrink-0">
            <Target size={18} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#8E8E93]
                          uppercase tracking-widest mb-1">
              AI 观测数据量
            </p>
            <p className="text-[14px] font-bold text-gray-900">
              {pattern.totalActions} 次有效反馈
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              数据越多，推荐越准确
            </p>
          </div>
        </motion.div>
      </section>
      <Navbar appState="insights" setAppState={setAppState} />
    </motion.div>
  );
}
