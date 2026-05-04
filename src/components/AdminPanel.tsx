import { useState } from 'react';
import { Prize } from '../types';
import { useLang } from '../LangContext';

const PRESET_COLORS = [
  '#1d4ed8', '#0e7490', '#16a34a', '#166534',
  '#c2410c', '#b91c1c', '#7c3aed', '#d97706',
  '#db2777', '#0f766e',
];

interface AdminPanelProps {
  prizes: Prize[];
  defaultPrizes: Prize[];
  onSave: (prizes: Prize[]) => void;
  onClose: () => void;
}

export default function AdminPanel({
  prizes,
  defaultPrizes,
  onSave,
  onClose,
}: AdminPanelProps) {
  const { T } = useLang();
  const [local, setLocal] = useState<Prize[]>(prizes);
  const [newAmount, setNewAmount] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  function removePrize(id: string) {
    if (id === 'loss') return;
    setLocal(ps => ps.filter(p => p.id !== id));
  }

  function addPrize() {
    const amount = parseInt(newAmount, 10);
    if (!amount || amount <= 0) return;
    const id = `p_${Date.now()}`;
    setLocal(ps => [
      ...ps.filter(p => p.id !== 'loss'),
      {
        id,
        label: `${amount.toLocaleString('ru-RU')} сум`,
        value: amount,
        color: newColor,
        count: 1,
      },
      ...ps.filter(p => p.id === 'loss'),
    ]);
    setNewAmount('');
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 520,
          maxHeight: '88vh',
          background: 'rgba(8, 2, 25, 0.97)',
          border: '1px solid rgba(255,215,0,0.4)',
          borderRadius: 20,
          padding: 28,
          overflowY: 'auto',
          boxShadow: '0 20px 80px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 26,
              letterSpacing: 3,
              color: '#ffd700',
              textShadow: '0 0 20px rgba(255,215,0,0.4)',
            }}
          >
            {T.adminTitle}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: 18,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Prize list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {local.map(prize => (
            <div
              key={prize.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${prize.color}44`,
              }}
            >
              {/* Color swatch */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: prize.color,
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${prize.color}88`,
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              />

              {/* Label */}
              <span
                style={{
                  flex: 1,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: prize.color,
                }}
              >
                {prize.label}
              </span>

              {/* Delete */}
              {prize.id !== 'loss' && (
                <button
                  onClick={() => removePrize(prize.id)}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 6,
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: 13,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add new prize */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 2,
              color: '#ffd700',
              marginBottom: 12,
            }}
          >
            {T.addPrize}
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>{T.sumLabel}</label>
            <input
              type="number"
              min="1"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              placeholder="напр. 30000000"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{T.colorLabel}</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {PRESET_COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    cursor: 'pointer',
                    border: newColor === c ? '2px solid white' : '2px solid transparent',
                    boxShadow: newColor === c ? `0 0 10px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={addPrize}
            disabled={!newAmount}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 10,
              background:
                newAmount
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : 'rgba(255,255,255,0.05)',
              border: 'none',
              color: newAmount ? 'white' : 'rgba(255,255,255,0.3)',
              fontSize: 15,
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 2,
              cursor: newAmount ? 'pointer' : 'not-allowed',
            }}
          >
            {T.addBtn}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { onSave(local); onClose(); }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
              border: 'none',
              color: '#000',
              fontSize: 16,
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 2,
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {T.save}
          </button>
          <button
            onClick={() => setLocal(defaultPrizes)}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontFamily: "'Rajdhani', sans-serif",
              cursor: 'pointer',
              letterSpacing: 1,
            }}
          >
            {T.reset}
          </button>
        </div>
      </div>
    </div>
  );
}


const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'rgba(255,255,255,0.35)',
  fontFamily: "'Rajdhani', sans-serif",
  letterSpacing: 1,
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'white',
  fontSize: 15,
  fontFamily: "'Rajdhani', sans-serif",
  outline: 'none',
};
