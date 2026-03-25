import {
  calculateSaju,
  getSajuMonth,
  lunarToSolar,
  solarToLunar,
} from '@fullstackfamily/manseryeok';
import {
  CHUNGGAN_OHANG,
  JIJI_OHANG,
} from '../manseryeok';
import type {
  ElementKey,
  PillarValue,
  SajuCoreOutput,
  SajuEngineInput,
  SeasonKey,
} from './types';

const OHANG_TO_ELEMENT: Record<string, ElementKey> = {
  목: 'wood',
  화: 'fire',
  토: 'earth',
  금: 'metal',
  수: 'water',
};

const CITY_LONGITUDE: Record<string, number> = {
  seoul: 127,
  busan: 129,
  incheon: 126.7,
  daegu: 128.6,
  daejeon: 127.4,
  gwangju: 126.9,
  ulsan: 129.3,
  jeju: 126.5,
};

export function runSajuCoreEngine(input: SajuEngineInput): SajuCoreOutput {
  const parsed = parseInput(input);

  const solarDate = input.calendar_type === 'lunar'
    ? lunarToSolar(parsed.year, parsed.month, parsed.day, input.leap_month)
    : null;
  const resolvedSolar = solarDate
    ? solarDate.solar
    : { year: parsed.year, month: parsed.month, day: parsed.day };
  const resolvedLunar = input.calendar_type === 'solar'
    ? solarToLunar(parsed.year, parsed.month, parsed.day).lunar
    : { year: parsed.year, month: parsed.month, day: parsed.day, isLeapMonth: input.leap_month };
  const longitude = CITY_LONGITUDE[normalizeLocationKey(input.location)] ?? CITY_LONGITUDE.seoul;

  const saju = calculateSaju(
    resolvedSolar.year,
    resolvedSolar.month,
    resolvedSolar.day,
    parsed.hour,
    parsed.minute,
    {
      longitude,
      applyTimeCorrection: true,
    },
  );

  const sajuMonth = getSajuMonth(resolvedSolar.month, resolvedSolar.day);

  return {
    input,
    normalized: {
      solar_date: formatDate(resolvedSolar.year, resolvedSolar.month, resolvedSolar.day),
      solar_time: formatTime(parsed.hour, parsed.minute),
      lunar_date: formatDate(resolvedLunar.year, resolvedLunar.month, resolvedLunar.day),
      is_leap_month: resolvedLunar.isLeapMonth,
      timezone: 'Asia/Seoul',
      longitude,
      time_corrected: Boolean(saju.isTimeCorrected),
      corrected_time: saju.correctedTime
        ? formatTime(saju.correctedTime.hour, saju.correctedTime.minute)
        : undefined,
    },
    pillars: {
      year: parsePillar(saju.yearPillar),
      month: parsePillar(saju.monthPillar),
      day: parsePillar(saju.dayPillar),
      hour: saju.hourPillar ? parsePillar(saju.hourPillar) : null,
    },
    elements: countElements([saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar]),
    seasonal_context: {
      saju_month: sajuMonth,
      season: getSeasonFromSajuMonth(sajuMonth),
    },
  };
}

function parseInput(input: SajuEngineInput) {
  const [yearText, monthText, dayText] = input.birth_date.split('-');
  const [hourText, minuteText] = input.birth_time.split(':');

  return {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
    hour: Number(hourText),
    minute: Number(minuteText),
  };
}

function parsePillar(pillar: string): PillarValue {
  return {
    stem: pillar[0],
    branch: pillar[1],
  };
}

function countElements(pillars: Array<string | null>): Record<ElementKey, number> {
  const counts: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  for (const pillar of pillars) {
    if (!pillar) {
      continue;
    }

    const stemElement = OHANG_TO_ELEMENT[CHUNGGAN_OHANG[pillar[0]]];
    const branchElement = OHANG_TO_ELEMENT[JIJI_OHANG[pillar[1]]];

    counts[stemElement] += 1;
    counts[branchElement] += 1;
  }

  return counts;
}

function getSeasonFromSajuMonth(sajuMonth: number): SeasonKey {
  if (sajuMonth >= 1 && sajuMonth <= 3) {
    return 'spring';
  }

  if (sajuMonth >= 4 && sajuMonth <= 6) {
    return 'summer';
  }

  if (sajuMonth >= 7 && sajuMonth <= 9) {
    return 'autumn';
  }

  return 'winter';
}

function normalizeLocationKey(location: string): string {
  return location.trim().toLowerCase().replace(/\s+/g, '-');
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
