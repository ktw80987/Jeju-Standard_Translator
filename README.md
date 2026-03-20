# 🍊 제주어-표준어 번역기

제주어,표준어 간 양방향 번역 및 제주어 학습을 위한 퀴즈 기능을 제공하는 웹 서비스입니다.

## ✨ 주요 기능

- **텍스트 번역**: 사용자가 입력한 문장을 실시간으로 번역합니다.
- - **양방향 번역**
  - - 제주어 ➡️ 표준어 번역
    - 표준어 ➡️ 제주어 번역
- **문서 번역**
  - txt, pdf 파일 업로드 후 번역 결과를 txt 파일로 다운로드합니다.
- **제주어 퀴즈**
  - 사용자가 제주어를 보다 재밌게 학습할 수 있는 퀴즈 기능을 제공합니다.

## 📁 프로젝트 구조
``` bash
Jeju-Standard_Translator/
├── app.py                  # Flask 애플리케이션 실행 파일
├── templates/
│   └── index.html          # 메인 프론트엔드 페이지
├── static/
│   ├── css/                # 스타일시트 파일
│   ├── js/                 # 프론트엔드 JavaScript 로직
│   └── img/                # 아이콘 및 이미지 리소스
├── model/
│   └── pkot5_weights.pth   # Fine-tuned 번역 모델 가중치 (필요)
├── uploads/                # 업로드된 문서 및 번역 결과물 저장소
├── requirements.txt        # Python 패키지 의존성 목록
└── README.md               # 프로젝트 설명 문서
```

## ⚙️ 환경 세팅 및 실행
### 의존성 설치
``` bash
pip install -r requirements.txt
```
### 업로드 폴더 생성
``` bash
mkdir -p uploads
```
### 서버 실행
```bash
python app.py
```

#### 📌 참고 사항

실행 전에 `model` 내부에 `pkot5_weights.pth` 가중치 파일을 준비해야 합니다.

## 🛠 기술 스택

| 분류 | 사용 기술 |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Backend** | Python, Flask |
| **AI** | PyTorch, HuggingFace Transformers, Sentence-Transformers, Scikit-learn |

# 📊 프로젝트 세부 사항
---
## 1.데이터셋
- AI Hub: 한국어 방언 발화(제주도), 중노년층 한국어 방언 데이터
- WORDROW/제주도 사투리 크롤링: `명사`, `형용사`, `동사`, `의존명사`, `부사`, `관형사`, `어미`, `감탄사`, `대명사`, `조사`, `품사없음`

## 2.전처리 결과
- 확장자: JSON
- 총 크기: 155MB
- 데이터셋 분할: Train 6182 / Validation 462 / Test 463 (약 8:1:1)

## 3.모델 및 학습 환경
- 개발 환경: Google Cloud Platform Vertex AI (Jupyter Notebook)
- 하드웨어 사양: NVIDIA Tesla A100 (40GB) 1개 / vCPU 12개 / RAM 85GB
- 베이스 모델: paust/pko-t5-base (T5 기반 한국어 모델)
- 모델 선정(BART vs T5): BART 대비 T5의 기계 번역 성능이 우수함을 [논문](https://github.com/user-attachments/files/26134725/Advancing_Wolof-French_Sentence_Translation_Comparative_Analysis_of_Transformer-Based_Models_and_Methodological_Insights.pdf)을 통해 확인하여 T5 계열 채택

### 🤖 사용 모델
- **Base model**: paust/pko-t5-base (T5 기반 한국형 모델)
 
### 🔧학습 방법: Full Fine-Tuning
#### 학습 전략
- JSON 데이터셋에서 표준어와 방언 쌍을 호출
- 정의된 클래스 내부에서 (방언, 표준어), (표준어, 방언) 쌍을 배열에 추가하여 데이터 증강 처리
- 모델 전달용 Dataset 및 DataLoader 구축으로 양방향 번역 환경 최적화


## 📝 라이선스 (License)
이 프로젝트는 MIT License를 따릅니다.
