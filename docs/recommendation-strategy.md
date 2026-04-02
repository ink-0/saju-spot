# 추천 시스템 전략 문서

이 문서는 현재 프로젝트의 `사주 -> 환경 -> 장소 추천` 방향을 정리한 기준 문서입니다.

사람이 읽어도 되고, 이후 이 저장소를 작업하는 AI가 참고해도 되는 장기 문서입니다.

## 핵심 제품 원칙

사주를 장소에 직접 매핑하지 않습니다.

항상 아래 단계를 거칩니다.

1. 사주 분석
2. 환경 요구 해석
3. 장소 영향 계산
4. 장소 추천 정렬

이 서비스는 운세 문구 생성기가 아니라, 구조화된 장소 추천 엔진입니다.

## 상위 모듈 구조

추천 시스템은 크게 두 영역으로 나뉘어 있습니다.

### 1) 사주 분석 영역

경로: `src/lib/recommendation/saju-analysis/`

- `saju-core.ts`: 사주 원국과 기본 오행 분포 계산
- `interpretation.ts`: 부족/과다 오행, 일간 세기, 기후 상태, 결론 도출
- `environment.ts`: 사주 결론을 환경 요구로 변환
- `explanation.ts`: 사주/환경 설명 문구 생성

### 2) 장소 추천 영역

경로: `src/lib/recommendation/place-recommendation/`

- `external-poi-mapper.ts`: 외부 장소 raw 데이터를 `PlaceRecord`로 정규화
- `providers/`: 외부 API client와 provider별 mapper
- `element-place-traits.ts`: 오행별 장소 특성 기준 파일
- `place-influence.ts`: 장소 특성을 환경 축/오행 점수로 변환
- `recommendation.ts`: 추천 정렬 및 근거 문구 생성
- `places.ts`: 외부 API 실패 시 사용할 로컬 fallback 데이터셋

사주 해석 로직과 외부 장소 수집 로직은 섞지 않습니다.

## 장소 특징의 기준 소스

`src/lib/spots.ts`는 사람이 직접 큐레이션한 오행별 장소 감각이 담긴 기준 데이터입니다.

즉, 어떤 오행이 어떤 장소 느낌을 가지는지에 대한 가장 강한 기준은 이 파일입니다.

이 수동 큐레이션을 구조화한 버전은 아래 파일에 모아둡니다.

- `src/lib/recommendation/place-recommendation/element-place-traits.ts`

추천 품질을 개선할 때는 route 안에 키워드를 흩뿌리기보다, 이 파일을 먼저 수정하는 것이 원칙입니다.

## 오행별 장소 특징 해석

각 오행은 단일 키워드가 아니라, 여러 장소 특성의 묶음으로 봐야 합니다.

### 목

대표 특징:

- 숲, 나무, 둘레길, 정원, 생태공원
- 성장감, 아침 산책, 유기적인 동선
- 물과 나무가 같이 있는 구조가 특히 강함

대표 단서:

- 높은 `nature_ratio`
- `organic` 구조
- `wood`, `water` 재질
- 걷기/탐색 중심 활동

### 화

대표 특징:

- 전망대, 광장, 야경 명소, 루프탑, 밝은 메인거리
- 시야, 높이, 빛, 사람 에너지, 강한 자극감

대표 단서:

- 높은 `brightness`
- 중간 이상 `crowd`
- `warm` 온도감
- skyline, 야경, 도시 활기

### 토

대표 특징:

- 궁궐, 박물관, 정원, 왕릉, 고궁, 조용한 문화 공간
- 안정감, 머무름, 중심 잡힘, 뿌리감

대표 단서:

- `stone`, `earth` 재질
- 안정적인 템포
- `mixed` 또는 차분한 구조
- 오래 머물기 쉬운 분위기

### 금

대표 특징:

- 전시관, 현대건축, 정돈된 호텔 라운지, 금융지구, 바위 전망 포인트
- 정확함, 질서, 결단, 선명한 구조

대표 단서:

- `metal`, `glass`, `stone`
- `linear` 구조
- 차갑고 깔끔한 분위기
- 소음보다 선명함이 강한 공간

### 수

대표 특징:

- 강변 산책로, 수변공원, 청계천, 선착장, 물정원
- 흐름, 진정, 반사, 서늘함, 회복

대표 단서:

- `water` 재질
- `cool` 온도감
- 낮은 자극도
- 수변/야간/고요한 흐름

## 검색 전략 원칙

부족한 오행마다 검색어를 하나만 쓰면 안 됩니다.

반드시 아래 구조를 따릅니다.

1. 오행 결정
2. 공간 특성 묶음 선택
3. provider 친화적 검색어 여러 개 생성
4. 후보 수집
5. 장소 영향 계산
6. 추천 정렬

오행별 검색어 세트의 기준 파일은 아래입니다.

- `src/lib/recommendation/place-recommendation/element-place-traits.ts`

