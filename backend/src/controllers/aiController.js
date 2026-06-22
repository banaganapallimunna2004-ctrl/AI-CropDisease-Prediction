const { Configuration, OpenAIApi } = require('openai');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;


const multilingualCatalog = {
  hi: {
    fertilizer: '🌱 एग्रो AI उर्वरक सलाह:\n- जैविक खाद या कम्पोस्ट का प्रयोग करें।\n- एन-पी-के (NPK 19:19:19) उर्वरक का संतुलित उपयोग करें।\n- मिट्टी परीक्षण के आधार पर सूक्ष्म पोषक तत्व छिड़कें।\n\nअपने निकटतम उर्वरक विक्रेताओं को खोजने के लिए लाइव जीआईएस मानचित्र का उपयोग करें।',
    disease: '🌾 फसल रोग सलाह:\n- प्रभावित पत्तियों को तुरंत तोड़कर नष्ट कर दें।\n- फफूंदनाशक दवा का संतुलित मात्रा में छिड़काव करें।\n- सुबह या शाम को छिड़काव करें, तेज धूप में नहीं।\n\nसटीक निदान के लिए एआई स्कैनर का उपयोग करें।',
    weather: '🌧️ मौसम और सिंचाई सलाह:\n- मिट्टी में 10 सेमी तक नमी की जांच करें।\n- बारिश होने की संभावना हो तो सिंचाई टालें।\n- ड्रिप सिंचाई पद्धति का प्रयोग करें जिससे पानी की बचत होती है।',
    default: 'नमस्ते! मैं आपका एग्रो AI सलाहकार हूं। मैं आपकी फसल की सुरक्षा, उर्वरक की आवश्यकता, मौसम के पूर्वानुमान और सिंचाई के तरीकों में मदद कर सकता हूं। कृपया उर्वरक, बीमारी, या मौसम से जुड़ा कोई प्रश्न पूछें।',
  },
  te: {
    fertilizer: '🌱 అగ్రో AI ఎరువుల సిఫార్సు:\n- సేంద్రీయ ఎరువులు మరియు వర్మీకంపోస్ట్ వాడండి.\n- పంట రకాన్ని బట్టి N-P-K (19:19:19) ఎరువులు వేయండి.\n- సూక్ష్మ పోషకాలను పిచికారీ చేయండి.\n\nసమీప ఎరువుల దుకాణాల కోసం లైవ్ మ్యాప్ చూడండి.',
    disease: '🌾 పంట తెగుళ్ల నివారణ:\n- తెగులు సోకిన ఆకులను వెంటనే తొలగించి నాశనం చేయండి.\n- సిఫార్సు చేసిన శిలీంద్ర సంహారిణి పిచికారీ చేయండి.\n- గాలి వెలుతురు తగిలేలా మొక్కల మధ్య దూరం పాటించండి.',
    weather: '🌧️ వాతావరణం & నీటిపారుదల:\n- నేల తేమను బట్టి తడులు ఇవ్వండి.\n- వర్ష సూచన ఉంటే నీటిపారుదలని వాయిదా వేయండి.\n- బిందు సేద్యం (Drip Irrigation) ఉపయోగించడం చాలా మంచిది.',
    default: 'నమస్కారం! నేను మీ అగ్రో AI సలహాదారుని. పంటల నిర్వహణ, తెగుళ్ల గుర్తింపు, ఎరువుల సమాచారం మరియు వాతావరణ సిఫార్సుల గురించి నన్ను ఏ భాషలోనైనా అడగవచ్చు.',
  },
  es: {
    fertilizer: '🌱 Consejos de Fertilizantes de Agro AI:\n- Aplique compost orgánico para mejorar la microbiología del suelo.\n- Use mezclas de nitrógeno, fósforo y potasio (N-P-K) según el estado de desarrollo.\n- Evite el exceso de nitrógeno en floración.',
    disease: '🌾 Consejos de Fitopatología:\n- Pode y elimine las hojas con necrosis o manchas.\n- Aplique fungicidas cúpricos o soluciones biológicas preventivas.\n- Ventile el dosel del cultivo para disminuir la humedad.',
    weather: '🌧️ Clima y Riego:\n- Monitoree la humedad a nivel de raíces.\n- Si se pronostican lluvias, suspenda el riego.\n- Riegue en las primeras horas de la mañana para evitar evaporación.',
    default: '¡Hola! Soy su asesor de Agro AI. Puedo asistirle con planes de fertilización, diagnóstico de patógenos, pronósticos climáticos e irrigación inteligente en su cultivo.',
  },
  en: {
    fertilizer: '🌱 Agro AI Fertilizer Recommendation:\n- Utilize organic compost or worm castings to enrich soil nutrients.\n- Apply balanced N-P-K (19:19:19) mixtures depending on crop stage.\n- Ensure soil pH is tested before bulk application.\n- Spray micronutrients based on leaf discoloration.',
    disease: '🌾 Crop Disease Control:\n- Prune infected lower leaves immediately to stop splash propagation.\n- Use copper-based protective fungicides for fungal outbreaks.\n- Keep foliage dry and verify using our disease scanner.\n- Ensure proper crop rotation to prevent soil-borne pathogens.',
    weather: '🌧️ Weather & Irrigation:\n- Check soil moisture at root depth before watering.\n- Delay irrigation cycles if high probability of rainfall is forecasted.\n- Shift to automated drip lines to maximize water efficacy.\n- Monitor local humidity levels to anticipate fungal risks.',
    default: 'Hello! I am your Agro AI Advisor. Please ask me specific questions about fertilizers, crop diseases, weather, irrigation, or general crop management to get the best and most accurate recommendations.',
  },
};

