'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { calcSajuPalja, countOhangFromSaju, type SajuPaljaResult } from '@/lib/manseryeok';
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

export default function ResultPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [result, setResult] = useState<SajuPaljaResult | null>(null);
  const [analysis, setAnalysis] = useState<OhangAnalysis | null>(null);
  const [spots, setSpots] = useState<OhangSpots[]>([]);
  const [avoidSpots, setAvoidSpots] = useState<OhangSpots[]>([]);
  const [ready, setReady] = useState(false);
  const [calcError, setCalcError] = useState('');

  useEffect(() => {
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
        router.push('/');
        return;
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

      setResult(paljaResult);
      setAnalysis(analysisResult);
      setSpots(getRecommendedSpots(analysisResult.lacking));
      setAvoidSpots(getAvoidanceSpots(analysisResult.excess));
      setTimeout(() => setReady(true), 100);
    } catch (err) {
      setCalcError(`계산 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  }, [params, router]);

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

  if (!result || !analysis) {
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
            const ganOhangMap: Record<string, OhangType> = {
              갑:'목',을:'목',병:'화',정:'화',무:'토',기:'토',경:'금',신:'금',임:'수',계:'수',
            };
            const jiOhangMap: Record<string, OhangType> = {
              자:'수',축:'토',인:'목',묘:'목',진:'토',사:'화',오:'화',미:'토',신:'금',유:'금',술:'토',해:'수',
            };
            const ganOhang: OhangType = ganOhangMap[gan] ?? '토';
            const jiOhang: OhangType = jiOhangMap[ji] ?? '토';
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
