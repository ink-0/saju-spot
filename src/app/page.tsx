'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hourStr, setHourStr] = useState('');   // "HH:MM" 형태
  const [unknownTime, setUnknownTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    if (!y || y < 1900 || y > 2026) {
      setError('올바른 연도를 입력해주세요 (1900~2026)');
      return;
    }
    if (!m || m < 1 || m > 12) {
      setError('올바른 월을 입력해주세요 (1~12)');
      return;
    }
    if (!d || d < 1 || d > 31) {
      setError('올바른 일을 입력해주세요 (1~31)');
      return;
    }

    let hour = 12;
    let minute = 0;

    if (!unknownTime) {
      if (!hourStr || !/^\d{1,2}:\d{2}$/.test(hourStr)) {
        setError('시간을 HH:MM 형식으로 입력해주세요 (예: 14:30)');
        return;
      }
      const [hh, mm] = hourStr.split(':').map(Number);
      if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
        setError('올바른 시간을 입력해주세요');
        return;
      }
      hour = hh;
      minute = mm;
    }

    setLoading(true);
    const params = new URLSearchParams({
      calendarType,
      year: String(y),
      month: String(m),
      day: String(d),
      hour: String(hour),
      minute: String(minute),
      unknownTime: String(unknownTime),
      isLeapMonth: String(isLeapMonth),
    });
    setTimeout(() => {
      router.push(`/result?${params.toString()}`);
    }, 1600);
  };

  return (
    <main className="gradient-bg min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10 fade-in-up">
        <div className="float-anim inline-block mb-5">
          <div className="text-6xl">🌿</div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
          <span className="gradient-text">사주풍수</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xs mx-auto leading-relaxed">
          생년월일시 입력 → 음양오행 분석 →<br />
          <strong className="text-white">서울 풍수 명소 추천</strong>
        </p>
      </div>

      {/* Form */}
      <div className="glass rounded-3xl p-7 md:p-9 w-full max-w-md fade-in-up fade-in-up-delay-2">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 양력 / 음력 토글 */}
          <div>
            <label className="block text-xs text-gray-500 mb-2 font-medium tracking-wide uppercase">달력 종류</label>
            <div className="grid grid-cols-2 gap-2">
              {(['solar', 'lunar'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCalendarType(type)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    calendarType === type
                      ? 'bg-amber-500 text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type === 'solar' ? '☀️ 양력' : '🌙 음력'}
                </button>
              ))}
            </div>

            {/* 윤달 체크 (음력일 때만) */}
            {calendarType === 'lunar' && (
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-gray-400">윤달로 태어났어요</span>
              </label>
            )}
          </div>

          {/* 연도 */}
          <div>
            <label className="block text-xs text-gray-500 mb-2 font-medium tracking-wide uppercase">생년</label>
            <input
              type="number"
              placeholder="예: 1995"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-all text-lg"
              min="1900"
              max="2026"
            />
          </div>

          {/* 월 / 일 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium tracking-wide uppercase">월</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-[#111118] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500/60 transition-all"
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}월</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium tracking-wide uppercase">일</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-[#111118] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500/60 transition-all"
              >
                <option value="">일</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}일</option>
                ))}
              </select>
            </div>
          </div>

          {/* 시간 입력 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-medium tracking-wide uppercase">태어난 시간</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  onChange={(e) => setUnknownTime(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500"
                />
                <span className="text-xs text-gray-500">시간 몰라요</span>
              </label>
            </div>

            {!unknownTime ? (
              <div className="space-y-2">
                <input
                  type="time"
                  value={hourStr}
                  onChange={(e) => setHourStr(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500/60 transition-all text-lg [color-scheme:dark]"
                />
                <p className="text-xs text-gray-600">
                  💡 진태양시 보정 자동 적용 (서울 기준 -32분)
                </p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl px-4 py-3.5 text-gray-500 text-sm">
                시간 제외하고 계산 (월주·일주 기준 분석)
              </div>
            )}
          </div>

          {/* 에러 */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-2">{error}</p>
          )}

          {/* 제출 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5" />
                <span>사주 분석 중...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>내 오행 분석하기</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Feature chips */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-sm fade-in-up fade-in-up-delay-4">
        {['KASI 절기 데이터', '진태양시 보정', '음력/양력', '서울 풍수 명소'].map((f) => (
          <span key={f} className="text-xs glass px-3 py-1.5 rounded-full text-gray-400">{f}</span>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-600 text-center">
        풍수지리·음양오행 전통 이론 기반 참고용 콘텐츠
      </p>
    </main>
  );
}
