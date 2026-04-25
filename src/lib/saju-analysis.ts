import {
  CHUNGGAN_HANJA,
  CHUNGGAN_OHANG,
  JIJI_HANJA,
  JIJI_OHANG,
  type SajuResult,
} from './manseryeok';
import type { OhangType } from './ohang';
import { getIljuNarrative, type IljuNarrative } from './ilju-narratives';

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

export interface HighlightSection {
  icon: string;
  title: string;
  body: string;
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
  /** 구조화된 해석 섹션 (성격, 사회적 모습, 내면, 미래, 밸런스) */
  structuredHighlights: HighlightSection[];
  /** 일주 내러티브 */
  iljuNarrative: IljuNarrative;
}

export interface TenGodUiMeta {
  label: string;
  headline: string;
  description: string;
}

export interface TwelveStateUiMeta {
  label: TwelveStateType;
  headline: string;
  description: string;
}

export interface PillarConversationUi {
  title: string;
  summary: string;
}

export interface SimpleSajuSummary {
  title: string;
  metaphor: string;
  lines: [string, string];
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

const TEN_GOD_UI: Record<TenGodType, TenGodUiMeta> = {
  비견: {
    label: '비견',
    headline: '자기 색이 뚜렷한 성향',
    description: '내 방식과 기준을 중요하게 여겨요. 독립적으로 밀고 가는 힘이 있는 편이에요.',
  },
  겁재: {
    label: '겁재',
    headline: '경쟁심과 추진력이 강한 성향',
    description: '사람과 부딪히더라도 앞으로 나가려는 힘이 있어요. 속도감 있게 움직이는 편이에요.',
  },
  식신: {
    label: '식신',
    headline: '차분하게 표현하는 성향',
    description: '내가 가진 것을 자연스럽게 풀어내요. 꾸준함과 생활 감각이 좋은 편이에요.',
  },
  상관: {
    label: '상관',
    headline: '표현력이 강하고 예민한 성향',
    description: '생각과 감정을 밖으로 잘 드러내요. 틀에 맞지 않으면 답답함을 크게 느낄 수 있어요.',
  },
  편재: {
    label: '편재',
    headline: '기회를 빠르게 잡는 성향',
    description: '현실 감각이 빠르고 상황 판단이 좋아요. 사람과 기회를 넓게 보는 편이에요.',
  },
  정재: {
    label: '정재',
    headline: '현실적이고 관리형인 성향',
    description: '돈, 일정, 생활 운영을 안정적으로 챙기려는 편이에요. 실속과 책임을 중요하게 봐요.',
  },
  편관: {
    label: '편관',
    headline: '압박 속에서도 버티는 성향',
    description: '긴장감이 있어도 책임을 지고 밀고 가는 힘이 있어요. 경쟁 상황에 민감할 수 있어요.',
  },
  정관: {
    label: '정관',
    headline: '책임감과 기준이 분명한 성향',
    description: '원칙, 질서, 신뢰를 중요하게 여겨요. 맡은 역할을 안정적으로 해내려는 편이에요.',
  },
  편인: {
    label: '편인',
    headline: '직감과 해석력이 강한 성향',
    description: '보이지 않는 흐름을 빨리 읽는 편이에요. 혼자 생각을 깊게 가져가는 시간이 중요해요.',
  },
  정인: {
    label: '정인',
    headline: '배우고 이해하려는 성향',
    description: '정보를 받아들이고 정리하는 힘이 좋아요. 안정감 있는 도움과 보호를 중시해요.',
  },
};

const TWELVE_STATE_UI: Record<TwelveStateType, TwelveStateUiMeta> = {
  장생: { label: '장생', headline: '기운이 막 살아나는 상태', description: '새로 시작하는 힘이 있고, 성장 가능성이 크게 열려 있는 단계예요.' },
  목욕: { label: '목욕', headline: '기운이 예민하게 움직이는 상태', description: '변화에 민감하고 주변 자극을 많이 받기 쉬운 단계예요.' },
  관대: { label: '관대', headline: '기운이 점점 커지는 상태', description: '자신감이 붙고 바깥으로 나가려는 힘이 강해지는 단계예요.' },
  건록: { label: '건록', headline: '자기 자리를 잡은 상태', description: '기운이 비교적 안정적으로 자리 잡아서 자기 페이스가 살아나는 단계예요.' },
  제왕: { label: '제왕', headline: '기운이 가장 강한 상태', description: '에너지가 강하게 드러나고 존재감이 커지기 쉬운 단계예요.' },
  쇠: { label: '쇠', headline: '기운이 조금씩 누그러지는 상태', description: '힘이 완전히 꺼진 건 아니지만, 한풀 꺾이며 조절이 필요한 단계예요.' },
  병: { label: '병', headline: '기운이 흔들리는 상태', description: '에너지가 약해지고 컨디션 영향을 많이 받을 수 있는 단계예요.' },
  사: { label: '사', headline: '기운이 거의 멈추는 상태', description: '활동성이 줄고 쉬어가야 할 필요가 커지는 단계예요.' },
  묘: { label: '묘', headline: '기운이 깊이 잠든 상태', description: '겉으로는 조용하지만 안쪽에 쌓여 있는 성향으로 남기 쉬운 단계예요.' },
  절: { label: '절', headline: '기운이 끊어지는 상태', description: '기존 흐름이 약해지고 다른 방식의 전환이 필요한 단계예요.' },
  태: { label: '태', headline: '새 기운이 준비되는 상태', description: '밖으로 드러나진 않지만 다음 흐름을 준비하는 단계예요.' },
  양: { label: '양', headline: '기운이 막 자라려는 상태', description: '아직 작지만 분명히 살아나고 있는 씨앗 같은 단계예요.' },
};

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
  const iljuNarrative = getIljuNarrative(saju.dayPillar);
  const structuredHighlights = buildStructuredHighlights(dayMaster, pillars, branchRelations, iljuNarrative);

