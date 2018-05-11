const unitCategories = {
    1: "Saying Hello",
    2: "Talking about the Family",
    3: "Everyday Life",
    4: "Talking about Health",
    5: "On the Phone",
    6: "Around Town",
    7: "Shopping",
    8: "In a Restaurant",
    9: "Work and School",
    10: "Sports and Leisure",
}

let glyphTimestamp = null;
const glyphSpeed = 300;

window.addEventListener('load', event => {
    lastTimeUrlChanged = Date.now();
    loadPage();
}, false);
    
window.addEventListener('hashchange', event => {
    clearTimeout(glyphTimestamp);
    glyphTimestamp = setTimeout(() => {
        showCorrectGlyph();
    }, glyphSpeed + 200);
    loadPage();
}, false);

function loadPage() {
    if (window.location.href.indexOf('#') > -1) {
        const hash = window.location.href.replace(/.+#/g, '');
        const splitHash = hash.split('/');
        if (splitHash[0].charAt(0) === 'U') {
            const unitNumber = splitHash[0].replace(/\D*/g, '');
            loadUnitEssentials(unitNumber);
            return;
        }
        const lessonNumber = splitHash[0].replace(/\D*/g, '');
        const pageType = splitHash[1].replace(/\d*/g, '');
        const pageNumber = splitHash[1].replace(/\D*/g, '');
        showCorrectGlyph();
        $('#main').slideUp(700, function() {
            $('#main').empty();
            switch (pageType) {
                case 'NB':
                    loadNutsAndBolts(lessonNumber, pageNumber);
                    break;
                case 'V':
                    loadVocabulary(lessonNumber, pageNumber);
                    break;
                case 'P':
                    loadPractice(lessonNumber, pageNumber);
                    break;
                case 'E':
                    loadExtra(lessonNumber, pageNumber);
                    break;
            }
            $('#main').slideDown(700);
        });
    }
}

function showCorrectGlyph() {
    const hash = window.location.href.replace(/.+#/g, '');
    $('.sectionLink').each(function(index) {
        let glyph = $(this).parent().find('.glyphicon');
        if ($(this).attr('href').replace('#', '') === hash) {
            if ($(glyph).hasClass('glyphicon-minus')) {
                $(glyph).fadeOut(glyphSpeed, function() {
                    $(glyph).removeClass('glyphicon-minus');
                    $(glyph).addClass('glyphicon-arrow-right');
                    $(glyph).fadeIn(glyphSpeed);
                });
            }
        } else if ($(glyph).hasClass('glyphicon-arrow-right')) {
            $(glyph).fadeOut(glyphSpeed, function() {
                $(glyph).removeClass('glyphicon-arrow-right');
                $(glyph).addClass('glyphicon-minus');
                $(glyph).fadeIn(glyphSpeed);
            });
        }
    });
}

function loadNutsAndBolts(lessonNumber, pageNumber) {

}

function loadVocabulary(lessonNumber, pageNumber) {
    const lessonType = lessonNumber % 4;
    let vocabType;
    let json;
    let extraString;
    switch (lessonType) {
        case 0:
            vocabType = 'conversations';
            json = conversationsJson;
            description = 'Conversation';
            break;
        case 1:
            vocabType = 'words';
            json = wordsJson;
            description = 'Word List';
            break;
        case 2:
            vocabType = 'phrases';
            json = phrasesJson;
            description = 'Phrase List';
            break;
        case 3:
            vocabType = 'sentences';
            json = sentencesJson;
            description = 'Sentence List';
            break;
    }
    const vocab = json['lessons'][lessonNumber]['sections'][pageNumber];
    let mainString = '<article>' + getHeader(lessonNumber, description + ' ' + pageNumber);

    if (vocab['beforeNotes']) {
        mainString += '<p>' + format(vocab['beforeNotes']) + '</p>';
    }

    mainString += '<table class="table"><tr><th>Portuguese</th><th>English</th></tr>';
    let row = 1;
    const filePath = 'audio/L' + lessonNumber + '/V' + pageNumber;
    for (let vocabObj of vocab[vocabType]) {
        let audioIds = [filePath + '/P' + row, filePath + '/E' + row];
        mainString += '<audio id="' + audioIds[0] + '" src="' + audioIds[0] + '.mp3" preload="auto"></audio>';
        if (vocabType != 'conversations') {
            mainString += '<audio id="' + audioIds[1] + '" src="' + audioIds[1] + '.mp3" preload="auto"></audio>';
        }
        mainString += '';
        mainString += '<tr><td><button class="audio" onclick="document.getElementById(\'' + audioIds[0] + '\').play();">';
        mainString += vocabObj['portuguese'] + ' <span class="glyphicon glyphicon-volume-up"></span></button></td><td><i>';
        if (vocabType != 'conversations') {
            mainString += '<button class="audio" onclick="document.getElementById(\'' + audioIds[1] + '\').play();">'
            mainString += vocabObj['english'] + ' <span class="glyphicon glyphicon-volume-up"></span></button>';
        } else {
            mainString += vocabObj['english'];
        }
        mainString += '</i></td></tr>';
        row++;
    }
    mainString += '</table>';

    if (vocab['afterNotes']) {
        mainString += '<p>' + format(vocab['afterNotes']) + '</p>';
    }

    mainString += '</article>';
    $('#main').append(mainString);
}

function playSound(filePath) {
    alert("On Press of " + filePath);
    var snd = new Audio(filePath);
    snd.play();
    snd.currentTime=0;
}

function getHeader(lessonNumber, section) {
    const unit = Math.ceil(lessonNumber / 4);
    let header = '<h2>Unit ' + unit + ' - ' + unitCategories[unit] + '</h2>';
    header += '<h3>Lesson ' + lessonNumber + ' - ' + section + '</h3><br>';
    return header;
}

function format(string) {
    while(string.indexOf('_') >= 0) {
        string = string.replace('_', '<i>').replace('_', '</i>');
    }
    while(string.indexOf('*') >= 0) {
        string = string.replace('*', '<b>').replace('*', '</b>');
    }
    return string;
}

function loadPractice(lessonNumber, pageNumber) {

}

function loadExtra(lessonNumber, pageNumber) {

}

function loadUnitEssentials(lessonNumber, pageNumber) {

}