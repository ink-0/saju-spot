'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [meridiem, setMeridiem] = useState<'am' | 'pm'>('am');
  const [hour12, setHour12] = useState('');
  const [minuteStr, setMinuteStr] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const monthInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);

  const sanitizeNumericInput = (value: string, maxLength: number) =>
    value.replace(/\D/g, '').slice(0, maxLength);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = sanitizeNumericInput(e.target.value, 4);
    setYear(digitsOnly);
    if (digitsOnly.length === 4) {
      monthInputRef.current?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = sanitizeNumericInput(e.target.value, 2);
    setMonth(digitsOnly);
    if (digitsOnly.length === 2) {
      dayInputRef.current?.focus();
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = sanitizeNumericInput(e.target.value, 2);
    setDay(digitsOnly);
  };

  const toggleCalendarType = () => {
    setCalendarType((prev) => (prev === 'solar' ? 'lunar' : 'solar'));
  };

  const toggleMeridiem = () => {
    setMeridiem((prev) => (prev === 'am' ? 'pm' : 'am'));
  };

  const handleHour12Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = sanitizeNumericInput(e.target.value, 2);
    setHour12(digitsOnly);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = sanitizeNumericInput(e.target.value, 2);
    setMinuteStr(digitsOnly);
  };

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
      if (!hour12 || !minuteStr || hour12.length < 1 || minuteStr.length < 2) {
        setError('태어난 시간을 입력해주세요');
        return;
      }
      const hh12 = Number(hour12);
      const mm = Number(minuteStr);
      if (hh12 < 1 || hh12 > 12 || mm < 0 || mm > 59) {
        setError('올바른 시간을 입력해주세요');
        return;
      }
      hour = meridiem === 'am'
        ? (hh12 === 12 ? 0 : hh12)
        : (hh12 === 12 ? 12 : hh12 + 12);
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
    <main className="landing-shell min-h-screen px-5 py-8">
      <div className="mx-auto w-full max-w-[390px] rounded-[40px] px-6 pb-10 pt-8 shadow-[0_24px_70px_rgba(31,24,17,0.06)] fade-in-up">
        <div className="relative overflow-hidden rounded-[30px] pb-2">
          <div className="absolute -right-8 -top-10 h-[170px] w-[170px] rounded-full bg-[#efede9]" />
          <div className="absolute right-9 top-14 h-[42px] w-[42px] rounded-full bg-[#fff1d0]" />

          <div className="relative pl-[2px] pt-8">
            <h1 className="max-w-[260px] text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-[#21201e]">
              당신에게 맞는
              <br />
              명소를 찾아볼게요
            </h1>
            <p className="mt-6 max-w-[270px] text-[14px] leading-[1.55] text-[#7d756d]">
              생년월일시를 바탕으로 오행을 분석해
              <br />
              당신에게 필요한 기운의 장소를 추천합니다.
            </p>
          </div>
        </div>



        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[18px] font-bold tracking-[-0.03em] text-[#23211f]">사주 정보 입력</h2>
            <div className="flex flex-col items-end gap-2">
              <div className="relative inline-grid grid-cols-2 overflow-hidden rounded-full bg-[#f4f1eb] p-[3px] cursor-pointer">
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-[3px] left-[3px] w-[calc(50%-0.1875rem)] rounded-full bg-[#232220] shadow-[0_5px_12px_rgba(35,34,32,0.16)] transition-transform duration-300 ease-out ${calendarType === 'lunar' ? 'translate-x-full' : 'translate-x-0'
                    }`}
                />
                {(['solar', 'lunar'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={toggleCalendarType}
                    aria-pressed={calendarType === type}
                    className={`relative z-10 cursor-pointer rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors duration-300 ${calendarType === type
                      ? 'text-white'
                      : 'text-[#8d847a]'
                      }`}
                  >
                    {type === 'solar' ? '양력' : '음력'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3.5">
            <div className="landing-panel rounded-[28px] px-6 py-4">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-[12px] font-medium text-[#9a9085]">생년월일</label>
                {calendarType === 'lunar' && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLeapMonth}
                      onChange={(e) => setIsLeapMonth(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#d69750]"
                    />
                    <span className="text-[10px] text-[#9a9085]">윤달</span>
                  </label>
                )}
              </div>
              <div className="mt-2 flex items-center gap-0 text-[16px] font-bold text-[#23211f]">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1997"
                  value={year}
                  onChange={handleYearChange}
                  className="landing-inline-input w-[50px]"
                  maxLength={4}
                />
                <span className="mx-[1px]">.</span>
                <input
                  ref={monthInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="02"
                  value={month}
                  onChange={handleMonthChange}
                  className="landing-inline-input w-[28px]"
                  maxLength={2}
                />
                <span className="mx-[1px]">.</span>
                <input
                  ref={dayInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="27"
                  value={day}
                  onChange={handleDayChange}
                  className="landing-inline-input w-[28px]"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="landing-panel rounded-[28px] px-6 py-4 col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[12px] font-medium text-[#9a9085]">태어난 시간</label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unknownTime}
                      onChange={(e) => setUnknownTime(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#d69750]"
                    />
                    <span className="text-[10px] text-[#9a9085]">모름</span>
                  </label>
                </div>
                {!unknownTime ? (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative inline-grid h-[28px] grid-cols-2 overflow-hidden rounded-full bg-[#f4f1eb] p-[2px] cursor-pointer">
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-y-[2px] left-[2px] w-[calc(50%-0.125rem)] rounded-full bg-[#232220] shadow-[0_4px_10px_rgba(35,34,32,0.14)] transition-transform duration-300 ease-out ${
                          meridiem === 'pm' ? 'translate-x-full' : 'translate-x-0'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={toggleMeridiem}
                        className={`relative z-10 cursor-pointer rounded-full px-2.5 text-[11px] font-semibold leading-none transition-colors duration-300 ${meridiem === 'am' ? 'text-white' : 'text-[#8d847a]'}`}
                      >
                        오전
                      </button>
                      <button
                        type="button"
                        onClick={toggleMeridiem}
                        className={`relative z-10 cursor-pointer rounded-full px-2.5 text-[11px] font-semibold leading-none transition-colors duration-300 ${meridiem === 'pm' ? 'text-white' : 'text-[#8d847a]'}`}
                      >
                        오후
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[16px] font-bold text-[#23211f]">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="09"
                        value={hour12}
                        onChange={handleHour12Change}
                        className="landing-inline-input w-[28px]"
                        maxLength={2}
                      />
                      <span>:</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="10"
                        value={minuteStr}
                        onChange={handleMinuteChange}
                        className="landing-inline-input w-[28px]"
                        maxLength={2}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-[16px] font-bold text-[#23211f]">미입력</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-[#f2d0ca] bg-[#fff0ee] px-4 py-3 text-sm text-[#c85b54]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="primary-button mt-9 flex w-full cursor-pointer items-center justify-center gap-3 rounded-[999px] py-4 text-[17px] font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="spinner h-5 w-5" />
                <span>사주 분석 중...</span>
              </>
            ) : (
              <span>내 사주 분석하기</span>
            )}
          </button>

        </form>
      </div>
    </main>
  );
}
