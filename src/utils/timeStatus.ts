/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task } from '../types';

// 获取标准北京时间（不依赖用户本地系统时区）
export function getBeijingTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

// 获取当前北京时间的小时数（0-23）
export function getBeijingHour(): number {
  return getBeijingTime().getHours();
}

// 判断当前属于哪个时间段
type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'midnight';

export function getCurrentPeriod(): TimePeriod {
  const hour = getBeijingHour();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'midnight';
}

// 判断是否有任务在当前时间的 0-1.5 小时内开始
export function hasUpcomingTask(tasks: Task[]): boolean {
  const now = getBeijingTime();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return tasks.some(task => {
    if (task.completed || !task.startTime) return false;
    const [hStr, mStr] = task.startTime.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return false;
    const taskMinutes = h * 60 + m;
    const diff = taskMinutes - nowMinutes;
    return diff >= 0 && diff <= 90; // 0 到 1.5 小时内
  });
}

// 获取当前可用分钟数
export function getAvailableMinutes(
  task: Task,
  allTasks: Task[]
): number {
  if (!task.startTime) return 180;

  const now = getBeijingTime();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  
  const parseToMins = (timeStr?: string) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const startMinutes = parseToMins(task.startTime);
  if (startMinutes === null) return 180;

  let effectiveDuration = 180;

  // 优先级1：startTime + deadline (截止时间)
  // deadline 格式通常为 "今天 17:30"
  const deadlineTimePart = task.deadline?.split(' ').pop();
  const ddlMinutes = parseToMins(deadlineTimePart);
  
  if (ddlMinutes !== null) {
    effectiveDuration = ddlMinutes - startMinutes;
  } 
  // 优先级2：没有 deadline，但存在下一个任务
  else {
    const otherStartTimes = allTasks
      .filter(t => t.id !== task.id && !t.completed && !!t.startTime)
      .map(t => parseToMins(t.startTime)!)
      .filter(t => t > startMinutes)
      .sort((a, b) => a - b);

    if (otherStartTimes.length > 0) {
      effectiveDuration = otherStartTimes[0] - startMinutes;
    }
    // 优先级3：都没有，默认为 180 (已初始化)
  }

  const availableMinutes = (startMinutes - nowMinutes) + effectiveDuration;
  return Math.min(180, availableMinutes);
}

/**
 * 解析用户输入的时间字符串
 * 支持格式：HH:mm, H:m, 1430, 下午2:30 (仅做基础识别)
 */
export function parseTimeInput(input: string): string | null {
  if (!input) return null;
  const t = input.trim();
  
  // 核心匹配逻辑
  const match = t.match(/^(\d{1,2}):(\d{1,2})$/);
  if (match) {
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }
  
  // 处理连续数字如 1430
  if (/^\d{4}$/.test(t)) {
    const h = parseInt(t.substring(0, 2));
    const m = parseInt(t.substring(2, 4));
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  return null;
}

export type TimeFit = 'good' | 'tight' | 'poor';

// 判断任务时长与可用时间的匹配度
export function getTimeFit(task: Task, available: number): TimeFit {
  const duration = task.duration || 30;
  if (duration <= available - 10) return 'good';
  if (duration <= available) return 'tight';
  return 'poor';
}

// 用户专注时段选项映射
const periodMap: Record<string, TimePeriod> = {
  '早上': 'morning',
  '下午': 'afternoon',
  '晚上': 'evening',
};

// 核心状态判断函数（优先级从高到低）
export type FocusStatus = 
  | 'fragmented'   // 碎片化间隙
  | 'rest'         // 建议休息
  | 'peak'         // 高认知窗口期
  | 'off-peak'     // 专注窗口未到/已过
  | 'flexible';    // 随时可进入状态

export interface StatusResult {
  status: FocusStatus;
  title: string;
  description: string;
  color: 'orange' | 'red' | 'green' | 'yellow' | 'blue';
}

export function getFocusStatus(
  focusTime: string,  // 用户冷启动选择，例如 '早上'
  tasks: Task[]
): StatusResult {
  const period = getCurrentPeriod();

  // 优先级1：有任务在 0-1.5h 内开始
  if (hasUpcomingTask(tasks)) {
    return {
      status: 'fragmented',
      title: '碎片化间隙',
      description: '1.5 小时内有任务开始，适合处理短时低认知事项。',
      color: 'orange',
    };
  }

  // 优先级2：深夜凌晨
  if (period === 'midnight') {
    return {
      status: 'rest',
      title: '建议休息',
      description: '当前时间较晚，注意保持精力，明天继续。',
      color: 'red',
    };
  }

  // 优先级3：不固定
  if (focusTime === '不固定') {
    return {
      status: 'flexible',
      title: '随时可进入状态',
      description: '你的专注时间灵活，随时都是好时机。',
      color: 'blue',
    };
  }

  // 优先级4：当前时间段是否匹配用户选择
  const userPeriod = periodMap[focusTime];
  if (userPeriod === period) {
    return {
      status: 'peak',
      title: '高认知窗口期',
      description: `基于你的历史习惯，${focusTime}处理深度任务的效率更高。`,
      color: 'green',
    };
  }

  // 优先级5：不匹配
  const isPast = (
    (userPeriod === 'morning' && (period === 'afternoon' || period === 'evening')) ||
    (userPeriod === 'afternoon' && period === 'evening')
  );
  return {
    status: 'off-peak',
    title: isPast ? '专注窗口已过' : '专注窗口未到',
    description: isPast
      ? `你的高效时段（${focusTime}）已过，适合处理低认知或沟通类任务。`
      : `你的高效时段（${focusTime}）还未到，可先处理沟通或事务性任务。`,
    color: 'yellow',
  };
}
