/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '@/src/types';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (reason: string) => void;
  task: Task | null;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, onSelectOption, task }) => {
  if (!isOpen || !task) return null;
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-[2px]" />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} 
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[44px] z-[80] p-10 pb-16 shadow-2xl"
      >
        <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-10" />
        <h3 className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-[0.3em] mb-4">反馈循环</h3>
        <p className="text-2xl font-black tracking-tight mb-10">为什么选择暂缓任务 "{task.title}"？</p>
        <div className="space-y-2 mb-10">
          {[
            { label: "精力不足", value: "Energy is low" },
            { label: "环境不匹配", value: "Incomplete context" },
            { label: "存在外部依赖", value: "External dependency" },
            { label: "暂时不想做", value: "Not now" }
          ].map(opt => (
            <button 
              key={opt.value}
              onClick={() => onSelectOption(opt.value)}
              className="w-full text-left p-5 bg-[#F2F2F7] rounded-2xl font-bold text-[#1D1D1F] active:scale-[0.98] transition-transform text-sm"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button className="w-full py-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]" onClick={onClose}>直接暂缓</button>
      </motion.div>
    </>
  );
};
