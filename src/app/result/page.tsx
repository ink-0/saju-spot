'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  calcSajuPalja,
  countOhangFromSaju,
  CHUNGGAN_OHANG,
  JIJI_OHANG,
  type SajuPaljaResult,
} from '@/lib/manseryeok';
import {
  analyzeOhang,
  prioritizeLacking,
  type OhangAnalysis,
  OHANG_DESIGN_COLOR,
  OHANG_DESIGN_THEME,
  OHANG_ORDER,
  OHANG_EMOJI,
  OHANG_KEYWORDS,
  OHANG_LACKING_DESC,
  OHANG_EXCESS_DESC,
  OHANG_HANJA,
  type OhangDesignThemeToken,
  getPersonalizedLackingDesc,
} from '@/lib/ohang';
import {
  getRecommendedSpots,
  getAvoidanceSpots,
  type OhangSpots,
  type Spot,
} from '@/lib/spots';
import type { GroupedRecommendationOutput, RecommendationResult } from '@/lib/recommendation';
import type { OhangType } from '@/lib/ohang';
import {
  analyzeSajuDetails,
  getPillarSubtitle,
  getSimpleSajuSummary,
  getTwelveStateUi,
  type SajuDetailAnalysis,
  type HighlightSection,
} from '@/lib/saju-analysis';

const RESULT_HERO_COPY: Record<OhangType, { title: string; accent: string; subtitle: string }> = {
  목: {
    title: '목 기운이 부족해요',
    accent: '생기를 채워보세요',
    subtitle: '나무, 바람, 확장감 있는 장소가 정체된 기운에 활력을 더해줘요.',
  },
  화: {
    title: '화 기운이 부족해요',
    accent: '온기를 채워보세요',
    subtitle: '햇살, 활기, 밝은 에너지가 있는 장소가 가라앉은 기운을 따뜻하게 깨워줘요.',
  },
  토: {
    title: '토 기운이 부족해요',
    accent: '중심을 채워보세요',
    subtitle: '흙길, 산책, 단단한 풍경이 있는 장소가 흐트러진 기운을 안정시켜줘요.',
  },
  금: {
    title: '금 기운이 부족해요',
    accent: '정돈을 채워보세요',
    subtitle: '맑고 정제된 분위기의 장소가 흐릿한 기운을 또렷하게 정리해줘요.',
  },
  수: {
    title: '수 기운이 부족해요',
    accent: '흐름을 채워보세요',
    subtitle: '넓은 시야, 물결, 바람이 있는 장소가 막힌 기운을 부드럽게 풀어줘요.',
  },
};

