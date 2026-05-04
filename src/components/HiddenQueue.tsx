import { useEffect, useRef, useState } from 'react';
import { Prize } from '../types';
import { useLang } from '../LangContext';
import { wheelLabel } from '../i18n';

interface HiddenQueueProps {
  prizes: Prize[];
  queue: Prize[];
  onAddToQueue: (prize: Prize) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
}

export default function HiddenQueue({
  prizes,
  queue,
  onAddToQueue,
  onRemoveFromQueue,
  onClearQueue,
}: HiddenQueueProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { T, lang } = useLang();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      {/* Invisible trigger button — only badge is visible when queue > 0 */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          width: 48,
          height: 48,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Управление очередью"
      >
        {queue.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              background: '#ef4444',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              fontFamily: "'Rajdhani', sans-serif",
              boxShadow: '0 0 8px rgba(239,68,68,0.8)',
              pointerEvents: 'none',
            }}
          >
            {queue.length}
          </div>
        )}
      </div>

      {/* Queue panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 8,
            width: 260,
            background: 'rgba(10, 2, 30, 0.95)',
            border: '1px solid rgba(255,215,0,0.4)',
            borderRadius: 12,
            padding: 16,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
          }}
        >
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 16,
              letterSpacing: 2,
              color: '#ffd700',
              marginBottom: 12,
            }}
          >
            {T.queueTitle}
          </div>

          {/* Prize picker */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              {T.addToQueue}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {prizes.map(prize => (
                <button
                  key={prize.id}
                  onClick={() => onAddToQueue(prize)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: prize.color,
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Rajdhani', sans-serif",
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: `0 0 8px ${prize.color}66`,
                  }}
                >
                  {prize.id === 'loss' ? T.loss : wheelLabel(prize.value, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Current queue */}
          {queue.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                {T.queueLabel} ({queue.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                {queue.map((prize, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 8px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.4)',
                        fontFamily: "'Rajdhani', sans-serif",
                        minWidth: 16,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "'Rajdhani', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: prize.color,
                      }}
                    >
                      {prize.id === 'loss' ? T.loss : wheelLabel(prize.value, lang)}
                    </span>
                    <button
                      onClick={() => onRemoveFromQueue(i)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: '0 2px',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={onClearQueue}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: 8,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                  fontSize: 13,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: 1,
                }}
              >
                {T.clearQueue}
              </button>
            </>
          )}

          {queue.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.3)',
                fontFamily: "'Rajdhani', sans-serif",
                textAlign: 'center',
                padding: '8px 0',
              }}
            >
              {T.queueEmpty}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
