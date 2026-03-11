const main_title = document.querySelector('.main-title');
const main_subtitle = document.querySelector('.main-subtitle');

if(main_title) {
    setTimeout(() => {
        main_title.classList.add('active');
        main_subtitle.classList.add('active');
    }, 100);
}

window.addEventListener('dragstart', event => {
    if(event.target.tagName == 'IMG') event.preventDefault();
});

window.addEventListener('scroll', () => {
    const title_container = document.querySelector('.title-container');
    const translate_container = document.querySelector('.translate-container');

    const triggerHeight_f = window.innerHeight;
    const triggerHeight_s = window.innerHeight * 0.8;

    if(main_subtitle && title_container) {
        if((main_subtitle.getBoundingClientRect().top < triggerHeight_f) && (main_subtitle.getBoundingClientRect().bottom > 0)) {
            main_subtitle.classList.add('active');
        }
        else {
            main_subtitle.classList.remove('active');
        }

        if((title_container.getBoundingClientRect().top < triggerHeight_s) && (title_container.getBoundingClientRect().bottom > 0)) {
            title_container.classList.add('active');
        }
        else {
            title_container.classList.remove('active');
        }
    }

    if(translate_container) {
        Array.from(translate_container).forEach(container => {
            if((container.getBoundingClientRect().top < triggerHeight) && (container.getBoundingClientRect().bottom > 0)) {
                container.classList.add('active');
            }
            else {
                container.classList.remove('active');
            }
        });
    }
});

window.showTextContainer = () => {
    const text_container = document.getElementById('text-container');
    const file_container = document.getElementById('file-container');
    const quiz_container = document.getElementById('quiz-container');

    if(text_container && file_container && quiz_container) {
        text_container.classList.add('active');
        text_container.classList.remove('standby');

        file_container.classList.remove('active');
        file_container.classList.add('standby');

        quiz_container.classList.remove('active');
        quiz_container.classList.add('standby');
    }
};

window.swapLanguages = () => {
    const input_label = document.getElementById('input-label');
    const output_label = document.getElementById('output-label');

    const input_text = document.getElementById('input-text');
    const output_text = document.getElementById('output-text');

    if(input_label.textContent == '표준어') {
        input_label.textContent = '제주어';
        output_label.textContent = '표준어';

        let input_memory = input_text.value;
        let output_memory = output_text.value;

        if(input_memory != '' && output_memory != '') {
            input_text.value = output_memory;
            output_text.value = input_memory;
        }
        else {
            input_text.value = '';
            output_text.value = '';
        }
    }
    else if(input_label.textContent == '제주어') {
        input_label.textContent = '표준어';
        output_label.textContent = '제주어';

        let input_memory = input_text.value;
        let output_memory = output_text.value;

        if(input_memory != '' && output_memory != '') {
            input_text.value = output_memory;
            output_text.value = input_memory;
        }
        else {
            input_text.value = '';
            output_text.value = '';
        }
    }
};

window.translateText = () => {
    const input_text = document.getElementById('input-text');
    const output_text = document.getElementById('output-text');

    if(!input_text.value) {
        alert('번역할 텍스트를 입력하세요.');
        return;
    }

    fetch('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: input_text.value })
    })
    .then(response => response.json())
    .then(data => {
        if(data.output_text) output_text.value = data.output_text;
        else alert('번역 실패' || data.error);
    })
    .catch(error => {
        console.error('ERROR : ', error);
        alert('번역 중 오류가 발생했습니다.');
    });
};

window.showFileContainer = () => {
    const text_container = document.getElementById('text-container');
    const file_container = document.getElementById('file-container');
    const quiz_container = document.getElementById('quiz-container');

    if(text_container && file_container && quiz_container) {
        file_container.classList.add('active');
        file_container.classList.remove('standby');

        text_container.classList.remove('active');
        text_container.classList.add('standby');

        quiz_container.classList.remove('active');
        quiz_container.classList.add('standby');
    }
};

const file_input = document.getElementById('file-input');
const file_inform = document.getElementById('file-inform');

window.triggerFileInput = () => {
    if(file_input) file_input.click();
};

