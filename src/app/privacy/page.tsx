import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 — 사주풍수',
};

export default function PrivacyPage() {
  return (
    <main className="gradient-bg min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-white">개인정보처리방침</h1>
      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">1. 수집하는 개인정보</h2>
          <p>
            본 서비스(사주풍수)는 별도의 회원가입 없이 이용 가능하며, 사용자가 입력한 생년월일시 정보는
            서버에 저장되지 않으며, 브라우저 내에서만 처리됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">2. 광고 서비스</h2>
          <p>
            본 사이트는 Google AdSense를 사용하여 광고를 게재합니다. Google은 쿠키를 사용하여
            사용자가 해당 사이트나 인터넷의 다른 사이트를 이전에 방문한 것을 기반으로
            광고를 게재할 수 있습니다. 광고 쿠키를 사용하지 않으려면{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline"
            >
              구글 광고 설정
            </a>
            을 방문하세요.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">3. 쿠키 사용</h2>
          <p>
            Google AdSense 등 제3자 광고 파트너는 쿠키를 사용하여 사용자의 관심사에 맞는 광고를
            제공할 수 있습니다. 사용자는 브라우저 설정에서 쿠키를 거부할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">4. 면책사항</h2>
          <p>
            본 서비스에서 제공하는 사주·풍수 분석 결과는 전통 음양오행 이론을 기반으로 한
            참고용 콘텐츠이며, 실제 운명을 단정하거나 의학·법률·금융적 결정의 근거로
            사용하지 마시길 권고합니다.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">5. 문의</h2>
          <p>개인정보 관련 문의사항이 있으시면 서비스 내 채널을 통해 연락해 주세요.</p>
        </section>

        <p className="text-gray-600 text-xs pt-4 border-t border-white/5">
          최초 작성일: 2026년 3월 | 본 방침은 내용 변경 시 사이트를 통해 공지됩니다.
        </p>
      </div>
    </main>
  );
}
