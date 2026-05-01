/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const INITIAL_TASKS = [
  {
    id: '1',
    title: '完成产品需求文档初稿',
    type: 'deep',
    importance: 'high',
    duration: 90,
    deadline: '明天',
    priorityScore: 0,
    reason: '符合你上午专注窗口，且明天截止，需要进入深度工作',
    skippedCount: 0,
    createdAt: Date.now() - 86400000,
    startTime: (() => {
      const d = new Date(new Date().getTime() + 8 * 3600000 
                         - new Date().getTimezoneOffset() * 60000);
      const h = d.getHours();
      const m = d.getMinutes() + 45; // 当前北京时间 45 分钟后
      const realH = h + Math.floor(m / 60);
      const realM = m % 60;
      return `${String(realH).padStart(2,'0')}:${String(realM).padStart(2,'0')}`;
    })(),
  },
  {
    id: '2',
    title: '回复设计评审反馈',
    type: 'comm',
    importance: 'high',
    duration: 15,
    deadline: '今天',
    priorityScore: 0,
    reason: '等待时间超过 24h，目前处于团队协作活跃期',
    skippedCount: 0,
    createdAt: Date.now() - 43200000,
  },
  {
    id: '3',
    title: '用户访谈笔记整理',
    type: 'admin',
    importance: 'medium',
    duration: 45,
    deadline: '本周',
    priorityScore: 0,
    reason: '根据习惯你常在此时段处理低认知事务',
    skippedCount: 2,
    createdAt: Date.now() - 172800000,
  },
];
