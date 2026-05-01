/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface NavIconProps {
  icon: React.ReactNode;
  active: boolean;
  label: string;
  onClick: () => void;
}

export const NavIcon: React.FC<NavIconProps> = ({ icon, active, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-[#007AFF]' : 'text-[#8E8E93] hover:text-gray-600'}`}>
     <div className={`transition-transform ${active ? 'scale-110' : ''}`}>
       {icon}
     </div>
     <span className="text-[8px] font-black uppercase tracking-[0.1em]">{label}</span>
     <div className="h-0.5 w-1 mt-0.5">
       {active && <motion.div layoutId="nav-pill" className="w-full h-full bg-[#007AFF] rounded-full" />}
     </div>
  </button>
);
