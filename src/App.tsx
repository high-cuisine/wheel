import { useCallback, useEffect, useRef, useState } from 'react';
import { HistoryEntry, Prize, Segment } from './types';
import Wheel, { WheelHandle } from './components/Wheel';
import HiddenQueue from './components/HiddenQueue';
import AdminPanel from './components/AdminPanel';
import History from './components/History';
import LangContext from './LangContext';
import { Lang, T, convertAmount, translations, wheelLabel } from './i18n';

const DEFAULT_PRIZES: Prize[] = [
  { id: 'p1', label: '5 млн',  value: 5_000_000,  color: '#1d4ed8', count: 1 },
  { id: 'p2', label: '10 млн', value: 10_000_000, color: '#0e7490', count: 1 },
  { id: 'p3', label: '15 млн', value: 15_000_000, color: '#16a34a', count: 1 },
  { id: 'p4', label: '20 млн', value: 20_000_000, color: '#c2410c', count: 1 },
  { id: 'p5', label: '25 млн', value: 25_000_000, color: '#7c3aed', count: 1 },
  { id: 'loss', label: 'ПРОИГРЫШ', value: 0, color: '#1f2937', count: 1 },
];

function buildSegments(prizes: Prize[], lang: Lang, lossLabel: string): Segment[] {
  return prizes.map(p => ({
    label: p.id === 'loss' ? lossLabel : wheelLabel(p.value, lang),
    value: p.value,
    color: p.color,
    prizeId: p.id,
  }));
}

function formatSum(uzs: number, lang: Lang, currency: string): string {
  const amount = convertAmount(uzs, lang);
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
}

function loadPrizes(): Prize[] {
  try {
    const raw = localStorage.getItem('wheel_prizes_v3');
    if (raw) return JSON.parse(raw) as Prize[];
  } catch { /* ignore */ }
  return DEFAULT_PRIZES;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem('wheel_history');
    if (raw) return JSON.parse(raw) as HistoryEntry[];
  } catch { /* ignore */ }
  return [];
}

function loadLang(): Lang {
  const saved = localStorage.getItem('wheel_lang');
  return (saved === 'tg' ? 'tg' : 'ru') as Lang;
}

function useDisplaySize(): number {
  const compute = () => Math.min(500, window.innerWidth - 16);
  const [size, setSize] = useState(compute);
  useEffect(() => {
    const handler = () => setSize(compute());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

function StarsBg() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse at 50% 40%, #1e0a47 0%, #0f0428 50%, #050112 100%)',
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'radial-gradient(1px 1px at 15% 12%, rgba(255,255,255,0.9) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 72% 8%, rgba(255,255,255,0.8) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 38% 25%, rgba(255,255,255,0.7) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 85% 33%, rgba(255,255,255,0.85) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 5% 45%, rgba(255,255,255,0.6) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 92% 55%, rgba(255,255,255,0.9) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 55% 68%, rgba(255,255,255,0.5) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 28% 78%, rgba(255,255,255,0.8) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 67% 88%, rgba(255,255,255,0.7) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 10% 92%, rgba(255,255,255,0.6) 50%, transparent 50%)',
            'radial-gradient(2px 2px at 45% 15%, rgba(255,255,255,0.5) 50%, transparent 50%)',
            'radial-gradient(2px 2px at 80% 72%, rgba(255,255,255,0.4) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 23% 55%, rgba(200,180,255,0.6) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 60% 40%, rgba(200,220,255,0.5) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 3% 20%, rgba(255,255,255,0.7) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 95% 15%, rgba(255,255,255,0.8) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 48% 95%, rgba(255,255,255,0.5) 50%, transparent 50%)',
            'radial-gradient(1px 1px at 77% 48%, rgba(255,220,255,0.4) 50%, transparent 50%)',
          ].join(', '),
        }}
      />
    </div>
  );
}

