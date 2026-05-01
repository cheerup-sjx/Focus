/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaskType } from '../types';

export function classifyTask(title: string): TaskType {
  
  // 深度专注 deep：长时间、高认知任务
  const deepKeywords = [
    '写', '文档', '方案', '报告', '分析', '研究', '代码', '开发',
    '设计', '规划', '策划', '论文', '总结', '复盘', '学习', '阅读'
  ];

  // 沟通协作 comm：高频切换、多方参与
  const commKeywords = [
    '回复', '邮件', '消息', '沟通', '会议', '对齐', '反馈',
    '汇报', '讨论', '电话', '跟进', '确认', '审批', '评审'
  ];

  // 创意思考 creative：高创造力、发散性
  const creativeKeywords = [
    '头脑风暴', 'brainstorm', '创意', '想法', '灵感', '构思',
    '探索', '调研', '访谈', '用户研究', '原型', '验证'
  ];

  // 低认知事务 admin：低脑力、重复性
  const adminKeywords = [
    '整理', '归档', '填表', '报销', '更新', '上传', '下载',
    '打印', '预订', '安排', '记录', '统计', '汇总', '备份'
  ];

  const lowerTitle = title.toLowerCase();

  if (deepKeywords.some(k => lowerTitle.includes(k))) return 'deep';
  if (commKeywords.some(k => lowerTitle.includes(k))) return 'comm';
  if (creativeKeywords.some(k => lowerTitle.includes(k))) return 'creative';
  if (adminKeywords.some(k => lowerTitle.includes(k))) return 'admin';

  // 默认兜底：无法识别时返回 deep
  return 'deep';
}

export function getTypeLabel(type: TaskType): string {
  const labels = {
    deep: '深度专注',
    comm: '沟通协作',
    creative: '创意思考',
    admin: '低认知事务'
  };
  return labels[type];
}

export function getTypeDuration(type: TaskType): number {
  const durations = {
    deep: 90,
    comm: 20,
    creative: 60,
    admin: 30
  };
  return durations[type];
}

// 四种任务类型的中文标签
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  deep:     '深度专注',
  comm:     '沟通协作',
  creative: '创意思考',
  admin:    '低认知事务',
};

// 每种任务类型的默认预估时长（分钟）
export const TASK_TYPE_DEFAULT_DURATION: Record<TaskType, number> = {
  deep:     90,
  comm:     20,
  creative: 60,
  admin:    30,
};
