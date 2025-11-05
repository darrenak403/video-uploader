"use client";

import {useState, useEffect} from "react";
import {formatDuration} from "@/lib/utils";
import {FiScissors} from "react-icons/fi";

interface TrimToolProps {
  duration: number;
  trimStart?: number;
  trimEnd?: number;
  onTrimChange: (start: number, end: number) => void;
}

export default function TrimTool({
  duration,
  trimStart = 0,
  trimEnd,
  onTrimChange,
}: TrimToolProps) {
  const [start, setStart] = useState(trimStart);
  const [end, setEnd] = useState(trimEnd || duration);

  useEffect(() => {
    // Only update local state when incoming props differ to avoid unnecessary renders.
    const targetStart = trimStart;
    const targetEnd = trimEnd ?? duration;

    if (start === targetStart && end === targetEnd) return;

    // Schedule state updates asynchronously to avoid cascading synchronous renders.
    const id = window.setTimeout(() => {
      setStart(targetStart);
      setEnd(targetEnd);
    }, 0);

    return () => {
      clearTimeout(id);
    };
  }, [trimStart, trimEnd, duration, start, end]);

  const handleStartChange = (value: number) => {
    const newStart = Math.max(0, Math.min(value, end - 1));
    setStart(newStart);
    onTrimChange(newStart, end);
  };

  const handleEndChange = (value: number) => {
    const newEnd = Math.max(start + 1, Math.min(value, duration));
    setEnd(newEnd);
    onTrimChange(start, newEnd);
  };

  const trimmedDuration = end - start;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FiScissors className="text-gray-600" />
        <label className="block text-sm font-medium text-gray-700">
          Cắt video
        </label>
      </div>

      <p className="text-xs text-gray-500">Chọn phần video bạn muốn giữ lại</p>

      {/* Timeline visualization */}
      <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
        {/* Selected range */}
        <div
          className="absolute h-full bg-blue-500/30 border-l-2 border-r-2 border-blue-600"
          style={{
            left: `${(start / duration) * 100}%`,
            width: `${((end - start) / duration) * 100}%`,
          }}
        />

        {/* Trim handles */}
        <div
          className="absolute top-0 w-1 h-full bg-blue-600 cursor-ew-resize"
          style={{left: `${(start / duration) * 100}%`}}
        />
        <div
          className="absolute top-0 w-1 h-full bg-blue-600 cursor-ew-resize"
          style={{left: `${(end / duration) * 100}%`}}
        />

        {/* Time markers */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
            {formatDuration(start)}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
            {formatDuration(end)}
          </span>
        </div>
      </div>

      {/* Range sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
            Bắt đầu
          </label>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={start}
            onChange={(e) => handleStartChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            value={Math.round(start)}
            onChange={(e) => handleStartChange(parseFloat(e.target.value) || 0)}
            min={0}
            max={end - 1}
            className="w-full mt-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
            Kết thúc
          </label>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={end}
            onChange={(e) => handleEndChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            value={Math.round(end)}
            onChange={(e) =>
              handleEndChange(parseFloat(e.target.value) || duration)
            }
            min={start + 1}
            max={duration}
            className="w-full mt-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Duration display */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Độ dài sau khi cắt:
        </span>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {formatDuration(trimmedDuration)}
        </span>
      </div>
    </div>
  );
}
