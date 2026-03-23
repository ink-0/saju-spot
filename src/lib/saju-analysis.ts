import {
  CHUNGGAN_HANJA,
  CHUNGGAN_OHANG,
  JIJI_HANJA,
  JIJI_OHANG,
  type SajuResult,
} from './manseryeok';
import type { OhangType } from './ohang';

export type TenGodType =
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '편재'
  | '정재'
  | '편관'
  | '정관'
  | '편인'
  | '정인';

export type TwelveStateType =
  | '장생'
  | '목욕'
  | '관대'
  | '건록'
  | '제왕'
  | '쇠'
  | '병'
  | '사'
  | '묘'
  | '절'
  | '태'
  | '양';

export type BranchRelationType = '합' | '충' | '형' | '해';

type Stem = keyof typeof CHUNGGAN_OHANG;
type Branch = keyof typeof JIJI_OHANG;

interface HiddenStemMeta {
  stem: Stem;
  role: '주기' | '중기' | '여기';
}

export interface HiddenStemDetail extends HiddenStemMeta {
  hanja: string;
  ohang: OhangType;
  tenGod: TenGodType;
}

export interface SajuPillarDetail {
  key: 'year' | 'month' | 'day' | 'hour';
  label: '연주' | '월주' | '일주' | '시주';
  pillar: string;
  pillarHanja: string;
  stem: Stem;
  stemHanja: string;
  stemOhang: OhangType;
  stemTenGod: TenGodType | '일간';
  branch: Branch;
  branchHanja: string;
  branchOhang: OhangType;
  branchTenGod: TenGodType;
  hiddenStems: HiddenStemDetail[];
  twelveState: TwelveStateType;
}

export interface BranchRelation {
  type: BranchRelationType;
  name: string;
  branches: [Branch, Branch];
  labels: [string, string];
  description: string;
}

export interface SajuDetailAnalysis {
  dayMaster: {
    stem: Stem;
    hanja: string;
    ohang: OhangType;
  };
  pillars: SajuPillarDetail[];
  branchRelations: BranchRelation[];
  highlights: string[];
}

const ELEMENT_ORDER: OhangType[] = ['목', '화', '토', '금', '수'];

const STEM_YINYANG: Record<Stem, 'yang' | 'yin'> = {
  갑: 'yang', 을: 'yin', 병: 'yang', 정: 'yin', 무: 'yang', 기: 'yin', 경: 'yang', 신: 'yin', 임: 'yang', 계: 'yin',
};

const HIDDEN_STEMS: Record<Branch, HiddenStemMeta[]> = {
  자: [{ stem: '계', role: '주기' }],
  축: [{ stem: '기', role: '주기' }, { stem: '계', role: '중기' }, { stem: '신', role: '여기' }],
  인: [{ stem: '갑', role: '주기' }, { stem: '병', role: '중기' }, { stem: '무', role: '여기' }],
  묘: [{ stem: '을', role: '주기' }],
  진: [{ stem: '무', role: '주기' }, { stem: '을', role: '중기' }, { stem: '계', role: '여기' }],
  사: [{ stem: '병', role: '주기' }, { stem: '무', role: '중기' }, { stem: '경', role: '여기' }],
  오: [{ stem: '정', role: '주기' }, { stem: '기', role: '여기' }],
  미: [{ stem: '기', role: '주기' }, { stem: '정', role: '중기' }, { stem: '을', role: '여기' }],
  신: [{ stem: '경', role: '주기' }, { stem: '임', role: '중기' }, { stem: '무', role: '여기' }],
  유: [{ stem: '신', role: '주기' }],
  술: [{ stem: '무', role: '주기' }, { stem: '신', role: '중기' }, { stem: '정', role: '여기' }],
  해: [{ stem: '임', role: '주기' }, { stem: '갑', role: '여기' }],
};

const TWELVE_STATES: TwelveStateType[] = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];

