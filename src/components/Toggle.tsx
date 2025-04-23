import React from 'react';

interface ToggleProps {
  leftLabel: string;
  rightLabel: string;
  isChecked: boolean;
  onChange: () => void;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  leftLabel,
  rightLabel,
  isChecked,
  onChange,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-slate-700">{leftLabel}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={onChange}
        />
        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-300"></div>
      </label>
      <span className="text-sm font-medium text-slate-700">{rightLabel}</span>
    </div>
  );
};

export default Toggle;
