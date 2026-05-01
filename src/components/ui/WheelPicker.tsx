import React, { useRef, useEffect, useCallback } from 'react';

interface WheelColumnProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5; // 显示5行，中间行为选中

const WheelColumn: React.FC<WheelColumnProps> = ({
  items,
  selectedIndex,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // 滚动到选中项
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (!containerRef.current) return;
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior,
      });
    },
    []
  );

  useEffect(() => {
    scrollToIndex(selectedIndex, 'auto');
  }, [selectedIndex, scrollToIndex]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    if (isScrolling.current) return;
    isScrolling.current = true;

    clearTimeout((containerRef.current as any)._scrollTimer);
    (containerRef.current as any)._scrollTimer = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      scrollToIndex(clamped);
      onSelect(clamped);
      isScrolling.current = false;
    }, 150);
  }, [items.length, onSelect, scrollToIndex]);

  const containerHeight = ITEM_HEIGHT * VISIBLE_COUNT;
  const paddingCount = Math.floor(VISIBLE_COUNT / 2);

  return (
    <div className="relative flex-1" style={{ height: containerHeight }}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
      {/* 选中行高亮框 */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10
                   border-t border-b border-black/10"
        style={{
          top: paddingCount * ITEM_HEIGHT,
          height: ITEM_HEIGHT,
        }}
      />
      {/* 上下渐变遮罩 */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to bottom,' +
            'white 0%,' +
            'rgba(255,255,255,0.6) 25%,' +
            'transparent 40%,' +
            'transparent 60%,' +
            'rgba(255,255,255,0.6) 75%,' +
            'white 100%)',
        }}
      />
      {/* 滚动容器 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll no-scrollbar"
        style={{ scrollSnapType: 'y mandatory', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {/* 顶部 padding */}
        {Array.from({ length: paddingCount }).map((_, i) => (
          <div key={`pad-top-${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              height: ITEM_HEIGHT,
              scrollSnapAlign: 'center',
            }}
            className="flex items-center justify-center cursor-pointer"
            onClick={() => {
              onSelect(idx);
              scrollToIndex(idx);
            }}
          >
            <span
              className={`text-base transition-all duration-200 select-none ${
                idx === selectedIndex
                  ? 'font-semibold text-gray-900 text-[17px]'
                  : 'text-gray-400 text-[15px]'
              }`}
            >
              {item}
            </span>
          </div>
        ))}
        {/* 底部 padding */}
        {Array.from({ length: paddingCount }).map((_, i) => (
          <div key={`pad-bot-${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
      </div>
    </div>
  );
};

// ── 日期时间选择器主组件 ──

export interface DateTimeValue {
  type: 'today' | 'tomorrow' | 'thisweek'; // 日期类型
  date: string;   // 'YYYY-MM-DD'
  time: string;   // 'HH:MM'
}

interface WheelPickerProps {
  value: DateTimeValue | null;
  onChange: (value: DateTimeValue) => void;
  showDateType?: boolean; // 是否显示今天/明天/本周/自定义快捷列
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  value,
  onChange,
  showDateType = true,
}) => {
  // 北京时间
  const now = new Date(
    new Date().getTime() +
    (8 * 60 - new Date().getTimezoneOffset()) * 60000
  );

  // ── 日期类型列 ──
  const dateTypeItems = ['今天', '明天', '本周'];
  const dateTypeValues = ['today', 'tomorrow', 'thisweek'] as const;

  // ── 根据类型计算实际日期 ──
  const getDateForType = (type: string): Date => {
    const d = new Date(now);
    if (type === 'tomorrow') d.setDate(d.getDate() + 1);
    else if (type === 'thisweek') {
      const day = d.getDay();
      const diff = day === 0 ? 0 : 7 - day;
      d.setDate(d.getDate() + diff);
    }
    return d;
  };

  // ── 小时列 0-23 ──
  const hourItems = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  // ── 分钟列 00/15/30/45（4档）──
  const minuteItems = ['00', '15', '30', '45'];

  // ── 当前状态 ──
  const currentType = value?.type ?? 'today';
  const currentTime = value?.time ?? `${String(now.getHours()).padStart(2,'0')}:00`;
  const [currentHour, currentMin] = currentTime.split(':').map(Number);

  const typeIndex = dateTypeValues.indexOf(currentType as any);
  const hourIndex = currentHour;
  const minIndex = minuteItems.indexOf(
    String(Math.round(currentMin / 15) * 15).padStart(2, '0')
  ) === -1 ? 0 : minuteItems.indexOf(
    String(Math.round(currentMin / 15) * 15).padStart(2, '0')
  );

  const buildValue = (
    type: typeof dateTypeValues[number],
    hour: number,
    minIdx: number
  ): DateTimeValue => {
    const d = getDateForType(type);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const timeStr = `${String(hour).padStart(2,'0')}:${minuteItems[minIdx]}`;
    return { type, date: dateStr, time: timeStr };
  };

  useEffect(() => {
    if (!value) {
      // 用户打开选择器但未滚动时，
      // 自动写入默认值：今天 + 当前小时 + 00分
      onChange(buildValue('today', now.getHours(), 0));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-inner border border-black/5">
      <div className="flex" style={{ height: 44 * 5 }}>
        {showDateType && (
          <WheelColumn
            items={dateTypeItems}
            selectedIndex={Math.max(0, typeIndex)}
            onSelect={(idx) =>
              onChange(buildValue(dateTypeValues[idx], currentHour, minIndex))
            }
          />
        )}
        <WheelColumn
          items={hourItems}
          selectedIndex={hourIndex}
          onSelect={(idx) =>
            onChange(buildValue(currentType as any, idx, minIndex))
          }
        />
        <div className="flex items-center justify-center text-gray-400 font-bold text-lg px-1">
          :
        </div>
        <WheelColumn
          items={minuteItems}
          selectedIndex={minIndex}
          onSelect={(idx) =>
            onChange(buildValue(currentType as any, currentHour, idx))
          }
        />
      </div>
      {/* 已选结果预览 */}
      {value && (
        <div className="px-4 py-3 border-t border-black/[0.04]
                        text-center text-xs font-bold text-blue-500
                        tracking-wider uppercase">
          {dateTypeItems[Math.max(0,typeIndex)]} · {value.time}
        </div>
      )}
    </div>
  );
};

export default WheelPicker;
