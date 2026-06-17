import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm text-white">
      {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

export default function CommandBar({ activeCaseCount, availableUnitCount }) {
  const userName = useSelector((state) => state.auth.user?.name ?? 'Dispatcher');

  return (
    <div className="px-5 py-2.5 border-b border-white/8 flex-shrink-0 flex items-center gap-5 bg-safe-sidebar/80 backdrop-blur-sm">
      {/* Dispatcher identity */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-safe-blue/20 border border-safe-blue/30 flex items-center justify-center flex-shrink-0">
          <FontAwesomeIcon icon="headset" className="text-safe-blue text-xs" />
        </div>
        <span className="text-sm font-semibold text-white leading-none">{userName}</span>
      </div>

      <div className="w-px h-5 bg-white/8 flex-shrink-0" />

      {/* Live status */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-safe-success opacity-75 animate-ping motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-safe-success" />
        </span>
        <span className="text-xs text-safe-success font-medium">Live</span>
      </div>

      <div className="w-px h-5 bg-white/8 flex-shrink-0" />

      {/* Quick stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <FontAwesomeIcon icon="circle-exclamation" className="text-safe-text-muted text-xs" />
          <span className="text-xs text-safe-text-muted">Active:</span>
          <span className="text-xs font-semibold text-white font-mono">{activeCaseCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FontAwesomeIcon icon="truck-medical" className="text-safe-text-muted text-xs" />
          <span className="text-xs text-safe-text-muted">Available:</span>
          <span className="text-xs font-semibold text-safe-success font-mono">{availableUnitCount}</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Clock */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <FontAwesomeIcon icon="clock" className="text-safe-text-muted text-xs" />
        <LiveClock />
      </div>
    </div>
  );
}
