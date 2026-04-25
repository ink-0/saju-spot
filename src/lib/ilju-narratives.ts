/**
 * 일주(日柱) 메타포 · 내러티브 시스템
 *
 * 천간(10) × 지지(12) = 실제 존재하는 60갑자 일주에 대해
 *  - 메타포 타이틀 (1줄 비유)
 *  - 성격 내러티브 (3~5 문장 스토리텔링)
 *  - 핵심 강점 / 약점
 *  - 실생활 조언
 *
 * 자주 조회되는 일주는 수작업으로 정교하게 작성하고,
 * 나머지는 천간·지지 기본 특성 조합 패턴으로 자동 생성합니다.
 */

import type { OhangType } from './ohang';

/* ─────────────────────── 타입 ─────────────────────── */

export interface IljuNarrative {
  /** 일주 조합 한글 (예: '경자') */
  pillar: string;
  /** 한자 (예: '庚子') */
  hanja: string;
  /** 1줄 비유 타이틀 */
  metaphor: string;
  /** 3~5문장 성격 내러티브 */
  narrative: string;
  /** 핵심 강점 2~3개 */
  strengths: string[];
  /** 핵심 약점 2~3개 */
  weaknesses: string[];
  /** 실생활 1줄 조언 */
  advice: string;
}

/* ─────────────────────── 천간 기본 특성 ─────────────────────── */

interface StemTrait {
  hanja: string;
  ohang: OhangType;
  yinyang: 'yang' | 'yin';
  nature: string;   // 자연 비유
  core: string;     // 핵심 키워드
  persona: string;  // 성격 한 줄
  strength: string;
  weakness: string;
}

