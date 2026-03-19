/**
 * 만세력 계산 엔진
 * @fullstackfamily/manseryeok 라이브러리 기반
 * - KASI(한국천문연구원) 데이터 기반 정확한 절기 계산
 * - 진태양시 보정 자동 적용 (서울 경도 127도 기준, -32분)
 * - 1900~2050년 지원
 */

import {
  calculateSaju,
  lunarToSolar,
  solarToLunar,
  type SajuResult,
} from '@fullstackfamily/manseryeok';

export type OhangType = '목' | '화' | '토' | '금' | '수';

// 라이브러리의 SajuResult 타입 재익스포트
export type { SajuResult };

// 천간 오행 매핑
export const CHUNGGAN_OHANG: Record<string, OhangType> = {
  갑: '목', 을: '목',
  병: '화', 정: '화',
  무: '토', 기: '토',
  경: '금', 신: '금',
  임: '수', 계: '수',
};

// 지지 오행 매핑
export const JIJI_OHANG: Record<string, OhangType> = {
  자: '수', 축: '토', 인: '목', 묘: '목',
  진: '토', 사: '화', 오: '화', 미: '토',
  신: '금', 유: '금', 술: '토', 해: '수',
};

// 천간 한자 매핑
export const CHUNGGAN_HANJA: Record<string, string> = {
  갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊',
  기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸',
};

// 지지 한자 매핑
export const JIJI_HANJA: Record<string, string> = {
  자: '子', 축: '丑', 인: '寅', 묘: '卯', 진: '辰', 사: '巳',
  오: '午', 미: '未', 신: '申', 유: '酉', 술: '戌', 해: '亥',
};

export interface SajuInput {
  calendarType: 'solar' | 'lunar';   // 양력 / 음력
  isLeapMonth?: boolean;              // 음력 윤달 여부
  year: number;
  month: number;
  day: number;
  hour: number;   // 0~23
  minute: number; // 0~59
  unknownTime: boolean; // 시간 모름 여부
}

export interface SajuPaljaResult {
  saju: SajuResult;
  // 양력으로 변환된 입력값 (음력 입력 시 변환됨)
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  // 음력 정보
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  // 진태양시 보정 정보
  isTimeCorrected: boolean;
  correctedHour?: number;
  correctedMinute?: number;
}

/**
 * 사주팔자 계산 메인 함수
 * - 음력 입력 시 자동으로 양력 변환 후 계산
 * - 진태양시 보정 자동 적용 (서울 127도 기준)
 */
export function calcSajuPalja(input: SajuInput): SajuPaljaResult {
  let solarYear = input.year;
  let solarMonth = input.month;
  let solarDay = input.day;
  let lunarYear = input.year;
  let lunarMonth = input.month;
  let lunarDay = input.day;
  let isLeapMonth = input.isLeapMonth ?? false;

  if (input.calendarType === 'lunar') {
    // 음력 → 양력 변환
    const converted = lunarToSolar(input.year, input.month, input.day, input.isLeapMonth ?? false);
    solarYear = converted.solar.year;
    solarMonth = converted.solar.month;
    solarDay = converted.solar.day;
  } else {
    // 양력 → 음력 정보 조회
    const lunar = solarToLunar(input.year, input.month, input.day);
    lunarYear = lunar.lunar.year;
    lunarMonth = lunar.lunar.month;
    lunarDay = lunar.lunar.day;
    isLeapMonth = lunar.lunar.isLeapMonth;
  }

  const hour = input.unknownTime ? 12 : input.hour; // 시간 모름 = 정오(12시) 기본값
  const minute = input.unknownTime ? 0 : input.minute;

  // 사주팔자 계산 (진태양시 보정 자동 적용, 서울 경도 127도)
  const saju = calculateSaju(solarYear, solarMonth, solarDay, hour, minute, {
    longitude: 127,
    applyTimeCorrection: true,
  });

  return {
    saju,
    solarYear,
    solarMonth,
    solarDay,
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth,
    isTimeCorrected: saju.isTimeCorrected ?? false,
    correctedHour: saju.correctedTime?.hour,
    correctedMinute: saju.correctedTime?.minute,
  };
}

/**
 * 사주 결과에서 오행 개수 집계
 * yearPillar, monthPillar, dayPillar, hourPillar 각 2글자 처리
 */
export function countOhangFromSaju(saju: SajuResult): Record<OhangType, number> {
  const counts: Record<OhangType, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  // 라이브러리가 반환하는 pillar는 "갑자", "을축" 형태의 2글자 한글
  const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];

  for (const pillar of pillars) {
    if (!pillar) continue;
    // 첫 글자 = 천간, 두 번째 글자 = 지지
    const gan = pillar[0];
    const ji = pillar[1];

    if (gan && CHUNGGAN_OHANG[gan]) counts[CHUNGGAN_OHANG[gan]]++;
    if (ji && JIJI_OHANG[ji]) counts[JIJI_OHANG[ji]]++;
  }

  return counts;
}
