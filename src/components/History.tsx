import { HistoryEntry } from '../types';
import { useLang } from '../LangContext';

interface HistoryProps {
  entries: HistoryEntry[];
  compact: boolean;
}

export default function History({ entries, compact }: HistoryProps) {
  const { T } = useLang();
  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          maxWidth: 420,
          padding: '0 8px',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {T.history}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            width: '100%',
            padding: '4px 0',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {entries.slice(0, 12).map((entry, idx) => (
            <div
              key={entry.id ?? idx}
              title={entry.label}
              style={{
                minWidth: 34,
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: entry.color,
                border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: 700,
                color: 'white',
                boxShadow: `0 0 8px ${entry.color}66`,
                fontFamily: "'Rajdhani', sans-serif",
                flexShrink: 0,
              }}
            >
              {entry.value === 0 ? (
                <span style={{ fontSize: 13 }}>✗</span>
              ) : (
                <span style={{ fontSize: 7, textAlign: 'center', lineHeight: 1 }}>
                  {entry.label}
                </span>
              )}
            </div>
          ))}
          {entries.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.2)',
                fontFamily: "'Rajdhani', sans-serif",
                padding: '6px 0',
              }}
            >
              {T.empty}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop: vertical panel
  const COLS = 4;
  const ROWS = 10;

  return (
    <div
      style={{
        width: 196,
        background: 'rgba(255,255,255,0.04)',
        border: '2px solid rgba(255,215,0,0.3)',
        borderRadius: 16,
        padding: '12px 10px',
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22,
          letterSpacing: 3,
          color: '#ffd700',
          textAlign: 'center',
          marginBottom: 10,
          textShadow: '0 0 12px rgba(255,215,0,0.5)',
        }}
      >
        {T.history}
      </div>

      <div
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 11,
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          marginBottom: 8,
          letterSpacing: 1,
        }}
      >
        {T.lastRound}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 6,
        }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const entry = entries[idx];
          return (
            <div
              key={idx}
              title={entry ? entry.label : ''}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: entry ? entry.color : 'rgba(255,255,255,0.06)',
                border: entry
                  ? '2px solid rgba(255,255,255,0.25)'
                  : '2px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: 700,
                color: 'white',
                boxShadow: entry ? `0 0 8px ${entry.color}66` : 'none',
                transition: 'all 0.3s ease',
                fontFamily: "'Rajdhani', sans-serif",
              }}
            >
              {entry && entry.value === 0 ? (
                <span style={{ fontSize: 12 }}>✗</span>
              ) : entry ? (
                <span style={{ fontSize: 7, textAlign: 'center', lineHeight: 1 }}>
                  {entry.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