const STEM_TRAITS: Record<string, StemTrait> = {
  갑: {
    hanja: '甲', ohang: '목', yinyang: 'yang',
    nature: '큰 나무',
    core: '성장·추진·리더십',
    persona: '곧게 자라는 거목처럼 한번 정한 방향을 묵묵히 밀고 나가는 사람이에요.',
    strength: '끈기와 추진력이 강하고, 어떤 환경에서든 뿌리를 내리는 생존력이 있어요',
    weakness: '유연함이 부족해 고집스러워 보일 수 있고, 남의 조언을 받아들이기 어려울 때가 있어요',
  },
  을: {
    hanja: '乙', ohang: '목', yinyang: 'yin',
    nature: '덩굴·풀',
    core: '적응·유연·섬세',
    persona: '바람에 흔들리며도 부러지지 않는 덩굴처럼, 상황에 맞춰 유연하게 움직이는 사람이에요.',
    strength: '적응력이 뛰어나고 사람과의 관계에서 부드러운 소통 능력이 있어요',
    weakness: '결단의 순간에 우유부단함이 나타나고, 주변 눈치를 너무 볼 수 있어요',
  },
  병: {
    hanja: '丙', ohang: '화', yinyang: 'yang',
    nature: '태양',
    core: '열정·화려·에너지',
    persona: '태양처럼 주변을 환하게 비추는 존재감의 소유자예요. 어디서든 분위기를 끌어올리는 힘이 있어요.',
    strength: '넘치는 열정과 카리스마로 사람을 끌어모으는 힘이 있어요',
    weakness: '지나친 자기 확신으로 독선적이 될 수 있고, 에너지 소모가 심해요',
  },
  정: {
    hanja: '丁', ohang: '화', yinyang: 'yin',
    nature: '촛불·등불',
    core: '따뜻함·집중·섬세',
    persona: '조용히 타오르는 촛불처럼, 겉은 차분해 보이지만 안에는 뜨거운 열정을 품고 있는 사람이에요.',
    strength: '한 가지에 깊이 집중하는 몰입력과 따뜻한 배려심이 있어요',
    weakness: '감정 기복이 있고, 마음에 상처를 쉽게 받을 수 있어요',
  },
  무: {
    hanja: '戊', ohang: '토', yinyang: 'yang',
    nature: '산·대지',
    core: '안정·포용·신뢰',
    persona: '든든한 산처럼 주변에 안정감을 주는 사람이에요. 묵직한 존재감으로 신뢰를 쌓아가는 타입이에요.',
    strength: '넓은 포용력과 흔들리지 않는 중심감이 있어요',
    weakness: '변화를 꺼려 타이밍을 놓칠 수 있고, 지나친 고집이 답답함으로 이어질 수 있어요',
  },
  기: {
    hanja: '己', ohang: '토', yinyang: 'yin',
    nature: '논밭·정원',
    core: '수용·실속·세심',
    persona: '비옥한 텃밭처럼 주어진 환경에서 실속 있게 결실을 맺는 사람이에요. 정리정돈과 관리에 강해요.',
    strength: '실용적 판단력과 꼼꼼한 관리 능력이 뛰어나요',
    weakness: '소심해지기 쉽고, 큰 그림보다 눈앞의 안정에 집착할 수 있어요',
  },
  경: {
    hanja: '庚', ohang: '금', yinyang: 'yang',
    nature: '원석·강철',
    core: '결단·의지·날카로움',
    persona: '세상 밖으로 나온 원석 같은 사람이에요. 거친 겉모습 속에 날카로운 판단력과 의지가 숨어 있어요.',
    strength: '결단력이 강하고 상황을 빠르게 꿰뚫는 분석력이 있어요',
    weakness: '직설적인 표현이 주변을 날카롭게 만들 수 있고, 타협이 어려운 편이에요',
  },
  신: {
    hanja: '辛', ohang: '금', yinyang: 'yin',
    nature: '보석·가위',
    core: '정교·예민·심미',
    persona: '세공된 보석처럼 정교하고 예민한 감각의 소유자예요. 아름다움과 완성도에 대한 기준이 높아요.',
    strength: '섬세한 미적 감각과 정밀한 작업 능력이 있어요',
    weakness: '완벽주의로 스트레스를 많이 받고, 자신과 타인 모두에게 엄격해질 수 있어요',
  },
  임: {
    hanja: '壬', ohang: '수', yinyang: 'yang',
    nature: '바다·큰 강',
    core: '지혜·포용·흐름',
    persona: '넓은 바다처럼 어떤 것이든 받아들이는 포용력이 있어요. 상황을 크게 보고 흐름을 읽는 힘이 있어요.',
    strength: '지적 호기심과 넓은 시야로 큰 그림을 그리는 능력이 있어요',
    weakness: '생각이 너무 많아 실행이 느려지고, 한 곳에 정착하기 어려울 수 있어요',
  },
  계: {
    hanja: '癸', ohang: '수', yinyang: 'yin',
    nature: '빗물·이슬',
    core: '감성·직관·침투',
    persona: '이슬처럼 조용히 스며드는 사람이에요. 겉은 잔잔하지만 깊은 곳까지 닿는 직관과 감성이 있어요.',
    strength: '직관력이 뛰어나고, 사람의 마음을 읽는 공감 능력이 있어요',
    weakness: '불안감이 높고, 혼자 감정을 삼키며 지칠 수 있어요',
  },
};

/* ─────────────────────── 지지 기본 특성 ─────────────────────── */

interface BranchTrait {
  hanja: string;
  ohang: OhangType;
  animal: string;
  nature: string;
  energy: string;
  innerTrait: string;
}

