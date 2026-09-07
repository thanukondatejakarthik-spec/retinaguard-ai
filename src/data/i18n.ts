import type { SupportedLanguage } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    home: string;
    dashboard: string;
    screening: string;
    history: string;
    telemetry: string;
    signIn: string;
    signOut: string;
    ruralMode: string;
    lowBandwidth: string;
    standardBandwidth: string;
  };
  hero: {
    title: string;
    subtitle: string;
    continueGoogle: string;
    learnHow: string;
    startScreening: string;
    trustedBy: string;
  };
  whyMatters: {
    badge: string;
    title: string;
    description: string;
    stat1Number: string;
    stat1Label: string;
    stat2Number: string;
    stat2Label: string;
    stat3Number: string;
    stat3Label: string;
  };
  howItWorks: {
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  xaiSection: {
    title: string;
    subtitle: string;
    description: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
  };
  disclaimer: {
    bannerTitle: string;
    bannerText: string;
    nonDiagnosisNotice: string;
  };
  screening: {
    title: string;
    subtitle: string;
    patientDetails: string;
    patientId: string;
    patientName: string;
    patientAge: string;
    eyeSide: string;
    rightEye: string;
    leftEye: string;
    facility: string;
    uploadTitle: string;
    uploadInstructions: string;
    orChooseSample: string;
    analyzing: string;
    stage1: string;
    stage2: string;
    stage3: string;
    stage4: string;
    runInference: string;
    reset: string;
    compressedNotice: string;
  };
  results: {
    title: string;
    badge: string;
    classification: string;
    confidence: string;
    icdrScale: string;
    xaiTitle: string;
    xaiDesc: string;
    toggleOverlay: string;
    showMarkers: string;
    detectedLesions: string;
    plainExplanation: string;
    nextSteps: string;
    downloadReport: string;
    saveToHistory: string;
    savedSuccess: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'RetinaGuard AI',
    tagline: 'Explainable Diabetic Retinopathy Screening for Rural India',
    nav: {
      home: 'Overview',
      dashboard: 'Dashboard',
      screening: 'New Screening',
      history: 'Patient Records',
      telemetry: 'Model Health',
      signIn: 'Continue with Google',
      signOut: 'Sign Out',
      ruralMode: 'Rural India Mode',
      lowBandwidth: 'Low Bandwidth (2G/3G)',
      standardBandwidth: 'Standard'
    },
    hero: {
      title: 'AI-Powered Retinal Screening for Everyone',
      subtitle: 'Explainable AI technology designed to support accessible diabetic retinopathy screening, especially in underserved and rural communities.',
      continueGoogle: 'Continue with Google',
      learnHow: 'Learn How It Works',
      startScreening: 'Launch Clinical Screening',
      trustedBy: 'Designed for Primary Health Centers (PHCs), Vision Centers & Rural Clinics'
    },
    whyMatters: {
      badge: 'Public Health Need',
      title: 'Why Diabetic Retinopathy Screening Matters in India',
      description: 'Over 101 million people in India live with diabetes. Diabetic Retinopathy is a leading cause of preventable blindness, yet 80% of ophthalmologists practice in urban centers. Early screening prevents 90% of severe vision loss.',
      stat1Number: '101M+',
      stat1Label: 'People with diabetes in India',
      stat2Number: '90%',
      stat2Label: 'Vision loss preventable with early screening',
      stat3Number: '1 : 100k',
      stat3Label: 'Rural ophthalmologist to population ratio'
    },
    howItWorks: {
      title: 'Clinical Screening Workflow',
      step1Title: '1. Fundus Image Capture',
      step1Desc: 'Capture retinal fundus photograph using portable or desktop fundus cameras.',
      step2Title: '2. Low-Bandwidth Optimization',
      step2Desc: 'Client-side edge compression minimizes payload for 2G/3G connectivity in village centers.',
      step3Title: '3. Real Neural Vision Analysis',
      step3Desc: 'ICDR classification pipeline identifies microaneurysms, hemorrhages, and vascular alterations.',
      step4Title: '4. Explainable Saliency & Guidance',
      step4Desc: 'Grad-CAM visual attention overlays highlight precise pathology for transparent clinician review.'
    },
    xaiSection: {
      title: 'Explainable AI (XAI) – Beyond Black Box Diagnosis',
      subtitle: 'Building Trust with Rural Community Health Workers and Clinicians',
      description: 'Unlike opaque AI models, RetinaGuard AI highlights the exact physiological zones that contributed to the classification. Clinicians see the original fundus image alongside high-resolution saliency maps showing microvascular changes.',
      feature1Title: 'Grad-CAM Attention Maps',
      feature1Desc: 'Gradient-weighted class activation mapping visualizes neural network focus on lesions.',
      feature2Title: 'Microvascular Lesion Isolation',
      feature2Desc: 'Pins point microaneurysms, blot hemorrhages, and hard lipid exudates.',
      feature3Title: 'Accessible Multi-lingual Explanations',
      feature3Desc: 'Plain-language summaries in Telugu, Hindi, and English for patient counseling.'
    },
    disclaimer: {
      bannerTitle: 'Clinical Decision Support Notice',
      bannerText: 'RetinaGuard AI is an assisted screening and triage decision-support tool, NOT a definitive medical diagnosis.',
      nonDiagnosisNotice: 'AI screening result — not a medical diagnosis. Please consult a qualified eye-care professional.'
    },
    screening: {
      title: 'New Retinal Screening',
      subtitle: 'Upload patient fundus photograph for automated ICDR assessment & Explainable AI inspection',
      patientDetails: 'Patient & Center Details',
      patientId: 'Patient ID / Health Card #',
      patientName: 'Patient Name',
      patientAge: 'Age (Years)',
      eyeSide: 'Eye Examined',
      rightEye: 'OD (Right Eye)',
      leftEye: 'OS (Left Eye)',
      facility: 'Screening Center / PHC',
      uploadTitle: 'Upload Retinal Fundus Scan',
      uploadInstructions: 'Drag & drop high-resolution fundus photograph (JPG/PNG) or click to browse.',
      orChooseSample: 'Or select a clinically validated sample scan for testing:',
      analyzing: 'Analyzing Retinal Microvasculature...',
      stage1: 'Preprocessing fundus image & validating optic disc illumination...',
      stage2: 'Evaluating retinal vasculature & microvascular anomalies...',
      stage3: 'Computing Grad-CAM attention maps and ICDR severity classification...',
      stage4: 'Synthesizing Explainable AI findings & non-technical report...',
      runInference: 'Execute AI Screening',
      reset: 'Upload Different Image',
      compressedNotice: 'Edge-compressed for Rural Bandwidth mode'
    },
    results: {
      title: 'AI Screening & Explainability Assessment',
      badge: 'Screening Evaluation',
      classification: 'ICDR Classification',
      confidence: 'Confidence Score',
      icdrScale: 'International Clinical Diabetic Retinopathy Scale',
      xaiTitle: 'Explainable AI (XAI) Attention Overlay',
      xaiDesc: 'Interactive Grad-CAM visualization showing exact retinal regions that triggered the model prediction',
      toggleOverlay: 'XAI Overlay Opacity',
      showMarkers: 'Highlight Detected Lesions',
      detectedLesions: 'Detected Clinical Findings',
      plainExplanation: 'Non-Technical Summary for Patient & Health Worker',
      nextSteps: 'Clinical Referral Guidance',
      downloadReport: 'Download Official Clinical PDF Report',
      saveToHistory: 'Save Record to Patient Database',
      savedSuccess: 'Successfully saved to Firestore cloud database.'
    }
  },

  te: {
    appName: 'రెటీనాగార్డ్ AI',
    tagline: 'గ్రామీణ భారతదేశం కోసం వివరణాత్మక డయాబెటిక్ రెటినోపతి స్క్రీనింగ్',
    nav: {
      home: 'అవలోకనం',
      dashboard: 'డాష్‌బోర్డ్',
      screening: 'కొత్త స్క్రీనింగ్',
      history: 'రోగి రికార్డులు',
      telemetry: 'మోడల్ హెల్త్',
      signIn: 'గూగుల్‌తో లాగిన్ అవ్వండి',
      signOut: 'లాగ్ అవుట్',
      ruralMode: 'గ్రామీణ మోడ్',
      lowBandwidth: 'తక్కువ బ్యాండ్‌విడ్త్ (2G/3G)',
      standardBandwidth: 'స్టాండర్డ్'
    },
    hero: {
      title: 'అందరికీ AI ఆధారిత కంటి రెటీనా స్క్రీనింగ్',
      subtitle: 'గ్రామీణ మరియు వెనుకబడిన ప్రాంతాలలో డయాబెటిక్ రెటినోపతిని ముందుగానే గుర్తించేందుకు వివరణాత్మక ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ సాంకేతికత.',
      continueGoogle: 'గూగుల్ ఖాతాతో కొనసాగండి',
      learnHow: 'ఇది ఎలా పనిచేస్తుందో తెలుసుకోండి',
      startScreening: 'స్క్రీనింగ్ ప్రారంభించండి',
      trustedBy: 'ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC) మరియు గ్రామీణ క్లినిక్‌ల కోసం ప్రత్యేకంగా రూపొందించబడింది'
    },
    whyMatters: {
      badge: 'ప్రజా ఆరోగ్య ప్రాధాన్యత',
      title: 'భారతదేశంలో డయాబెటిక్ రెటినోపతి స్క్రీనింగ్ ఎందుకు ముఖ్యం',
      description: 'భారతదేశంలో 101 మిలియన్ల మందికి పైగా డయాబెటిస్‌తో బాధపడుతున్నారు. సకాలంలో స్క్రీనింగ్ చేయకపోతే కంటి చూపు కోల్పోయే ప్రమాదం ఉంది. ముందుగానే గుర్తిస్తే 90% అంధత్వాన్ని నివారించవచ్చు.',
      stat1Number: '101 మి+ ',
      stat1Label: 'డయాబెటిస్ బాధితులు',
      stat2Number: '90%',
      stat2Label: 'ముందస్తు స్క్రీనింగ్‌తో నివారించదగిన చూపు నష్టం',
      stat3Number: '1 : 100k',
      stat3Label: 'గ్రామీణ నేత్ర వైద్యుల నిష్పత్తి'
    },
    howItWorks: {
      title: 'క్లినికల్ స్క్రీనింగ్ విధానం',
      step1Title: '1. రెటీనా ఫోటో సేకరణ',
      step1Desc: 'పోర్టబుల్ కెమెరా ద్వారా కంటి లోపలి భాగాన్ని ఫోటో తీయండి.',
      step2Title: '2. తక్కువ డేటా ఆప్టిమైజేషన్',
      step2Desc: 'గ్రామీణ 2G/3G ఇంటర్నెట్‌లోనూ వేగంగా అప్‌లోడ్ అయ్యేలా సైజును కుదిస్తుంది.',
      step3Title: '3. నిజమైన న్యూరల్ AI విశ్లేషణ',
      step3Desc: 'రక్తనాళాల మార్పులు, రక్తస్రావాలను గుర్తించి వర్గీకరిస్తుంది.',
      step4Title: '4. వివరణాత్మక దృశ్యం & మార్గదర్శకత్వం',
      step4Desc: 'AI ఎక్కడ సమస్యను గుర్తించిందో స్పష్టమైన రంగు మ్యాప్‌తో చూపిస్తుంది.'
    },
    xaiSection: {
      title: 'వివరణాత్మక AI (XAI) – పారదర్శక సాంకేతికత',
      subtitle: 'ఆరోగ్య కార్యకర్తలు మరియు రోగులకు సులభంగా అర్థమయ్యే విశ్లేషణ',
      description: 'రెటీనాగార్డ్ AI కేవలం ఫలితాన్ని మాత్రమే ఇవ్వకుండా, కంటిలోని ఏ ప్రాంతంలో రక్తస్రావం లేదా వాపు జరిగిందో స్పష్టమైన గ్రాడ్-కామ్ హీట్‌మ్యాప్ ద్వారా వివరిస్తుంది.',
      feature1Title: 'గ్రాడ్-కామ్ శ్రద్ధా మ్యాప్‌లు',
      feature1Desc: 'AI ఏ భాగాన్ని పరిశీలించిందో రంగుల ద్వారా చూపిస్తుంది.',
      feature2Title: 'లక్ష్య ప్రాంతాల గుర్తింపు',
      feature2Desc: 'చిన్న రక్తనాళాల ఉబ్బెత్తులు మరియు స్రావాలను వేరుచేస్తుంది.',
      feature3Title: 'స్థానిక భాషలో వివరణ',
      feature3Desc: 'రోగులకు అర్థమయ్యే సరళమైన తెలుగు వివరణను అందిస్తుంది.'
    },
    disclaimer: {
      bannerTitle: 'క్లినికల్ నిర్ణయ మద్దతు నోటీసు',
      bannerText: 'రెటీనాగార్డ్ AI అనేది వైద్యులకు సహాయపడే స్క్రీనింగ్ సాధనం మాత్రమే, ఇది అంతిమ వైద్య నిర్ధారణ కాదు.',
      nonDiagnosisNotice: 'AI స్క్రీనింగ్ ఫలితం — వైద్య నిర్ధారణ కాదు. దయచేసి అర్హతగల నేత్ర వైద్య నిపుణుడిని సంప్రదించండి.'
    },
    screening: {
      title: 'కొత్త రెటీనా స్క్రీనింగ్',
      subtitle: 'డయాబెటిక్ రెటినోపతిని అంచనా వేయడానికి ఫండస్ ఫోటోను అప్‌లోడ్ చేయండి',
      patientDetails: 'రోగి మరియు కేంద్ర వివరాలు',
      patientId: 'రోగి ఐడి / ఆరోగ్య కార్డు నంబర్',
      patientName: 'రోగి పేరు',
      patientAge: 'వయస్సు (సంవత్సరాలు)',
      eyeSide: 'పరీక్షించిన కన్ను',
      rightEye: 'కుడి కన్ను (OD)',
      leftEye: 'ఎడమ కన్ను (OS)',
      facility: 'ఆరోగ్య కేంద్రం / PHC',
      uploadTitle: 'కంటి రెటీనా ఫోటోను అప్‌లోడ్ చేయండి',
      uploadInstructions: 'ఫండస్ ఫోటోను ఇక్కడ లాగి వదలండి లేదా బ్రౌజ్ చేయండి.',
      orChooseSample: 'లేదా తనిఖీ కోసం ఈ నమూనా ఫోటోను ఎంచుకోండి:',
      analyzing: 'కంటి నరాల విశ్లేషణ జరుగుతోంది...',
      stage1: 'ఫోటో స్పష్టత మరియు కాంతిని పరీక్షిస్తోంది...',
      stage2: 'రెటీనా రక్తనాళాలలో మార్పులను గుర్తిస్తోంది...',
      stage3: 'తీవ్రతను అంచనా వేసి హీట్‌మ్యాప్‌ను రూపొందిస్తోంది...',
      stage4: 'రోగికి అర్థమయ్యే నివేదికను తయారు చేస్తోంది...',
      runInference: 'AI స్క్రీనింగ్ ప్రారంభించండి',
      reset: 'వేరే ఫోటోను ఎంచుకోండి',
      compressedNotice: 'గ్రామీణ నెట్‌వర్క్ కోసం ఆప్టిమైజ్ చేయబడింది'
    },
    results: {
      title: 'AI స్క్రీనింగ్ & వివరణాత్మక నివేదిక',
      badge: 'స్క్రీనింగ్ ఫలితం',
      classification: 'ICDR వర్గీకరణ',
      confidence: 'ఖచ్చితత్వ విశ్వాసం',
      icdrScale: 'అంతర్జాతీయ క్లినికల్ డయాబెటిక్ రెటినోపతి స్కేల్',
      xaiTitle: 'వివరణాత్మక AI (XAI) దృష్టి మ్యాప్',
      xaiDesc: 'AI మోడల్ ఏ ప్రాంతాలలో మార్పులను గుర్తించిందో చూపే ఇంటరాక్టివ్ గ్రాడ్-కామ్ మ్యాప్',
      toggleOverlay: 'హీట్‌మ్యాప్ సాంద్రత',
      showMarkers: 'గుర్తించిన భాగాలను చూపించు',
      detectedLesions: 'గుర్తించబడిన లక్షణాలు',
      plainExplanation: 'రోగి మరియు ఆరోగ్య కార్యకర్త కోసం సరళమైన వివరణ',
      nextSteps: 'తదుపరి వైద్య సిఫార్సు',
      downloadReport: 'అధికారిక PDF నివేదికను డౌన్‌లోడ్ చేయండి',
      saveToHistory: 'రోగి రికార్డులలో భద్రపరచండి',
      savedSuccess: 'డేటాబేస్‌లో విజయవంతంగా నమోదు చేయబడింది.'
    }
  },

  hi: {
    appName: 'रेटिनागार्ड AI',
    tagline: 'ग्रामीण भारत के लिए व्याख्यात्मक डायबिटिक रेटिनोपैथी स्क्रीनिंग',
    nav: {
      home: 'अवलोकन',
      dashboard: 'डैशबोर्ड',
      screening: 'नई स्क्रीनिंग',
      history: 'मरीज़ रिकॉर्ड',
      telemetry: 'मॉडल स्थिति',
      signIn: 'गूगल से लॉगिन करें',
      signOut: 'लॉग आउट',
      ruralMode: 'ग्रामीण मोड',
      lowBandwidth: 'कम इंटरनेट (2G/3G)',
      standardBandwidth: 'सामान्य'
    },
    hero: {
      title: 'सभी के लिए AI-आधारित रेटिनल स्क्रीनिंग',
      subtitle: 'ग्रामीण और दूरदराज के क्षेत्रों में डायबिटिक रेटिनोपैथी की समय पर पहचान के लिए व्याख्यात्मक कृत्रिम बुद्धिमत्ता।',
      continueGoogle: 'गूगल खाते के साथ जारी रखें',
      learnHow: 'यह कैसे काम करता है जानें',
      startScreening: 'स्क्रीनिंग शुरू करें',
      trustedBy: 'प्राथमिक स्वास्थ्य केंद्रों (PHC) एवं ग्रामीण क्लीनिकों हेतु विशेष रूप से निर्मित'
    },
    whyMatters: {
      badge: 'सार्वजनिक स्वास्थ्य आवश्यकता',
      title: 'भारत में डायबिटिक रेटिनोपैथी स्क्रीनिंग क्यों महत्वपूर्ण है',
      description: 'भारत में 10.1 करोड़ से अधिक लोग मधुमेह से पीड़ित हैं। डायबिटिक रेटिनोपैथी अंधेपन का एक प्रमुख कारण है, जिसे समय पर जांच द्वारा 90% तक रोका जा सकता है।',
      stat1Number: '10.1 करोड़+',
      stat1Label: 'भारत में मधुमेह से पीड़ित लोग',
      stat2Number: '90%',
      stat2Label: 'समय पर जांच से रोकी जा सकने वाली दृष्टि हानि',
      stat3Number: '1 : 100k',
      stat3Label: 'ग्रामीण क्षेत्रों में नेत्र विशेषज्ञों का अनुपात'
    },
    howItWorks: {
      title: 'नैदानिक स्क्रीनिंग प्रक्रिया',
      step1Title: '1. रेटिनल फंडस फोटोग्राफी',
      step1Desc: 'पोर्टेबल अथवा क्लिनिक कैमरे से आंख के पिछले हिस्से की तस्वीर लें।',
      step2Title: '2. कम इंटरनेट पर अनुकूलन',
      step2Desc: '2G/3G नेटवर्क पर भी तुरंत अपलोड के लिए डिवाइस पर ही आकार संकुचित करता है।',
      step3Title: '3. वास्तविक न्यूरल AI विश्लेषण',
      step3Desc: 'रक्त वाहिकाओं के सूक्ष्म बदलाव, रिसाव और क्षति का सटीक विश्लेषण।',
      step4Title: '4. स्पष्ट विजुअल व्याख्या व मार्गदर्शन',
      step4Desc: 'Grad-CAM हीटमैप द्वारा दिखाता है कि AI ने किस क्षेत्र के आधार पर निष्कर्ष निकाला।'
    },
    xaiSection: {
      title: 'व्याख्यात्मक AI (XAI) – भरोसेमंद तकनीक',
      subtitle: 'स्वास्थ्य कार्यकर्ताओं और मरीजों के लिए पारदर्शी स्वास्थ्य सेवा',
      description: 'रेटिनागार्ड AI केवल नतीजा नहीं बताता, बल्कि आंख के पर्दे पर मौजूद रक्तस्राव और माइक्रोएन्यूरिज्म को हीटमैप के रूप में दिखाता है ताकि डॉक्टर आसानी से पुष्टि कर सकें।',
      feature1Title: 'Grad-CAM अटेंशन हीटमैप',
      feature1Desc: 'मॉडल का ध्यान आकर्षित करने वाले क्षेत्रों को रंगों द्वारा प्रदर्शित करता है।',
      feature2Title: 'सूक्ष्म रक्तस्राव की पहचान',
      feature2Desc: 'माइक्रोएन्यूरिज्म और एक्सयूडेट्स को स्पष्ट रूप से चिन्हित करता है।',
      feature3Title: 'स्थानीय भाषाओं में सरल व्याख्या',
      feature3Desc: 'मरीजों को समझाने के लिए हिंदी, तेलुगु और अंग्रेजी में सरल सारांश।'
    },
    disclaimer: {
      bannerTitle: 'नैदानिक सहायता सूचना',
      bannerText: 'रेटिनागार्ड AI एक स्क्रीनिंग सहायता उपकरण है, यह कोई अंतिम चिकित्सकीय निदान नहीं है।',
      nonDiagnosisNotice: 'AI स्क्रीनिंग परिणाम — कोई चिकित्सकीय निदान नहीं है। कृपया योग्य नेत्र रोग विशेषज्ञ से परामर्श लें।'
    },
    screening: {
      title: 'नई रेटिनल स्क्रीनिंग',
      subtitle: 'डायबिटिक रेटिनोपैथी के आकलन हेतु आंख की फंडस तस्वीर अपलोड करें',
      patientDetails: 'मरीज एवं केंद्र विवरण',
      patientId: 'मरीज आईडी / स्वास्थ्य कार्ड संख्या',
      patientName: 'मरीज का नाम',
      patientAge: 'उम्र (वर्ष)',
      eyeSide: 'जांची गई आंख',
      rightEye: 'दाहिनी आंख (OD)',
      leftEye: 'बाईं आंख (OS)',
      facility: 'प्राथमिक स्वास्थ्य केंद्र (PHC)',
      uploadTitle: 'रेटिनल फंडस स्कैन अपलोड करें',
      uploadInstructions: 'फंडस फोटो यहाँ खींचें या फ़ाइल चुनें।',
      orChooseSample: 'या परीक्षण के लिए प्रमाणित क्लिनिकल सैंपल चुनें:',
      analyzing: 'रेटिना का न्यूरल विश्लेषण जारी है...',
      stage1: 'फोटो की स्पष्टता और ऑप्टिक डिस्क की जांच हो रही है...',
      stage2: 'रेटिना की सूक्ष्म रक्त वाहिकाओं का विश्लेषण हो रहा है...',
      stage3: 'Grad-CAM हीटमैप और रोग की गंभीरता का वर्गीकरण...',
      stage4: 'व्याख्यात्मक रिपोर्ट तैयार की जा रही है...',
      runInference: 'AI स्क्रीनिंग प्रारंभ करें',
      reset: 'दूसरी तस्वीर चुनें',
      compressedNotice: 'ग्रामीण इंटरनेट के लिए संकुचित (Edge Compressed)'
    },
    results: {
      title: 'AI स्क्रीनिंग एवं व्याख्यात्मक परिणाम',
      badge: 'स्क्रीनिंग रिपोर्ट',
      classification: 'ICDR वर्गीकरण',
      confidence: 'विश्वसनीयता स्तर',
      icdrScale: 'अंतर्राष्ट्रीय नैदानिक डायबिटिक रेटिनोपैथी पैमाना',
      xaiTitle: 'व्याख्यात्मक AI (XAI) अटेंशन ओवरले',
      xaiDesc: 'इंटरैक्टिव Grad-CAM मैप जो दिखाता है कि AI ने रेटिना के किन हिस्सों को देखकर निष्कर्ष निकाला',
      toggleOverlay: 'हीटमैप पारदर्शिता',
      showMarkers: 'पहचाने गए घावों को हाईलाइट करें',
      detectedLesions: 'पहचाने गए नैदानिक लक्षण',
      plainExplanation: 'मरीज और स्वास्थ्य कार्यकर्ता के लिए सरल व्याख्या',
      nextSteps: 'अगला अनुशंसित चिकित्सकीय कदम',
      downloadReport: 'आधिकारिक PDF रिपोर्ट डाउनलोड करें',
      saveToHistory: 'मरीज के रिकॉर्ड में सुरक्षित करें',
      savedSuccess: 'क्लाउड डेटाबेस में सफलतापूर्वक सुरक्षित किया गया।'
    }
  }
};
