/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';

// Types
import { AppState, Task, UserProfile } from './types';

// Utils
import { INITIAL_TASKS } from './utils/mockData';
import { getBeijingTime } from './utils/timeStatus';

// Components
import { BottomSheet } from './components/tasks/BottomSheet';
import { FocusScreen } from './components/focus/FocusScreen';

// Pages
import { Home } from './pages/Home';
import { TasksPool } from './pages/Tasks';
import { AddTask } from './pages/AddTask';
import { Insights } from './pages/Insights';
import { Profile } from './pages/Profile';
import { Onboarding } from './pages/Onboarding';

export default function App() {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '小林',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=A1',
    focusTime: '早上',
    dailyHours: '2-4h',
    hardType: '需要写作的',
    learningDays: 17,
    habitData: {
      daysUsed: 14,
      totalActions: 12,
      usedSampleTasks: true,
      preferredTaskTypes: {
        morning: 'deep',
        afternoon: 'comm'
      }
    }
  });
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isSkipSheetOpen, setIsSkipSheetOpen] = useState(false);
  const [interactingTask, setInteractingTask] = useState<Task | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // New tracking state for insights
  const [completedToday, setCompletedToday] = useState(0);
  const [skippedToday, setSkippedToday] = useState(0);
  const [completedTasksToday, setCompletedTasksToday] = useState<(Task & { completedAt: number })[]>([]);

  // Logic moved to components for better responsiveness to habit updates
  const addTask = (newTask: Partial<Task>) => {
    setIsRecalculating(true);
    setTimeout(() => {
      const task: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: newTask.title || '未命名任务',
        type: newTask.type || 'admin',
        importance: newTask.importance || 'medium',
        duration: newTask.duration || 30,
        deadline: newTask.deadline || '有空再说',
        priorityScore: newTask.priorityScore ?? 0,
        reason: newTask.reason || 'AI 根据实时重要性及你的精力模型已更新其权重',
        skippedCount: 0,
        createdAt: Date.now(),
        ...newTask
      };
      setTasks(prev => [...prev, task]);
      setIsRecalculating(false);
      setAppState('home');
    }, 1200);
  };

  const handleSkipConfirm = (reason: string) => {
    if (interactingTask) {
      setTasks(prev => prev.map(t => 
        t.id === interactingTask.id 
          ? { 
              ...t, 
              skippedCount: t.skippedCount + 1,
              skipReasonCounts: {
                ...(t.skipReasonCounts || {}),
                [reason]: (t.skipReasonCounts?.[reason] || 0) + 1
              }
            } 
          : t
      ));
      setUserProfile(prev => ({
        ...prev,
        habitData: prev.habitData ? {
          ...prev.habitData,
          totalActions: (prev.habitData.totalActions ?? 0) + 1,
        } : {
          daysUsed: 0,
          totalActions: 1,
          usedSampleTasks: false,
          preferredTaskTypes: {}
        }
      }));
      setSkippedToday(n => n + 1);
    }
    setIsSkipSheetOpen(false);
    setInteractingTask(null);
  };

  const onTaskComplete = (taskId: string, elapsedMinutes: number) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            completed: true, 
            elapsedTime: elapsedMinutes, 
            completedAt: Date.now() 
          } 
        : t
    ));
    setUserProfile(prev => ({
      ...prev,
      habitData: prev.habitData ? {
        ...prev.habitData,
        totalActions: (prev.habitData.totalActions ?? 0) + 1,
      } : {
        daysUsed: 0,
        totalActions: 1,
        usedSampleTasks: false,
        preferredTaskTypes: {}
      }
    }));

    if (task) {
      setCompletedToday(n => n + 1);
      setCompletedTasksToday(prev => [
        ...prev,
        {
          ...task,
          completedAt:
            getBeijingTime().getHours() * 60 +
            getBeijingTime().getMinutes(),
        },
      ]);
    }

    setAppState('home');
  };

  const onCompleteWithSample = () => {
    setTasks(INITIAL_TASKS as Task[]);
    setAppState('home');
  };

  const onCompleteEmpty = () => {
    setAppState('home');
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans antialiased text-[#1D1D1F] overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {appState === 'home' && (
          <Home 
            key="home"
            userProfile={userProfile}
            tasks={tasks}
            setAppState={setAppState}
            setUserProfile={setUserProfile}
            setActiveTask={setActiveTask}
            setInteractingTask={setInteractingTask}
            setIsSkipSheetOpen={setIsSkipSheetOpen}
          />
        )}
        {appState === 'tasks' && <TasksPool key="tasks" tasks={tasks} userProfile={userProfile} setAppState={setAppState} />}
        {appState === 'insights' && (
          <Insights 
            key="insights" 
            setAppState={setAppState} 
            completedToday={completedToday}
            skippedToday={skippedToday}
            completedTasksToday={completedTasksToday}
            userProfile={userProfile}
            tasks={tasks}
          />
        )}
        {appState === 'profile' && (
          <Profile 
            key="profile" 
            userProfile={userProfile} 
            tasks={tasks}
            completedToday={completedToday}
            setAppState={setAppState} 
          />
        )}
        {appState === 'add-task' && (
          <AddTask 
            key="add-task" 
            addTask={addTask} 
            setAppState={setAppState} 
            isRecalculating={isRecalculating} 
            userProfile={userProfile}
            tasks={tasks}
          />
        )}
        {appState === 'focus' && activeTask && (
           <FocusScreen key="focus" task={activeTask} onClose={() => setAppState('home')} onComplete={(elapsed) => onTaskComplete(activeTask.id, elapsed)} />
        )}
        {appState === 'onboarding' && (
          <Onboarding 
            key="onboarding" 
            setAppState={setAppState} 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onCompleteWithSample={onCompleteWithSample}
            onCompleteEmpty={onCompleteEmpty}
          />
        )}
      </AnimatePresence>

      <BottomSheet 
        isOpen={isSkipSheetOpen} 
        onClose={() => setIsSkipSheetOpen(false)} 
        onSelectOption={handleSkipConfirm}
        task={interactingTask}
      />
    </div>
  );
}
