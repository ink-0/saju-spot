import type {
  ClimateCondition,
  ConflictRecord,
  ConflictType,
  DayMasterStrength,
  ElementKey,
  InterpretationOutput,
  SajuCoreOutput,
} from '../types';

const STEM_ELEMENT: Record<string, ElementKey> = {
  갑: 'wood', 을: 'wood', 병: 'fire', 정: 'fire', 무: 'earth', 기: 'earth', 경: 'metal', 신: 'metal', 임: 'water', 계: 'water',
};

const GENERATES: Record<ElementKey, ElementKey> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

const CONTROLS: Record<ElementKey, ElementKey> = {
  wood: 'earth',
  fire: 'metal',
  earth: 'water',
  metal: 'wood',
  water: 'fire',
};

const SUPPORTS: Record<ElementKey, ElementKey> = {
  wood: 'water',
  fire: 'wood',
  earth: 'fire',
  metal: 'earth',
  water: 'metal',
};

const CLASHES = new Map<string, string>([
  ['자:오', '감정과 행동의 속도가 충돌하기 쉬운 축이에요.'],
  ['축:미', '안정과 변화 압력이 동시에 걸리기 쉬운 구조예요.'],
  ['인:신', '확장성과 통제 욕구가 부딪히는 흐름이에요.'],
  ['묘:유', '감수성과 현실 판단이 맞서며 예민해질 수 있어요.'],
  ['진:술', '유지와 전환이 동시에 강해 큰 방향 수정이 생길 수 있어요.'],
  ['사:해', '속도와 유연성의 리듬이 자주 엇갈릴 수 있어요.'],
]);

const HARMS = new Map<string, string>([
  ['자:미', '부드러워 보여도 내부 피로가 쌓이기 쉬운 조합이에요.'],
  ['축:오', '정착감과 속도감이 어긋나면서 체감 스트레스가 커질 수 있어요.'],
  ['인:사', '성장 욕구와 현실 압박이 충돌하면서 속앓이가 생기기 쉬워요.'],
  ['묘:진', '관계 조율 비용이 커지고 세밀한 조정이 필요한 흐름이에요.'],
  ['신:해', '계획과 감정선이 자주 어긋나는 편이에요.'],
  ['유:술', '성과를 챙기려는 마음과 현실 여건이 엇갈릴 수 있어요.'],
]);

const COMBINATIONS = new Map<string, string>([
  ['자:축', '기본 운영을 안정시키는 결속력이 생기기 쉬워요.'],
  ['인:해', '성장과 학습에 힘을 싣는 연결이에요.'],
  ['묘:술', '표현과 결과를 이어주는 실무 감각이 붙기 쉬워요.'],
  ['진:유', '정리력과 실무 효율을 끌어올리는 연결이에요.'],
  ['사:신', '판단과 실행 속도가 함께 올라가기 쉬워요.'],
  ['오:미', '활력과 안정이 동시에 보강되는 조합이에요.'],
]);

const PUNISHMENTS = new Map<string, string>([
  ['인:사', '방식 차이로 긴장감이 높아지기 쉬운 형이에요.'],
  ['사:신', '경쟁과 압박이 강해져 피로가 누적될 수 있어요.'],
  ['자:묘', '예민함과 인간관계 피로가 함께 올라오기 쉬워요.'],
  ['축:술', '책임감이 지나치게 단단해져 유연성이 떨어질 수 있어요.'],
  ['미:축', '감정과 현실 계산이 계속 부딪히는 흐름이에요.'],
  ['술:미', '안정 추구가 강해질수록 답답함이 커질 수 있어요.'],
]);

export function runInterpretationEngine(core: SajuCoreOutput): InterpretationOutput {
  const dominantElements = findDominantElements(core.elements);
  const missingElements = findMissingElements(core.elements);
  const dayMaster = STEM_ELEMENT[core.pillars.day.stem];
  const dayMasterStrength = assessDayMasterStrength(core.elements, dayMaster, core.seasonal_context.season);
  const climateCondition = assessClimate(core);
  const conflicts = detectConflicts(core);
  const conclusion = buildConclusion(core, dayMaster, dayMasterStrength, climateCondition, missingElements, dominantElements);

  return {
    layer_a: {
      element_balance: core.elements,
      seasonal_context: core.seasonal_context,
      dominant_elements: dominantElements,
      missing_elements: missingElements,
    },
    layer_b: {
      day_master: dayMaster,
      day_master_strength: dayMasterStrength,
      climate_condition: climateCondition,
      conflicts,
    },
    conclusion,
  };
}

function findDominantElements(elements: Record<ElementKey, number>): ElementKey[] {
  const max = Math.max(...Object.values(elements));
  return Object.entries(elements)
    .filter(([, count]) => count === max)
    .map(([element]) => element as ElementKey);
}

function findMissingElements(elements: Record<ElementKey, number>): ElementKey[] {
  const min = Math.min(...Object.values(elements));
  return Object.entries(elements)
    .filter(([, count]) => count === min)
    .map(([element]) => element as ElementKey);
}

