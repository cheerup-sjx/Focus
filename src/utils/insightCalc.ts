import { Task, UserProfile } from '../types';
import { getBeijingTime } from './timeStatus';

// ── 类型定义 ──

export interface DailyReview {
  taskSummary: string;        // 指标1：任务完成情况文案
  focusQuality: {             // 指标2：专注时段利用质量
    label: string;
    desc: string;
  };
  adoptionSummary: string | null; // 指标3：推荐采纳（无数据时为null）
  finalSummary: string;       // 指标4：一句话总结
  focusUtilRate: number;      // 专注时段利用率（0-100）
  deepInFocus: number;        // 专注时段内完成的深度任务数
}

export interface WeekPattern {
  peakPeriod: string;         // 效率最高时段
  procrastinationType: string; // 最容易拖延的任务类型
  hardType: string;           // 最难开始的任务类型
  totalActions: number;       // 累计行为次数
}

// ── 工具：专注时段小时范围 ──
const FOCUS_PERIOD_HOURS: Record<string, [number, number]> = {
  '早上':   [6,  12],
  '下午':   [12, 18],
  '晚上':   [18, 23],
  '不固定': [0,  24],
};

const FOCUS_PERIOD_TOTAL: Record<string, number> = {
  '早上':   360,
  '下午':   360,
  '晚上':   300,
  '不固定': 180,
};

const TYPE_LABEL: Record<string, string> = {
  deep:     '深度专注',
  comm:     '沟通协作',
  creative: '创意思考',
  admin:    '低认知事务',
};

// ── 主函数：计算今日复盘 ──
export function calcDailyReview(
  completedToday: number,
  skippedToday: number,
  completedTasksToday: (Task & { completedAt: number })[],
  userProfile: UserProfile
): DailyReview {
  const focusTime = userProfile.focusTime || '早上';
  const [focusStart, focusEnd] = FOCUS_PERIOD_HOURS[focusTime] ?? [6, 12];
  const totalFocusMinutes = FOCUS_PERIOD_TOTAL[focusTime] ?? 360;

  // ── 指标2基础数据 ──
  const tasksInFocus = completedTasksToday.filter(t => {
    const hour = Math.floor(t.completedAt / 60);
    return hour >= focusStart && hour < focusEnd;
  });

  const deepInFocus = tasksInFocus.filter(
    t => t.type === 'deep' || t.type === 'creative'
  ).length;

  const usedFocusMinutes = tasksInFocus.reduce(
    (sum, t) => sum + t.duration, 0
  );

  const focusUtilRate = Math.min(
    100,
    Math.round((usedFocusMinutes / totalFocusMinutes) * 100)
  );

  // ── 指标1：任务完成情况 ──
  let taskSummary: string;
  if (completedToday === 0 && skippedToday === 0) {
    taskSummary = '今天还没有开始处理任务';
  } else {
    const parts: string[] = [];
    if (completedToday > 0) parts.push(`完成了 ${completedToday} 个任务`);
    if (skippedToday > 0)   parts.push(`跳过了 ${skippedToday} 个`);
    taskSummary = '今天' + parts.join('，');
  }

  // ── 指标2：专注时段利用质量 ──
  let focusQuality: { label: string; desc: string };
  if (tasksInFocus.length === 0) {
    focusQuality = {
      label: '暂无数据',
      desc: `在你的${focusTime}专注时段完成任务，AI 会记录下来`,
    };
  } else if (deepInFocus >= 1) {
    focusQuality = {
      label: '专注时段利用良好',
      desc: `你在${focusTime}完成了 ${deepInFocus} 个深度任务，利用率 ${focusUtilRate}%`,
    };
  } else {
    focusQuality = {
      label: '专注时段未充分利用',
      desc: `${focusTime}主要处理了事务性任务，明天可以把深度任务安排在这个时段`,
    };
  }

  // ── 指标3：推荐采纳情况 ──
  const total = completedToday + skippedToday;
  let adoptionSummary: string | null = null;
  if (total > 0) {
    const rate = Math.round((completedToday / total) * 100);
    const rateLabel = rate >= 60 ? '采纳率良好' : 'AI 正在学习你的偏好';
    adoptionSummary =
      `接受了 ${completedToday} 条推荐，跳过了 ${skippedToday} 条 · ${rateLabel}`;
  }

  // ── 指标4：综合评分 + 一句话总结 ──
  const scoreA =
    completedToday >= 3 ? 2 : completedToday >= 1 ? 1 : 0;
  const scoreB =
    deepInFocus >= 2 ? 2 : deepInFocus === 1 ? 1 : 0;
  const scoreC =
    focusUtilRate >= 50 ? 2 : focusUtilRate >= 20 ? 1 : 0;
  const totalScore = scoreA + scoreB + scoreC;

  let finalSummary: string;

  if (totalScore >= 5) {
    finalSummary =
      `今天的专注时段利用率达 ${focusUtilRate}%，` +
      `深度任务推进顺利，是高效的一天`;
  } else if (totalScore >= 3) {
    if (deepInFocus >= 1 && focusUtilRate >= 20) {
      finalSummary =
        `今天完成了 ${completedToday} 个任务，` +
        `专注时段利用了 ${focusUtilRate}%，` +
        `明天可以把更多深度任务安排在${focusTime}`;
    } else if (deepInFocus === 0 && focusUtilRate >= 20) {
      finalSummary =
        `今天专注时段利用了 ${focusUtilRate}%，` +
        `但主要处理了事务性任务，` +
        `明天的${focusTime}适合安排深度工作`;
    } else {
      finalSummary =
        `今天完成了深度任务，但专注时段还有 ` +
        `${100 - focusUtilRate}% 的空间未使用，` +
        `明天可以更充分地利用${focusTime}`;
    }
  } else if (totalScore >= 1) {
    if (skippedToday >= 2) {
      finalSummary =
        `今天跳过了 ${skippedToday} 条推荐，` +
        `专注时段利用率 ${focusUtilRate}%，` +
        `告诉 AI 跳过原因可以帮它更快了解你`;
    } else {
      finalSummary =
        `今天专注时段利用率 ${focusUtilRate}%，` +
        `还有较大提升空间，` +
        `明天试着在${focusTime}先处理最重要的一件事`;
    }
  } else {
    finalSummary =
      `今天还没有开始，现在开始也不晚，` +
      `你的专注时段还有时间`;
  }

  return {
    taskSummary,
    focusQuality,
    adoptionSummary,
    finalSummary,
    focusUtilRate,
    deepInFocus,
  };
}