const BRANCH_TRAITS: Record<string, BranchTrait> = {
  자: { hanja: '子', ohang: '수', animal: '쥐', nature: '한밤의 물', energy: '지혜와 민첩함', innerTrait: '영리하고 눈치가 빨라요. 하지만 속마음을 잘 드러내지 않아서 가까운 사람조차 진심을 파악하기 어려울 때가 있어요' },
  축: { hanja: '丑', ohang: '토', animal: '소', nature: '새벽의 땅', energy: '묵직한 인내', innerTrait: '느리지만 확실하게 움직여요. 한번 시작하면 끝까지 밀고 가는 끈기가 있지만, 속도감이 필요한 순간에는 답답할 수 있어요' },
  인: { hanja: '寅', ohang: '목', animal: '호랑이', nature: '이른 아침의 숲', energy: '도전과 확장', innerTrait: '야망이 크고 도전을 두려워하지 않아요. 리더십이 자연스럽게 드러나지만, 성급한 판단이 독이 될 때가 있어요' },
  묘: { hanja: '卯', ohang: '목', animal: '토끼', nature: '봄의 새싹', energy: '부드러운 성장', innerTrait: '사교적이고 분위기를 잘 읽어요. 갈등 상황을 부드럽게 풀어가지만, 결정적 순간에 물러서는 경향이 있어요' },
  진: { hanja: '辰', ohang: '토', animal: '용', nature: '봄비 머금은 흙', energy: '변화와 잠재력', innerTrait: '큰 스케일의 상상력이 있어요. 아이디어가 풍부하지만, 현실과의 간극을 좁히는 게 과제예요' },
  사: { hanja: '巳', ohang: '화', animal: '뱀', nature: '한낮의 불꽃', energy: '집중과 변신', innerTrait: '통찰력이 깊고 한 가지에 몰두하면 놀라운 결과를 내요. 하지만 의심이 많아 사람을 완전히 믿기까지 시간이 걸려요' },
  오: { hanja: '午', ohang: '화', animal: '말', nature: '정오의 태양', energy: '열정과 행동력', innerTrait: '에너지가 넘치고 행동이 빨라요. 하지만 지나친 속도감이 실수로 이어지거나, 주변과 보조를 맞추기 어려울 수 있어요' },
  미: { hanja: '未', ohang: '토', animal: '양', nature: '여름 오후의 들판', energy: '온화한 끈기', innerTrait: '겉은 온순하지만 속에는 자기만의 고집이 있어요. 사람을 편안하게 만드는 분위기가 있지만, 속마음을 드러내기까지 시간이 걸려요' },
  신: { hanja: '申', ohang: '금', animal: '원숭이', nature: '가을의 서늘한 바람', energy: '재치와 변화', innerTrait: '머리 회전이 빠르고 다재다능해요. 여러 가지를 동시에 잘 처리하지만, 한 곳에 깊이 뿌리내리기 어려울 수 있어요' },
  유: { hanja: '酉', ohang: '금', animal: '닭', nature: '석양의 빛', energy: '정밀한 판단', innerTrait: '분석력이 뛰어나고 기준이 명확해요. 자기 원칙을 잘 지키지만, 융통성 없이 느껴질 수 있어요' },
  술: { hanja: '戌', ohang: '토', animal: '개', nature: '저녁의 흙', energy: '충성과 의지', innerTrait: '한번 맺은 관계에 진심이에요. 의리와 정의감이 강하지만, 배신에 상처를 크게 받고 용서가 어려운 편이에요' },
  해: { hanja: '亥', ohang: '수', animal: '돼지', nature: '밤의 깊은 물', energy: '포용과 에너지', innerTrait: '넉넉하고 인정이 많아요. 베풀기를 좋아하지만, 그 과정에서 자신을 챙기지 못할 때가 있어요' },
};

/* ─────────────────────── 수작업 일주 내러티브 ─────────────────────── */

