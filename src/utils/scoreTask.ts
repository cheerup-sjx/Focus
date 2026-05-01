/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, UserProfile, TaskType, Importance } from '../types';
import {
  getFocusStatus,
  getBeijingTime,
  getAvailableMinutes,
  getTimeFit,
} from './timeStatus';

export interface ScoreBreakdown {
  total: number;
  importance: number;
  urgency: number;
  timeMatch: number;
  habit: number;
  delay: number;
  weights: {
    importance: number;
    urgency: number;
    timeMatch: number;
    habit: number;
    delay: number;
  };
}

/**
 * 判断是否应使用成熟期模型
 * 满足以下任一条件即切换：
 * 1. 冷启动时选择了导入示例任务（usedSampleTasks === true）
 * 2. 使用天数 >= 7
 * 3. 累计完成或跳过任务总次数 >= 10
 */
export function isMatureModel(userProfile: UserProfile): boolean {
  const habit = userProfile.habitData;
  if (!habit) return false;

  // 条件1：导入了示例任务，直接视为成熟期
  if (habit.usedSampleTasks === true) return true;

  // 条件2：使用满7天
  if (habit.daysUsed >= 7) return true;

  // 条件3：累计行为数据达到10次
  if (habit.totalActions >= 10) return true;

  return false;
}

export function getScoreBreakdown(task: Task, userProfile: UserProfile, allTasks: Task[]): ScoreBreakdown {
  const mature = isMatureModel(userProfile);
  const weights = mature ? {
    importance: 0.25,
    urgency: 0.20,
    timeMatch: 0.30,
    habit: 0.20,
    delay: 0.05
  } : {
    importance: 0.40,
    urgency: 0.35,
    timeMatch: 0.15,
    habit: 0.05,
    delay: 0.05
  };

  const importanceBase: Record<string, number> = { high: 100, medium: 60, low: 20 };
  const importanceScore = (importanceBase[task.importance] ?? 60) * weights.importance;

  const urgencyBase = getUrgencyBaseScore(task);
  const urgencyScore = urgencyBase * weights.urgency;

  const matchBase = getTimeMatchBaseScore(task, userProfile.focusTime, allTasks, weights);
  const timeMatchScore = matchBase * weights.timeMatch;

  const habitBase = getHabitBaseScore(task, userProfile);
  const habitScore = habitBase * weights.habit;

  // ── 维度5：拖延抵扣 ──
  const notNowCount = task.skipReasonCounts?.['Not now'] || 0;
  let delayBase = 0;
  if (notNowCount >= 1) delayBase += 60; // 第1次 +3分 (60 * 0.05)
  if (notNowCount >= 2) delayBase += 40; // 第2次 +2分 (40 * 0.05)
  if (notNowCount >= 3) delayBase += 20; // 第3次 +1分 (20 * 0.05)
  
  const skipBonus = delayBase;
  const delayScore = skipBonus * weights.delay;

  const total = Math.min(100, Math.max(0, Math.round(importanceScore + urgencyScore + timeMatchScore + habitScore + delayScore)));

  return {
    total,
    importance: Math.round(importanceScore),
    urgency: Math.round(urgencyScore),
    timeMatch: Math.round(timeMatchScore),
    habit: Math.round(habitScore),
    delay: Math.round(delayScore),
    weights
  };
}

/**
 * 基于四象限法则与用户习惯的动态优先级评分
 * 总分 0-100，分数越高越优先推荐
 */
export function scoreTask(task: Task, userProfile: UserProfile, allTasks: Task[]): number {
  let score = 0;
  
  // 动态权重分配逻辑
  const mature = isMatureModel(userProfile);
  
  const weights = mature ? {
    importance: 0.25,
    urgency: 0.20,
    timeMatch: 0.30,
    habit: 0.20,
    delay: 0.05
  } : {
    importance: 0.40,
    urgency: 0.35,
    timeMatch: 0.15,
    habit: 0.05,
    delay: 0.05
  };

  // ── 维度1：重要程度 (满分 100 * 权重) ──
  const importanceBase: Record<string, number> = { high: 100, medium: 60, low: 20 };
  score += (importanceBase[task.importance] ?? 60) * weights.importance;

  // ── 维度2：紧急程度 (满分 100 * 权重) ──
  const urgencyBase = getUrgencyBaseScore(task);
  score += urgencyBase * weights.urgency;

  // ── 维度3：时间段匹配度 (满分 100 * 权重) ──
  const matchBase = getTimeMatchBaseScore(task, userProfile.focusTime, allTasks, weights);
  score += matchBase * weights.timeMatch;

  // 维度4：AI 历史习惯得分 (满分 100 * 权重)
  const habitBase = getHabitBaseScore(task, userProfile);
  score += habitBase * weights.habit;

  // ── 维度5：拖延惩罚/提权 (满分 100 * 权重) ──
  const notNowCount = task.skipReasonCounts?.['Not now'] || 0;
  let delayBase = 0;
  if (notNowCount >= 1) delayBase += 60; // 第1次 +3分
  if (notNowCount >= 2) delayBase += 40; // 第2次 +2分
  if (notNowCount >= 3) delayBase += 20; // 第3次 +1分
  
  const skipBonus = delayBase;
  score += skipBonus * weights.delay;

  // 总分截断到 0-100
  return Math.min(100, Math.max(0, Math.round(score)));
}