// ── 本周规律计算 ──
export function calcWeekPattern(
  tasks: Task[],
  userProfile: UserProfile
): WeekPattern {
  const focusTime = userProfile.focusTime || '早上';
  const hardType  = userProfile.hardType  || '需要写作的';
  const totalActions = userProfile.habitData?.totalActions ?? 0;

  // 最容易拖延的任务类型：按 type 分组累加 skippedCount
  const skipByType: Record<string, number> = {};
  tasks.forEach(t => {
    skipByType[t.type] = (skipByType[t.type] ?? 0) + t.skippedCount;
  });
  const procrastinationType = Object.entries(skipByType)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'comm';

  return {
    peakPeriod: focusTime,
    procrastinationType: TYPE_LABEL[procrastinationType] ?? procrastinationType,
    hardType,
    totalActions,
  };
}

// ── 人格标签计算 ──
export interface PersonaLabel {
  title: string;   // 标签名，如"早起深度型"
  desc: string;    // 一句话描述
}

export function calcPersonaLabel(
  userProfile: UserProfile
): PersonaLabel {
  const focusTime = userProfile.focusTime || '早上';
  const hardType  = userProfile.hardType  || '需要写作的';

  const map: Record<string, Record<string, PersonaLabel>> = {
    '早上': {
      '需要写作的': {
        title: '早起深度型',
        desc:  '你擅长在清晨进入心流，适合安排高认知写作任务',
      },
      '需要沟通的': {
        title: '早起独立型',
        desc:  '你上午效率高但回避沟通，AI 会把协作任务安排到下午',
      },
      '耗时很长的': {
        title: '早起冲刺型',
        desc:  '你早上精力充沛，但对长任务有启动阻力，AI 会帮你拆解',
      },
      '需要创意的': {
        title: '早起探索型',
        desc:  '你上午思维发散，适合创意和规划类任务',
      },
    },
    '下午': {
      '需要写作的': {
        title: '下午专注型',
        desc:  '你下午进入状态更快，深度写作放在午后效率更高',
      },
      '需要沟通的': {
        title: '下午协作型',
        desc:  '你下午更适合独立思考，AI 会把沟通任务集中到上午',
      },
      '耗时很长的': {
        title: '下午推进型',
        desc:  '你下午执行力强，但对长任务有拖延倾向，AI 会提前提醒',
      },
      '需要创意的': {
        title: '下午创意型',
        desc:  '你下午创造力更活跃，适合安排产品 and 设计类任务',
      },
    },
    '晚上': {
      '需要写作的': {
        title: '夜间深度型',
        desc:  '你在夜晚更容易集中，适合安排需要长时间思考的工作',
      },
      '需要沟通的': {
        title: '夜间独立型',
        desc:  '你夜间效率高，AI 会避免在这个时段推荐协作类任务',
      },
      '耗时很长的': {
        title: '夜间专注型',
        desc:  '你夜间能进入深度状态，AI 会帮你在睡前完成重要推进',
      },
      '需要创意的': {
        title: '夜间创意型',
        desc:  '你在夜晚思维最活跃，适合创意和复盘类工作',
      },
    },
    '不固定': {
      default: {
        title: '灵活切换型',
        desc:  '你的专注时间灵活，AI 会根据实时状态动态推荐任务',
      },
    },
  };

  const byFocus = map[focusTime];
  if (!byFocus) {
    return { title: '灵活切换型', desc: 'AI 会根据实时状态动态推荐' };
  }
  return (
    byFocus[hardType] ??
    byFocus['default'] ??
    { title: '专注工作者', desc: 'AI 正在学习你的工作模式' }
  );
}