const CURATED_NARRATIVES: Record<string, IljuNarrative> = {
  경자: {
    pillar: '경자', hanja: '庚子',
    metaphor: '겨울 호수 위에서 벼려진 서리 칼날',
    narrative: '경금(庚金)의 날카로운 결단력에 자수(子水)의 영리한 지혜가 만난 조합이에요. 마치 얼어붙은 호수 위에서 달빛을 받아 번쩍이는 칼날처럼, 겉으로는 차갑고 날카로워 보이지만 그 안에는 상황을 정확히 꿰뚫는 예리한 통찰이 숨어 있어요. 사람들 앞에서 쉽게 감정을 드러내지 않지만, 한번 마음을 열면 누구보다 깊은 신뢰를 주는 사람이에요. 머리 회전이 빠르고 분석력이 뛰어나서 복잡한 상황일수록 빛을 발하는 타입이에요. 다만 그 날카로움이 때로는 주변 사람에게 벽처럼 느껴질 수 있어서, 따뜻한 한 마디를 의식적으로 건네는 연습이 필요해요.',
    strengths: ['복잡한 상황을 빠르게 읽는 전략적 사고', '감정에 휘둘리지 않는 냉정한 판단력', '맡은 일은 끝까지 해내는 책임감'],
    weaknesses: ['차가운 인상 때문에 다가가기 어렵다는 오해를 받을 수 있어요', '완벽을 추구하다 자신도 주변도 지치게 만들 수 있어요'],
    advice: '차가운 칼날에 예쁜 칼집을 입혀주듯, 부드러운 표현을 연습해 보세요. 당신의 진심이 전해질 때 관계가 한층 깊어질 거예요.',
  },
  갑자: {
    pillar: '갑자', hanja: '甲子',
    metaphor: '깊은 밤 물가에서 싹을 틔운 거목의 씨앗',
    narrative: '갑목(甲木)의 뻗어나가는 성장력에 자수(子水)의 깊은 지혜가 뿌리를 내려준 조합이에요. 어둠 속에서도 방향을 잃지 않는 나침반 같은 내면의 힘이 있어요. 남들이 주저할 때 먼저 움직이는 개척정신이 있지만, 혼자 앞서가다 보면 외로움을 느낄 수 있어요. 물은 나무를 키우는 자양분이 되듯, 자수의 지지가 갑목의 성장을 끊임없이 밀어주기 때문에 시간이 갈수록 점점 더 단단해지는 사람이에요. 앞만 보고 달리기보다 가끔 뒤돌아 함께 가는 사람들을 챙기면 더 크게 성장할 수 있어요.',
    strengths: ['흔들리지 않는 내면의 방향감각', '시간이 갈수록 성장하는 잠재력', '어려운 상황에서도 길을 찾아내는 개척정신'],
    weaknesses: ['혼자 결정하고 혼자 움직이려는 경향', '도움을 요청하는 것이 어색하고 불편해요'],
    advice: '혼자 앞서가기보다, 옆 사람에게 손을 내밀어 보세요. 함께 걸을 때 당신의 숲은 더 울창해질 거예요.',
  },
  을축: {
    pillar: '을축', hanja: '乙丑',
    metaphor: '얼어붙은 땅 위에서 봄을 기다리는 겨울 새싹',
    narrative: '을목(乙木)의 유연한 생명력이 축토(丑土)의 차갑지만 단단한 토양 위에 자리 잡은 모습이에요. 겉으로 보기엔 화려하지 않지만, 조용히 때를 기다리며 내실을 다지는 인내의 사람이에요. 주변 환경이 힘들어도 포기하지 않고, 뿌리 깊게 자리를 잡아가는 끈기가 최대 강점이에요. 사회적으로는 튀지 않으려 하지만, 가까운 곳에서 묵묵히 자기 역할을 해내는 진짜 실력파예요. 다만 너무 참기만 하면 마음에 서리가 내릴 수 있으니, 따뜻한 사람들 곁에서 감정을 나누는 시간이 꼭 필요해요.',
    strengths: ['어려운 환경에서도 꺾이지 않는 끈기', '내실 있게 준비하는 실력', '소수의 관계를 깊게 가져가는 진심'],
    weaknesses: ['감정 표현이 서투르고, 혼자 삼키는 습관이 있어요', '기회가 와도 자신을 과소평가해 망설이는 경향이 있어요'],
    advice: '봄은 반드시 와요. 지금 힘들더라도 당신이 쌓아온 뿌리는 절대 헛되지 않을 거예요. 때가 되면 가장 아름답게 피어날 사람이에요.',
  },
  병인: {
    pillar: '병인', hanja: '丙寅',
    metaphor: '이른 아침 숲속을 비추는 첫 햇살',
    narrative: '병화(丙火)의 강렬한 에너지에 인목(寅木)의 활기찬 도전정신이 합쳐진 조합이에요. 아침 숲에 떠오르는 태양처럼 어디에서든 존재감이 뚜렷하고, 주변에 생기를 불어넣는 사람이에요. 말보다 행동이 앞서고, 틀에 갇히는 것을 싫어해요. 목(木)이 불(火)을 지피듯 자신의 에너지를 스스로 충전하는 힘이 있어, 한번 달리기 시작하면 멈추기 어려울 정도로 강한 추진력을 보여줘요. 다만 주위와 보폭을 맞추는 배려가 있으면 빛이 더 멀리까지 닿을 수 있어요.',
    strengths: ['타고난 리더십과 추진력', '위기 상황에서 빛나는 결단력', '주변에 에너지를 나눠주는 밝은 분위기'],
    weaknesses: ['혼자서 뛰어나가 동료와 속도차가 벌어질 수 있어요', '지나친 의욕이 번아웃으로 이어질 수 있어요'],
    advice: '가끔은 숲 한가운데 멈춰 서서 그늘도 만들어 주세요. 당신의 따스함에 쉬어가고 싶은 사람이 분명 있을 거예요.',
  },
  정축: {
    pillar: '정축', hanja: '丁丑',
    metaphor: '겨울밤 창가에 놓인 따스한 촛불 한 자루',
    narrative: '정화(丁火)의 부드러운 불꽃이 축토(丑土)의 차갑고 단단한 밤 위에 자리 잡은 모습이에요. 화려하지는 않지만, 어둠 속에서 작은 빛 하나로 주변을 따뜻하게 느끼게 해주는 사람이에요. 세상 일에 깊이 감정을 느끼고, 한번 마음을 준 사람에게는 끝까지 곁을 지키려는 따뜻한 충성심이 있어요. 겉은 조용하지만 속에서는 끈끈한 정이 항상 타오르고 있어요. 다만 자기 감정을 너무 혼자 삼키면 안에서 그을음이 생길 수 있으니, 신뢰할 수 있는 사람에게는 속마음을 보여주세요.',
    strengths: ['조용하지만 깊은 정서적 유대감', '혼란 속에서도 중심을 잡는 내면의 단단함', '디테일을 놓치지 않는 세심한 관찰력'],
    weaknesses: ['감정을 안으로 삼키면서 내면의 소모가 커질 수 있어요', '쉽게 마음을 열지 않아 기회를 놓치기도 해요'],
    advice: '남에게 건네는 따뜻함을 나에게도 한 스푼 나눠주세요. 당신의 불꽃은 당신이 돌봐야 가장 오래 탈 수 있어요.',
  },
  임인: {
    pillar: '임인', hanja: '壬寅',
    metaphor: '숲 사이를 흐르는 거칠고 생명력 넘치는 계곡물',
    narrative: '임수(壬水)의 넓은 포용력에 인목(寅木)의 강한 성장 에너지가 합쳐진 조합이에요. 물이 나무를 키우듯, 자신의 지혜와 자원을 아낌없이 쏟아 무언가를 성장시키는 데 능한 사람이에요. 규모 큰 프로젝트나 새로운 도전 앞에서 오히려 눈이 빛나고, 안주하는 것을 답답하게 느껴요. 리더십과 배려가 동시에 있어서 사람들이 자연스럽게 따르는 편이에요. 다만 에너지가 분산되기 쉬우니, 한 번에 하나씩 깊이 파는 연습이 필요해요.',
    strengths: ['아이디어를 현실로 만드는 실행력', '사람을 키우고 조직을 만드는 리더십', '지적 호기심과 배움에 대한 열정'],
    weaknesses: ['여러 일을 동시에 벌여 에너지가 분산될 수 있어요', '한 곳에 정착하기보다 계속 새로운 것을 찾아 떠나려 해요'],
    advice: '계곡물이 바다에 닿으려면 한 방향으로 꾸준히 흘러야 해요. 가장 설레는 한 가지에 물길을 모아보세요.',
  },
};

