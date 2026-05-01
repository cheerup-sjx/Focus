/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ChevronRight, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { UserProfile } from '../types';

interface OnboardingProps {
  setAppState: (state: any) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onCompleteWithSample: () => void;
  onCompleteEmpty: () => void;
}

type Step = 'welcome' | 'name' | 'questions' | 'get-started';

export const Onboarding: React.FC<OnboardingProps> = ({ 
  setAppState, 
  userProfile, 
  setUserProfile,
  onCompleteWithSample,
  onCompleteEmpty
}) => {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(userProfile.name);
  
  // Question state (multi-select)
  const [focusTimes, setFocusTimes] = useState<string[]>([]);
  const [dailyHours, setDailyHours] = useState<string[]>([]);
  const [hardTypes, setHardTypes] = useState<string[]>([]);

  const handleFinalStep = () => {
    setUserProfile(prev => ({
      ...prev,
      name: name || prev.name,
      focusTime: focusTimes.join(', ') || prev.focusTime,
      dailyHours: dailyHours.join(', ') || prev.dailyHours,
      hardType: hardTypes.join(', ') || prev.hardType,
    }));
    setStep('get-started');
  };

  const Progress = ({ current }: { current: number }) => (
    <div className="flex gap-1.5 mb-12">
      {[1, 2].map(i => (
        <div key={i} className={`h-1 flex-1 rounded-full ${i <= current ? 'bg-[#007AFF]' : 'bg-gray-100'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-[#007AFF] rounded-[32px] mb-10 flex items-center justify-center shadow-2xl shadow-blue-200"
            >
              <Brain size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tighter mb-4 text-[#1D1D1F]">Focus</h1>
            <p className="text-[15px] text-gray-400 font-medium mb-12 max-w-[200px] mx-auto leading-relaxed underline decoration-[#007AFF]/20 underline-offset-8 decoration-2">AI-助力的行动决策系统</p>
            <Button className="w-full h-16 text-sm uppercase tracking-widest group" onClick={() => setStep('name')}>
              开始使用 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {step === 'name' && (
          <motion.div 
            key="name"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="p-8 pt-16"
          >
            <Progress current={1} />
            <h2 className="text-3xl font-black tracking-tighter mb-4">你叫什么名字？</h2>
            <p className="text-gray-400 font-medium mb-12">AI 将用这个名字向你提供个性化建议</p>
            
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入你的昵称..."
              className="w-full text-2xl font-bold border-none outline-none mb-24 placeholder:text-gray-100"
            />

            <Button className="w-full h-16 text-sm uppercase tracking-widest" onClick={() => setStep('questions')}>下一步</Button>
          </motion.div>
        )}

        {step === 'questions' && (
          <motion.div 
            key="questions"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="p-8 pt-16 min-h-screen flex flex-col pb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setStep('name')} className="p-2 -ml-2 text-gray-300 hover:text-black">
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1 px-8">
                <Progress current={2} />
              </div>
              <div className="w-10" />
            </div>

            <h2 className="text-3xl font-black tracking-tighter mb-2">让 AI 了解你</h2>
            <p className="text-sm text-gray-400 font-medium mb-10">3 个问题，帮 AI 从第一天就给出更好的推荐</p>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {/* Question 1 */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">你通常什么时候最专注？ (单选)</p>
                <div className="grid grid-cols-2 gap-2">
                  {['早上', '下午', '晚上', '不固定'].map(opt => (
                    <OptionButton 
                      key={opt}
                      label={opt}
                      selected={focusTimes.includes(opt)}
                      onClick={() => setFocusTimes([opt])}
                    />
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">今天大概有多少深度工作时间？ (单选)</p>
                <div className="space-y-2">
                  {['1小时以内', '2–4小时', '4小时以上'].map(opt => (
                    <OptionButton 
                      key={opt}
                      label={opt}
                      selected={dailyHours.includes(opt)}
                      onClick={() => setDailyHours([opt])}
                    />
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">你最难开始的任务类型是？ (多选，最多2项)</p>
                <div className="space-y-2">
                  {['需要写作的', '需要沟通的', '耗时很长的', '需要创意的'].map(opt => (
                    <OptionButton 
                      key={opt}
                      label={opt}
                      selected={hardTypes.includes(opt)}
                      onClick={() => {
                        if (hardTypes.includes(opt)) {
                          setHardTypes(hardTypes.filter(t => t !== opt));
                        } else if (hardTypes.length < 2) {
                          setHardTypes([...hardTypes, opt]);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 bg-white border-t border-gray-50 -mx-8 px-8">
              <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-wider mb-4">
                AI 还在了解你的完整习惯，推荐准确度会随使用逐步提升
              </p>
              <Button className="w-full h-16 text-sm uppercase tracking-widest" onClick={handleFinalStep}>开始使用 Focus</Button>
            </div>
          </motion.div>
        )}

        {step === 'get-started' && (
          <motion.div 
            key="get-started"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-8 pt-24 min-h-screen flex flex-col text-center"
          >
            <div className="w-16 h-16 bg-[#007AFF]/10 text-[#007AFF] rounded-[24px] mx-auto mb-8 flex items-center justify-center">
              <Zap size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">开始使用 Focus</h2>
            <p className="text-gray-400 font-medium mb-12">你想怎么开始？</p>

            <div className="space-y-4">
              <button 
                onClick={() => {
                  setUserProfile(prev => ({
                    ...prev,
                    habitData: {
                      daysUsed: 0,
                      totalActions: 0,
                      usedSampleTasks: false,
                      preferredTaskTypes: {}
                    }
                  }));
                  onCompleteEmpty();
                }}
                className="w-full py-6 px-6 rounded-2xl text-left font-bold transition-all border bg-gray-50 text-gray-500 border-gray-50 hover:border-[#007AFF]/30"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-900 mb-1">自己添加任务</p>
                    <p className="text-[11px] text-gray-400 font-medium">从空白列表开始你的提效之旅</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </button>

              <button 
                onClick={() => {
                  setUserProfile(prev => ({
                    ...prev,
                    habitData: {
                      daysUsed: 0,
                      totalActions: 0,
                      usedSampleTasks: true,
                      preferredTaskTypes: {
                        morning: 'deep',
                        afternoon: 'comm'
                      }
                    }
                  }));
                  onCompleteWithSample();
                }}
                className="w-full py-6 px-6 rounded-2xl text-left font-bold transition-all border bg-gray-50 text-gray-500 border-gray-50 hover:border-[#007AFF]/30"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-900 mb-1">导入 3 个示例任务查看效果</p>
                    <p className="text-[11px] text-gray-400 font-medium">快速体验 AI 如何帮你决策优先级</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </button>
            </div>
            
            <p className="mt-12 text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-relaxed">
              Ready to Focus?
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OptionButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void; key?: string }) => (
  <button 
    onClick={onClick}
    className={`w-full py-4 px-6 rounded-2xl text-left font-bold transition-all border ${
      selected 
        ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-lg shadow-blue-100' 
        : 'bg-gray-50 text-gray-500 border-gray-50 hover:border-gray-200'
    }`}
  >
    <div className="flex justify-between items-center">
      <span className="text-sm">{label}</span>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-white" />
      )}
    </div>
  </button>
);
