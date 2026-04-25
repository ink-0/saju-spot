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

/* ─────────── 개인화된 부족 오행 설명 ─────────── */

/** 오행 상생 관계 표 (A → B를 생함) */
const OHANG_GENERATES_MAP: Record<OhangType, OhangType> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
};

/** 오행 상극 관계 표 (A → B를 극함) */
const OHANG_CONTROLS_MAP: Record<OhangType, OhangType> = {
  목: '토', 화: '금', 토: '수', 금: '목', 수: '화',
};

const OHANG_NATURE_NAME: Record<OhangType, string> = {
  목: '나무', 화: '불', 토: '흙', 금: '쇠', 수: '물',
};

const OHANG_ENERGY_NAME: Record<OhangType, string> = {
  목: '성장과 시작의 기운', 화: '열정과 표현의 기운',
  토: '안정과 중심의 기운', 금: '결단과 마무리의 기운',
  수: '지혜와 유연함의 기운',
};

const OHANG_ACTION_TIPS: Record<OhangType, string[]> = {
  목: ['녹색 계열 소품이나 의류를 가까이 해보세요', '산책이나 공원 방문으로 자연의 기운을 받아보세요', '새로운 배움이나 도전을 일상에 하나 추가해 보세요'],
  화: ['햇볕을 충분히 쬐는 시간을 만들어 보세요', '붉은 계열 소품을 포인트로 활용해 보세요', '활기찬 운동이나 사람들과의 모임으로 에너지를 충전해 보세요'],
  토: ['흙길 산책이나 세라믹 공예 등 흙과 관련된 활동을 해보세요', '노란색이나 갈색 톤의 안정적인 색상을 가까이 해보세요', '규칙적인 루틴을 만들어 일상의 리듬을 잡아보세요'],
  금: ['금속 소재의 액세서리를 포인트로 착용해 보세요', '흰색·실버 톤으로 공간을 정리해 보세요', '마감 기한을 정해두고 작은 일부터 완결해 보세요'],
  수: ['물가 산책이나 수영 등 물과 가까운 활동을 해보세요', '검정이나 남색 계열로 차분한 분위기를 만들어 보세요', '명상이나 일기 쓰기로 내면의 흐름을 정리해 보세요'],
};

/**
 * 개인화된 부족 오행 설명을 생성합니다.
 *
 * 일간 오행과의 상생/상극 관계, 과다 오행과의 밸런스를 반영하여
 * "이 사람의 사주에서 왜 이 오행이 특히 중요한지"를 설명합니다.
 */