const TWELVE_STATE_START: Record<Stem, Branch> = {
  갑: '해', 을: '오', 병: '인', 정: '유', 무: '인', 기: '유', 경: '사', 신: '자', 임: '신', 계: '묘',
};

const BRANCH_ORDER: Branch[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const BRANCH_RELATIONS: Array<{
  type: BranchRelationType;
  branches: [Branch, Branch];
  name: string;
  description: string;
}> = [
  { type: '합', branches: ['자', '축'], name: '자축합', description: '서로의 기운을 묶어 현실적인 결속을 만드는 조합이에요.' },
  { type: '합', branches: ['인', '해'], name: '인해합', description: '성장성과 배움의 흐름이 자연스럽게 이어지는 합이에요.' },
  { type: '합', branches: ['묘', '술'], name: '묘술합', description: '표현력과 결과를 연결해 주는 불씨가 생기기 쉬워요.' },
  { type: '합', branches: ['진', '유'], name: '진유합', description: '실리와 정리력이 맞물리면서 결과를 챙기려는 힘이 커져요.' },
  { type: '합', branches: ['사', '신'], name: '사신합', description: '강한 추진력과 판단력이 맞물리는 합이에요.' },
  { type: '합', branches: ['오', '미'], name: '오미합', description: '따뜻한 활력과 안정감이 연결되는 합이에요.' },
  { type: '충', branches: ['자', '오'], name: '자오충', description: '감정과 행동의 리듬이 부딪히며 급한 변화가 생기기 쉬워요.' },
  { type: '충', branches: ['축', '미'], name: '축미충', description: '안정과 변화 욕구가 맞서며 방향 수정이 잦아질 수 있어요.' },
  { type: '충', branches: ['인', '신'], name: '인신충', description: '확장과 통제가 충돌하면서 관계나 진로 변화가 두드러질 수 있어요.' },
  { type: '충', branches: ['묘', '유'], name: '묘유충', description: '섬세함과 현실 감각이 부딪혀 예민함이 올라오기 쉬워요.' },
  { type: '충', branches: ['진', '술'], name: '진술충', description: '쌓아둔 것과 바꾸려는 힘이 충돌해 큰 전환점을 만들 수 있어요.' },
  { type: '충', branches: ['사', '해'], name: '사해충', description: '속도와 유연함이 엇갈려 계획 변경이 잦아질 수 있어요.' },
  { type: '형', branches: ['인', '사'], name: '인사형', description: '의욕은 큰데 방식 차이가 커서 긴장감이 생기기 쉬워요.' },
  { type: '형', branches: ['사', '신'], name: '사신형', description: '성과 압박과 경쟁심이 강해지며 예민한 긴장이 쌓일 수 있어요.' },
  { type: '형', branches: ['신', '인'], name: '신인형', description: '판단 속도 차이로 부딪힘이 생기기 쉬운 형살 패턴이에요.' },
  { type: '형', branches: ['축', '술'], name: '축술형', description: '고집과 책임감이 맞물려 쉽게 물러서지 않는 흐름이에요.' },
  { type: '형', branches: ['술', '미'], name: '술미형', description: '안정 추구가 강해지면서 답답함을 느끼기 쉬워요.' },
  { type: '형', branches: ['미', '축'], name: '미축형', description: '감정과 현실 계산이 맞물려 내적 소모가 커질 수 있어요.' },
  { type: '형', branches: ['자', '묘'], name: '자묘형', description: '감수성과 예민함이 동시에 올라와 인간관계 피로가 쌓일 수 있어요.' },
  { type: '형', branches: ['묘', '자'], name: '묘자형', description: '의사표현이 꼬이기 쉬워 말보다 상황 관리가 중요해지는 흐름이에요.' },
  { type: '해', branches: ['자', '미'], name: '자미해', description: '겉으로는 부드럽지만 속으로는 엇갈리는 기운이 숨어 있어요.' },
  { type: '해', branches: ['축', '오'], name: '축오해', description: '안정과 속도감이 어긋나며 마음고생이 커질 수 있어요.' },
  { type: '해', branches: ['인', '사'], name: '인사해', description: '성장 욕구와 현실 압박이 엇갈려 속앓이를 만들기 쉬워요.' },
  { type: '해', branches: ['묘', '진'], name: '묘진해', description: '섬세함과 책임감이 섞이며 관계 피로가 쌓이기 쉬워요.' },
  { type: '해', branches: ['신', '해'], name: '신해해', description: '계획과 감정 흐름이 어긋나며 예상치 못한 변수에 민감해질 수 있어요.' },
  { type: '해', branches: ['유', '술'], name: '유술해', description: '결과를 챙기려는 마음과 현실 여건이 엇갈리는 흐름이에요.' },
];

export function analyzeSajuDetails(saju: SajuResult): SajuDetailAnalysis {
  const dayStem = getStem(saju.dayPillar);
  const dayMaster = {
    stem: dayStem,
    hanja: CHUNGGAN_HANJA[dayStem],
    ohang: CHUNGGAN_OHANG[dayStem],
  };

  const pillars: SajuPillarDetail[] = [
    createPillarDetail('year', '연주', saju.yearPillar, saju.yearPillarHanja, dayStem),
    createPillarDetail('month', '월주', saju.monthPillar, saju.monthPillarHanja, dayStem),
    createPillarDetail('day', '일주', saju.dayPillar, saju.dayPillarHanja, dayStem),
    saju.hourPillar && saju.hourPillarHanja
      ? createPillarDetail('hour', '시주', saju.hourPillar, saju.hourPillarHanja, dayStem)
      : null,
  ].filter((pillar): pillar is SajuPillarDetail => pillar !== null);

  const branchRelations = findBranchRelations(pillars.map((pillar) => ({ label: pillar.label, branch: pillar.branch })));
  const highlights = buildHighlights(dayMaster, pillars, branchRelations);

  return {
    dayMaster,
    pillars,
    branchRelations,
    highlights,
  };
}

function createPillarDetail(
  key: SajuPillarDetail['key'],
  label: SajuPillarDetail['label'],
  pillar: string,
  pillarHanja: string,
  dayStem: Stem,
): SajuPillarDetail {
  const stem = getStem(pillar);
  const branch = getBranch(pillar);
  const hiddenStems = HIDDEN_STEMS[branch].map(({ stem: hiddenStem, role }) => ({
    stem: hiddenStem,
    role,
    hanja: CHUNGGAN_HANJA[hiddenStem],
    ohang: CHUNGGAN_OHANG[hiddenStem],
    tenGod: getTenGod(dayStem, hiddenStem),
  }));

  return {
    key,
    label,
    pillar,
    pillarHanja,
    stem,
    stemHanja: CHUNGGAN_HANJA[stem],
    stemOhang: CHUNGGAN_OHANG[stem],
    stemTenGod: key === 'day' ? '일간' : getTenGod(dayStem, stem),
    branch,
    branchHanja: JIJI_HANJA[branch],
    branchOhang: JIJI_OHANG[branch],
    branchTenGod: hiddenStems[0].tenGod,
    hiddenStems,
    twelveState: getTwelveState(dayStem, branch),
  };
}

function getStem(pillar: string): Stem {
  return pillar[0] as Stem;
}

function getBranch(pillar: string): Branch {
  return pillar[1] as Branch;
}

function getTenGod(dayStem: Stem, targetStem: Stem): TenGodType {
  const dayElementIndex = ELEMENT_ORDER.indexOf(CHUNGGAN_OHANG[dayStem]);
  const targetElementIndex = ELEMENT_ORDER.indexOf(CHUNGGAN_OHANG[targetStem]);
  const parityMatches = STEM_YINYANG[dayStem] === STEM_YINYANG[targetStem];

  if (dayElementIndex === targetElementIndex) {
    return parityMatches ? '비견' : '겁재';
  }

  if ((dayElementIndex + 1) % 5 === targetElementIndex) {
    return parityMatches ? '식신' : '상관';
  }

  if ((dayElementIndex + 2) % 5 === targetElementIndex) {
    return parityMatches ? '편재' : '정재';
  }

  if ((dayElementIndex + 3) % 5 === targetElementIndex) {
    return parityMatches ? '편관' : '정관';
  }

  return parityMatches ? '편인' : '정인';
}

function getTwelveState(dayStem: Stem, branch: Branch): TwelveStateType {
  const startIndex = BRANCH_ORDER.indexOf(TWELVE_STATE_START[dayStem]);
  const branchIndex = BRANCH_ORDER.indexOf(branch);
  const isYang = STEM_YINYANG[dayStem] === 'yang';
  const distance = isYang
    ? (branchIndex - startIndex + BRANCH_ORDER.length) % BRANCH_ORDER.length
    : (startIndex - branchIndex + BRANCH_ORDER.length) % BRANCH_ORDER.length;

  return TWELVE_STATES[distance];
}

function findBranchRelations(pillars: Array<{ label: string; branch: Branch }>): BranchRelation[] {
  const relations: BranchRelation[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const left = pillars[i];
      const right = pillars[j];

      for (const relation of BRANCH_RELATIONS) {
        if (!matchesRelation(relation.branches, left.branch, right.branch)) {
          continue;
        }

        const signature = `${relation.type}:${[left.branch, right.branch].sort().join('-')}`;
        if (seen.has(signature)) {
          continue;
        }

        seen.add(signature);
        relations.push({
          type: relation.type,
          name: relation.name,
          branches: [left.branch, right.branch],
          labels: [left.label, right.label],
          description: relation.description,
        });
      }
    }
  }

  return relations;
}