route는 이 값을 “후보를 모으는 힌트”로 사용해야지, 최종 진실처럼 쓰면 안 됩니다.

## 외부 데이터 처리 흐름

현재 서버 흐름은 아래와 같습니다.

1. `src/app/result/page.tsx`가 `/api/recommendations` 호출
2. `src/app/api/recommendations/route.ts`가 사주 분석 수행
3. 부족한 오행 기반으로 검색 spec 생성
4. Kakao Local + TourAPI를 병렬 호출
5. raw provider 응답을 `PlaceRecord`로 정규화
6. 오행별 특성/장소 영향 기준으로 후보 필터링
7. `runRecommendationEngine()`로 정렬
8. 부족한 오행별 그룹 추천으로 UI 렌더링

외부 API client는 얇게 유지해야 하며, 추천 로직을 client에 넣지 않습니다.

## 추천 정렬 원칙

추천 리스트는 다음처럼 읽혀야 합니다.

"이 사람에게 부족한 기운을 가장 강하게 채워주는 장소부터 보여준다"

현재 우선순위는 아래와 같습니다.

1. `replenishment_score`
2. `excess_element_control`
3. `environment_fit`
4. `supportive_element_match`
5. `user_preference`

즉 추천 품질의 1순위는 “부족한 오행 보강 강도”입니다.

## 부족한 오행이 여러 개일 때의 규칙

부족한 오행이 2개 이상이면 하나의 리스트로 뭉개서 보여주지 않습니다.

오행별로 추천을 따로 나눠서 보여줍니다.

예시:

- 부족한 화 기운 추천
- 부족한 수 기운 추천

이 동작은 route가 `grouped_recommendations`를 내려주고, result 페이지가 이를 오행별 섹션으로 렌더링하는 방식으로 처리합니다.

## fallback 원칙

외부 provider가 실패하거나, 추천 가능한 장소가 없으면 로컬 curated dataset으로 fallback 합니다.

다만 fallback은 “env를 못 읽었다”는 의미로 해석되면 안 됩니다.

반드시 아래를 구분해야 합니다.

- provider failure
- empty search results
- partial external success

## 외부 장소명 처리 원칙

provider raw 장소명은 영어이거나 일관성이 없을 수 있습니다.

이름 정규화는 UI가 아니라 provider mapper 레이어에서 처리합니다.

즉 화면에서 임시로 바꾸는 게 아니라, mapper에서 display name을 정리한 뒤 올려야 합니다.

## 환경 변수

루트 `.env.local`을 사용합니다.

필요한 키:

```bash
KAKAO_REST_API_KEY=
TOURAPI_SERVICE_KEY=
```

이 키들은 서버 전용입니다. `NEXT_PUBLIC_`로 노출하지 않습니다.

## 실무 제약

- 외부 API 사용은 최소로 유지하고 provider client에 격리할 것
- 결정론적 규칙을 우선할 것
- 오행별 장소 특성은 한 군데 기준 파일에서 관리할 것
- 외부 provider가 죽어도 fallback 데이터는 항상 동작해야 함
- 추천 이유는 사람이 관찰 가능한 특징과 연결돼야 함

## 풍수·사주 기반 장소 근거

추천 장소의 품질은 **풍수 지형 근거**가 있을 때 높아집니다.

오행별 장소 특성과 풍수 근거의 기준서는 아래 파일에 정리되어 있습니다.

- `docs/fengshui-place-logic.md`

이 문서는 풍수지리·명리학의 실전 패턴을 정리한 기준서입니다. 주요 내용:

1. 풍수 지형 용어 사전 (수생목, 화형산, 갈룡음수형, 환포지형 등)
2. 오행별 대표 장소와 그 풍수 근거
3. 산(山)의 오행 분류 (관악산=화, 북한산=금, 청계산=토, 아차산=수)
4. 용신별 최적 방문 시간 (천간/지지 날짜 + 시(時) 매핑)
5. 목적별 추천 연계 (계약=금, 시험=화, 창업=목, 재물=토, 인맥=수)

추천 이유 문구를 생성하거나, fallback 장소를 추가하거나,
검색 키워드를 수정할 때는 반드시 이 기준서를 먼저 참고합니다.

## 다음 개선 우선순위

다음 단계에서 품질을 더 올리고 싶다면 이 순서가 좋습니다.

1. 풍수 기반 장소 특성 반영
   - `element-place-traits.ts` 키워드/태그 확장
   - fallback `places.ts`에 명당 장소 추가
   - 추천 이유 문구에 풍수 근거 포함
2. 용신별 방문 시간 추천 로직 추가
3. 좌표 기반 enrichment
   - 수변 인접성
   - 녹지 인접성
   - 고도/언덕/능선 정보
4. provider dedupe 강화
5. 부족한 오행 그룹 안에서의 다양성 제어
6. 추천 카드 한국어 문구 자연화
