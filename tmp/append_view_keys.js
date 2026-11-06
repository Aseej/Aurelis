const fs = require('fs');

const newMaiTranslations = {
  'dashboard.addNewTopic': 'नयाँ पाठ दर्ज करू',
  'dashboard.todayRecallSchedule': 'आइ-क स्मरण तालिका',
  'dashboard.continueSession': 'दैनिक स्मरण आरम्भ करू',
  'dashboard.noReviewsDue': 'आइ सबहि पुनरावलोकन सम्पन्न अछि',
  'dashboard.attentionNeeded': 'तत्काल ध्यान आवश्यक',
  'queue.title': 'स्पेस्ड रिपीटिशन स्मरण सूची',
  'queue.subtitle': 'एबिंगहास विस्मरण वक्र पर आधारित स्वचालित ७-चरणीय स्मरण इन्जिन',
  'queue.markDone': 'शीघ्र दर्ज',
  'queue.startRecall': 'स्मरण आरम्भ करू',
  'subjects.title': 'विषय आ स्मरण दक्षता',
  'subjects.subtitle': 'मुख्य अकादमिक पाठ्यक्रम आ वैज्ञानिक पुनरावलोकन तालिका',
  'subjects.addSubject': 'नयाँ विषय जोड़ू',
  'tests.title': 'साप्ताहिक परीक्षा आ मूल्याङ्कन',
  'tests.subtitle': 'विस्तृत परीक्षामे प्रदर्शन जाँ Nazू आ विस्मरण-प्रतिरोध प्रमाणित करू',
  'errors.title': 'त्रुटि पोथी आ परीक्षाक भूल',
  'errors.subtitle': 'प्रश्नक भूल, सूत्र भ्रम आ वैचारिक कमीकेँ व्यवस्थित रूपेँ दर्ज करू',
  'errors.unresolved': 'असमाधानित',
  'errors.resolved': 'समाधानित',
  'landing.heroTitle': 'जे आवश्यक अछि, ओकरा मोन राखू।',
  'landing.heroSubtitle': 'आइ जे पढ़लहुँ ओकरा महिना बाद धरि मोन राखू। गम्भीर अकादमिक परीक्षा लेल वैज्ञानिक स्पेस्ड रिपीटिशन।',
  'landing.getStarted': 'अध्ययन आरम्भ करू',
  'landing.methodTitle': 'स्वचालित स्पेस्ड रिपीटिशन समयरेखा',
  'landing.ctaTitle': 'जटिल योजनाक आवश्यकता नहि अछि।',
  'landing.ctaSubtitle': 'आइ जे पढ़लहुँ ओकरा दर्ज करू। काल्हि AURELIS खोलू आ ठीक देखू जे ककरा पर ध्यान देबय पड़त।',
};

const newEnTranslations = {
  'dashboard.addNewTopic': 'Record New Topic',
  'dashboard.todayRecallSchedule': "Today's Recall Schedule",
  'dashboard.continueSession': 'Start Daily Queue',
  'dashboard.noReviewsDue': 'All caught up today',
  'dashboard.attentionNeeded': 'Need Immediate Attention',
  'queue.title': 'Spaced Repetition Queue',
  'queue.subtitle': 'Automated 7-stage recall engine based on the Ebbinghaus forgetting curve',
  'queue.markDone': 'Quick Log',
  'queue.startRecall': 'Start Recall',
  'subjects.title': 'Subjects & Mastery',
  'subjects.subtitle': 'Core academic examination syllabus and spaced repetitions',
  'subjects.addSubject': 'Add Subject',
  'tests.title': 'Weekly Tests & Assessment',
  'tests.subtitle': 'Track performance on comprehensive tests and verify spaced recall retention',
  'errors.title': 'Error Notebook & Mistakes',
  'errors.subtitle': 'Systematically record mistakes, formula confusions, and misconceptions',
  'errors.unresolved': 'Unresolved',
  'errors.resolved': 'Resolved',
  'landing.heroTitle': 'Remember what matters.',
  'landing.heroSubtitle': 'Turn what you study today into what you remember months from now. Spaced repetition engineered for demanding academic examinations.',
  'landing.getStarted': 'Begin Setup',
  'landing.methodTitle': 'Automatic Spaced Repetition Timeline',
  'landing.ctaTitle': "You don't need a complicated plan.",
  'landing.ctaSubtitle': 'Log what you study today. Open AURELIS tomorrow to see exactly what needs your attention.',
};

function appendKeys(file, map) {
  let content = fs.readFileSync(file, 'utf8');
  const lastBraceIdx = content.lastIndexOf('};');
  let toInsert = '\n  // View Headers & Primary Banners\n';
  for (const [k, v] of Object.entries(map)) {
    if (!content.includes(`'${k}'`)) {
      toInsert += `  '${k}': '${v.replace(/'/g, "\\'")}',\n`;
    }
  }
  content = content.slice(0, lastBraceIdx) + toInsert + content.slice(lastBraceIdx);
  fs.writeFileSync(file, content, 'utf8');
}

appendKeys('src/i18n/locales/mai.ts', newMaiTranslations);
appendKeys('src/i18n/locales/en.ts', newEnTranslations);
console.log('Appended 24 primary view keys to mai.ts and en.ts successfully!');
