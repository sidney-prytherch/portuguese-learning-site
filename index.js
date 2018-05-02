

window.addEventListener('load', event => {
  //console.warn(conversations);
}, false);

window.addEventListener('hashchange', event => {
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
  console.warn(lessonNumber, pageType, pageNumber);
  switch (pageType) {
      case 'NB':
          loadNutsAndBolts(lessonNumber, pageNumber | '1');
          break;
      case 'V':
          loadVocabulary(lessonNumber, pageNumber | '1');
          break;
      case 'P':
          loadPractice(lessonNumber, pageNumber | '1');
          break;
      case 'E':
          loadExtra(lessonNumber, pageNumber | '1');
          break;
  }
}, false);

function loadNutsAndBolts(lessonNumber, pageNumber) {

}

function loadVocabulary(lessonNumber, pageNumber) {
  const lessonType = lessonNumber % 4;
  let vocabType;
  switch (lessonType) {
      case 0:
          vocabType = 'conversations'
          break;
      case 1:
          vocabType = 'words'
          break;
      case 2:
          vocabType = 'phrases'
          break;
      case 3:
          vocabType = 'sentences'
          break;
  }


}

function loadPractice(lessonNumber, pageNumber) {

}

function loadExtra(lessonNumber, pageNumber) {

}

function loadUnitEssentials(lessonNumber, pageNumber) {

}