/* ─────────────────────── 자동 생성 로직 ─────────────────────── */

/**
 * 천간 + 지지 기본 특성의 상호작용을 반영한 자동 내러티브 생성
 */
function generateNarrative(stem: string, branch: string): IljuNarrative {
  const st = STEM_TRAITS[stem];
  const br = BRANCH_TRAITS[branch];
  if (!st || !br) {
    return fallback(stem, branch);
  }

  // 상생/상극 관계 파악
  const generates: Record<OhangType, OhangType> = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
  const controls: Record<OhangType, OhangType> = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };

  const stemGeneratesBranch = generates[st.ohang] === br.ohang;
  const branchGeneratesStem = generates[br.ohang] === st.ohang;
  const stemControlsBranch = controls[st.ohang] === br.ohang;
  const branchControlsStem = controls[br.ohang] === st.ohang;
  const sameElement = st.ohang === br.ohang;

  // 메타포 조합
  let metaphor: string;
  let relationNarrative: string;

  if (branchGeneratesStem) {
    metaphor = `${br.nature}이 키워낸 ${st.nature}의 기운`;
    relationNarrative = `${br.animal}의 ${br.energy}이 ${st.nature}의 힘을 끊임없이 밀어주는 구조예요. 안에서 올라오는 지지 덕분에 시간이 갈수록 더 단단해지는 사람이에요. 기반이 탄탄하니 자신감 있게 나아갈 수 있지만, 그 안정감에 안주하지 않는 것이 중요해요.`;
  } else if (stemGeneratesBranch) {
    metaphor = `${st.nature}이 ${br.nature}을 피워낸 형상`;
    relationNarrative = `${st.nature}의 에너지가 ${br.animal}의 ${br.energy} 쪽으로 자연스럽게 흘러가는 구조예요. 자기 에너지를 밖으로 표현하고 나누는 데 능하지만, 자신을 돌보는 시간도 반드시 필요한 사람이에요.`;
  } else if (stemControlsBranch) {
    metaphor = `${st.nature}이 ${br.nature}을 다스리는 구도`;
    relationNarrative = `내면의 ${br.energy}을 ${st.nature}의 의지로 통제하려는 긴장감이 깔려 있어요. 자기 관리에는 강하지만, 가끔은 내면의 욕구를 억누르느라 에너지가 소모될 수 있어요. 완벽하게 통제하기보다 적정선에서 풀어주는 유연함이 필요해요.`;
  } else if (branchControlsStem) {
    metaphor = `${br.nature} 속에서 단련되는 ${st.nature}`;
    relationNarrative = `외부 환경이 나를 시험하고 단련시키는 구조예요. 쉽지 않은 조건 속에서 강해지는 사람이라, 역경을 겪을수록 오히려 빛나는 면이 있어요. 다만 지나친 긴장감은 스스로를 갉아먹을 수 있으니, 쉼의 균형이 필요해요.`;
  } else if (sameElement) {
    metaphor = `${st.nature}과 ${br.nature}이 어우러진 순수한 기운`;
    relationNarrative = `같은 계열의 에너지가 겹치면서 순수하고 강한 기질이 나타나요. 자기 색이 뚜렷하고 일관성이 있어 신뢰를 주지만, 다양성이 부족할 수 있어 다른 기운을 의식적으로 채워주는 게 좋아요.`;
  } else {
    metaphor = `${st.nature}과 ${br.nature}이 만나 빚어내는 독특한 조화`;
    relationNarrative = `서로 다른 성질의 에너지가 공존하면서 다채로운 면모를 만들어내요. 상황에 따라 전혀 다른 모습을 보여주기도 해서, 주변에서 '알다가도 모르겠다'는 말을 들을 수 있어요.`;
  }

  const narrative = [
    `${st.hanja}(${st.ohang})의 ${st.core} 특성에 ${br.hanja}(${br.ohang})의 ${br.energy}이 결합된 일주예요.`,
    st.persona,
    `안쪽에는 ${br.innerTrait}.`,
    relationNarrative,
  ].join(' ');

  return {
    pillar: `${stem}${branch}`,
    hanja: `${st.hanja}${br.hanja}`,
    metaphor,
    narrative,
    strengths: [st.strength, `${br.animal}의 ${br.energy}에서 오는 내면의 힘이 있어요`],
    weaknesses: [st.weakness, `${br.innerTrait.split('.')[0]}에서 오는 내적 긴장이 있을 수 있어요`],
    advice: generateAdvice(st, br),
  };
}

