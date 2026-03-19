import { Suspense } from 'react';
import ResultPage from './page';

export default function ResultLayout() {
  return (
    <Suspense
      fallback={
        <main className="gradient-bg min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="spinner w-12 h-12 mx-auto" />
            <p className="text-gray-400">사주 분석 중...</p>
          </div>
        </main>
      }
    >
      <ResultPage />
    </Suspense>
  );
}
