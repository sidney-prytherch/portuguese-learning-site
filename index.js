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
                    loadNutsAndBolts(lessonNumber, pageNumber)
                        .then(() => {
                            $('#main').slideDown(700);
                        });
                    break;
                case 'V':
                    loadVocabulary(lessonNumber, pageNumber);
                    $('#main').slideDown(700);
                    break;
                case 'P':
                    loadPractice(lessonNumber, pageNumber);
                    $('#main').slideDown(700);
                    break;
                case 'E':
                    loadExtra(lessonNumber, pageNumber);
                    $('#main').slideDown(700);
                    break;
            }
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

async function loadNutsAndBolts(lessonNumber, pageNumber) {
    let json = nutsAndBoltsJson;
    let tips = json['lessons'][lessonNumber]['nutsAndBolts'][pageNumber]['tips'];
    let mainString = '<article>';
    const audioString = 'audio/L' + lessonNumber + '/NB' + pageNumber + '/';
    for (let tipNumber in tips) {
        let tip = tips[tipNumber];
        if (tipNumber === '1') {
            if (tip.hasOwnProperty('tip category')) {
                mainString += getHeader(lessonNumber, 'Nuts and Bolts ' + pageNumber + ' - ' + format(tip['tip category']));
            } else {
                mainString += getHeader(lessonNumber, 'Nuts and Bolts ' + pageNumber);
            }
        }
        if (tip.hasOwnProperty('tip')) {
            mainString += '<p>' + format(tip['tip']) + '</p>';
        }
        if (tip.hasOwnProperty('table')) {
            let table = tip['table'];
            let formats = {};
            if (table.length > 0) {
                mainString += '<table class="table bordered">';
                let headerRow = table[0];
                let containsHeader = false;
                for (let property in headerRow) {
                    if (headerRow[property].replace('_', '').replace('*', '').replace('-', '').replace('~', '').length > 0) {
                        containsHeader = true;
                        break;
                    }
                }
                for (let property in headerRow) {
                    if (headerRow[property].indexOf('_') != -1) { //italics
                        formats[property] = '_';
                    } else if (headerRow[property].indexOf('*') != -1) { //bold
                        formats[property] = '*';
                    } else if (headerRow[property].indexOf('~') != -1) { //format
                        formats[property] = '~';
                    } else { //nothing
                        formats[property] = '-';
                    }
                    let columnHeader = headerRow[property].replace('_', '').replace('*', '').replace('-', '').replace('~', '');
                    if (containsHeader) {
                        if (property === 'col1') {
                            mainString += '<thead><tr>';
                        }
                        if (columnHeader.length === 0) {
                            mainString += '<th style="border: none">' + columnHeader + '</th>';
                        } else {
                            mainString += '<th>' + columnHeader + '</th>';
                        }
                        
                    }
                }
                if (containsHeader) {
                    mainString += '</tr></thead>';
                }

                for (let rowCount = 1; rowCount < table.length; rowCount++) {
                    mainString += '<tr>';
                    for (let cell in table[rowCount]) {
                        const column = cell.replace('col', '');
                        const audioId = tipNumber + '-' + rowCount + '-' + column;
                        const portAudio = audioString + 'P' + audioId;
                        const engAudio = audioString + 'E' + audioId;
                        let portugueseAudioExists = true;
                        let englishAudioExists = true;
                        await Promise.all([UrlExists(portAudio + '.mp3'), UrlExists(engAudio + '.mp3')]).then((values) => {
                            portugueseAudioExists = values[0];
                            englishAudioExists = values[1];
                        });
                        let cellContent = table[rowCount][cell];
                        mainString += '<td class="col-md-2">';
                        if (formats[cell] === '-') {
                            mainString += cellContent;
                        } else if (formats[cell] === '*') {
                            if (portugueseAudioExists) {
                                mainString += '<audio id="' + portAudio + '" src="' + portAudio + '.mp3" preload="auto"></audio>';
                                mainString += '<button class="audio" onclick="document.getElementById(\'' + portAudio + '\').play();">';
                                mainString += '<b>' + cellContent + '</b>' + ' <span class="glyphicon glyphicon-volume-up"></span></button>';
                            } else {
                                mainString += '<b>' + cellContent + '</b>';
                            }
                        } else if (formats[cell] === '~') {
                            let newCellContent = format(cellContent).split('(');
                            if (newCellContent.length === 2) {
                                if (portugueseAudioExists) {
                                    mainString += '<audio id="' + portAudio + '" src="' + portAudio + '.mp3" preload="auto"></audio>';
                                    mainString += '<button class="audio" onclick="document.getElementById(\'' + portAudio + '\').play();">';
                                    mainString += newCellContent[0] + ' <span class="glyphicon glyphicon-volume-up"></span></button>';
                                } else {
                                    mainString += newCellContent[0];
                                }
                                if (englishAudioExists) {
                                    mainString += '<audio id="' + engAudio + '" src="' + engAudio + '.mp3" preload="auto"></audio>';
                                    mainString += '<button class="audio" onclick="document.getElementById(\'' + engAudio + '\').play();">';
                                    mainString += '(' + newCellContent[1].replace(')', '') + ' <span class="glyphicon glyphicon-volume-up"></span>)</button>';
                                } else {
                                    mainString += '(' + newCellContent[1];
                                }
                            }
                        } else if (formats[cell] === '_') {
                            if (englishAudioExists) {
                                mainString += '<audio id="' + engAudio + '" src="' + engAudio + '.mp3" preload="auto"></audio>';
                                mainString += '<button class="audio" onclick="document.getElementById(\'' + engAudio + '\').play();">';
                                mainString += '<i>' + cellContent + '</i>' + ' <span class="glyphicon glyphicon-volume-up"></span></button>';
                            } else {
                                mainString += '<i>' + cellContent + '</i>';
                            }
                        }
                        mainString += '</td>';
                    }
                    mainString += '</tr>';
                }
                mainString += '</table>';
            }
        }
        let list = tip.hasOwnProperty('list') ? tip['list'] : [];
        let listNum = 1;
        for (let item in list) {
            const audioId = tipNumber + '-' + listNum;
            const portAudio = audioString + 'P' + audioId;
            const engAudio = audioString + 'E' + audioId;
            let portugueseAudioExists = true;
            let englishAudioExists = true;
            await Promise.all([UrlExists(portAudio + '.mp3'), UrlExists(engAudio + '.mp3')]).then((values) => {
                portugueseAudioExists = values[0];
                englishAudioExists = values[1];
            });
            mainString += '<div class="lesson-list">';
            if (list[item].hasOwnProperty('portuguese')) {
                if (portugueseAudioExists) {
                    mainString += '<audio id="' + portAudio + '" src="' + portAudio + '.mp3" preload="auto"></audio>';
                    mainString += '<button class="audio" onclick="document.getElementById(\'' + portAudio + '\').play();">';
                    mainString += '<b>' + list[item]['portuguese'] + '</b>' + ' <span class="glyphicon glyphicon-volume-up"></span></button>';
                } else {
                    mainString += '<b>' + list[item]['portuguese'] + '</b>';
                }
            }
            if (list[item].hasOwnProperty('english')) {
                mainString += '</br>';
                if (englishAudioExists) {
                    mainString += '<audio id="' + engAudio + '" src="' + engAudio + '.mp3" preload="auto"></audio>';
                    mainString += '<button class="audio" onclick="document.getElementById(\'' + engAudio + '\').play();">';
                    mainString += '<i>' + list[item]['english'] + '</i>' + ' <span class="glyphicon glyphicon-volume-up"></span></button>';
                } else {
                    mainString += '<i>' + list[item]['english'] + '</i>';
                }
            }
            mainString += '</br></div>';
            listNum++;
        }
    }

    mainString += '</article>';
    $('#main').append(mainString);
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
        mainString += '<p>' + format(formatForTables(vocab['beforeNotes'])) + '</p>';
    }

    mainString += '<table class="table"><thead><tr><th>Portuguese</th><th>English</th></thead></tr><tbody>';
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
    mainString += '</tbody></table>';

    if (vocab['afterNotes']) {
        mainString += '</br><p><b>Notes</b></p><p>' + format(formatForTables(vocab['afterNotes'])) + '</p></br>';
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
    while(string.indexOf('`') >= 0) {
        string = string.replace('`', '<u>').replace('`', '</u>');
    }
    while(string.indexOf('\n') >= 0) {
        string = string.replace('\n', '</br></br>');
    }
    while(string.indexOf('\\n') >= 0) {
        string = string.replace('\\n', '</br></br>');
    }
    while(string.indexOf('</br><b>') >= 0) {
        string = string.replace('</br><b>', '</br></br> <b>'); //o espaço é importante
    }
    return string;
}

function formatForTables(string) {
    console.warn(string);
    let tables = string.match(/\[([^\]])+\]/g);
    console.warn(tables);
    for (let i in tables) {
        let table = tables[i];
        string = string.replace('[', '</p><table class="table bordered"><tbody>');
        console.warn(table);
        let rows = table.match(/\{([^\}])+\}/g);
        console.warn(rows);
        for (let j in rows) {
            let row = rows[j];
            string = string.replace('{', '<tr><td>');
            let bars = row.match(/\|/g);
            console.warn(bars);
            for (let k in bars) {
                string = string.replace('|', '</td><td>');
            }
            string = string.replace('}', '</td></tr>');
        }
        string = string.replace(']', '</tbody></table><p>');
    }
    while (string.indexOf('<td></td>') >= 0) {
        string = string.replace('<td></td>', '');
    }
    return string;
}

function loadPractice(lessonNumber, pageNumber) {

}

function loadExtra(lessonNumber, pageNumber) {

}

function loadUnitEssentials(lessonNumber, pageNumber) {

}

function UrlExists(url) {
    return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, true);
        http.onload = () => {
            resolve(http.status != '404');
        };
        http.onerror = () => {
            resolve(true);
        };
        http.send();
    });
}