/**
 * 오행(五行) 분석 엔진
 * @fullstackfamily/manseryeok 라이브러리 기반 사주팔자에서 오행 분석
 */

import type { OhangType } from './manseryeok';

export type { OhangType };

export interface OhangCount {
  목: number;
  화: number;
  토: number;
  금: number;
  수: number;
}

export interface OhangAnalysis {
  counts: OhangCount;
  lacking: OhangType[];   // 0~1개
  excess: OhangType[];    // 3개 이상
  balanced: OhangType[];  // 2개
  dominant: OhangType | null;
  /** 부족한 오행 중 사주학 우선순위 상위 2개 */
  prioritizedLacking: OhangType[];
}

export const OHANG_ORDER: OhangType[] = ['목', '화', '토', '금', '수'];

export function analyzeOhang(counts: OhangCount): OhangAnalysis {
  const lacking: OhangType[] = [];
  const excess: OhangType[] = [];
  const balanced: OhangType[] = [];
  let dominant: OhangType | null = null;
  let maxCount = -1;

  for (const ohang of OHANG_ORDER) {
    const count = counts[ohang];
    if (count <= 1) lacking.push(ohang);
    else if (count >= 3) excess.push(ohang);
    else balanced.push(ohang);

    if (count > maxCount) {
      maxCount = count;
      dominant = ohang;
    }
  }
  return { counts, lacking, excess, balanced, dominant, prioritizedLacking: lacking };
}

/** 오행 상생 관계 — A가 B를 생한다 */
const OHANG_GENERATES: Record<OhangType, OhangType> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
};

/** 오행 상극 관계 — A가 B를 극한다 */
const OHANG_CONTROLS: Record<OhangType, OhangType> = {
  목: '토', 화: '금', 토: '수', 금: '목', 수: '화',
};

/** 사주월(1~12)로부터 계절 판별 → 계절별 약한 오행 */
function getSeasonWeakOhang(sajuMonth: number): OhangType | null {
  if (sajuMonth >= 1 && sajuMonth <= 3) return '금';   // 봄: 금 약
  if (sajuMonth >= 4 && sajuMonth <= 6) return '수';   // 여름: 수 약
  if (sajuMonth >= 7 && sajuMonth <= 9) return '목';   // 가을: 목 약
  if (sajuMonth >= 10 && sajuMonth <= 12) return '화'; // 겨울: 화 약
  return null;
}

/**
 * 부족한 오행 중 더 시급한 2개를 우선순위로 선별합니다.
 *
 * @param analysis - 기본 오행 분석 결과
 * @param dayMasterOhang - 일간(日干)의 오행
 * @param sajuMonth - 사주월(1~12, 계절 판별용)
 * @returns 우선순위가 매겨진 OhangAnalysis (prioritizedLacking 업데이트)
 */