function assessDayMasterStrength(
  elements: Record<ElementKey, number>,
  dayMaster: ElementKey,
  season: SajuCoreOutput['seasonal_context']['season'],
): DayMasterStrength {
  const supportScore = elements[dayMaster] + elements[SUPPORTS[dayMaster]];
  const drainScore = elements[GENERATES[dayMaster]] + elements[CONTROLS[dayMaster]];
  const seasonBonus = getSeasonSupportBonus(dayMaster, season);
  const total = supportScore + seasonBonus - drainScore;

  if (total >= 2) {
    return 'strong';
  }

  if (total <= -1) {
    return 'weak';
  }

  return 'balanced';
}

function getSeasonSupportBonus(dayMaster: ElementKey, season: SajuCoreOutput['seasonal_context']['season']): number {
  if (
    (season === 'spring' && dayMaster === 'wood') ||
    (season === 'summer' && dayMaster === 'fire') ||
    (season === 'autumn' && dayMaster === 'metal') ||
    (season === 'winter' && dayMaster === 'water')
  ) {
    return 1;
  }

  if (dayMaster === 'earth') {
    return 0;
  }

  return 0;
}

function assessClimate(core: SajuCoreOutput): ClimateCondition {
  const { season } = core.seasonal_context;
  const { fire, water, metal, earth } = core.elements;

  if (season === 'winter' || water - fire >= 2) {
    return 'cold';
  }

  if (season === 'summer' || fire - water >= 2) {
    return 'hot';
  }

  if (metal >= 3 && water <= 1) {
    return 'dry';
  }

  if (earth >= 3 || (earth >= 2 && water >= 2)) {
    return 'damp';
  }

  return 'balanced';
}

function detectConflicts(core: SajuCoreOutput): ConflictRecord[] {
  const branches = [
    core.pillars.year.branch,
    core.pillars.month.branch,
    core.pillars.day.branch,
    core.pillars.hour?.branch,
  ].filter((branch): branch is string => Boolean(branch));

  const conflicts: ConflictRecord[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const left = branches[i];
      const right = branches[j];
      const key = [left, right].sort().join(':');
      pushConflict(conflicts, 'combination', left, right, COMBINATIONS.get(key));
      pushConflict(conflicts, 'clash', left, right, CLASHES.get(key));
      pushConflict(conflicts, 'punishment', left, right, PUNISHMENTS.get(key));
      pushConflict(conflicts, 'harm', left, right, HARMS.get(key));
    }
  }

  return conflicts;
}

function pushConflict(
  conflicts: ConflictRecord[],
  type: ConflictType,
  left: string,
  right: string,
  description: string | undefined,
) {
  if (!description) {
    return;
  }

  conflicts.push({
    type,
    pair: [left, right],
    description,
  });
}

function buildConclusion(
  core: SajuCoreOutput,
  dayMaster: ElementKey,
  strength: DayMasterStrength,
  climate: ClimateCondition,
  missingElements: ElementKey[],
  dominantElements: ElementKey[],
) {
  const yongshin = pickYongshin(dayMaster, strength, climate, missingElements);
  const heeshin = unique([
    SUPPORTS[yongshin],
    ...missingElements.filter((element) => element !== yongshin),
  ]).slice(0, 2);
  const avoid = unique([
    ...dominantElements,
    getClimateAggravator(climate),
    strength === 'strong' ? dayMaster : CONTROLS[dayMaster],
  ].filter((element): element is ElementKey => Boolean(element))).filter((element) => element !== yongshin);

  return {
    yongshin,
    heeshin,
    avoid,
    environment_need: buildEnvironmentNeeds(core, yongshin, climate, strength),
  };
}

function pickYongshin(
  dayMaster: ElementKey,
  strength: DayMasterStrength,
  climate: ClimateCondition,
  missingElements: ElementKey[],
): ElementKey {
  if (climate === 'cold') {
    return 'fire';
  }

  if (climate === 'hot') {
    return 'water';
  }

  if (climate === 'dry') {
    return 'water';
  }

  if (climate === 'damp') {
    return 'wood';
  }

  if (strength === 'weak') {
    return missingElements[0] ?? dayMaster;
  }

  if (strength === 'strong') {
    return GENERATES[dayMaster];
  }

  return missingElements[0] ?? SUPPORTS[dayMaster];
}

function buildEnvironmentNeeds(
  core: SajuCoreOutput,
  yongshin: ElementKey,
  climate: ClimateCondition,
  strength: DayMasterStrength,
): string[] {
  const needs = [`Increase ${yongshin}-like conditions in a practical environment.`];

  if (climate === 'cold') {
    needs.push('Prioritize warmth, brightness, and visible activity.');
  } else if (climate === 'hot') {
    needs.push('Prioritize cooling, slower pacing, and recovery-oriented settings.');
  } else if (climate === 'dry') {
    needs.push('Prioritize moisture, flow, and softer spatial texture.');
  } else if (climate === 'damp') {
    needs.push('Prioritize ventilation, movement, and lighter surroundings.');
  }

  if (strength === 'weak') {
    needs.push('Use supportive environments that add stability rather than overstimulation.');
  }

  return needs;
}

function getClimateAggravator(climate: ClimateCondition): ElementKey | null {
  if (climate === 'cold') return 'water';
  if (climate === 'hot') return 'fire';
  if (climate === 'dry') return 'metal';
  if (climate === 'damp') return 'earth';
  return null;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
