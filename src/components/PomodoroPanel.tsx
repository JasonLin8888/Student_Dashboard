import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

type Mode = 'work' | 'short-break' | 'long-break';

const MODES: Record<Mode, { label: string; duration: number; color: string }> = {
  'work': { label: 'Focus', duration: 25 * 60, color: 'text-indigo-600' },
  'short-break': { label: 'Short Break', duration: 5 * 60, color: 'text-green-600' },
  'long-break': { label: 'Long Break', duration: 15 * 60, color: 'text-blue-600' },
};

export default function PomodoroPanel() {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(MODES['work'].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsRunning(false);
            if (mode === 'work') setSessions(s => s + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
  };

  const reset = () => {
    setTimeLeft(MODES[mode].duration);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const progress = 1 - timeLeft / MODES[mode].duration;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Mode selector */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-full p-1">
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              mode === m ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="relative mb-6">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="64" cy="64" r="54" fill="none"
            stroke={mode === 'work' ? '#4F46E5' : mode === 'short-break' ? '#059669' : '#0891B2'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold font-mono ${MODES[mode].color}`}>
            {minutes}:{seconds}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">{MODES[mode].label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-full">
          <RotateCcw className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
      </div>

      {/* Session counter */}
      <div className="mt-4 flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${i < (sessions % 4) ? 'bg-indigo-500' : 'bg-gray-200'}`}
          />
        ))}
        <span className="text-xs text-gray-400 ml-2">{sessions} session{sessions !== 1 ? 's' : ''} today</span>
      </div>
    </div>
  );
}
