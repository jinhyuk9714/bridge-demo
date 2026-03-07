# Bridge Studio

브라우저에서 사장교를 직접 조정하고 탐색할 수 있도록 만든 파라메트릭 3D 프로젝트입니다.  
프리셋과 구조 파라미터를 바꾸면 주탑, 케이블, 상판, 접속부가 함께 반응하도록 구성했습니다.

![Bridge Studio 대표 화면](docs/assets/bridge-balanced-2026-03-08-001719.png)

## 소개

`Bridge Studio`는 React와 Three.js 기반의 브라우저 3D 교량 시각화 프로젝트입니다.  
전체화면 뷰포트 안에서 사장교 형상을 조정하고, 카메라를 이동하며, 현재 장면을 이미지로 저장할 수 있습니다.

## 주요 기능

- 사장교 파라미터 조절
- `Compact`, `Balanced`, `Monumental` 프리셋
- `Hero`, `Front`, `Side` 카메라 프리셋
- Orbit / 휠 줌 / `WASD` 이동
- PNG export
- URL 공유
- last session 복원
- 로컬 preset 저장

## 구현 포인트

- 정적 모델 로드가 아니라 파라미터 기반 형상 생성
- H형 주탑, 양측 케이블면, 박스거더, 교대와 접속부 구성
- 황혼 톤의 수변 장면과 저폴리 현장 구조물 배치
- Enter gate, staged boot, instancing 기반 성능 최적화

## 기술 스택

- React 19
- TypeScript
- Vite
- Three.js
- @react-three/fiber
- @react-three/drei
- Zustand
- Vitest

## 실행 방법

```bash
npm install
npm run dev
```

```bash
npm run build
```

```bash
npm test -- --run
```

## 링크

- 저장소: [https://github.com/jinhyuk9714/bridge-demo](https://github.com/jinhyuk9714/bridge-demo)
