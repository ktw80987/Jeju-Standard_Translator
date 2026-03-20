# 🍊 제주어-표준어 번역기

제주어와 표준어 간의 양방향 번역 및 제주어 학습을 위한 퀴즈 기능을 제공하는 웹 서비스입니다.

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
│   └── index.html          # 메인 웹 페이지
├── static/
│   ├── css/                # 스타일 파일
│   ├── js/                 # 프론트엔드 JavaScript
│   └── img/                # 이미지/아이콘 리소스
├── model/
│   └── pkot5_weights.pth   # Fine-tuned 번역 모델 가중치
├── uploads/                # 업로드된 문서와 번역 결과 파일 저장 폴더
├── requirements.txt        # Python 패키지 의존성
└── README.md               # 프로젝트 설명 문서
```

## ⚙️ 설치 및 실행
1. 의존성 설치
``` bash
pip install -r requirements.txt
```
2. 업로드 폴더 생성
``` bash
mkdir -p uploads
```
3. 서버 실행
```bash
python app.py
```

### 📌 참고 사항

실행 전에 `model` 내부에 `pkot5_weights.pth` 가중치 파일을 준비해야 합니다.


## 🛠 기술 스택

### 프론트엔드
- HTML5
- CSS3
- JavaScript

### 백엔드 / AI
- Flask
- Python
- Pytorch
- HF Transformers
- Sentence-Transformers
- Scikit-learn

## 프로젝트 세부 사항

### 데이터셋
- AI Hub: 한국어 방언 발화(제주도), 중노년층 한국어 방언 데이터
- WORDROW/제주도 사투리: 아래 항목들 크롤링
`명사`, `형용사`, `동사`, `의존명사`, `부사`, `관형사`, `어미`, `감탄사`, `대명사`, `조사`, `품사없음`

### 전처리 결과
- 확장자: JSON
- 총 크기: 155MB
- 데이터셋 분할: Train 6182 / Validation 462 / Test 463 (약 8:1:1)

### 개발 환경
- Google Cloud Platform의 Vertex AI (Jupyter Notebook)
- GPU: NVIDIA Tesla A100 40GB 1개, CPU: vCPU 12개, RAM: 85GB

### 학습 모델 선정: BART vs T5
- [Advancing_Wolof-French_Sentence_Translation_Comparative_Analysis_of_Transformer-Based_Models_and_Methodological_Insights.pdf](https://github.com/user-attachments/files/26134725/Advancing_Wolof-French_Sentence_Translation_Comparative_Analysis_of_Transformer-Based_Models_and_Methodological_Insights.pdf)
- 위 논문의 T5 기계 번역 성능이 더 높은것을 확인하여 T5 계열로 선정

### 🤖 사용 모델
- **Base model**: paust/pko-t5-base (T5 기반 한국형 모델)
 
### 학습 방법: Full Fine-Tuning
#### 학습 전략
- JSON 데이터셋으로부터 표준어와 방언 키-값을 호출하여, 
정의된 클래스 내부에서 (방언, 표준어), (표준어, 방언) 쌍을 data 배열에 추가하여 데이터 증강,
모델에 전달할 Dataset 및 DataLoader 구축 및 양방양 번역 환경 마련


## 📝 라이선스 (License)
이 프로젝트는 MIT License를 따릅니다.