  return {
    dayMaster,
    pillars,
    branchRelations,
    highlights,
    structuredHighlights,
    iljuNarrative,
  };
}

export function getStemTenGodUi(tenGod: TenGodType | '일간') {
  if (tenGod === '일간') {
    return {
      label: '일간',
      headline: '나를 대표하는 중심 성향',
      description: '이 칸은 다른 사람과의 관계가 아니라, 사주에서 나 자신을 기준으로 보는 자리예요.',
    };
  }

  return TEN_GOD_UI[tenGod];
}

export function getBranchTenGodUi(tenGod: TenGodType) {
  return TEN_GOD_UI[tenGod];
}

export function getTwelveStateUi(state: TwelveStateType) {
  return TWELVE_STATE_UI[state];
}

export function getPillarConversationUi(pillar: SajuPillarDetail, dayMaster: SajuDetailAnalysis['dayMaster']): PillarConversationUi {
  const stemTone = pillar.key === 'day'
    ? '나를 대표하는 중심 성향'
    : getStemTenGodUi(pillar.stemTenGod).headline;
  const branchTone = getBranchTenGodUi(pillar.branchTenGod).headline;

  if (pillar.key === 'year') {
    return {
      title: '처음 자란 분위기와 시작점',
      summary: `연주는 내가 어떤 배경에서 출발했는지를 보여줘요. 겉으로는 ${stemTone} 쪽 분위기가 깔리고, 안쪽에는 ${branchTone} 같은 기본 반응이 자리 잡기 쉬워요.`,
    };
  }

  if (pillar.key === 'month') {
    return {
      title: '사회에서 보이는 내 모습',
      summary: `월주는 회사나 학교, 사람들 사이에서 보이는 나에 가까워요. 그래서 ${stemTone} 같은 인상이 잘 드러나고, 실제 생활 감각이나 일 처리 방식도 이쪽 색을 많이 타요.`,
    };
  }

  if (pillar.key === 'day') {
    return {
      title: '진짜 내 성격 중심',
      summary: `일주는 사주에서 가장 중요한 자리예요. ${dayMaster.stem}${dayMaster.hanja} 일간이 바로 나 자신을 뜻하고, 겉보다 깊은 기본 성격은 ${branchTone} 쪽으로 나타나기 쉬워요.`,
    };
  }

  return {
    title: '속마음과 나중의 방향',
    summary: `시주는 겉으로 바로 티 나는 모습보다는 속마음이나 시간이 지나며 더 뚜렷해지는 방향을 보여줘요. 안으로는 ${branchTone} 같은 반응이 쌓이고, 나중에는 ${stemTone} 같은 방식으로 힘이 실리기 쉬워요.`,
  };
}