function matchesRelation(target: [Branch, Branch], left: Branch, right: Branch): boolean {
  return (target[0] === left && target[1] === right) || (target[0] === right && target[1] === left);
}

function buildHighlights(
  dayMaster: SajuDetailAnalysis['dayMaster'],
  pillars: SajuPillarDetail[],
  relations: BranchRelation[],
): string[] {
  const monthPillar = pillars.find((pillar) => pillar.key === 'month');
  const supportCount = pillars.filter((pillar) => pillar.stemOhang === dayMaster.ohang).length;
  const resourceCount = pillars.filter((pillar) => getTenGod(dayMaster.stem, pillar.stem) === '정인' || getTenGod(dayMaster.stem, pillar.stem) === '편인').length;

  const highlights = [
    `일간은 ${dayMaster.stem}${dayMaster.hanja}(${dayMaster.ohang})로, 내 성향을 읽을 때 가장 먼저 보는 중심축이에요.`,
  ];

  if (monthPillar) {
    highlights.push(`월주는 ${monthPillar.stemTenGod} 성향이 걸려 있어 사회생활과 현실 감각에서 ${monthPillar.stemTenGod}의 색이 강하게 드러나기 쉬워요.`);
  }

  if (supportCount >= 2 || resourceCount >= 2) {
    highlights.push(`사주 안에 일간을 돕는 기운이 비교적 반복돼서 자기 색을 밀고 가는 힘이 있는 편으로 보여요.`);
  } else {
    highlights.push(`일간을 직접 돕는 기운이 많지 않아 환경이나 타이밍의 도움을 받는지가 체감에 크게 작용할 수 있어요.`);
  }

  if (relations.length > 0) {
    highlights.push(`지지에서는 ${relations.map((relation) => relation.name).join(', ')} 흐름이 보여 관계와 환경 변화가 한 번에 크게 들어오는 시점이 있을 수 있어요.`);
  } else {
    highlights.push('지지 관계가 비교적 단순해서 큰 충돌보다는 기본 성향이 꾸준히 드러나는 편이에요.');
  }

  return highlights;
}
