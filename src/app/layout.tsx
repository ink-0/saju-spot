import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '사주풍수 — 내 사주에 맞는 서울 명소',
  description:
    '생년월일시를 입력하면 음양오행으로 부족한 기운을 분석하고, 서울의 풍수지리 명소를 추천해드립니다. 파크하얏트, 관악산, 한강공원 등 오행별 디테일 명소 안내.',
  keywords: ['사주', '오행', '풍수지리', '서울명소', '운세', '음양오행', '명당', '개운법'],
  openGraph: {
    title: '사주풍수 — 내 사주에 맞는 서울 명소',
    description: '사주 음양오행으로 부족한 기운을 채워줄 서울 명소를 찾아보세요.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[#0a0a0f] text-white antialiased">{children}</body>
    </html>
  );
}