file_input.addEventListener('change', () => {
    const file = file_input.files[0];

    if (!file) {
        alert('파일이 선택되지 않았습니다.');
        file_inform.textContent = '파일 없음';
        return;
    }

    const form_data = new FormData();
    form_data.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: form_data
    })
    .then(response => response.json())
    .then(data => {
        if (!data.error) {
            alert('파일 업로드 성공' || data.message);
            file_inform.textContent = `${file.name}`;
        } else {
            alert('파일 업로드 실패' || data.error);
            file_inform.textContent = '파일 없음';
        }
    })
    .catch(error => {
        console.error('ERROR:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
    });
});

window.translateFile = () => {
    const original_file = file_inform.textContent;
    const translated_file = original_file.replace(/\.[^/.]+$/, '_translated.txt');

    if(original_file == '파일 없음') {
        alert('업로드 된 파일이 없습니다.');
        return;
    }

    fetch('/translate_file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: original_file })
    })
    .then(response => {
        if(response.ok) return response.blob();
        else return response.json().then(data => {
            throw new Error('번역 실패' || data.error);
        });
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = translated_file;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        fetch('/delete_files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                original_file: original_file,
                translated_file: translated_file
            })
        })
        .then(response => response.json())
        .then(data => {
            file_inform.textContent = '파일 없음';
            
            if(data.message) {
                console.log(data.message);
            } else {
                console.error('파일 삭제 실패');
            }
        })
        .catch(error => {
            console.error('파일 삭제 중 오류 발생:', error);
        });
    })
    .catch(error => {
        console.error('ERROR:', error);
        alert('파일 다운로드 중 오류가 발생했습니다.');
    });
}

window.showQuizContainer = () => {
    const text_container = document.getElementById('text-container');
    const file_container = document.getElementById('file-container');
    const quiz_container = document.getElementById('quiz-container');

    if(text_container && file_container && quiz_container) {
        quiz_container.classList.add('active');
        quiz_container.classList.remove('standby');

        text_container.classList.remove('active');
        text_container.classList.add('standby');

        file_container.classList.remove('active');
        file_container.classList.add('standby');
    }
};

let dialects = [];
let currentIndex = 0;

window.shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

fetch('/static/dialects.json')
.then(response => response.json())
.then(data => {
  dialects = data;
  shuffleArray(dialects);
  loadDialect();
})
.catch(error => {
    console.error('Error loading the JSON file:', error)
});

window.loadDialect = () => {
    const quizArea = document.querySelector('.quiz-area');
    
    dialects.forEach((text, index) => {
        const div = document.createElement('div');
        div.id = `text-${index}`;
        div.className = "dialect-text hidden";
        div.textContent = text.question;
        quizArea.appendChild(div);
    });

    document.getElementById('text-0').className = "dialect-text current"; 
    document.getElementById('text-1').className = "dialect-text below";
    document.getElementById('text-2').className = "dialect-text hidden";
};

window.nextDialect = async () => {
    const totalTexts = dialects.length;
    const userAnswer = document.getElementById("answer-input").value.trim();
    const correctAnswer = dialects[currentIndex].answer;

    const response = await fetch('/check_similarity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            answer_string: correctAnswer,
            input_string: userAnswer
        })
    });

    const data = await response.json();
    const similarity = data.similarity;

    if (similarity >= 0.8) {
        alert("정답입니다! (" + similarity.toFixed(2) + "%)");
    } else {
        alert("오답입니다! (" + similarity.toFixed(2) + "%)\n\n정답 : " + correctAnswer);
    }

    document.getElementById("answer-input").value = "";

    const prevIndex = (currentIndex - 1 + totalTexts) % totalTexts;
    const nextIndex = (currentIndex + 1) % totalTexts;

    const prevText = document.getElementById(`text-${prevIndex}`);
    const currentText = document.getElementById(`text-${currentIndex}`);
    const nextText = document.getElementById(`text-${nextIndex}`);

    prevText.className = "dialect-text hidden";
    currentText.className = "dialect-text above";
    nextText.className = "dialect-text current";

    const newNextIndex = (nextIndex + 1) % totalTexts;
    const newNextText = document.getElementById(`text-${newNextIndex}`);
    newNextText.className = "dialect-text below";

    currentIndex = nextIndex;
};