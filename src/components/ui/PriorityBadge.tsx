/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const PriorityBadge = ({ score, onClick }: { score: number; onClick?: (e: React.MouseEvent) => void }) => {
  const color = score > 85 ? 'text-[#007AFF] bg-blue-50' : 'text-gray-500 bg-gray-50';
  return (
    <button 
      onClick={onClick}
      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-transform active:scale-95 ${color} ${onClick ? 'cursor-pointer hover:shadow-sm' : ''}`}
    >
      评分 {score}
    </button>
  );
};