export function getPillarSubtitle(pillar: SajuPillarDetail, dayMaster: SajuDetailAnalysis['dayMaster']): string {
  if (pillar.key === 'year') {
    return '내가 어떤 분위기에서 시작했는지 보여주는 자리';
  }

  if (pillar.key === 'month') {
    const stemTone = getStemTenGodUi(pillar.stemTenGod).headline;
    return `사회에서는 ${stemTone} 쪽으로 보이기 쉬워요.`;
  }

  if (pillar.key === 'day') {
    return `${dayMaster.stem}${dayMaster.hanja} 일간이라, 여기서 진짜 내 성격 중심을 봐요.`;
  }

  return '속마음이나 시간이 갈수록 더 드러나는 면을 보여줘요.';
}

export function getSimpleSajuSummary(detail: SajuDetailAnalysis): SimpleSajuSummary {
  const monthPillar = detail.pillars.find((pillar) => pillar.key === 'month');
  const dayPillar = detail.pillars.find((pillar) => pillar.key === 'day');
  const hourPillar = detail.pillars.find((pillar) => pillar.key === 'hour');
  const { iljuNarrative } = detail;

  const socialTone = monthPillar
    ? getStemTenGodUi(monthPillar.stemTenGod).headline
    : '차분한 분위기';
  const innerTone = dayPillar
    ? getBranchTenGodUi(dayPillar.branchTenGod).headline
    : '자기 색이 뚜렷한 성향';
  const laterTone = hourPillar
    ? getBranchTenGodUi(hourPillar.branchTenGod).headline
    : null;

  return {
    title: `${detail.dayMaster.stem}${detail.dayMaster.hanja} 일간 · ${detail.dayMaster.ohang} 기운 중심`,
    metaphor: iljuNarrative.metaphor,
    lines: [
      `겉으로는 ${socialTone} 쪽으로 보이지만, 안으로는 ${innerTone} 같은 결이 중심을 잡고 있어요.`,
      laterTone
        ? `시간이 지날수록 ${laterTone} 같은 면이 더 뚜렷하게 드러날 수 있어요.`
        : '전체적으로는 자기만의 리듬을 지키며 나아가는 것이 가장 편한 타입으로 읽혀요.',
    ],
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
  const dayPillar = pillars.find((pillar) => pillar.key === 'day');
  const hourPillar = pillars.find((pillar) => pillar.key === 'hour');
  const supportCount = pillars.filter((pillar) => pillar.stemOhang === dayMaster.ohang).length;
  const resourceCount = pillars.filter((pillar) => getTenGod(dayMaster.stem, pillar.stem) === '정인' || getTenGod(dayMaster.stem, pillar.stem) === '편인').length;

  const highlights = [
    `일간은 ${dayMaster.stem}(${dayMaster.ohang})로, 내 성향을 읽을 때 가장 먼저 보는 중심축이에요.`,
  ];

  if (monthPillar) {
    const monthStemMeaning = getStemTenGodUi(monthPillar.stemTenGod);
    highlights.push(`사회에서 보이는 모습은 ${monthStemMeaning.headline} 쪽으로 드러나기 쉬워요.`);
  }

  if (dayPillar) {
    const dayBranchMeaning = getBranchTenGodUi(dayPillar.branchTenGod);
    highlights.push(`진짜 성격의 중심은 ${dayMaster.ohang} 기운 위에 ${dayBranchMeaning.headline} 같은 결이 깔려 있어요.`);
  }

  if (hourPillar) {
    const hourMeaning = getBranchTenGodUi(hourPillar.branchTenGod);
    highlights.push(`시간이 지날수록 ${hourMeaning.headline} 쪽의 면이 더 또렷해질 가능성이 있어요.`);
  }

  if (supportCount >= 2 || resourceCount >= 2) {
    highlights.push('자기 색을 밀고 가는 힘이 있어서, 방향을 잡으면 쉽게 흔들리지 않는 타입이에요.');
  } else {
    highlights.push('환경과 타이밍을 잘 만나야 편하게 풀리는 타입이에요.');
  }

  if (relations.length > 0) {
    highlights.push('사주 안에 충·합·형이 있어서, 흐름이 바뀌는 시기에 변화를 크게 체감할 수 있어요.');
  } else {
    highlights.push('사주 구조가 비교적 안정적이라, 기본 성향이 꾸준히 이어지는 편이에요.');
  }

  return highlights;
}

/* ─────────── 구조화 해석 (스토리텔링) ─────────── */

function buildStructuredHighlights(
  dayMaster: SajuDetailAnalysis['dayMaster'],
  pillars: SajuPillarDetail[],
  relations: BranchRelation[],
  iljuNarrative: IljuNarrative,
): HighlightSection[] {
  const monthPillar = pillars.find((p) => p.key === 'month');
  const dayPillar = pillars.find((p) => p.key === 'day');
  const hourPillar = pillars.find((p) => p.key === 'hour');
  const supportCount = pillars.filter((p) => p.stemOhang === dayMaster.ohang).length;
  const resourceCount = pillars.filter((p) => {
    const tenGod = getTenGod(dayMaster.stem, p.stem);
    return tenGod === '정인' || tenGod === '편인';
  }).length;

  const sections: HighlightSection[] = [];

  /* ── 1. 나는 어떤 사람일까 ── */
  sections.push({
    icon: '✨',
    title: '나는 어떤 사람일까',
    body: iljuNarrative.narrative,
  });

  /* ── 2. 사회에서 보이는 나 ── */
  if (monthPillar) {
    const stemMeta = getStemTenGodUi(monthPillar.stemTenGod);
    const isSameAsDay = monthPillar.stemTenGod === '비견' || monthPillar.stemTenGod === '겁재';

    let socialBody: string;
    if (isSameAsDay) {
      socialBody = `직장이나 사회에서도 자기 색을 또렷하게 드러내는 편이에요. ${stemMeta.description} 주변에서 "좋든 싫든 존재감이 확실한 사람"이라는 인상을 받기 쉬워요.`;
    } else {
      socialBody = `사람들 사이에서는 ${stemMeta.headline} 같은 분위기가 먼저 읽혀요. ${stemMeta.description}`;
    }

    sections.push({
      icon: '🏢',
      title: '사회에서 보이는 나',
      body: socialBody,
    });
  }

  /* ── 3. 내면의 진짜 모습 ── */
  if (dayPillar) {
    const dayBranch = getBranchTenGodUi(dayPillar.branchTenGod);

    sections.push({
      icon: '💭',
      title: '내면의 진짜 모습',
      body: `겉으로 보이는 모습과 달리, 안쪽에서는 ${dayBranch.headline} 같은 반응이 중심에 자리 잡고 있어요. ${dayBranch.description}`,
    });
  }

  /* ── 4. 시간이 지나면 ── */
  if (hourPillar) {
    const hourStemMeta = getStemTenGodUi(hourPillar.stemTenGod);
    const hourBranchMeta = getBranchTenGodUi(hourPillar.branchTenGod);

    sections.push({
      icon: '🔮',
      title: '시간이 지나면',
      body: `나이가 들수록 ${hourStemMeta.headline} 쪽으로 힘이 더 실리게 될 거예요. ${hourStemMeta.description} 안으로는 ${hourBranchMeta.headline} 같은 에너지가 쌓여 있어서, 혼자 있을 때 이 면이 더 잘 느껴질 수 있어요.`,
    });
  }

  /* ── 5. 사주의 힘 밸런스 ── */
  {
    const isDayMasterStrong = supportCount >= 2 || resourceCount >= 2;
    let powerBody: string;
    if (isDayMasterStrong) {
      powerBody = '나를 도와주는 기운이 충분한 편이에요. 자기 색을 밀고 나가는 힘이 있어서, 한번 결심하면 쉽게 흔들리지 않아요. 다만 그 단단함이 때로는 고집으로 보일 수 있으니, 부족한 기운을 의식적으로 채워주면 균형이 더 좋아질 거예요.';
    } else {
      powerBody = '나를 직접 도와주는 기운이 적은 편이에요. 혼자 힘으로 밀어붙이기보다는, 좋은 환경과 사람을 만났을 때 크게 빛나는 타입이에요. 나에게 맞는 장소와 분위기를 찾는 것이 특히 중요한 사주예요.';
    }

    sections.push({
      icon: '⚖️',
      title: '사주의 힘 밸런스',
      body: powerBody,
    });
  }

  return sections;
}
