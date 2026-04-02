# 사주스팟 (Saju Spot)

사주 오행 분석을 기반으로, 부족한 기운을 채워주는 서울 명소를 추천하는 서비스입니다.

## 핵심 기능

- **사주 분석**: 생년월일시 입력 → 오행 분포·일간 세기·기후 상태 분석
- **환경 요구 변환**: 사주 결론을 실제 공간 환경으로 변환
- **장소 추천**: 부족한 오행을 보강하는 장소를 점수 기반 정렬로 추천
- **풍수 근거**: 풍수지리·명리학 기반의 장소 추천 이유 제공

## 기술 스택

- **프레임워크**: Next.js (App Router)
- **언어**: TypeScript
- **외부 API**: Kakao Local API, 한국관광공사 TourAPI
- **패키지 매니저**: pnpm

## 프로젝트 구조

```
src/
├── app/
│   ├── api/recommendations/  # 추천 API endpoint
│   └── result/               # 결과 페이지
├── lib/
│   ├── recommendation/
│   │   ├── saju-analysis/    # 사주 분석 엔진
│   │   └── place-recommendation/  # 장소 추천 엔진
│   ├── spots.ts              # 큐레이션된 오행별 명소 데이터
│   └── manseryeok.ts         # 만세력 계산
docs/
├── recommendation-strategy.md   # 추천 시스템 전략 기준서
└── fengshui-place-logic.md      # 풍수·사주 기반 장소 추천 기준서
```

## 문서

| 문서 | 설명 |
|---|---|
| [recommendation-strategy.md](docs/recommendation-strategy.md) | 추천 시스템 전체 파이프라인, 정렬 원칙, 검색 전략 |
| [fengshui-place-logic.md](docs/fengshui-place-logic.md) | 풍수 지형 용어, 오행별 장소 기준, 산 분류, 방문 시간 |

> 추천 로직을 수정할 때는 반드시 위 두 문서를 먼저 읽어야 합니다.

## 시작하기

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 환경 변수

`.env.local` 파일에 아래 키가 필요합니다:

```bash
KAKAO_REST_API_KEY=
TOURAPI_SERVICE_KEY=
```