function ResultModal({
  result,
  tr,
  lang,
  onClose,
}: {
  result: { label: string; value: number; color: string };
  tr: T;
  lang: Lang;
  onClose: () => void;
}) {
  const isWin = result.value > 0;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        padding: '0 16px',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(8,2,25,0.97)',
          border: `2px solid ${isWin ? '#ffd700' : '#4b5563'}`,
          borderRadius: 24,
          padding: '36px 40px',
          textAlign: 'center',
          boxShadow: isWin
            ? `0 0 80px rgba(255,215,0,0.25), 0 20px 60px rgba(0,0,0,0.8)`
            : '0 20px 60px rgba(0,0,0,0.8)',
          width: '100%',
          maxWidth: 360,
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 10 }}>
          {isWin ? '🎉' : '😢'}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 20,
            letterSpacing: 3,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 8,
          }}
        >
          {isWin ? tr.win : tr.lose}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: isWin ? 30 : 42,
            letterSpacing: 1,
            color: isWin ? result.color : '#6b7280',
            textShadow: isWin ? `0 0 30px ${result.color}88` : 'none',
            lineHeight: 1.15,
            marginBottom: 8,
          }}
        >
          {isWin ? formatSum(result.value, lang, tr.currency) : tr.loss}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            padding: '12px 40px',
            borderRadius: 12,
            background: isWin
              ? 'linear-gradient(135deg, #ffd700, #f59e0b)'
              : 'rgba(255,255,255,0.08)',
            border: 'none',
            color: isWin ? '#000' : 'rgba(255,255,255,0.6)',
            fontSize: 17,
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: 2,
            cursor: 'pointer',
          }}
        >
          {tr.continueBtn}
        </button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

const SPIN_SETUP_AMOUNTS = [100_000, 500_000, 1_000_000, 5_000_000];