export default function ResultPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [apiRecommendations, setApiRecommendations] = useState<RecommendationResult[]>([]);
  const [apiGroupedRecommendations, setApiGroupedRecommendations] = useState<GroupedRecommendationOutput[]>([]);
  const [apiRecommendationSource, setApiRecommendationSource] = useState<'external' | 'fallback' | null>(null);
  const [apiRecommendationQuery, setApiRecommendationQuery] = useState('');
  const [apiRecommendationLoading, setApiRecommendationLoading] = useState(false);
  const [apiRecommendationError, setApiRecommendationError] = useState('');
  const calculation = useMemo<{
    result: SajuPaljaResult | null;
    analysis: OhangAnalysis | null;
    detailAnalysis: SajuDetailAnalysis | null;
    spots: OhangSpots[];
    avoidSpots: OhangSpots[];
    calcError: string;
    shouldRedirect: boolean;
  }>(() => {
    try {
      const calendarType = (params.get('calendarType') || 'solar') as 'solar' | 'lunar';
      const year = parseInt(params.get('year') || '0');
      const month = parseInt(params.get('month') || '0');
      const day = parseInt(params.get('day') || '0');
      const hour = parseInt(params.get('hour') || '12');
      const minute = parseInt(params.get('minute') || '0');
      const unknownTime = params.get('unknownTime') === 'true';
      const isLeapMonth = params.get('isLeapMonth') === 'true';

      if (!year || !month || !day) {
        return {
          result: null,
          analysis: null,
          detailAnalysis: null,
          spots: [],
          avoidSpots: [],
          calcError: '',
          shouldRedirect: true,
        };
      }

      const paljaResult = calcSajuPalja({
        calendarType,
        isLeapMonth,
        year,
        month,
        day,
        hour,
        minute,
        unknownTime,
      });

      const counts = countOhangFromSaju(paljaResult.saju);
      const rawAnalysis = analyzeOhang(counts);
      const detailResult = analyzeSajuDetails(paljaResult.saju);

      // 부족한 오행 우선순위 계산 (일간 오행 + 사주월 기반)
      const dayMasterOhang = detailResult.dayMaster.ohang;
      const sajuMonth = paljaResult.saju.monthPillar
        ? (['인', '묘'].includes(paljaResult.saju.monthPillar[1]) ? 1
          : ['진', '사'].includes(paljaResult.saju.monthPillar[1]) ? 3
            : ['오', '미'].includes(paljaResult.saju.monthPillar[1]) ? 5
              : ['신', '유'].includes(paljaResult.saju.monthPillar[1]) ? 7
                : ['술', '해'].includes(paljaResult.saju.monthPillar[1]) ? 9
                  : ['자', '축'].includes(paljaResult.saju.monthPillar[1]) ? 11
                    : 1)
        : 1;
      const analysisResult = prioritizeLacking(rawAnalysis, dayMasterOhang, sajuMonth);

      return {
        result: paljaResult,
        analysis: analysisResult,
        detailAnalysis: detailResult,
        spots: getRecommendedSpots(analysisResult.prioritizedLacking),
        avoidSpots: getAvoidanceSpots(analysisResult.excess),
        calcError: '',
        shouldRedirect: false,
      };
    } catch (err) {
      return {
        result: null,
        analysis: null,
        detailAnalysis: null,
        spots: [],
        avoidSpots: [],
        calcError: `계산 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
        shouldRedirect: false,
      };
    }
  }, [params]);

  useEffect(() => {
    if (calculation.shouldRedirect) {
      router.push('/');
    }
  }, [calculation.shouldRedirect, router]);

  useEffect(() => {
    if (!calculation.result || calculation.calcError) {
      return;
    }

    const timer = window.setTimeout(() => setReady(true), 100);

    return () => window.clearTimeout(timer);
  }, [calculation.calcError, calculation.result]);

  const { result, analysis, detailAnalysis, spots, avoidSpots, calcError } = calculation;

  useEffect(() => {
    if (!result || !analysis) {
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setApiRecommendationLoading(true);
        setApiRecommendationError('');

        const calendarType = (params.get('calendarType') || 'solar') as 'solar' | 'lunar';
        const year = parseInt(params.get('year') || '0');
        const month = parseInt(params.get('month') || '0');
        const day = parseInt(params.get('day') || '0');
        const hour = parseInt(params.get('hour') || '12');
        const minute = parseInt(params.get('minute') || '0');
        const leapMonth = params.get('isLeapMonth') === 'true';

        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            birth_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            birth_time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            calendar_type: calendarType,
            leap_month: leapMonth,
            location: '서울',
          }),
        });

        if (!response.ok) {
          throw new Error('추천 데이터를 불러오지 못했어요.');
        }

        const data = await response.json() as {
          source: 'external' | 'fallback';
          provider_status: 'success' | 'partial' | 'empty' | 'failed';
          query_keyword: string;
          recommendation: {
            recommendations: RecommendationResult[];
          };
          grouped_recommendations: GroupedRecommendationOutput[];
        };

        setApiRecommendationSource(data.source);
        setApiRecommendationQuery(data.query_keyword);
        setApiRecommendations(data.recommendation.recommendations);
        setApiGroupedRecommendations(data.grouped_recommendations);
        setApiRecommendationError(
          data.source === 'fallback'
            ? data.provider_status === 'empty'
              ? '실시간으로 찾은 명소가 지금 조건과 딱 맞지 않아 기본 추천을 함께 보여드려요.'
              : data.provider_status === 'failed'
                ? '외부 명소 데이터를 잠시 불러오지 못해 기본 추천을 먼저 보여드려요.'
                : ''
            : '',
        );
      } catch (error) {
        setApiRecommendationError(error instanceof Error ? error.message : '추천 데이터를 불러오지 못했어요.');
        setApiRecommendationSource(null);
        setApiRecommendations([]);
        setApiGroupedRecommendations([]);
      } finally {
        setApiRecommendationLoading(false);
      }
    };

    void fetchRecommendations();
  }, [analysis, params, result]);

  if (calcError) {
    return (
      <main className="gradient-bg min-h-screen flex items-center justify-center px-4">
        <div className="result-card rounded-2xl p-8 text-center max-w-sm">
          <p className="text-2xl mb-4">⚠️</p>
          <p className="text-[#c85b54] mb-4">{calcError}</p>
          <button onClick={() => router.push('/')} className="text-[#8f7347] underline">
            다시 시도하기
          </button>
        </div>
      </main>
    );
  }

  if (!result || !analysis || !detailAnalysis) {
    return (
      <main className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="spinner w-12 h-12 mx-auto" />
          <p className="text-[#786f67]">사주 분석 중...</p>
        </div>
      </main>
    );
  }

  const { saju, isTimeCorrected, correctedHour, correctedMinute } = result;
  const simpleSummary = getSimpleSajuSummary(detailAnalysis);
  const hasLacking = analysis.prioritizedLacking.length > 0;
  const primaryThemeOhang = analysis.prioritizedLacking[0] ?? analysis.dominant ?? '토';
  const primaryTheme = OHANG_DESIGN_THEME[primaryThemeOhang];
  const heroCopy = hasLacking
    ? RESULT_HERO_COPY[primaryThemeOhang]
    : {
      title: '오행이 비교적 균형 잡혀 있어요',
      accent: '지금의 균형을 이어가보세요',
      subtitle: '전체 흐름은 안정적이에요. 지금 잘 맞는 환경을 유지하면서 필요한 기운만 가볍게 보완해보세요.',
    };
  const themeStyle: CSSProperties = {
    ['--theme-page-bg' as string]: primaryTheme.pageBg,
    ['--theme-hero-start' as string]: primaryTheme.heroStart,
    ['--theme-orb' as string]: primaryTheme.orb,
    ['--theme-surface' as string]: primaryTheme.surface,
    ['--theme-surface-alt' as string]: primaryTheme.surfaceAlt,
    ['--theme-border' as string]: primaryTheme.border,
    ['--theme-text' as string]: primaryTheme.text,
    ['--theme-muted' as string]: primaryTheme.muted,
    ['--theme-accent-soft' as string]: primaryTheme.accentSoft,
    ['--theme-accent-strong' as string]: primaryTheme.accentStrong,
    ['--theme-pill-bg' as string]: primaryTheme.pillBg,
    ['--theme-shadow' as string]: primaryTheme.shadow,
  };

  // 사주 4기둥 파싱
  const pillars = [
    { label: '연주', pillar: saju.yearPillar, hanja: saju.yearPillarHanja },
    { label: '월주', pillar: saju.monthPillar, hanja: saju.monthPillarHanja },
    { label: '일주', pillar: saju.dayPillar, hanja: saju.dayPillarHanja },
    { label: '시주', pillar: saju.hourPillar, hanja: saju.hourPillarHanja },
  ];

  return (
    <main className="result-shell min-h-screen px-4 py-12 max-w-2xl mx-auto" style={themeStyle}>
      <button
        onClick={() => router.push('/')}
        className="mb-8 result-muted transition-colors flex items-center gap-2 text-sm hover:opacity-75"
      >
        ← 다시 분석하기
      </button>

      <section className={`relative mb-7 overflow-hidden ${ready ? 'fade-in-up' : 'opacity-0'}`}>
        <ResultHeroArtwork ohang={primaryThemeOhang} />
        <div className="relative z-10 min-h-[148px] max-w-[620px] pr-24 sm:pr-28">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: primaryTheme.pillBg, color: primaryTheme.accentStrong }}>
            <span>{OHANG_EMOJI[primaryThemeOhang]}</span>
            <span>{hasLacking ? '부족한 오행' : '현재 흐름'}</span>
          </div>
          <h1 className="mt-4 text-[30px] font-bold tracking-[-0.04em] leading-[1.15]" style={{ color: primaryTheme.text }}>
            {heroCopy.title}
          </h1>
          <p className="mt-1 text-[30px] font-bold tracking-[-0.04em] leading-[1.15]" style={{ color: primaryTheme.text }}>
            {heroCopy.accent}
          </p>
          <p className="mt-4 max-w-[560px] text-sm leading-6 result-muted">
            {heroCopy.subtitle}
          </p>
        </div>
      </section>

      {/* ── 사주팔자 카드 ── */}
      <section className={`result-card rounded-3xl p-4 mb-5 ${ready ? 'fade-in-up' : 'opacity-0'}`}>
        <div className="grid grid-cols-4 gap-2.5">
          {pillars.map((p) => {
            const gan = p.pillar?.[0] ?? '';
            const ji = p.pillar?.[1] ?? '';
            const ganHanja = p.hanja?.[0] ?? '';
            const jiHanja = p.hanja?.[1] ?? '';
            const detailPillar = detailAnalysis.pillars.find((detail) => detail.label === p.label);
            const ganOhang: OhangType = CHUNGGAN_OHANG[gan] ?? '토';
            const jiOhang: OhangType = JIJI_OHANG[ji] ?? '토';
            const gc = OHANG_DESIGN_COLOR[ganOhang];
            const jc = OHANG_DESIGN_COLOR[jiOhang];
            return (
              <div key={p.label} className="text-center">
                <p className="text-xs result-label mb-2">{p.label}</p>
                <div className="flex flex-col gap-1.5">
                  <div className={`rounded-xl py-3 ${gc.bg} ${gc.text} border ${gc.border}`}>
                    <div className="text-xl font-bold">{gan}</div>
                    <div className="text-xs opacity-60">{ganHanja}</div>
                  </div>
                  <div className={`rounded-xl py-3 ${jc.bg} ${jc.text} border ${jc.border}`}>
                    <div className="text-xl font-bold">{ji}</div>
                    <div className="text-xs opacity-60">{jiHanja}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <SajuSummaryCard
        analysis={analysis}
        primaryThemeOhang={primaryThemeOhang}
        primaryTheme={primaryTheme}
        heroCopy={heroCopy}
        structuredHighlights={detailAnalysis.structuredHighlights}
        dayMasterOhang={detailAnalysis.dayMaster.ohang}
        iljuAdvice={detailAnalysis.iljuNarrative.advice}
        ready={ready}
      />

      {/* ── 오행 분포 ── */}
      <section className={`result-card rounded-3xl p-6 mb-5 ${ready ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
        <h2 className="text-xs font-medium result-label uppercase tracking-widest mb-4">오행 분포</h2>
        <div className="space-y-3">
          {OHANG_ORDER.map((ohang) => {
            const count = analysis.counts[ohang];
            const pct = Math.round((count / 8) * 100);
            const color = OHANG_DESIGN_COLOR[ohang];
            return (
              <div key={ohang} className="flex items-center gap-3">
                <span className="w-14 text-sm flex items-center gap-1">
                  <span>{OHANG_EMOJI[ohang]}</span>
                  <span className={color.text}>{ohang}</span>
                </span>
                <div className="flex-1 rounded-full h-2.5 overflow-hidden" style={{ background: primaryTheme.surfaceAlt }}>
                  <div
                    className="h-full rounded-full bar-grow"
                    style={{
                      width: count === 0 ? '0%' : `${Math.max(pct, 10)}%`,
                      background: color.glow,
                      boxShadow: `0 0 8px ${color.glow}80`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm result-muted">{count}</span>
                {count === 0 && <span className="text-xs bg-[#fff0ee] text-[#c85b54] rounded-full px-2 py-0.5">없음</span>}
                {count === 1 && <span className="text-xs bg-[#fff4e6] text-[#bd7b34] rounded-full px-2 py-0.5">약</span>}
                {count >= 3 && <span className="text-xs bg-[#f2eef8] text-[#7b69aa] rounded-full px-2 py-0.5">과다</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 채우면 좋은 기운 (개인화) ── */}
      {analysis.prioritizedLacking.length > 0 && (
        <section className={`mb-5 ${ready ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <h2 className="text-xs font-medium result-label uppercase tracking-widest mb-3">채우면 좋은 기운</h2>
          <div className="space-y-4">
            {analysis.prioritizedLacking.map((ohang) => {
              const lackColor = OHANG_DESIGN_COLOR[ohang];
              const lackTheme = OHANG_DESIGN_THEME[ohang];
              const personalDesc = getPersonalizedLackingDesc(ohang, detailAnalysis.dayMaster.ohang, analysis);
              return (
                <PersonalizedLackingCard
                  key={`lacking-${ohang}`}
                  ohang={ohang}
                  personalDesc={personalDesc}
                  lackColor={lackColor}
                  lackTheme={lackTheme}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ── 과다 기운 ── */}
      {analysis.excess.length > 0 && (
        <section className={`mb-5 ${ready ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <h2 className="text-xs font-medium result-label uppercase tracking-widest mb-3">과다한 기운</h2>
          <div className="space-y-3">
            {analysis.excess.map((ohang) => {
              const excessColor = OHANG_DESIGN_COLOR[ohang];
              return (
                <div key={ohang} className={`result-card rounded-2xl p-5 border ${excessColor.border}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{OHANG_EMOJI[ohang]}</span>
                    <p className={`font-bold text-lg ${excessColor.text}`}>
                      {ohang}({OHANG_HANJA[ohang]}) 기운 과다
                    </p>
                  </div>
                  <p className="result-muted text-sm leading-relaxed">{OHANG_EXCESS_DESC[ohang]}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {analysis.prioritizedLacking.length === 0 && analysis.excess.length === 0 && (
        <section className={`result-card rounded-2xl p-6 mb-5 text-center ${ready ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <p className="text-3xl mb-2">⚖️</p>
          <p className="font-bold" style={{ color: primaryTheme.text }}>오행이 비교적 균형 잡혀 있어요!</p>
          <p className="result-muted text-sm mt-1">아래 명소들을 통해 각 기운을 더욱 강화해보세요.</p>
        </section>
      )}

      {/* ── 추천 명소 ── */}
      {(apiRecommendations.length > 0 || apiRecommendationLoading || apiRecommendationError) && (
        <section className={`mb-8 ${ready ? 'fade-in-up fade-in-up-delay-3' : 'opacity-0'}`}>
          {apiRecommendationLoading && (
            <div className="result-card rounded-2xl p-5 text-sm result-muted">
              실시간 명소를 불러오는 중이에요...
            </div>
          )}

          {apiRecommendationError && (
            <div className="result-card rounded-2xl p-5 border border-[#f2d0ca] text-sm text-[#c85b54]">
              {apiRecommendationError}
            </div>
          )}

          {apiGroupedRecommendations.length > 0 ? (
            <div className="space-y-6">
              {apiGroupedRecommendations.map((group) => {
                const ohang = toOhangType(group.element);
                const color = OHANG_DESIGN_COLOR[ohang];

                return (
                  <div key={`group-${group.element}`} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{OHANG_EMOJI[ohang]}</span>
                      <h3 className={`font-semibold ${color.text}`}>부족한 {ohang} 기운 추천 장소</h3>
                    </div>
                    <div className="space-y-3">
                      {group.recommendations.map((recommendation, index) => (
                        <ApiRecommendationCard
                          key={`${group.element}-${recommendation.id}-${recommendation.name}`}
                          recommendation={recommendation}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : apiRecommendations.length > 0 && (
            <div className="space-y-3">
              {apiRecommendations.map((recommendation, index) => (
                <ApiRecommendationCard key={`${recommendation.id}-${recommendation.name}`} recommendation={recommendation} index={index} />
              ))}
            </div>
          )}
        </section>
      )}

      {apiRecommendations.length === 0 && spots.map((ohangSpots, si) => (
        <section key={ohangSpots.ohang} className={`mb-8 ${ready ? `fade-in-up fade-in-up-delay-${Math.min(si + 3, 5)}` : 'opacity-0'}`}>
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${OHANG_DESIGN_COLOR[ohangSpots.ohang].text}`}>
              {OHANG_EMOJI[ohangSpots.ohang]} {ohangSpots.title}
            </h2>
            <p className="result-muted text-sm mt-1">{ohangSpots.subtitle}</p>
          </div>
          <div className="result-card rounded-2xl p-5 mb-4">
            <p className="text-sm leading-relaxed" style={{ color: primaryTheme.text }}>💬 {ohangSpots.advice}</p>
          </div>
          {ohangSpots.warning && (
            <div className="bg-[#fff2ef] border border-[#f2d5cf] rounded-2xl p-4 mb-4">
              <p className="text-[#c85b54] text-sm">⚠️ {ohangSpots.warning}</p>
            </div>
          )}
          <div className="space-y-3">
            {ohangSpots.spots.map((spot, i) => (
              <SpotCard key={spot.id} spot={spot} ohang={ohangSpots.ohang} index={i} />
            ))}
          </div>
        </section>
      ))}

      {/* 과다 냉각 명소 */}
      {avoidSpots.map((ohangSpots) => (
        <section key={`avoid-${ohangSpots.ohang}`} className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-purple-300">
              ❄️ {ohangSpots.ohang}({OHANG_HANJA[ohangSpots.ohang]}) 과다 — 냉각 명소
            </h2>
            <p className="result-muted text-sm mt-1">기운을 식혀줄 장소들이에요</p>
          </div>
          <div className="space-y-3">
            {(ohangSpots.avoidSpots || []).map((spot, i) => (
              <SpotCard key={spot.id} spot={spot} ohang={ohangSpots.ohang} index={i} />
            ))}
          </div>
        </section>
      ))}

      <footer className="pt-8 border-t text-center text-xs space-y-1" style={{ borderColor: primaryTheme.border, color: primaryTheme.muted }}>
        <p>풍수지리·음양오행 전통 이론 기반 참고용 콘텐츠입니다</p>
        <a href="/privacy" className="underline transition-opacity hover:opacity-70">개인정보처리방침</a>
      </footer>
    </main>
  );
}

function ApiRecommendationCard({ recommendation, index }: { recommendation: RecommendationResult; index: number }) {
  const [open, setOpen] = useState(false);
  const dominantElement = recommendation.supported_missing_elements[0] ?? recommendation.dominant_elements[0] ?? recommendation.tags.element[0] ?? 'earth';
  const dominantColor = OHANG_DESIGN_COLOR[toOhangType(dominantElement)];
  const cardTheme = OHANG_DESIGN_THEME[toOhangType(dominantElement)];
  const shownElements = recommendation.supported_missing_elements.length > 0
    ? recommendation.supported_missing_elements
    : recommendation.dominant_elements.length > 0
      ? recommendation.dominant_elements
      : recommendation.tags.element;
  const placeCharacterTags = getPlaceCharacterTags(recommendation);

  return (
    <div
      className="rounded-2xl overflow-hidden border transition-all duration-300"
      style={{
        background: cardTheme.surface,
        borderColor: open ? cardTheme.accentStrong : cardTheme.border,
        boxShadow: `0 20px 40px ${cardTheme.shadow}`,
      }}
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-sm w-5 shrink-0" style={{ color: cardTheme.muted }}>{index + 1}.</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate" style={{ color: cardTheme.text }}>{recommendation.name}</p>
                {shownElements.map((el) => {
                  const oh = toOhangType(el);
                  const elColor = OHANG_DESIGN_COLOR[oh];
                  return (
                    <span key={el} className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${elColor.bg} ${elColor.text}`}>
                      {OHANG_EMOJI[oh]} {oh}
                    </span>
                  );
                })}
              </div>
              <p className="text-xs mt-0.5 truncate" style={{ color: cardTheme.muted }}>{recommendation.location}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center shrink-0 pl-2">
          <span className="text-sm" style={{ color: cardTheme.muted }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: cardTheme.border }}>
          <div className="pt-5 flex flex-wrap gap-2">
            {placeCharacterTags.map((tag) => (
              <span
                key={`${recommendation.id}-${tag}`}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: cardTheme.surfaceAlt, color: cardTheme.muted }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            {recommendation.reason.map((reason) => (
              <p key={reason} className="text-sm leading-relaxed" style={{ color: cardTheme.text }}>- {reason}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getPlaceCharacterTags(recommendation: RecommendationResult): string[] {
  const tags: string[] = [];

  if (recommendation.tags.nature_ratio >= 4) {
    tags.push('자연');
  } else if (recommendation.tags.nature_ratio <= 1) {
    tags.push('도심');
  }

  if (recommendation.tags.material.includes('water')) {
    tags.push('수변');
  }

  if (recommendation.tags.brightness >= 4) {
    tags.push('전망');
  }

  if (recommendation.tags.material.includes('glass') || recommendation.tags.material.includes('metal') || recommendation.tags.material.includes('stone')) {
    tags.push('건물');
  }

  if (recommendation.tags.activity.includes('rest')) {
    tags.push('휴식');
  }

  if (recommendation.tags.activity.includes('explore')) {
    tags.push('산책');
  }

  return [...new Set(tags)].slice(0, 4);
}

function toOhangType(element: string): OhangType {
  const mapping: Record<string, OhangType> = {
    wood: '목',
    fire: '화',
    earth: '토',
    metal: '금',
    water: '수',
  };

  return mapping[element] ?? '토';
}

function FireArtwork() {
  return (
    <>
      <defs>
        <radialGradient id="fire-orb-shadow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(102 98) rotate(90) scale(86 96)">
          <stop offset="0" stopColor="#FFB38F" stopOpacity="0.42" />
          <stop offset="0.62" stopColor="#FFC9B4" stopOpacity="0.2" />
          <stop offset="1" stopColor="#FFF8F5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="102" cy="98" rx="96" ry="86" fill="url(#fire-orb-shadow)" />
      <circle cx="90" cy="84" r="78" fill="#FFCCBC" />
      <circle cx="54" cy="66" r="28" fill="#FFF3B8" />
    </>
  );
}

function WaterArtwork() {
  return (
    <>
      <defs>
        <linearGradient id="water-wave-back" x1="84" y1="88" x2="84" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#CFE8F8" />
          <stop offset="1" stopColor="#A8D4F0" />
        </linearGradient>
        <linearGradient id="water-wave-mid" x1="84" y1="112" x2="84" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9BCAE9" />
          <stop offset="1" stopColor="#74B3DE" />
        </linearGradient>
        <linearGradient id="water-wave-front" x1="84" y1="132" x2="84" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#73B3DE" />
          <stop offset="1" stopColor="#4E9ED3" />
        </linearGradient>
      </defs>
      <path
        d="M-8 76C15 79 31 63 53 63C75 63 90 80 112 80C134 80 152 67 178 60"
        stroke="#B7DCF2"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M-10 110C11 104 26 90 48 90C69 90 84 106 105 106C125 106 139 94 159 94C166 94 172 96 178 99V170H-10V110Z"
        fill="url(#water-wave-back)"
      />
      <path
        d="M-10 132C12 126 28 116 50 116C72 116 86 129 108 129C129 129 143 119 163 119C168 119 173 120 178 122V170H-10V132Z"
        fill="url(#water-wave-mid)"
      />
      <path
        d="M-10 150C12 145 28 138 50 138C72 138 87 148 109 148C130 148 144 141 164 141C169 141 174 142 178 144V170H-10V150Z"
        fill="url(#water-wave-front)"
      />
    </>
  );
}

function WoodArtwork() {
  return (
    <>
      <circle cx="130" cy="20" r="130" fill="#E3F0DE" />
      <polygon points="52,155 97,38 140,155" fill="#5E8A57" />
      <polygon points="17,155 62,62 105,155" fill="#7BA46F" />
      <rect x="57" y="121" width="11" height="34" fill="#94734D" />
    </>
  );
}

function EarthArtwork() {
  return (
    <>
      <defs>
        <linearGradient id="earth-dune-back" x1="85" y1="82" x2="85" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8D3A7" />
          <stop offset="1" stopColor="#D9BD87" />
        </linearGradient>
        <linearGradient id="earth-dune-front" x1="85" y1="114" x2="85" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#CDA774" />
          <stop offset="1" stopColor="#B88C57" />
        </linearGradient>
      </defs>
      <circle cx="140" cy="25" r="130" fill="#FFF0C8" />
      <path
        d="M-8 116C18 102 38 106 58 95C79 82 99 79 118 86C138 94 153 108 178 104V170H-8V116Z"
        fill="url(#earth-dune-back)"
      />
      <path
        d="M-10 140C16 130 42 129 63 121C86 112 108 111 126 118C146 125 159 139 178 136V170H-10V140Z"
        fill="url(#earth-dune-front)"
      />
    </>
  );
}

function MetalArtwork() {
  return (
    <>
      <defs>
        <radialGradient id="metal-orb" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 32) rotate(90) scale(118)">
          <stop offset="0" stopColor="#F4F7FA" />
          <stop offset="1" stopColor="#E8EDF3" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="32" r="118" fill="url(#metal-orb)" />
      <ellipse cx="92" cy="154" rx="48" ry="8" fill="#DDE3EA" fillOpacity="0.72" />

      <polygon points="74,38 103,24 128,40 110,57 84,58" fill="#F8FAFC" />
      <polygon points="58,53 84,58 75,88 46,76" fill="#DCE3EA" />
      <polygon points="39,78 75,88 74,126 45,113 31,92" fill="#E8EDF2" />
      <polygon points="84,58 110,57 111,92 87,106 75,88" fill="#D4DCE4" />
      <polygon points="110,57 128,40 146,66 126,85 111,92" fill="#C7D0D9" />
      <polygon points="126,85 146,66 139,111 119,128 111,92" fill="#D9E0E7" />
      <polygon points="62,101 75,88 87,106 75,126 58,118" fill="#BCC6D0" />
      <polygon points="74,126 87,106 111,92 119,128 94,153" fill="#E4EAF1" />
      <polygon points="88,79 104,94 95,122 76,108 79,91" fill="#F7FAFC" />
    </>
  );
}

function ResultHeroArtwork({ ohang }: { ohang: OhangType }) {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-0"
      width="170"
      height="170"
      viewBox="0 0 170 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {ohang === '화' && <FireArtwork />}
      {ohang === '수' && <WaterArtwork />}
      {ohang === '목' && <WoodArtwork />}
      {ohang === '토' && <EarthArtwork />}
      {ohang === '금' && <MetalArtwork />}
    </svg>
  );
}

function SpotCard({ spot, ohang, index }: { spot: Spot; ohang: OhangType; index: number }) {
  const [open, setOpen] = useState(false);
  const color = OHANG_DESIGN_COLOR[ohang];
  const cardTheme = OHANG_DESIGN_THEME[ohang];
  return (
    <div
      className="rounded-2xl overflow-hidden border transition-all duration-300"
      style={{
        background: cardTheme.surface,
        borderColor: open ? cardTheme.accentStrong : cardTheme.border,
        boxShadow: `0 20px 40px ${cardTheme.shadow}`,
      }}
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm w-5" style={{ color: cardTheme.muted }}>{index + 1}.</span>
          <div>
            <p className="font-semibold" style={{ color: cardTheme.text }}>{spot.name}</p>
            <p className="text-xs mt-0.5" style={{ color: cardTheme.muted }}>{spot.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>{spot.category}</span>
          <span className="text-sm" style={{ color: cardTheme.muted }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: cardTheme.border }}>
          <div className="pt-3">
            <p className="text-xs mb-1" style={{ color: cardTheme.muted }}>🧭 풍수 포인트</p>
            <p className="text-sm leading-relaxed" style={{ color: cardTheme.text }}>{spot.fengshui}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: cardTheme.muted }}>💡 방문 팁</p>
            <p className="text-sm leading-relaxed" style={{ color: cardTheme.accentStrong }}>{spot.tip}</p>
          </div>
          {spot.warning && (
            <div>
              <p className="text-xs mb-1" style={{ color: cardTheme.muted }}>⚠️ 주의</p>
              <p className="text-sm leading-relaxed" style={{ color: '#c85b54' }}>{spot.warning}</p>
            </div>
          )}
          <div className="flex gap-1 flex-wrap">
            {spot.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: cardTheme.surfaceAlt, color: cardTheme.muted }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <a
            href={spot.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs ${color.text} underline underline-offset-2 hover:opacity-80 transition-opacity`}
          >
            📍 네이버 지도에서 보기 →
          </a>
        </div>
      )}
    </div>
  );
}

function SajuSummaryCard({
  analysis,
  primaryThemeOhang,
  primaryTheme,
  heroCopy,
  structuredHighlights,
  dayMasterOhang,
  iljuAdvice,
  ready,
}: {
  analysis: OhangAnalysis;
  primaryThemeOhang: OhangType;
  primaryTheme: OhangDesignThemeToken;
  heroCopy: { title: string; accent: string; subtitle: string };
  structuredHighlights: HighlightSection[];
  dayMasterOhang: OhangType;
  iljuAdvice: string;
  ready: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className={`result-card rounded-3xl overflow-hidden mb-5 ${ready ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-xs font-medium result-label uppercase tracking-widest">나의 사주 읽기</h2>
          <div className="flex items-center gap-2">
            <span className="result-pill text-xs px-3 py-1 rounded-full border" style={{ borderColor: primaryTheme.border }}>
              {open ? '접기' : '자세히 보기'}
            </span>
            <span className="text-sm" style={{ color: primaryTheme.muted }}>{open ? '▲' : '▼'}</span>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="text-lg shrink-0 mt-0.5">💡</span>
          <p className="text-sm leading-relaxed" style={{ color: primaryTheme.text }}>
            {iljuAdvice}
          </p>
        </div>
      </button>
      {open && structuredHighlights.length > 0 && (
        <div className="px-5 pb-6 space-y-5 border-t" style={{ borderColor: primaryTheme.border }}>
          <h3 className="text-xs font-medium result-label uppercase tracking-widest pt-5">사주 해석</h3>
          {structuredHighlights.map((section, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{section.icon}</span>
                <h4 className="text-sm font-bold" style={{ color: primaryTheme.text }}>{section.title}</h4>
              </div>
              <div className="text-sm leading-[1.85] result-muted pl-7">
                {section.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PersonalizedLackingCard({
  ohang,
  personalDesc,
  lackColor,
  lackTheme,
}: {
  ohang: OhangType;
  personalDesc: { headline: string; detail: string; tips: string[] };
  lackColor: { bg: string; text: string; border: string; glow: string };
  lackTheme: OhangDesignThemeToken;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden border transition-all duration-300"
      style={{
        background: lackTheme.surface,
        borderColor: open ? lackTheme.accentStrong : lackTheme.border,
        boxShadow: `0 12px 32px ${lackTheme.shadow}`,
      }}
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-2xl shrink-0 mt-0.5">{OHANG_EMOJI[ohang]}</span>
            <div className="min-w-0">
              <p className="font-bold text-base" style={{ color: lackTheme.text }}>
                {personalDesc.headline}
              </p>
              <p className="text-xs mt-1" style={{ color: lackTheme.muted }}>
                {ohang}({OHANG_HANJA[ohang]}) 기운 보충이 필요해요
              </p>
            </div>
          </div>
          <span className="text-sm shrink-0 mt-1" style={{ color: lackTheme.muted }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: lackTheme.border }}>
          <p className="text-sm leading-[1.85] pt-4" style={{ color: lackTheme.text }}>
            {personalDesc.detail}
          </p>
          {personalDesc.tips.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: lackTheme.surfaceAlt }}>
              <p className="text-xs font-medium mb-2.5" style={{ color: lackTheme.accentStrong }}>
                💡 {ohang} 기운을 채우는 방법
              </p>
              <ul className="space-y-1.5">
                {personalDesc.tips.map((tip, i) => (
                  <li key={i} className="text-sm leading-relaxed flex items-start gap-2" style={{ color: lackTheme.text }}>
                    <span className="shrink-0 mt-1 w-1 h-1 rounded-full" style={{ background: lackTheme.accentStrong }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