function generateAdvice(st: StemTrait, br: BranchTrait): string {
  const generates: Record<OhangType, OhangType> = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
  if (generates[br.ohang] === st.ohang) {
    return `내면의 뿌리가 단단한 만큼, 그 힘을 믿고 한 걸음 더 나아가 보세요. 당신의 잠재력은 아직 다 발현되지 않았을지도 몰라요.`;
  }
  if (generates[st.ohang] === br.ohang) {
    return `에너지를 밖으로 쏟는 만큼, 자신을 채우는 시간도 꼭 가져보세요. 멈춰 서는 것도 성장의 일부예요.`;
  }
  return `자신의 고유한 리듬을 지키면서도, 다른 기운을 받아들이는 열린 자세가 있으면 더 풍요로운 삶이 펼쳐질 거예요.`;
}

function fallback(stem: string, branch: string): IljuNarrative {
  return {
    pillar: `${stem}${branch}`,
    hanja: `${STEM_TRAITS[stem]?.hanja ?? stem}${BRANCH_TRAITS[branch]?.hanja ?? branch}`,
    metaphor: '자연의 기운이 어우러진 고유한 조합',
    narrative: '각기 다른 성질의 기운이 만나 독특한 개성을 만들어내는 일주예요. 자기만의 리듬으로 세상과 소통하는 사람이에요.',
    strengths: ['자기만의 고유한 개성', '다양한 상황에 대처하는 적응력'],
    weaknesses: ['자신의 장점을 충분히 활용하지 못할 때가 있어요'],
    advice: '자신의 리듬을 믿고, 자기만의 속도로 걸어가 보세요.',
  };
}