function SpinSetupModal({
  lang,
  tr,
  selectedAmount,
  onSelectAmount,
  onClose,
  onStart,
}: {
  lang: Lang;
  tr: T;
  selectedAmount: number;
  onSelectAmount: (value: number) => void;
  onClose: () => void;
  onStart: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(7px)',
        padding: '0 16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(8,2,25,0.97)',
          border: '1px solid rgba(255,215,0,0.35)',
          borderRadius: 20,
          padding: '26px 24px 20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28,
            letterSpacing: 2,
            color: '#ffd700',
            textAlign: 'center',
          }}
        >
          {tr.spinSetupTitle}
        </div>
        <div
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.55)',
            marginTop: 6,
            marginBottom: 16,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 14,
          }}
        >
          {tr.spinSetupHint}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {SPIN_SETUP_AMOUNTS.map(amount => {
            const isActive = amount === selectedAmount;
            return (
              <button
                key={amount}
                onClick={() => onSelectAmount(amount)}
                style={{
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: isActive
                    ? '1px solid rgba(255,215,0,0.8)'
                    : '1px solid rgba(255,255,255,0.12)',
                  background: isActive ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#fff4be' : 'rgba(255,255,255,0.8)',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {formatSum(amount, lang, tr.currency)}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18,
              letterSpacing: 1.5,
              cursor: 'pointer',
            }}
          >
            {tr.spinSetupCancel}
          </button>
          <button
            onClick={onStart}
            style={{
              flex: 1.2,
              padding: '12px 14px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
              color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18,
              letterSpacing: 1.5,
              cursor: 'pointer',
            }}
          >
            {tr.spinSetupStart}
          </button>
        </div>
      </div>
    </div>
  );
}

function LangButton({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);
  const tr = translations[lang];

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={lang === 'ru' ? 'Тоҷикӣ' : 'Русский'}
      style={{
        position: 'fixed',
        bottom: 14,
        left: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 14px',
        borderRadius: 20,
        background: hovered
          ? 'rgba(255,215,0,0.12)'
          : 'rgba(255,255,255,0.05)',
        border: hovered
          ? '1px solid rgba(255,215,0,0.35)'
          : '1px solid rgba(255,255,255,0.1)',
        color: hovered ? '#ffd700' : 'rgba(255,255,255,0.45)',
        fontSize: 13,
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        letterSpacing: 1,
        cursor: 'pointer',
        zIndex: 10,
        transition: 'all 0.2s ease',
        outline: 'none',
      }}
    >
      {tr.langBtn}
    </button>
  );
}

export default function App() {
  const [prizes, setPrizes] = useState<Prize[]>(loadPrizes);
  const [queue, setQueue] = useState<Prize[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [result, setResult] = useState<{ label: string; value: number; color: string } | null>(null);
  const [lang, setLang] = useState<Lang>(loadLang);
  const [showSpinSetup, setShowSpinSetup] = useState(false);
  const [spinAmount, setSpinAmount] = useState<number>(SPIN_SETUP_AMOUNTS[0]);

  const displaySize = useDisplaySize();
  const isMobile = displaySize < 480;
  const tr = translations[lang];

  const segments = buildSegments(prizes, lang, tr.loss);
  const wheelRef = useRef<WheelHandle>(null);

  useEffect(() => {
    localStorage.setItem('wheel_prizes_v3', JSON.stringify(prizes));
  }, [prizes]);

  useEffect(() => {
    localStorage.setItem('wheel_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('wheel_lang', lang);
  }, [lang]);

  // Admin panel: Ctrl+Shift+A
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') setShowAdmin(v => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const startSpin = useCallback(() => {
    if (isSpinning || !wheelRef.current) return;

    let targetIndex: number;

    if (queue.length > 0) {
      const nextPrize = queue[0];
      setQueue(q => q.slice(1));
      const matching = segments
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.prizeId === nextPrize.id)
        .map(({ i }) => i);
      targetIndex =
        matching.length > 0
          ? matching[Math.floor(Math.random() * matching.length)]
          : Math.floor(Math.random() * segments.length);
    } else {
      targetIndex = Math.floor(Math.random() * segments.length);
    }

    setIsSpinning(true);
    wheelRef.current.spin(targetIndex);
  }, [isSpinning, queue, segments]);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    setShowSpinSetup(true);
  }, [isSpinning]);

  const handleSpinEnd = useCallback(
    (segmentIndex: number) => {
      const seg = segments[segmentIndex];
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        label: seg.label,
        value: seg.value,
        color: seg.color,
        timestamp: Date.now(),
      };
      setHistory(h => [entry, ...h].slice(0, 50));
      setResult({ label: seg.label, value: seg.value, color: seg.color });
      setIsSpinning(false);
    },
    [segments],
  );

  return (
    <LangContext.Provider value={{ lang, T: tr }}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: isMobile ? '16px 0 20px' : '24px 24px 32px',
        }}
      >
        <StarsBg />

        {/* Title */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            marginBottom: isMobile ? 12 : 20,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: isMobile ? 32 : 52,
              letterSpacing: isMobile ? 4 : 8,
              lineHeight: 1,
              background: 'linear-gradient(180deg, #fff8c0 0%, #ffd700 40%, #f59e0b 70%, #b45309 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 18px rgba(255,215,0,0.55))',
              userSelect: 'none',
            }}
          >
            FORTUNA SUPER PRIZ
          </div>
          <div
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent, #ffd700 30%, #fff8c0 50%, #ffd700 70%, transparent)',
              marginTop: 6,
              borderRadius: 1,
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 16 : 32,
            alignItems: 'center',
            zIndex: 1,
            position: 'relative',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {!isMobile && <History entries={history} compact={false} />}

          <Wheel
            ref={wheelRef}
            segments={segments}
            onSpin={handleSpin}
            onSpinEnd={handleSpinEnd}
            isSpinning={isSpinning}
            displaySize={displaySize}
          />

          {isMobile && <History entries={history} compact={true} />}
        </div>

        {/* Hidden queue — top right corner */}
        <HiddenQueue
          prizes={prizes}
          queue={queue}
          onAddToQueue={prize => setQueue(q => [...q, prize])}
          onRemoveFromQueue={index => setQueue(q => q.filter((_, i) => i !== index))}
          onClearQueue={() => setQueue([])}
        />

        {/* Language toggle — bottom left */}
        <LangButton lang={lang} onToggle={() => setLang(l => l === 'ru' ? 'tg' : 'ru')} />

        {/* Admin gear — bottom right */}
        <button
          onClick={() => setShowAdmin(true)}
          title="Настройки (Ctrl+Shift+A)"
          style={{
            position: 'fixed',
            bottom: 14,
            right: 14,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.2)',
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          ⚙
        </button>

        {showAdmin && (
          <AdminPanel
            prizes={prizes}
            defaultPrizes={DEFAULT_PRIZES}
            onSave={setPrizes}
            onClose={() => setShowAdmin(false)}
          />
        )}

        {result && (
          <ResultModal result={result} tr={tr} lang={lang} onClose={() => setResult(null)} />
        )}

        {showSpinSetup && (
          <SpinSetupModal
            lang={lang}
            tr={tr}
            selectedAmount={spinAmount}
            onSelectAmount={setSpinAmount}
            onClose={() => setShowSpinSetup(false)}
            onStart={() => {
              setShowSpinSetup(false);
              startSpin();
            }}
          />
        )}
      </div>
    </LangContext.Provider>
  );
}