// ── 紧急程度基础分 ──
function getUrgencyBaseScore(task: Task): number {
  const deadline = task.deadline?.toLowerCase() ?? '';
  if (deadline.startsWith('今天') || deadline === 'today') return 100;
  if (deadline.startsWith('明天') || deadline === 'tomorrow') return 80;
  if (deadline.startsWith('本周') || deadline === 'this week') return 50;

  const importanceFallback: Record<string, number> = { high: 40, medium: 20, low: 10 };
  return importanceFallback[task.importance] ?? 20;
}

// ── 时间段匹配基础分 ──
function getTimeMatchBaseScore(task: Task, focusTime: string, allTasks: Task[], weights: any): number {
  const available = getAvailableMinutes(task, allTasks);
  const status = getFocusStatus(focusTime, allTasks).status;
  
  // 基础状态评分
  let base = 50;
  if (status === 'fragmented') base = (task.type === 'admin' || task.type === 'comm') ? 100 : 20;
  else if (status === 'peak') base = (task.type === 'deep') ? 100 : (task.type === 'creative' ? 80 : 40);
  else if (status === 'off-peak') base = (task.type === 'comm' || task.type === 'admin') ? 100 : 50;
  else if (status === 'rest') base = 10;

  // 时间窗口惩罚：如果窗口不足以完成任务，降低得分
  const fit = getTimeFit(task, available);
  if (fit === 'poor') base *= 0.5;
  else if (fit === 'tight') base *= 0.8;

  // ── 反馈惩罚 ──
  // Energy is low: -5 points total
  // Incomplete context: -8 points total
  // External dependency: -5 points total
  if (task.skipReasonCounts && weights && weights.timeMatch > 0) {
    const energyCount = task.skipReasonCounts['Energy is low'] || 0;
    const contextCount = task.skipReasonCounts['Incomplete context'] || 0;
    const dependencyCount = task.skipReasonCounts['External dependency'] || 0;
    
    // 转换为维度基础分 (BaseScore * weight = TotalPoints)
    const penaltyTotal = (energyCount * 5) + (contextCount * 8) + (dependencyCount * 5);
    const penaltyBase = penaltyTotal / weights.timeMatch;
    base -= penaltyBase;
  }

  return base;
}

// AI 习惯评分逻辑
function getHabitBaseScore(task: Task, userProfile: UserProfile): number {
  if (!userProfile.habitData) return 50; // 无数据时给中位分
  
  // 模拟逻辑：判断当前任务类型是否符合用户在该时段的历史偏好
  const currentPeriod = new Date().getHours() < 12 ? 'morning' : 'afternoon';
  const preferredType = userProfile.habitData.preferredTaskTypes?.[currentPeriod];
  
  if (preferredType && task.type === preferredType) {
    return 100; // 命中习惯，满分加持
  }
  return 40;
}

/**
 * 对任务列表重新计算并排序
 */
export function rankTasks(tasks: Task[], userProfile: UserProfile): Task[] {
  return tasks
    .map(task => ({
      ...task,
      priorityScore: scoreTask(task, userProfile, tasks),
    }))
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
}

export function calcHabitLearning(userProfile: UserProfile): number {
  const habit = userProfile.habitData;
  if (!habit) return 15;

  // 导入示例用户固定显示 84%
  if (habit.usedSampleTasks === true) {
    // 成熟期后仍可继续增长
    if (isMatureModel(userProfile)) {
      return Math.min(99, 70 + habit.totalActions);
    }
    return 84;
  }

  // 已进入成熟期
  if (isMatureModel(userProfile)) {
    return Math.min(99, 70 + habit.totalActions);
  }

  // 冷启动阶段：15% 起，每次 +7%，上限 65%
  return Math.min(65, 15 + habit.totalActions * 7);
}

/**
 * 根据四象限位置与 AI 习惯生成推荐理由文案
 */
