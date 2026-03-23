'use client';

import { useEffect, useMemo, useState } from 'react';
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
  type OhangAnalysis,
  OHANG_ORDER,
  OHANG_EMOJI,
  OHANG_COLOR,
  OHANG_KEYWORDS,
  OHANG_LACKING_DESC,
  OHANG_EXCESS_DESC,
  OHANG_HANJA,
} from '@/lib/ohang';
import {
  getRecommendedSpots,
  getAvoidanceSpots,
  type OhangSpots,
  type Spot,
} from '@/lib/spots';
import type { OhangType } from '@/lib/ohang';
import { analyzeSajuDetails, type SajuDetailAnalysis } from '@/lib/saju-analysis';

export default function ResultPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [ready, setReady] = useState(false);
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
      const analysisResult = analyzeOhang(counts);
      const detailResult = analyzeSajuDetails(paljaResult.saju);

      return {
        result: paljaResult,
        analysis: analysisResult,
        detailAnalysis: detailResult,
        spots: getRecommendedSpots(analysisResult.lacking),
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

  if (calcError) {
    return (
      <main className="gradient-bg min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="text-2xl mb-4">⚠️</p>
          <p className="text-red-400 mb-4">{calcError}</p>
          <button onClick={() => router.push('/')} className="text-amber-400 underline">
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
          <p className="text-gray-400">사주 분석 중...</p>
        </div>
      </main>
    );
  }

  const { saju, solarYear, solarMonth, solarDay, lunarYear, lunarMonth, lunarDay, isLeapMonth, isTimeCorrected, correctedHour, correctedMinute } = result;

  // 사주 4기둥 파싱
  const pillars = [
    { label: '연주', pillar: saju.yearPillar, hanja: saju.yearPillarHanja },
    { label: '월주', pillar: saju.monthPillar, hanja: saju.monthPillarHanja },
    { label: '일주', pillar: saju.dayPillar, hanja: saju.dayPillarHanja },
    { label: '시주', pillar: saju.hourPillar, hanja: saju.hourPillarHanja },
  ];

  return (
    <main className="gradient-bg min-h-screen px-4 py-12 max-w-2xl mx-auto">
      <button
        onClick={() => router.push('/')}
        className="mb-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm"
      >
        ← 다시 분석하기
      </button>

      {/* ── 날짜 정보 ── */}
      <div className={`glass rounded-2xl px-5 py-4 mb-5 text-sm ${ready ? 'fade-in-up' : 'opacity-0'}`}>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-400">
          <span>☀️ 양력 {solarYear}.{solarMonth}.{solarDay}</span>
          <span>🌙 음력 {lunarYear}.{lunarMonth}.{lunarDay}{isLeapMonth ? ' (윤)' : ''}</span>
          {isTimeCorrected && correctedHour !== undefined && (
            <span className="text-amber-400 text-xs">
              ⏱ 진태양시 보정 → {correctedHour}시 {correctedMinute?.toString().padStart(2, '0')}분
            </span>
          )}
        </div>
      </div>

      {/* ── 사주팔자 카드 ── */}
      <section className={`glass rounded-3xl p-6 mb-5 ${ready ? 'fade-in-up' : 'opacity-0'}`}>
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-5">
          사주팔자 (四柱八字)
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {pillars.map((p) => {
            const gan = p.pillar?.[0] ?? '';
            const ji = p.pillar?.[1] ?? '';
            const ganHanja = p.hanja?.[0] ?? '';
            const jiHanja = p.hanja?.[1] ?? '';
            const ganOhang: OhangType = CHUNGGAN_OHANG[gan] ?? '토';
            const jiOhang: OhangType = JIJI_OHANG[ji] ?? '토';
            const gc = OHANG_COLOR[ganOhang];
            const jc = OHANG_COLOR[jiOhang];
            return (
              <div key={p.label} className="text-center">
                <p className="text-xs text-gray-600 mb-2">{p.label}</p>
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

      <section className={`glass rounded-3xl p-6 mb-5 ${ready ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">핵심 해석</h2>
            <p className="text-lg font-semibold text-white">
              일간 {detailAnalysis.dayMaster.stem}{detailAnalysis.dayMaster.hanja}
              <span className={`ml-2 text-sm ${OHANG_COLOR[detailAnalysis.dayMaster.ohang].text}`}>
                {detailAnalysis.dayMaster.ohang} 기운 중심
              </span>
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border ${OHANG_COLOR[detailAnalysis.dayMaster.ohang].border} ${OHANG_COLOR[detailAnalysis.dayMaster.ohang].bg} ${OHANG_COLOR[detailAnalysis.dayMaster.ohang].text}`}>
            나를 대표하는 일간
          </span>
        </div>
        <div className="space-y-3">
          {detailAnalysis.highlights.map((highlight) => (
            <div key={highlight} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm text-gray-200 leading-relaxed">{highlight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 오행 분포 ── */}
      <section className={`glass rounded-3xl p-6 mb-5 ${ready ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">오행 분포</h2>
        <div className="space-y-3">
          {OHANG_ORDER.map((ohang) => {
            const count = analysis.counts[ohang];
            const pct = Math.round((count / 8) * 100);
            const color = OHANG_COLOR[ohang];
            return (
              <div key={ohang} className="flex items-center gap-3">
                <span className="w-14 text-sm flex items-center gap-1">
                  <span>{OHANG_EMOJI[ohang]}</span>
                  <span className={color.text}>{ohang}</span>
                </span>
                <div className="flex-1 bg-white/5 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bar-grow"
                    style={{
                      width: count === 0 ? '0%' : `${Math.max(pct, 10)}%`,
                      background: color.glow,
                      boxShadow: `0 0 8px ${color.glow}80`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm text-gray-400">{count}</span>
                {count === 0 && <span className="text-xs bg-red-500/20 text-red-400 rounded-full px-2 py-0.5">없음</span>}
                {count === 1 && <span className="text-xs bg-orange-500/20 text-orange-400 rounded-full px-2 py-0.5">약</span>}
                {count >= 3 && <span className="text-xs bg-purple-500/20 text-purple-400 rounded-full px-2 py-0.5">과다</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className={`glass rounded-3xl p-6 mb-5 ${ready ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">십신 · 지장간 · 12운성</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {detailAnalysis.pillars.map((pillar) => {
            const stemColor = OHANG_COLOR[pillar.stemOhang];
            const branchColor = OHANG_COLOR[pillar.branchOhang];

            return (
              <article key={pillar.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{pillar.label}</p>
                    <p className="text-lg font-semibold text-white">
                      {pillar.pillar}
                      <span className="ml-2 text-sm text-gray-500">{pillar.pillarHanja}</span>
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                    {pillar.twelveState}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className={`rounded-xl border px-3 py-3 ${stemColor.border} ${stemColor.bg}`}>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">천간 십신</p>
                    <p className={`font-semibold ${stemColor.text}`}>{pillar.stemTenGod}</p>
                    <p className="text-xs text-gray-400 mt-1">{pillar.stem}{pillar.stemHanja}</p>
                  </div>
                  <div className={`rounded-xl border px-3 py-3 ${branchColor.border} ${branchColor.bg}`}>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">지지 대표 십신</p>
                    <p className={`font-semibold ${branchColor.text}`}>{pillar.branchTenGod}</p>
                    <p className="text-xs text-gray-400 mt-1">{pillar.branch}{pillar.branchHanja}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">지장간</p>
                  <div className="flex flex-wrap gap-2">
                    {pillar.hiddenStems.map((hiddenStem) => (
                      <span
                        key={`${pillar.key}-${hiddenStem.stem}-${hiddenStem.role}`}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${OHANG_COLOR[hiddenStem.ohang].border} ${OHANG_COLOR[hiddenStem.ohang].bg} ${OHANG_COLOR[hiddenStem.ohang].text}`}
                      >
                        <span>{hiddenStem.role}</span>
                        <span>{hiddenStem.stem}{hiddenStem.hanja}</span>
                        <span className="text-gray-300">· {hiddenStem.tenGod}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {detailAnalysis.branchRelations.length > 0 && (
        <section className={`glass rounded-3xl p-6 mb-5 ${ready ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">지지 관계</h2>
          <div className="space-y-3">
            {detailAnalysis.branchRelations.map((relation) => (
              <div key={`${relation.type}-${relation.name}-${relation.labels.join('-')}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRelationBadgeClass(relation.type)}`}>
                    {relation.type}
                  </span>
                  <p className="font-semibold text-white">{relation.name}</p>
                  <span className="text-xs text-gray-500">
                    {relation.labels[0]} {relation.branches[0]} · {relation.labels[1]} {relation.branches[1]}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{relation.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 부족한 기운 ── */}
      {analysis.lacking.length > 0 && (
        <section className={`mb-5 ${ready ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">부족한 기운</h2>
          <div className="space-y-3">
            {analysis.lacking.map((ohang) => {
              const color = OHANG_COLOR[ohang];
              return (
                <div key={ohang} className={`rounded-2xl p-5 border ${color.border} ${color.bg}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{OHANG_EMOJI[ohang]}</span>
                    <div>
                      <p className={`font-bold text-lg ${color.text}`}>
                        {ohang}({OHANG_HANJA[ohang]}) 기운 부족
                      </p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {OHANG_KEYWORDS[ohang].map((kw) => (
                          <span key={kw} className={`text-xs px-2 py-0.5 rounded-full bg-white/5 ${color.text}`}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{OHANG_LACKING_DESC[ohang]}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 과다 기운 ── */}
      {analysis.excess.length > 0 && (
        <section className={`mb-5 ${ready ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">과다한 기운</h2>
          <div className="space-y-3">
            {analysis.excess.map((ohang) => (
              <div key={ohang} className="glass rounded-2xl p-5 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{OHANG_EMOJI[ohang]}</span>
                  <p className="font-bold text-lg text-purple-300">
                    {ohang}({OHANG_HANJA[ohang]}) 기운 과다
                  </p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{OHANG_EXCESS_DESC[ohang]}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.lacking.length === 0 && analysis.excess.length === 0 && (
        <section className={`glass rounded-2xl p-6 mb-5 text-center ${ready ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <p className="text-3xl mb-2">⚖️</p>
          <p className="text-white font-bold">오행이 비교적 균형 잡혀 있어요!</p>
          <p className="text-gray-400 text-sm mt-1">아래 명소들을 통해 각 기운을 더욱 강화해보세요.</p>
        </section>
      )}

      {/* ── 추천 명소 ── */}
      {spots.map((ohangSpots, si) => (
        <section key={ohangSpots.ohang} className={`mb-8 ${ready ? `fade-in-up fade-in-up-delay-${Math.min(si + 3, 5)}` : 'opacity-0'}`}>
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${OHANG_COLOR[ohangSpots.ohang].text}`}>
              {OHANG_EMOJI[ohangSpots.ohang]} {ohangSpots.title}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{ohangSpots.subtitle}</p>
          </div>
          <div className="glass rounded-2xl p-5 mb-4 border border-white/10">
            <p className="text-sm text-gray-200 leading-relaxed">💬 {ohangSpots.advice}</p>
          </div>
          {ohangSpots.warning && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4">
              <p className="text-red-300 text-sm">⚠️ {ohangSpots.warning}</p>
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
            <p className="text-gray-400 text-sm mt-1">기운을 식혀줄 장소들이에요</p>
          </div>
          <div className="space-y-3">
            {(ohangSpots.avoidSpots || []).map((spot, i) => (
              <SpotCard key={spot.id} spot={spot} ohang={ohangSpots.ohang} index={i} />
            ))}
          </div>
        </section>
      ))}

      <footer className="pt-8 border-t border-white/5 text-center text-xs text-gray-600 space-y-1">
        <p>풍수지리·음양오행 전통 이론 기반 참고용 콘텐츠입니다</p>
        <a href="/privacy" className="underline hover:text-gray-400 transition-colors">개인정보처리방침</a>
      </footer>
    </main>
  );
}

function getRelationBadgeClass(type: SajuDetailAnalysis['branchRelations'][number]['type']) {
  const tone: Record<typeof type, string> = {
    합: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
    충: 'bg-red-500/15 text-red-300 border border-red-500/20',
    형: 'bg-orange-500/15 text-orange-300 border border-orange-500/20',
    해: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  };

  return tone[type];
}

function SpotCard({ spot, ohang, index }: { spot: Spot; ohang: OhangType; index: number }) {
  const [open, setOpen] = useState(false);
  const color = OHANG_COLOR[ohang];
  return (
    <div className={`glass rounded-2xl overflow-hidden border transition-all duration-300 ${open ? color.border : 'border-white/8'}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm w-5">{index + 1}.</span>
          <div>
            <p className="font-semibold text-white">{spot.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{spot.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>{spot.category}</span>
          <span className="text-gray-500 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/5">
          <div className="pt-3">
            <p className="text-xs text-gray-500 mb-1">🧭 풍수 포인트</p>
            <p className="text-sm text-gray-300 leading-relaxed">{spot.fengshui}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">💡 방문 팁</p>
            <p className="text-sm text-amber-300 leading-relaxed">{spot.tip}</p>
          </div>
          {spot.warning && (
            <div>
              <p className="text-xs text-gray-500 mb-1">⚠️ 주의</p>
              <p className="text-sm text-orange-300 leading-relaxed">{spot.warning}</p>
            </div>
          )}
          <div className="flex gap-1 flex-wrap">
            {spot.tags.map((tag) => (
              <span key={tag} className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
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