export function prioritizeLacking(
  analysis: OhangAnalysis,
  dayMasterOhang: OhangType,
  sajuMonth: number,
): OhangAnalysis {
  const { lacking, excess, dominant } = analysis;

  if (lacking.length <= 2) {
    return { ...analysis, prioritizedLacking: lacking };
  }

  // 간이 용신 계산: 가장 과다한 오행을 극하는 오행 또는 일간이 약하면 일간을 생하는 오행
  const dayMasterCount = analysis.counts[dayMasterOhang];
  const isDayMasterWeak = dayMasterCount <= 1;
  const simpleYongshin: OhangType | null = isDayMasterWeak
    ? (OHANG_ORDER.find((o) => OHANG_GENERATES[o] === dayMasterOhang) ?? null)
    : (dominant ? OHANG_GENERATES[dayMasterOhang] : null);

  const scored = lacking.map((ohang) => {
    let score = 0;

    // 1. 용신 일치 (+10)
    if (simpleYongshin && ohang === simpleYongshin) {
      score += 10;
    }

    // 2. 용신을 생해줌 (+5)
    if (simpleYongshin && OHANG_GENERATES[ohang] === simpleYongshin) {
      score += 5;
    }

    // 3. 과다 오행을 극함 (+4)
    if (excess.some((ex) => OHANG_CONTROLS[ohang] === ex)) {
      score += 4;
    }

    // 4. 일간이 약할 때 일간을 생해줌 (+3)
    if (isDayMasterWeak && OHANG_GENERATES[ohang] === dayMasterOhang) {
      score += 3;
    }

    // 5. 계절 약 오행 일치 (+2)
    const seasonWeak = getSeasonWeakOhang(sajuMonth);
    if (seasonWeak && ohang === seasonWeak) {
      score += 2;
    }

    return { ohang, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const prioritized = scored.slice(0, 2).map((item) => item.ohang);

  return { ...analysis, prioritizedLacking: prioritized };
}

export const OHANG_HANJA: Record<OhangType, string> = {
  목: '木', 화: '火', 토: '土', 금: '金', 수: '水',
};

export const OHANG_EMOJI: Record<OhangType, string> = {
  목: '🌳', 화: '🔥', 토: '🏔️', 금: '⚔️', 수: '💧',
};

export const OHANG_COLOR: Record<OhangType, { bg: string; text: string; border: string; glow: string }> = {
  목: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50', glow: '#10b981' },
  화: { bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/50',     glow: '#ef4444' },
  토: { bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  border: 'border-yellow-500/50',  glow: '#eab308' },
  금: { bg: 'bg-slate-300/20',   text: 'text-slate-300',   border: 'border-slate-300/50',   glow: '#cbd5e1' },
  수: { bg: 'bg-blue-500/20',    text: 'text-blue-400',    border: 'border-blue-500/50',    glow: '#3b82f6' },
};

export interface OhangDesignThemeToken {
  pageBg: string;
  heroStart: string;
  orb: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  muted: string;
  accentSoft: string;
  accentStrong: string;
  pillBg: string;
  shadow: string;
}

export interface OhangDesignColorToken {
  bg: string;
  text: string;
  border: string;
  glow: string;
}

// Bright result-page palette intended as a reusable design-system reference
// when other screens need consistent five-elements colors.
export const OHANG_DESIGN_THEME: Record<OhangType, OhangDesignThemeToken> = {
  목: {
    pageBg: '#f7fbf5',
    heroStart: '#edf6e9',
    orb: 'rgba(188, 220, 180, 0.72)',
    surface: 'rgba(255, 255, 255, 0.9)',
    surfaceAlt: '#f3f8f0',
    border: '#dcead7',
    text: '#213023',
    muted: '#6a7668',
    accentSoft: '#edf7ea',
    accentStrong: '#5e975e',
    pillBg: '#e7f2e2',
    shadow: 'rgba(70, 107, 74, 0.12)',
  },
  화: {
    pageBg: '#fff8f5',
    heroStart: '#fff0e7',
    orb: 'rgba(255, 204, 188, 0.7)',
    surface: 'rgba(255, 255, 255, 0.9)',
    surfaceAlt: '#fff5ef',
    border: '#f4ddd3',
    text: '#34211c',
    muted: '#7d645b',
    accentSoft: '#fff0e9',
    accentStrong: '#e67b56',
    pillBg: '#ffe5da',
    shadow: 'rgba(134, 76, 52, 0.12)',
  },
  토: {
    pageBg: '#fff9f1',
    heroStart: '#ffeed8',
    orb: 'rgba(255, 224, 164, 0.72)',
    surface: 'rgba(255, 255, 255, 0.9)',
    surfaceAlt: '#fff5e7',
    border: '#efe2cf',
    text: '#2c241d',
    muted: '#786b5c',
    accentSoft: '#fff1d9',
    accentStrong: '#a07a3a',
    pillBg: '#faebcb',
    shadow: 'rgba(124, 92, 39, 0.12)',
  },
  금: {
    pageBg: '#fafbfc',
    heroStart: '#f1f4f7',
    orb: 'rgba(220, 228, 237, 0.8)',
    surface: 'rgba(255, 255, 255, 0.92)',
    surfaceAlt: '#f6f8fa',
    border: '#e2e8ee',
    text: '#20252a',
    muted: '#6d7780',
    accentSoft: '#eef2f5',
    accentStrong: '#88939d',
    pillBg: '#eef2f5',
    shadow: 'rgba(85, 100, 114, 0.12)',
  },
  수: {
    pageBg: '#f7fbff',
    heroStart: '#eff8ff',
    orb: 'rgba(208, 232, 248, 0.85)',
    surface: 'rgba(255, 255, 255, 0.9)',
    surfaceAlt: '#f0f8ff',
    border: '#dfeef8',
    text: '#183245',
    muted: '#647f92',
    accentSoft: '#e6f3ff',
    accentStrong: '#4d98d6',
    pillBg: '#e8f5ff',
    shadow: 'rgba(69, 128, 171, 0.12)',
  },
};

export const OHANG_DESIGN_COLOR: Record<OhangType, OhangDesignColorToken> = {
  목: { bg: 'bg-[#edf7ea]', text: 'text-[#5f965c]', border: 'border-[#d5e8cf]', glow: '#6FB46C' },
  화: { bg: 'bg-[#fff0e9]', text: 'text-[#e57a55]', border: 'border-[#f4d2c8]', glow: '#FF8A61' },
  토: { bg: 'bg-[#fff1d9]', text: 'text-[#9d7a3d]', border: 'border-[#eadabb]', glow: '#D1AE6D' },
  금: { bg: 'bg-[#f1f4f7]', text: 'text-[#85929e]', border: 'border-[#dfe5ea]', glow: '#B8C1C9' },
  수: { bg: 'bg-[#e6f3ff]', text: 'text-[#4b95d2]', border: 'border-[#d4e7f8]', glow: '#67AFE5' },
};

export const OHANG_KEYWORDS: Record<OhangType, string[]> = {
  목: ['성장', '창의', '도전', '생명력', '인내'],
  화: ['열정', '활기', '명예', '표현력', '변화'],
  토: ['안정', '균형', '신뢰', '포용', '지속'],
  금: ['결단', '정밀', '의지', '마무리', '결실'],
  수: ['지혜', '유연', '소통', '흐름', '재물'],
};

export const OHANG_LACKING_DESC: Record<OhangType, string> = {
  목: '새로운 시작이 두렵고 추진력이 부족할 때가 많아요. 창의적 아이디어가 막히고 답답함을 느끼기 쉬워요.',
  화: '에너지가 떨어지고 의욕이 없을 때가 많아요. 소극적이고 주목받는 것이 불편하게 느껴질 수 있어요.',
  토: '마음이 붕 뜨고 안정감이 부족해요. 결정을 내려도 흔들리고 기반이 약하게 느껴질 수 있어요.',
  금: '우유부단하고 일 마무리가 잘 안 돼요. 결단력이 떨어지고 흐지부지 끝나는 일들이 많아요.',
  수: '직관과 유연성이 부족해요. 고집이 세지고 변화에 적응하기 어려울 때가 많아요.',
};

export const OHANG_EXCESS_DESC: Record<OhangType, string> = {
  목: '욕심이 과해지고 남의 말을 안 듣게 돼요. 과도한 경쟁심으로 인간관계에 마찰이 생길 수 있어요.',
  화: '감정기복이 심하고 충동적이에요. 화를 참지 못하고 인간관계에서 갈등이 잦아요.',
  토: '고집이 강하고 변화를 거부해요. 지나친 집착으로 답답한 상황이 반복될 수 있어요.',
  금: '지나치게 냉정하고 날카로워요. 완벽주의로 자신도 타인도 힘들게 할 수 있어요.',
  수: '생각이 너무 많아서 행동으로 옮기지 못해요. 불안감이 높고 의심이 많아질 수 있어요.',
};