export function generateReason(
  task: Task,
  userProfile: UserProfile,
  allTasks: Task[]
): string {
  const now = getBeijingTime();
  const currentHour = now.getHours();
  const available = getAvailableMinutes(task, allTasks);
  const fit = getTimeFit(task, available);
  const status = getFocusStatus(userProfile.focusTime, allTasks).status;
  const deadline = task.deadline?.toLowerCase() ?? '';
  const isUrgent =
    deadline.startsWith('今天') ||
    deadline.startsWith('明天') ||
    deadline === 'today'        ||
    deadline === 'tomorrow';
  const isImportant = task.importance === 'high';
  const mature = isMatureModel(userProfile);

  // ── 辅助描述 ──
  const periodLabel =
    currentHour >= 6  && currentHour < 12 ? '上午' :
    currentHour >= 12 && currentHour < 18 ? '下午' :
    currentHour >= 18 && currentHour < 23 ? '晚上' : '当前';

  const userFocusPeriod = userProfile.focusTime || '上午';
  const isInPeakPeriod = status === 'peak';
  const isFragmented   = status === 'fragmented';

  const availableLabel =
    available >= 120 ? `当前有约 ${available} 分钟可用时间` :
    available >= 60  ? `当前还有约 ${available} 分钟`       :
    available >= 30  ? `距下个安排仅剩约 ${available} 分钟` :
                       `时间窗口较短（约 ${available} 分钟）`;

  const fitLabel =
    fit === 'good'  ? `预计 ${task.duration} 分钟可完整完成`          :
    fit === 'tight' ? `预计 ${task.duration} 分钟，建议先推进核心部分` :
                      `预计 ${task.duration} 分钟，时间窗口不足`;

  // ── 成熟期习惯命中 ──
  if (mature && getHabitBaseScore(task, userProfile) === 100) {
    return `AI 观察到你通常在${periodLabel}处理此类任务，${availableLabel}，${fitLabel}`;
  }

  // ── 第一象限：重要且紧急 ──
  if (isImportant && isUrgent) {
    if (fit === 'poor') {
      return `截止在即且重要，但${availableLabel}，建议先完成可处理的部分`;
    }
    return `重要且截止在即，${availableLabel}，${fitLabel}`;
  }

  // ── 第二象限：重要不紧急 ──
  if (isImportant && !isUrgent) {
    if (isInPeakPeriod) {
      return `${periodLabel}是你的高效时段，${availableLabel}，适合推进这项重要任务`;
    }
    return `重要但不紧急，${availableLabel}，${fitLabel}`;
  }

  // ── 第三象限：紧急不重要 ──
  if (!isImportant && isUrgent) {
    if (task.type === 'comm') {
      return `截止在即且影响他人进度，${availableLabel}，${fitLabel}`;
    }
    return `截止较近，${availableLabel}，适合当前时间窗口快速完成`;
  }

  // ── 碎片化间隙 ──
  if (isFragmented) {
    if (task.type === 'admin' || task.type === 'comm') {
      return `距下个安排约 ${available} 分钟，适合处理这类 ${task.duration} 分钟的短任务`;
    }
    if (fit === 'poor') {
      return `当前时间窗口较短（${available} 分钟），深度任务建议移至${userFocusPeriod}处理`;
    }
  }

  // ── 高峰时段 ──
  if (isInPeakPeriod && task.type === 'deep') {
    return `${periodLabel}是你的专注高峰，${availableLabel}，${fitLabel}`;
  }
  if (isInPeakPeriod && task.type === 'creative') {
    return `${periodLabel}创意思维活跃，${availableLabel}，适合推进这项任务`;
  }

  // ── 拖延场景 ──
  if (task.skippedCount >= 3) {
    return `已推迟 ${task.skippedCount} 次，${availableLabel}，${fitLabel}，今天是个好时机`;
  }

  // ── 兜底 ──
  return mature
    ? `基于你的工作模式，${periodLabel}${availableLabel}，${fitLabel}`
    : `${periodLabel}${availableLabel}，${fitLabel}`;
}

/**
 * 根据任务类型和截止日期自动推断重要程度
 * 规则：
 * - 截止今天 + deep/creative → high
 * - 截止今天 + comm/admin   → medium
 * - 截止明天 + deep/creative → high
 * - 截止明天 + comm/admin   → medium
 * - 截止本周 + deep/creative → medium
 * - 截止本周 + comm/admin   → low
 * - 无截止日期 + deep        → medium（第二象限保护）
 * - 无截止日期 + 其他        → low
 */
export function inferImportance(
  type: TaskType,
  deadline?: string
): Importance {
  const d = deadline?.toLowerCase() ?? '';
  const isDeepOrCreative = type === 'deep' || type === 'creative';

  if (d.startsWith('今天') || d === 'today') {
    return isDeepOrCreative ? 'high' : 'medium';
  }
  if (d.startsWith('明天') || d === 'tomorrow') {
    return isDeepOrCreative ? 'high' : 'medium';
  }
  if (d.startsWith('本周') || d === 'this week') {
    return isDeepOrCreative ? 'medium' : 'low';
  }
  // 无截止日期
  if (type === 'deep') return 'medium';
  return 'low';
}