const detectLanguage = (message) => {
  const text = String(message || '').toLowerCase();
  
  // Hindi characters (Devanagari)
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  // Telugu characters
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  
  // Spanish keywords
  if (/hola|fertilizante|enfermedad|clima|agua|riego|plaga|hongo/i.test(text)) return 'es';
  
  return 'en';
};

const getMultilingualResponse = (message, location) => {
  const lang = detectLanguage(message);
  const catalog = multilingualCatalog[lang] || multilingualCatalog['en'];
  const text = message.toLowerCase();

  let response = '';
  if (/fertilizer|manure|npk|urea|compost|nutrients|soil|ph|fertilizante|खाद|उर्वरक|ఎరువులు/i.test(text)) {
    response = catalog.fertilizer;
  } else if (/disease|blight|pest|infection|spot|mildew|fungus|rot|virus|bugs|insects|enfermedad|plaga|हवा|बीमारी|తెగులు/i.test(text)) {
    response = catalog.disease;
  } else if (/weather|rain|irrigation|temperature|humidity|water|drought|flood|clima|lluvia|riego|मौसम|సిరి|నీరు|నీటిపారుదల/i.test(text)) {
    response = catalog.weather;
  } else {
    response = catalog.default;
  }

  if (location && location.lat && location.lng) {
    const coords = `(${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
    if (lang === 'hi') {
      response += `\n\n📍 आपके स्थान ${coords} के पास विक्रेताओं की सूची के लिए जीआईएस मैप देखें।`;
    } else if (lang === 'te') {
      response += `\n\n📍 మీ లొకేషన్ ${coords} ఆధారంగా సమీప స్టోర్లను జిఐఎస్ మ్యాప్ లో చూడండి.`;
    } else if (lang === 'es') {
      response += `\n\n📍 Ubicación detectada ${coords}. Use el mapa GIS para ver proveedores locales cercanos.`;
    } else {
      response += `\n\n📍 Location detected near ${coords}. Review localized stores on the live GIS map.`;
    }
  }

  return response;
};

const chat = async (req, res) => {
  const { message, location } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  // 1. Try Gemini
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const lang = detectLanguage(message);
      let prompt = 'You are Agro AI, an expert precision crop agronomist. Answer briefly and recommend safe treatments. ';
      if (lang === 'hi') prompt += 'Write the entire response in Hindi (हिंदी). ';
      else if (lang === 'te') prompt += 'Write the entire response in Telugu (తెలుగు). ';
      else if (lang === 'es') prompt += 'Write the entire response in Spanish (Español). ';
      else prompt += 'Write the response in English. ';

      prompt += `\n\nUser Question: ${message}${location ? `\nLocation Coordinate: ${location.lat}, ${location.lng}` : ''}`;

      const result = await model.generateContent(prompt);
      const answer = result.response.text();
      return res.json({ answer });
    } catch (error) {
      console.error('Gemini AI error', error.message);
    }
  }

  // 2. Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
      const client = new OpenAIApi(config);
      const lang = detectLanguage(message);
      
      let prompt = 'You are Agro AI, an expert precision crop agronomist. Answer briefly and recommend safe treatments. ';
      if (lang === 'hi') prompt += 'Write the entire response in Hindi (हिंदी).';
      else if (lang === 'te') prompt += 'Write the entire response in Telugu (తెలుగు).';
      else if (lang === 'es') prompt += 'Write the entire response in Spanish (Español).';
      else prompt += 'Write the response in English.';

      const messages = [
        { role: 'system', content: prompt },
        { role: 'user', content: `Question: ${message}${location ? `\nLocation Coordinate: ${location.lat}, ${location.lng}` : ''}` },
      ];

      const response = await client.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 400,
        temperature: 0.75,
      });

      const answer = response.data.choices?.[0]?.message?.content?.trim() || getMultilingualResponse(message, location);
      return res.json({ answer });
    } catch (error) {
      console.error('OpenAI chat error', error?.response?.data || error.message);
    }
  }

  // 3. Fallback to offline rule-based model
  const answer = getMultilingualResponse(message, location);
  return res.json({ answer });
};

module.exports = { chat };