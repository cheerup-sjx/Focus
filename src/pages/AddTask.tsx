/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { Button } from '../components/ui/Button';
import { 
  classifyTask, 
  getTypeLabel, 
  getTypeDuration,
  TASK_TYPE_LABELS,
  TASK_TYPE_DEFAULT_DURATION
} from '../utils/classifyTask';
import { scoreTask, generateReason, inferImportance } from '../utils/scoreTask';
import { getBeijingTime } from '../utils/timeStatus';
import { UserProfile, TaskType, Importance } from '../types';
import { WheelPicker, DateTimeValue } from '../components/ui/WheelPicker';
import { Clock, Calendar, ChevronRight } from 'lucide-react';

interface AddTaskProps {
  addTask: (task: Partial<Task>) => void;
  setAppState: (state: any) => void;
  isRecalculating: boolean;
  userProfile: UserProfile;
  tasks: Task[];
}

export const AddTask: React.FC<AddTaskProps> = ({ addTask, setAppState, isRecalculating, userProfile, tasks }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [startTimeValue, setStartTimeValue] = useState<DateTimeValue | null>(null);
  const [deadlineValue, setDeadlineValue] = useState<DateTimeValue | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customType, setCustomType] = useState<TaskType | null>(null);
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [customDurationInput, setCustomDurationInput] = useState('');
  const [showDurationInput, setShowDurationInput] = useState(false);

  const aiSuggestion = useMemo(() => {
    if (title.length < 2) return null;
    const type = classifyTask(title);
    return {
      type,
      label: getTypeLabel(type),
      duration: getTypeDuration(type),
    };
  }, [title]);

  // AI 建议的类型和时长
  const aiType = aiSuggestion?.type ?? 'deep';
  const aiDuration = aiSuggestion?.duration ?? 60;

  // 最终值：custom 覆盖 AI 建议
  const finalType = customType ?? aiType;
  const finalDuration = customDuration ?? aiDuration;

  const handleSchedule = () => {
    console.log('startTimeValue:', startTimeValue);
    const startTimeResult = startTimeValue?.time ?? undefined;
    console.log('写入 startTime:', startTimeResult);

    // deadline：用中文类型标签，与 generateReason 的判断逻辑一致
    const deadlineString = deadlineValue
      ? (['今天', '明天', '本周', '自定义'][
          ['today', 'tomorrow', 'thisweek', 'custom'].indexOf(deadlineValue.type)
        ] + ' ' + deadlineValue.time)
      : undefined;

    const tempTask: Partial<Task> = {
      title,
      type: finalType,
      importance: inferImportance(finalType, deadlineString),
      duration: finalDuration,
      deadline: deadlineString,
      skippedCount: 0,
      createdAt: Date.now(),
      startTime: startTimeResult
    };
    
    // 生成最终的 task 对象以供 reason 和 score 计算使用
    const newTask = {
      ...tempTask,
      id: Math.random().toString(36).substring(7),
      priorityScore: 0,
      reason: '',
    } as Task;

    addTask({ 
      ...tempTask,
      priorityScore: scoreTask(newTask, userProfile, tasks),
      reason: generateReason(newTask, userProfile, tasks)
    });
    setAppState('home');
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 bg-white z-[100] flex flex-col max-w-md mx-auto overflow-hidden">
      <header className="flex justify-between items-center p-8 pb-0 shrink-0">
         <button onClick={() => setAppState('home')} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={18}/></button>
         <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E93]">新建任务</h3>
         <div className="w-10" />
      </header>

      <div className="flex-1 p-8 overflow-y-auto" ref={scrollRef}>
        <div className="mb-12">
          <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest mb-3">任务名称</p>
          <textarea 
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="接下来要完成什么？"
            className="w-full text-2xl font-bold border-none outline-none resize-none placeholder:text-gray-100 leading-tight"
            rows={4}
          />
        </div>

        <div className="mb-12">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">开始时间（选填）</p>
          <button
            onClick={() => {
              setShowStartPicker(v => !v);
              setShowDeadlinePicker(false);
            }}
            className="w-full flex items-center justify-between py-3 border-b border-black/[0.05]"
          >
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-gray-400" />
              <span className={`text-lg font-semibold ${
                startTimeValue ? 'text-gray-900' : 'text-gray-200'
              }`}>
                {startTimeValue
                  ? `${['今天','明天','本周','自定义'][
                      ['today','tomorrow','thisweek','custom']
                        .indexOf(startTimeValue.type)
                    ]} ${startTimeValue.time}`
                  : '选择开始时间'}
              </span>
            </div>
            <ChevronRight size={18} className="text-gray-100" />
          </button>

          <AnimatePresence>
            {showStartPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2"
              >
                <WheelPicker
                  value={startTimeValue}
                  onChange={setStartTimeValue}
                  showDateType={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-12">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">截止日期（选填）</p>
          <button
            onClick={() => {
              setShowDeadlinePicker(v => !v);
              setShowStartPicker(false);
            }}
            className="w-full flex items-center justify-between py-3 border-b border-black/[0.05]"
          >
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-400" />
              <span className={`text-lg font-semibold ${
                deadlineValue ? 'text-gray-900' : 'text-gray-200'
              }`}>
                {deadlineValue
                  ? `${['今天','明天','本周','自定义'][
                      ['today','tomorrow','thisweek','custom']
                        .indexOf(deadlineValue.type)
                    ]} ${deadlineValue.time}`
                  : '选择截止日期'}
              </span>
            </div>
            <ChevronRight size={18} className="text-gray-100" />
          </button>

          <AnimatePresence>
            {showDeadlinePicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2"
              >
                <WheelPicker
                  value={deadlineValue}
                  onChange={setDeadlineValue}
                  showDateType={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {aiSuggestion && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F2F2F7]/40 border border-black/5 p-6 rounded-[28px] mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#007AFF]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0066CC]">AI 智能建议</span>
              </div>
              <p className="text-[13px] font-medium text-gray-500 mb-6 leading-relaxed">
                {!isCustomMode ? (
                  <>系统推测这是一个 <span className="text-[#1D1D1F] font-bold uppercase">{aiSuggestion.label}</span> 任务。建议在上午专注窗口处理，预估需要 <span className="text-[#1D1D1F] font-bold">{aiSuggestion.duration} 分钟</span>。</>
                ) : (
                  <>已自定义：<span className="text-[#1D1D1F] font-bold uppercase">{TASK_TYPE_LABELS[finalType]}</span>，预计 <span className="text-[#1D1D1F] font-bold">{finalDuration} 分钟</span>。</>
                )}
              </p>
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => {
                    if (!isCustomMode) {
                      handleSchedule();
                    } else {
                      setIsCustomMode(false);
                      setCustomType(null);
                      setCustomDuration(null);
                    }
                  }} 
                  className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${!isCustomMode ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-100' : 'bg-white border border-black/5 text-gray-400'}`}
                >
                  采纳建议
                </button>
                <button 
                  onClick={() => {
                    setIsCustomMode(true);
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: 'smooth',
                      });
                    }, 100);
                  }}
                  className={`py-2.5 px-6 rounded-xl text-[11px] font-bold uppercase transition-all ${isCustomMode ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-100' : 'bg-white border border-black/5 text-gray-400'}`}
                >
                  自定义
                </button>
              </div>


              <AnimatePresence>
                {isCustomMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">任务类型</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setCustomType(type);
                              setCustomDuration(TASK_TYPE_DEFAULT_DURATION[type]);
                              setShowDurationInput(false);
                            }}
                            className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${finalType === type ? 'bg-[#007AFF] text-white' : 'bg-gray-100 text-gray-400'}`}
                          >
                            {TASK_TYPE_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">预计时长</p>
                      <div className="flex flex-wrap gap-2">
                        {[15, 30, 60, 90].map((duration) => {
                          const isActive = !showDurationInput && (
                            finalDuration === duration || 
                            (duration === 15 && finalDuration <= 15) ||
                            (duration === 30 && finalDuration > 15 && finalDuration <= 45) ||
                            (duration === 60 && finalDuration > 45 && finalDuration <= 75) ||
                            (duration === 90 && finalDuration > 75)
                          );
                          
                          // More precise matching for small durations
                          const isExactActive = !showDurationInput && (
                            (duration === 15 && finalDuration === 15) ||
                            (duration === 30 && finalDuration === 30) ||
                            (duration === 60 && finalDuration === 60) ||
                            (duration === 90 && finalDuration === 90)
                          );

                          // The requirement says: 默认选中：与 finalDuration 最接近的选项
                          // （15→15m, 20-45→30m, 46-75→60m, 76以上→90m）
                          let isTarget = false;
                          if (!showDurationInput) {
                            if (duration === 15 && finalDuration <= 17) isTarget = true;
                            else if (duration === 30 && finalDuration > 17 && finalDuration <= 45) isTarget = true;
                            else if (duration === 60 && finalDuration > 45 && finalDuration <= 75) isTarget = true;
                            else if (duration === 90 && finalDuration > 75) isTarget = true;
                          }

                          return (
                            <button
                              key={duration}
                              onClick={() => {
                                setCustomDuration(duration);
                                setShowDurationInput(false);
                              }}
                              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${isTarget ? 'bg-[#007AFF] text-white' : 'bg-gray-100 text-gray-400'}`}
                            >
                              {duration} 分钟
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setShowDurationInput(true)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${showDurationInput ? 'bg-[#007AFF] text-white' : 'bg-gray-100 text-gray-400'}`}
                        >
                          自定义
                        </button>
                      </div>

                      {showDurationInput && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-2"
                        >
                          <input
                            type="number"
                            placeholder="输入分钟数，如 45"
                            value={customDurationInput}
                            onChange={(e) => setCustomDurationInput(e.target.value)}
                            onBlur={() => {
                              const val = parseInt(customDurationInput, 10);
                              if (!isNaN(val) && val > 0) {
                                setCustomDuration(val);
                              }
                            }}
                            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#007AFF]/30 transition-all"
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 pt-0 pb-12 shrink-0">
         <Button 
          className="w-full h-16 text-sm uppercase tracking-widest" 
          disabled={!title || isRecalculating} 
          onClick={handleSchedule}
        >
           {isRecalculating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Sparkles size={18}/></motion.div> : '重新计算优先级'}
         </Button>
         <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-4">由 Focus 学习引擎驱动</p>
      </div>
    </motion.div>
  );
};
