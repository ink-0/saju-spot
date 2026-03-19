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
  return { counts, lacking, excess, balanced, dominant };
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