/* ─────────────────────── 외부 API ─────────────────────── */

/**
 * 일주 문자열로 내러티브를 가져옵니다.
 * @param pillar "경자" 같은 2글자 일주 문자열
 */
export function getIljuNarrative(pillar: string): IljuNarrative {
  if (CURATED_NARRATIVES[pillar]) {
    return CURATED_NARRATIVES[pillar];
  }
  const stem = pillar[0];
  const branch = pillar[1];
  return generateNarrative(stem, branch);
}

/**
 * 일주 메타포를 포함한 히어로 카피를 생성합니다.
 */
export function getIljuHeroCopy(pillar: string, lackingOhang: OhangType[]): {
  title: string;
  subtitle: string;
} {
  const narrative = getIljuNarrative(pillar);
  const lackingNames: Record<OhangType, string> = {
    목: '성장의 기운', 화: '열정의 불꽃', 토: '안정의 대지',
    금: '결단의 칼날', 수: '흐름의 물결',
  };

  if (lackingOhang.length === 0) {
    return {
      title: narrative.metaphor,
      subtitle: '오행이 비교적 균형 잡혀 있어요. 지금의 흐름을 잘 유지하면서, 자기 리듬에 맞는 환경을 찾아보세요.',
    };
  }

  const lackingText = lackingOhang.map((o) => lackingNames[o]).join('과 ');
  return {
    title: narrative.metaphor,
    subtitle: `${lackingText}을 채워주면 당신의 사주가 한층 더 빛날 수 있어요.`,
  };
}

export { STEM_TRAITS, BRANCH_TRAITS };
