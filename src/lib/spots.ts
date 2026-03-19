/**
 * 서울 명소 데이터
 * 풍수지리 기반, 오행별 명소 리스트
 */

import type { OhangType } from './manseryeok';

export interface Spot {
  id: string;
  name: string;
  address: string;
  category: '자연' | '호텔' | '궁궐' | '거리' | '랜드마크' | '공원';
  fengshui: string;    // 풍수 포인트
  tip: string;         // 방문 팁
  warning?: string;    // 주의사항
  tags: string[];
  mapUrl: string;      // 카카오/네이버 지도 링크
}

export interface OhangSpots {
  ohang: OhangType;
  title: string;         // 예: "목(木) 기운 충전 명소"
  subtitle: string;      // 짧은 설명
  advice: string;        // 릴스 스타일 어드바이스
  warning?: string;      // 과다 시 주의
  spots: Spot[];
  avoidSpots?: Spot[];   // 과다 시 피해야 할 곳
}

export const SPOTS_DATA: Record<OhangType, OhangSpots> = {
  목: {
    ohang: '목',
    title: '목(木) 기운 충전 명소',
    subtitle: '성장·창의·도전 에너지가 필요할 때',
    advice:
      '나무 빽빽한 숲길, 흐르는 물 옆 산책로가 목 기운 맛집이야. 서울숲 새벽 맨발 걷기 30분이면 막혔던 창의력이 슬슬 풀릴 거야. 성장하고 싶고, 새로운 거 시작하고 싶은데 발이 안 떨어진다면 여기로.',
    spots: [
      {
        id: 'mo-1',
        name: '서울숲',
        address: '성동구 뚝섬로 273',
        category: '공원',
        fengshui:
          '한강·중랑천·청계천 삼수(三水)가 합류하는 지점. 물이 목을 키우는 수생목(水生木) 구조로 서울 최강 목 기운 명소.',
        tip: '이른 아침 맨발로 잔디밭 걷기 30분. 핸드폰 내려놓고 나무 한 그루 붙잡고 5분 있어보기.',
        tags: ['숲', '한강', '맨발걷기', '아침산책'],
        mapUrl: 'https://map.naver.com/p/search/서울숲',
      },
      {
        id: 'mo-2',
        name: '낙산공원',
        address: '종로구 낙산길 41',
        category: '공원',
        fengshui:
          '서울 내사산 중 목 기운을 타고난 산. 동쪽(목의 방위)에 위치해 생기 에너지가 강함. 오래된 성곽이 기운을 잡아줌.',
        tip: '일출 직후 성곽 따라 걷기. 이화동 벽화마을과 연계 코스.',
        tags: ['성곽', '일출', '숲길', '동쪽'],
        mapUrl: 'https://map.naver.com/p/search/낙산공원',
      },
      {
        id: 'mo-3',
        name: '북한산 둘레길 2코스 (순례길)',
        address: '은평구 진관동 일대',
        category: '자연',
        fengshui:
          '빽빽한 활엽수림, 바람 잘 통하는 흙길. 도심에서 가장 강렬한 목 기운을 느낄 수 있는 자연 코스.',
        tip: '우이동~솔밭공원 구간 추천. 흙길에 맨발 닿게 걸으면 효과 배가.',
        tags: ['등산', '숲길', '흙길', '힐링'],
        mapUrl: 'https://map.naver.com/p/search/북한산둘레길',
      },
      {
        id: 'mo-4',
        name: '응봉산',
        address: '성동구 응봉동',
        category: '자연',
        fengshui:
          '낮은 지대 + 한강 바로 인접 + 울창한 수목. 물기운과 나무기운이 공존하는 수생목 입지.',
        tip: '개나리 철(3~4월) 최고. 정상에서 한강 바라보며 10분 명상.',
        tags: ['한강뷰', '개나리', '낮은산', '수목'],
        mapUrl: 'https://map.naver.com/p/search/응봉산',
      },
      {
        id: 'mo-5',
        name: '청계천 (효자동~세운상가 구간)',
        address: '종로구 청계광장 일대',
        category: '거리',
        fengshui:
          '흐르는 물 + 양옆 수목 식재. 수생목(水生木) 상생 구조. 도심 한복판에서 목 기운 빠르게 충전.',
        tip: '물에 손 직접 담그거나 물 소리 들으며 30분 걷기.',
        tags: ['도심', '물소리', '수목', '산책'],
        mapUrl: 'https://map.naver.com/p/search/청계천',
      },
      {
        id: 'mo-6',
        name: '창경궁 후원',
        address: '종로구 창경궁로 185',
        category: '궁궐',
        fengshui:
          '조선 왕실 정원. 수백 년 된 나무들의 기운 + 연못의 수기가 목 기운을 안정적으로 뒷받침.',
        tip: '봄 목요일 야간개장 활용 (사전 예약 필수). 대온실 앞 연못 필수 방문.',
        tags: ['고궁', '왕실정원', '연못', '야간'],
        mapUrl: 'https://map.naver.com/p/search/창경궁',
      },
      {
        id: 'mo-7',
        name: '양재 시민의숲',
        address: '서초구 매헌로 99',
        category: '공원',
        fengshui:
          '서초구는 목 기운이 강한 지역으로 분류. 대규모 평지 녹지에서 안정적으로 목 기운 흡수 가능.',
        tip: '잔디밭에 돗자리 깔고 누워서 나무 바라보기 20분.',
        tags: ['잔디', '넓은공원', '서초', '휴식'],
        mapUrl: 'https://map.naver.com/p/search/양재시민의숲',
      },
    ],
  },

  화: {
    ohang: '화',
    title: '화(火) 기운 충전 명소',
    subtitle: '열정·활기·에너지가 필요할 때',
    advice:
      '의욕이 바닥이고, 소극적으로 변한 것 같다면 화 기운이 부족한 거야. 빛 넘치고 사람 많고 높은 곳에서 에너지 팍팍 받아와야 해. 관악산 연주대에서 10분만 있어봐, 머릿속이 환해지는 거 느낄 수 있어.',
    warning:
      '화(火)가 이미 많은 사람은 이 명소들 오히려 독이 됨. 감정기복·충동적 결정이 잦다면 아래 冷각 리스트로.',
    spots: [
      {
        id: 'hwa-1',
        name: '관악산 연주대',
        address: '관악구 관악산 정상부',
        category: '자연',
        fengshui:
          '조선시대 공식 화형산(火形山). 바위 능선이 불꽃처럼 솟구침. 조선 궁궐도 이 화기를 막으려 해태상·연못 설치할 정도. 서울 최강 화 기운 집약점.',
        tip: '정상 연주대 바위 위에 10분 이상 서 있기. 아침 일출 산행 추천.',
        tags: ['등산', '바위', '일출', '명예운'],
        mapUrl: 'https://map.naver.com/p/search/관악산연주대',
      },
      {
        id: 'hwa-2',
        name: 'DDP (동대문디자인플라자)',
        address: '중구 을지로7가 281',
        category: '랜드마크',
        fengshui:
          '야간 LED 조형물과 빛의 홍수. 현대 풍수에서 인공조명의 강렬함은 화 기운과 같음. 젊고 창의적인 에너지 충전.',
        tip: '일몰 후 야간 방문. DDP 야외광장에서 1시간 앉아 빛 속에 있기.',
        tags: ['야경', '빛', '현대건축', '활기'],
        mapUrl: 'https://map.naver.com/p/search/DDP동대문',
      },
      {
        id: 'hwa-3',
        name: '파크 하얏트 서울 루프탑 바',
        address: '강남구 테헤란로 606',
        category: '호텔',
        fengshui:
          '강남 최고층 루프탑. 높이+야경+도시의 빛 에너지 = 화 기운 집약. 명예와 사회적 에너지 충전에 최적.',
        tip: '저녁 예약 필수. 칵테일 한 잔 하면서 야경 1시간. 목표 설정하고 오면 더 효과적.',
        tags: ['루프탑', '야경', '5성급', '강남'],
        mapUrl: 'https://map.naver.com/p/search/파크하얏트서울',
      },
      {
        id: 'hwa-4',
        name: '홍대·합정 메인거리',
        address: '마포구 와우산로 일대',
        category: '거리',
        fengshui:
          '청년 에너지와 최고 유동인구. 풍수에서 사람의 열기와 활기도 화 에너지. 성동구 성수동과 함께 서울 화 기운 핫플.',
        tip: '주말 저녁 8~10시 피크타임 방문. 공연·버스킹 구경하며 에너지 충전.',
        tags: ['청년', '버스킹', '활기', '밤문화'],
        mapUrl: 'https://map.naver.com/p/search/홍대거리',
      },
      {
        id: 'hwa-5',
        name: '롯데타워 서울스카이',
        address: '송파구 올림픽로 300',
        category: '랜드마크',
        fengshui:
          '555m 대한민국 최고층. 높이 자체가 화 에너지 최고점. 하늘에 가까운 공간에서 목표 에너지 폭발.',
        tip: '123층 전망대 방문. 야경 감상 + 원하는 것 크게 상상하기.',
        tags: ['전망대', '고층', '야경', '송파'],
        mapUrl: 'https://map.naver.com/p/search/롯데타워서울스카이',
      },
      {
        id: 'hwa-6',
        name: '광화문광장',
        address: '종로구 세종대로 172',
        category: '랜드마크',
        fengshui:
          '경복궁 정남(正南) 방위 = 화 방위. 직사광선이 가장 강하게 내리쬐는 곳. 조선 최고 양기(陽氣) 집약.',
        tip: '오전 10~12시 햇볕 최강 시간대. 이순신 장군 동상 앞에서 각오 다지기.',
        tags: ['광장', '햇볕', '역사', '도심'],
        mapUrl: 'https://map.naver.com/p/search/광화문광장',
      },
      {
        id: 'hwa-7',
        name: '반얀트리 클럽&스파 서울',
        address: '중구 장충단로 60',
        category: '호텔',
        fengshui:
          '남산 기슭 입지, 실제로 오행 인테리어를 적용한 국내 유일 호텔. 남산의 온화한 화 기운을 받는 위치.',
        tip: '스파보다 루프탑 레스토랑 추천. 남산 보면서 식사.',
        tags: ['5성급', '남산', '오행인테리어', '스파'],
        mapUrl: 'https://map.naver.com/p/search/반얀트리서울',
      },
    ],
    avoidSpots: [
      {
        id: 'hwa-avoid-1',
        name: '덕수궁 돌담길',
        address: '중구 정동길 일대',
        category: '거리',
        fengshui: '낮은 지대 + 돌벽 + 수목. 화기를 흡수하고 안정시켜주는 수극화(水克火) 구조.',
        tip: '화 과다 시 이곳에서 산책 1시간, 감정이 차분해짐.',
        tags: ['돌담', '낮은지대', '산책', '안정'],
        mapUrl: 'https://map.naver.com/p/search/덕수궁돌담길',
      },
      {
        id: 'hwa-avoid-2',
        name: '서촌 골목 (경복궁 서쪽)',
        address: '종로구 필운대로 일대',
        category: '거리',
        fengshui: '낮고 좁은 골목, 역사적 토 기운. 화기를 감싸고 안정화시키는 구조.',
        tip: '통인시장~체부동 골목 코스. 오래된 찻집에서 차 한 잔.',
        tags: ['골목', '한옥', '차분', '토기운'],
        mapUrl: 'https://map.naver.com/p/search/서촌골목',
      },
      {
        id: 'hwa-avoid-3',
        name: '포시즌스 서울 스파',
        address: '종로구 새문안로 97',
        category: '호텔',
        fengshui: '물 치료 프로그램. 화기를 직접 수기로 다스리는 최고급 솔루션.',
        tip: '수(水) 테라피로 열기 식히기. 냉수 욕조 체험 추천.',
        tags: ['5성급', '스파', '물치료', '종로'],
        mapUrl: 'https://map.naver.com/p/search/포시즌스서울',
      },
    ],
  },

  토: {
    ohang: '토',
    title: '토(土) 기운 충전 명소',
    subtitle: '안정·균형·뿌리가 필요할 때',
    advice:
      '마음이 붕 뜨고, 결정을 내려도 계속 흔들린다면 토 기운이 부족한 거야. 경복궁 광장에서 맨발로 5분만 서 있어봐. 수백 년 된 땅 기운이 발바닥 통해서 올라오는 느낌 받을 수 있어. 고궁, 흙산, 박물관이 최고의 토 기운 충전소야.',
    spots: [
      {
        id: 'to-1',
        name: '경복궁',
        address: '종로구 사직로 161',
        category: '궁궐',
        fengshui:
          '조선 500년 정혈(正穴). 북악산(주산)·낙산(좌청룡)·인왕산(우백호)·남산(안산)의 사신사가 완벽. 서울에서 토 기운이 가장 응집된 핵심.',
        tip: '아침 개장 직후 광장에서 5분 정좌. 경회루 연못 앞 벤치에서 명상.',
        tags: ['정혈', '궁궐', '안정', '500년기운'],
        mapUrl: 'https://map.naver.com/p/search/경복궁',
      },
      {
        id: 'to-2',
        name: '창덕궁 후원 (비원)',
        address: '종로구 율곡로 99',
        category: '궁궐',
        fengshui:
          '왕실 비밀 정원. 땅 기운 + 수목 기운이 완벽히 균형 잡힌 명당. 조선 왕들이 심리적 안정을 찾던 장소.',
        tip: '해설 투어로만 입장. 부용지·주합루 구간에서 물과 땅의 조화 감상.',
        tags: ['비밀정원', '왕실', '명당', '균형'],
        mapUrl: 'https://map.naver.com/p/search/창덕궁후원',
      },
      {
        id: 'to-3',
        name: '부암동 석파정',
        address: '종로구 창의문로 110-1',
        category: '자연',
        fengshui:
          '북악산 자락, 청와대 바로 뒤. 왕들이 묻히고 싶던 배산임수의 완벽한 명당. 심리적 안정감이 탁월.',
        tip: '석파정 카페·서울미술관 코스. 조용한 토요일 오전 방문 추천.',
        tags: ['명당', '북악산', '카페', '배산임수'],
        mapUrl: 'https://map.naver.com/p/search/석파정서울미술관',
      },
      {
        id: 'to-4',
        name: '인왕산 자락길',
        address: '종로구 인왕산로 일대',
        category: '자연',
        fengshui:
          '바위 + 흙 혼합 지형. 금기운과 토 기운이 함께 강한 곳. 서울 무당들이 기도하는 명산으로도 유명.',
        tip: '무악재~범바위~윤동주 문학관 코스. 바위에 등 기대어 쉬기.',
        tags: ['바위산', '흙길', '기도', '종로'],
        mapUrl: 'https://map.naver.com/p/search/인왕산자락길',
      },
      {
        id: 'to-5',
        name: '국립중앙박물관',
        address: '용산구 서빙고로 137',
        category: '랜드마크',
        fengshui:
          '넓은 평지 + 역사의 응집 + 안정된 대지 에너지. 한반도 수천 년의 땅 기운이 모인 장소.',
        tip: '야외 정원 산책 필수. 연못 앞 벤치에서 30분 앉아 있기.',
        tags: ['박물관', '정원', '역사', '용산'],
        mapUrl: 'https://map.naver.com/p/search/국립중앙박물관',
      },
      {
        id: 'to-6',
        name: '성북동 성북구립미술관 일대',
        address: '성북구 성북동 일대',
        category: '거리',
        fengshui:
          '북악산 에너지 + 낙산 맥 이어지는 터. 재물운·학문운 강한 안정 지역. 고택과 미술관이 공존.',
        tip: '수연산방(찻집)·길상사 코스. 조용한 산책로 걷기.',
        tags: ['한옥', '차', '미술관', '성북'],
        mapUrl: 'https://map.naver.com/p/search/성북동',
      },
      {
        id: 'to-7',
        name: '롯데호텔 서울',
        address: '중구 을지로 30',
        category: '호텔',
        fengshui:
          '서울 도심 한복판 입지. 안정성과 격식이 최정점. 도심 중앙에서 토 기운을 가장 세련되게 체험.',
        tip: '1층 로비에서 애프터눈 티. 안정감 필요할 때 여기서 업무 미팅도 좋음.',
        tags: ['5성급', '도심', '격식', '안정'],
        mapUrl: 'https://map.naver.com/p/search/롯데호텔서울',
      },
    ],
  },

  금: {
    ohang: '금',
    title: '금(金) 기운 충전 명소',
    subtitle: '결단력·마무리·의지력이 필요할 때',
    advice:
      '우유부단하고 일이 흐지부지 끝나는 게 반복된다면 금 기운이 부족한 거야. 대리석·스틸·통유리 떡칠된 세련된 빌딩에 가야 해. 나무 많은 숲세권 카페 가봤자 더 몽글몽글해질 뿐이야. 파크 하얏트 로비에서 30분만 앉아 있어봐, 머릿속이 딱딱 정리되는 느낌 받을 거야.',
    spots: [
      {
        id: 'gum-1',
        name: '파크 하얏트 서울',
        address: '강남구 테헤란로 606',
        category: '호텔',
        fengshui:
          '콘크리트·스틸·대리석 직선 인테리어가 금 기운의 집약체. 차갑고 정밀한 공간이 결단력 에너지를 활성화.',
        tip: '로비 바에서 커피 한 잔, 30분 앉아서 결정해야 할 것들 생각하기. 예약 없이 카페 이용 가능.',
        tags: ['5성급', '대리석', '스틸', '결단'],
        mapUrl: 'https://map.naver.com/p/search/파크하얏트서울',
      },
      {
        id: 'gum-2',
        name: '안다즈 서울 강남',
        address: '강남구 학동로 322',
        category: '호텔',
        fengshui:
          '메탈릭 포인트 + 직선 위주 세련된 디자인. 우드톤 없는 현대 금 에너지 호텔. 결실과 자립 에너지 충전.',
        tip: '루프탑 바 방문. 강남 야경 보면서 "이번 달 반드시 끝낼 것" 목록 작성.',
        tags: ['5성급', '루프탑', '메탈릭', '강남'],
        mapUrl: 'https://map.naver.com/p/search/안다즈서울강남',
      },
      {
        id: 'gum-3',
        name: '여의도 콘래드 서울',
        address: '영등포구 여의대로 10',
        category: '호텔',
        fengshui:
          '금융 중심지 여의도 + 고층 통유리. 금(金)은 돈과 결실을 상징. 대한민국 금융 에너지의 진원지.',
        tip: '아침 첫 커피를 여기서. IFC몰 연계 쇼핑 후 로비에서 마무리.',
        tags: ['5성급', '금융', '여의도', '결실'],
        mapUrl: 'https://map.naver.com/p/search/콘래드서울',
      },
      {
        id: 'gum-4',
        name: '페어몬트 앰배서더 서울',
        address: '중구 퇴계로 14',
        category: '호텔',
        fengshui:
          '통유리 + 대리석 외관. 명동 중심부 도시 에너지. 차갑고 날카로운 금 기운이 집약된 현대 공간.',
        tip: '로비 라운지에서 업무 미팅. 결정 앞두고 방문하면 판단력 UP.',
        tags: ['5성급', '명동', '대리석', '도심'],
        mapUrl: 'https://map.naver.com/p/search/페어몬트앰배서더서울',
      },
      {
        id: 'gum-5',
        name: '파라스파라 서울 (북한산)',
        address: '은평구 진관길 89',
        category: '호텔',
        fengshui:
          '북한산 화강암 바위산 정기를 직접 수용. 풍수에서 바위산=금 기운의 원천. 자연 속 금 에너지 명당.',
        tip: '바위산이 보이는 객실 + 테라스 지정. 아침에 바위산 멍하니 1시간 보기.',
        warning: '도심 금 기운과 자연 금 기운의 차이 느껴짐. 보다 부드러운 결단력 원한다면 추천.',
        tags: ['호텔', '북한산', '바위', '자연'],
        mapUrl: 'https://map.naver.com/p/search/파라스파라서울',
      },
      {
        id: 'gum-6',
        name: '인왕산 정상 (치마바위 구간)',
        address: '종로구 인왕산로',
        category: '자연',
        fengshui:
          '서울 내사산 중 쇠 기운을 타고난 산. 노출된 화강암이 금 기운의 원천. 서울 최고의 자연 금 에너지.',
        tip: '정상 바위 위에 10분 이상 서 있기. 등산 후 하산하면 머릿속이 딱 정리됨.',
        tags: ['등산', '바위', '화강암', '정상'],
        mapUrl: 'https://map.naver.com/p/search/인왕산',
      },
      {
        id: 'gum-7',
        name: '신라호텔 서울',
        address: '중구 동호로 249',
        category: '호텔',
        fengshui:
          '남산 기슭 자연석 + 단단한 설계. 격식과 의지력 에너지. 오랜 역사의 5성급 금 기운 명소.',
        tip: '영빈관 앞 정원 산책. 결혼·사업 등 중요 결정 앞두고 방문하면 좋음.',
        tags: ['5성급', '남산', '격식', '자연석'],
        mapUrl: 'https://map.naver.com/p/search/신라호텔서울',
      },
    ],
  },

  수: {
    ohang: '수',
    title: '수(水) 기운 충전 명소',
    subtitle: '지혜·유연성·재물 흐름이 필요할 때',
    advice:
      '고집이 세지고, 변화에 적응 못하고, 뭔가 꽉 막힌 느낌이 든다면 수 기운이 필요한 거야. 한강 물 바로 옆에 앉아서 1~2시간만 있어봐. 막혔던 아이디어, 관계, 재물 흐름이 슬슬 풀리기 시작해. 물 소리 들으면서 핸드폰 내려놓는 게 핵심이야.',
    spots: [
      {
        id: 'su-1',
        name: '한강공원 광진·자양 구간',
        address: '광진구 자양동 자양한강공원',
        category: '공원',
        fengshui:
          '한강이 지역을 크게 감싸는 환포(環抱) 지형. 풍수 최고의 재물 명당 구조. 암사·자양·광진 전체가 수기 집약.',
        tip: '일몰 후 강가 돗자리 깔고 1시간. 물에 발 담그면 기운 빠르게 흡수.',
        tags: ['한강', '재물운', '환포지형', '일몰'],
        mapUrl: 'https://map.naver.com/p/search/자양한강공원',
      },
      {
        id: 'su-2',
        name: '옥수동 동호(東湖) 한강변',
        address: '성동구 옥수동',
        category: '공원',
        fengshui:
          '과거 동호(東湖)라 불릴 만큼 물이 맑은 전통 명당. 성동구는 한강·중랑천·청계천 삼수합류 = 서울 최강 수기.',
        tip: '달맞이봉 아래 한강 산책로. 조용한 평일 저녁 혼자 오기 추천.',
        tags: ['동호', '한강', '성동구', '삼수합류'],
        mapUrl: 'https://map.naver.com/p/search/옥수동한강공원',
      },
      {
        id: 'su-3',
        name: '잠실한강공원 선착장',
        address: '송파구 잠실동 잠실한강공원',
        category: '공원',
        fengshui:
          '잠실=섬 지형으로 사방이 물. 물이 집결한 최고의 수기 충전지. 재물·소통 에너지 강한 입지.',
        tip: '유람선 탑승 or 물가에 최대한 가까이 앉기. 2시간이면 기운 충전 완료.',
        tags: ['선착장', '유람선', '섬지형', '재물운'],
        mapUrl: 'https://map.naver.com/p/search/잠실한강공원',
      },
      {
        id: 'su-4',
        name: '청계천 (광장시장~을지로 구간)',
        address: '중구 청계광장 일대',
        category: '거리',
        fengshui:
          '도심 흐르는 물, 직접 접촉 가능. 수기 빠른 충전 포인트. 유동 인구와 흐름의 에너지 결합.',
        tip: '물에 손 담그거나 징검다리 건너기. 30분 이상 물 소리 들으며 앉아 있기.',
        tags: ['도심', '흐르는물', '접촉', '접근성'],
        mapUrl: 'https://map.naver.com/p/search/청계천',
      },
      {
        id: 'su-5',
        name: '조선팰리스 강남',
        address: '강남구 테헤란로 223',
        category: '호텔',
        fengshui:
          '물 정원 + 부드러운 곡선 인테리어. 수 기운을 가장 세련되게 체험할 수 있는 5성급 호텔.',
        tip: '로비 수공간 앞 소파에서 30분 명상. 온수 스파 이용 추천.',
        tags: ['5성급', '물정원', '강남', '스파'],
        mapUrl: 'https://map.naver.com/p/search/조선팰리스강남',
      },
      {
        id: 'su-6',
        name: '그랜드 하얏트 서울',
        address: '용산구 소월로 322',
        category: '호텔',
        fengshui:
          '남산 중턱 입지 + 야외 수영장 + 자연 수맥. 자연 수기와 인공 수기가 공존하는 복합 수 에너지 공간.',
        tip: '야외 풀 이용 (여름 한정). 물소리 들으며 선베드에서 2시간.',
        tags: ['5성급', '야외풀', '남산', '수맥'],
        mapUrl: 'https://map.naver.com/p/search/그랜드하얏트서울',
      },
      {
        id: 'su-7',
        name: '선릉·정릉 공원',
        address: '강남구 선릉로 100길',
        category: '공원',
        fengshui:
          '양재천+탄천+한강 삼수합류(三水合流) 지점 근처. 재물이 가장 강하게 모이는 풍수 명당으로 꼽힘.',
        tip: '능 내 산책로 걷기. 잔디밭 앉아서 명상. 직장인 점심 산책 추천.',
        tags: ['왕릉', '삼수합류', '재물운', '강남'],
        mapUrl: 'https://map.naver.com/p/search/선릉정릉',
      },
      {
        id: 'su-8',
        name: '압구정 한강변 산책로',
        address: '강남구 압구정동 한강공원',
        category: '공원',
        fengshui:
          '한강이 활처럼 휘감는 환포 지형. 재물이 쌓이고 보존되는 입지. 청담동도 옛 지명 청수골로 수기 강한 동네.',
        tip: '저녁 산책, 강 바라보며 걸으며 걱정 흘려보내기. 압구정로데오 연계 코스.',
        tags: ['환포지형', '재물운', '강남', '한강뷰'],
        mapUrl: 'https://map.naver.com/p/search/압구정한강공원',
      },
    ],
  },
};

/**
 * 부족한 오행에 따른 추천 명소 가져오기
 */
export function getRecommendedSpots(lacking: OhangType[]): OhangSpots[] {
  if (lacking.length === 0) return [];
  return lacking.map((ohang) => SPOTS_DATA[ohang]);
}

/**
 * 과다 오행에 따른 냉각 명소 가져오기 (현재 화만 지원)
 */
export function getAvoidanceSpots(excess: OhangType[]): OhangSpots[] {
  return excess
    .map((ohang) => SPOTS_DATA[ohang])
    .filter((s) => s.avoidSpots && s.avoidSpots.length > 0);
}