export function getPersonalizedLackingDesc(
  ohang: OhangType,
  dayMasterOhang: OhangType,
  analysis: OhangAnalysis,
): { headline: string; detail: string; tips: string[] } {
  const lines: string[] = [];
  let headline: string;

  // 1. 부족 오행 → 일간과의 관계 해석
  const generatesTarget = OHANG_GENERATES_MAP[ohang];
  const controlsTarget = OHANG_CONTROLS_MAP[ohang];
  const generatedBy = (Object.entries(OHANG_GENERATES_MAP) as [OhangType, OhangType][]).find(([, v]) => v === ohang)?.[0];

  if (OHANG_GENERATES_MAP[ohang] === dayMasterOhang) {
    // 부족 오행이 일간을 생해주는 관계 (인성 역할)
    headline = `나를 키워주는 ${OHANG_ENERGY_NAME[ohang]}이 부족해요`;
    lines.push(
      `${OHANG_NATURE_NAME[ohang]}(${OHANG_HANJA[ohang]})은 ${OHANG_NATURE_NAME[dayMasterOhang]}(${OHANG_HANJA[dayMasterOhang]})을 키워주는 기운이에요. 이 기운이 약하면 스스로를 충전하고 회복하는 힘이 부족해질 수 있어요.`,
      `마치 뿌리에 영양을 주는 토양이 메마른 것처럼, 바깥에서 열심히 해도 안에서 차오르는 에너지가 느껴지지 않을 때가 있어요.`,
    );
  } else if (dayMasterOhang === ohang) {
    // 부족 오행이 일간과 같은 오행 (비겁 역할)
    headline = `나와 같은 ${OHANG_ENERGY_NAME[ohang]}이 부족해요`;
    lines.push(
      `자신과 같은 ${ohang}(${OHANG_HANJA[ohang]}) 기운이 부족하면, 스스로 밀고 나가는 추진력이나 자존감이 약해지기 쉬워요.`,
      `혼자서는 버거움을 느끼고, 누군가의 도움이나 환경의 뒷받침이 있어야 비로소 안정감을 찾을 수 있는 구조예요.`,
    );
  } else if (OHANG_GENERATES_MAP[dayMasterOhang] === ohang) {
    // 일간이 부족 오행을 생해주는 관계 (식상 역할)
    headline = `표현의 출구인 ${OHANG_ENERGY_NAME[ohang]}이 부족해요`;
    lines.push(
      `${dayMasterOhang}(${OHANG_HANJA[dayMasterOhang]}) 일간이 만들어내는 에너지가 ${ohang}(${OHANG_HANJA[ohang]}) 쪽으로 흘러야 하는데, 그 출구가 좁아진 상태예요.`,
      `생각은 많지만 표현이 막히거나, 하고 싶은 일은 있는데 실행으로 이어지기 어려운 답답함을 느끼기 쉬워요.`,
    );
  } else if (OHANG_CONTROLS_MAP[dayMasterOhang] === ohang) {
    // 일간이 부족 오행을 극하는 관계 (재성 역할)
    headline = `현실 감각의 ${OHANG_ENERGY_NAME[ohang]}이 부족해요`;
    lines.push(
      `${dayMasterOhang}(${OHANG_HANJA[dayMasterOhang]}) 일간이 다스려야 할 ${ohang}(${OHANG_HANJA[ohang]}) 기운이 약하면, 현실을 관리하고 자원을 챙기는 감각이 흐릿해질 수 있어요.`,
      `계획은 세웠는데 실속이 따르지 않거나, 돈·시간 같은 실질적 자원 관리에서 아쉬움이 남는 경우가 생기기 쉬워요.`,
    );
  } else {
    // 부족 오행이 일간을 극하는 관계 (관성 역할)
    headline = `자기 절제의 ${OHANG_ENERGY_NAME[ohang]}이 부족해요`;
    lines.push(
      `${ohang}(${OHANG_HANJA[ohang]}) 기운은 ${dayMasterOhang}(${OHANG_HANJA[dayMasterOhang]}) 일간을 눌러주는 역할이에요. 이 기운이 약하면 자기 조절이 어렵거나 외부의 규율 없이 흐트러지기 쉬워요.`,
      `자유로운 것은 좋지만, 가끔은 스스로를 잡아줄 프레임이 필요한 타입이에요.`,
    );
  }

  // 2. 과다 오행과의 밸런스 관점
  if (analysis.excess.length > 0) {
    const excessNames = analysis.excess.map((e) => `${e}(${OHANG_HANJA[e]})`).join(', ');
    const controlsExcess = analysis.excess.some((e) => OHANG_CONTROLS_MAP[ohang] === e);
    if (controlsExcess) {
      const controlled = analysis.excess.find((e) => OHANG_CONTROLS_MAP[ohang] === e)!;
      lines.push(
        `특히 ${controlled}(${OHANG_HANJA[controlled]}) 기운이 과다한 사주에서 ${ohang}(${OHANG_HANJA[ohang]})은 그것을 제어하는 역할을 해요. 이 균형추가 빠져 있어서 과다한 기운이 더 날뛰기 쉬운 상태예요. ${ohang} 기운을 보충하면 전체적인 밸런스가 크게 개선될 수 있어요.`,
      );
    } else {
      lines.push(
        `현재 ${excessNames} 기운이 과다한 상태인데, ${ohang}(${OHANG_HANJA[ohang]}) 기운까지 부족하니 전체 밸런스가 한쪽으로 기울어 있어요. 부족한 기운을 의식적으로 채워주면 기울어진 균형이 잡혀갈 수 있어요.`,
      );
    }
  }

  // 3. 기본 설명 추가
  lines.push(OHANG_LACKING_DESC[ohang]);

  return {
    headline,
    detail: lines.join(' '),
    tips: OHANG_ACTION_TIPS[ohang],
  };
}
