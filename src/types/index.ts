export interface Prize {
  id: string;
  label: string;
  value: number; // 0 = loss
  color: string;
  count: number; // number of segments on wheel
}

export interface Segment {
  label: string;
  value: number;
  color: string;
  prizeId: string;
}

export interface HistoryEntry {
  id: string;
  label: string;
  value: number;
  color: string;
  timestamp: number;
  /** Сумма прокрута в узбекских сумах (для отображения / подсказок) */
  stakeUzs?: number;
}
