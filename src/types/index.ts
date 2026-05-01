/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppState = 'onboarding' | 'home' | 'tasks' | 'insights' | 'profile' | 'focus' | 'add-task';
export type TaskType = 'deep' | 'comm' | 'creative' | 'admin';
export type Importance = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  importance: Importance;
  duration: number; // minutes
  deadline?: string;
  priorityScore: number;
  reason: string;
  skippedCount: number;
  skipReasonCounts?: Record<string, number>;
  createdAt: number;
  startTime?: string;
  notes?: string;
  elapsedTime?: number;
  completedAt?: number;
  completed?: boolean;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  focusTime: string; 
  dailyHours: string;
  hardType: string;
  learningDays: number;
  habitData?: {
    daysUsed: number;
    totalActions: number; // 累计完成或跳过任务的总次数
    usedSampleTasks: boolean; // 冷启动时是否选择了导入示例任务
    preferredTaskTypes: Record<string, string>;
  };
}
