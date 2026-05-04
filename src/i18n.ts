export type Lang = 'ru' | 'tg';

/** Сколько сум в одном сомони */
export const UZS_PER_TJS = 875;

/** Конвертировать сумму (хранится в UZS) для отображения */
export function convertAmount(uzs: number, lang: Lang): number {
  return lang === 'tg' ? Math.round(uzs / UZS_PER_TJS) : uzs;
}

/** Короткий лейбл для сегмента колеса */
export function wheelLabel(uzs: number, lang: Lang): string {
  if (lang === 'tg') {
    const tjs = uzs / UZS_PER_TJS;
    return `${(tjs / 1000).toFixed(1)}к с`;
  }
  return `${uzs / 1_000_000} млн`;
}

export interface T {
  spin: string;
  spinning: string;
  history: string;
  lastRound: string;
  win: string;
  lose: string;
  continueBtn: string;
  loss: string;
  currency: string;
  queueTitle: string;
  addToQueue: string;
  queueEmpty: string;
  queueLabel: string;
  clearQueue: string;
  adminTitle: string;
  addPrize: string;
  sumLabel: string;
  colorLabel: string;
  addBtn: string;
  save: string;
  reset: string;
  empty: string;
  langBtn: string;
}

export const translations: Record<Lang, T> = {
  ru: {
    spin: 'КРУТИТЬ ▶',
    spinning: 'КРУТИМ...',
    history: 'ИСТОРИЯ',
    lastRound: 'ПОСЛЕДНИЙ РАУНД',
    win: 'ПОБЕДА!',
    lose: 'НЕ ПОВЕЗЛО',
    continueBtn: 'ПРОДОЛЖИТЬ',
    loss: 'ПРОИГРЫШ',
    currency: 'сум',
    queueTitle: 'ОЧЕРЕДЬ ПРИЗОВ',
    addToQueue: 'ДОБАВИТЬ В ОЧЕРЕДЬ:',
    queueEmpty: 'Очередь пуста — призы случайные',
    queueLabel: 'ОЧЕРЕДЬ',
    clearQueue: 'ОЧИСТИТЬ ОЧЕРЕДЬ',
    adminTitle: 'НАСТРОЙКА ПРИЗОВ',
    addPrize: 'ДОБАВИТЬ ПРИЗ',
    sumLabel: 'Сумма (сум)',
    colorLabel: 'Цвет',
    addBtn: 'ДОБАВИТЬ',
    save: 'СОХРАНИТЬ',
    reset: 'СБРОС',
    empty: 'Пока пусто',
    langBtn: '🇹🇯 TJ',
  },
  tg: {
    spin: 'ГАРДОНДАН ▶',
    spinning: 'МЕГАРДАД...',
    history: 'ТАЪРИХ',
    lastRound: 'ДАВРАИ ОХИР',
    win: 'БУРДЕД!',
    lose: 'БАХТ НАБУД',
    continueBtn: 'ДАВОМ',
    loss: 'БОХТ',
    currency: 'сомонӣ',
    queueTitle: 'НАВБАТИ ҶОИЗА',
    addToQueue: 'БА НАВБАТ ИЛОВА КУН:',
    queueEmpty: 'Навбат холӣ — ба тасодуф',
    queueLabel: 'НАВБАТ',
    clearQueue: 'ТОЗА КАРДАН',
    adminTitle: 'ТАНЗИМИ ҶОИЗАҲО',
    addPrize: 'ҶОИЗА ИЛОВА КУН',
    sumLabel: 'Маблағ (сомонӣ)',
    colorLabel: 'Ранг',
    addBtn: 'ИЛОВА',
    save: 'НИГОҲ ДОР',
    reset: 'БАРҚАРОР',
    empty: 'Ҳанӯз холӣ',
    langBtn: '🇷🇺 RU',
  },
};
