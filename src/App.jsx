import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RotateCcw, Award, ChevronRight, HelpCircle, Volume2, Bot, BookOpen } from 'lucide-react';

// --- [TTS/PCM 轉 WAV 輔助函式] ---
// (這部分程式碼已確認正確且必要，保持不變，但在實際專案中建議移至 utils 文件)
const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const pcmToWav = (pcmData, sampleRate) => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  
  const buffer = new ArrayBuffer(44 + pcmData.byteLength);
  const view = new DataView(buffer);
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + pcmData.byteLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 for PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, byteRate, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, pcmData.byteLength, true);
  
  // PCM data
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(offset, pcmData[i], true);
    offset += 2;
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
};
// --- [TTS/PCM 轉 WAV 輔助函式結束] ---


// Custom image assets for questions (used in JSX)
const questionImages = {
  1: "https://www.svgrepo.com/show/532354/smoke-detector.svg", 
  2: "https://www.svgrepo.com/show/441460/fire-extinguisher.svg", 
  3: "https://www.svgrepo.com/show/361845/fire-house.svg", 
  4: "https://www.svgrepo.com/show/503460/maintenance.svg", 
  5: "https://www.svgrepo.com/show/347633/kitchen-cook-cooking.svg", 
  6: "https://www.svgrepo.com/show/441460/fire-extinguisher.svg", 
  7: "https://www.svgrepo.com/show/496030/door-opened.svg", 
  8: "https://www.svgrepo.com/show/465103/heater-heating.svg", 
  9: "https://www.svgrepo.com/show/496096/family.svg", 
  10: "https://www.svgrepo.com/show/305370/person-fall.svg", 
  11: "https://www.svgrepo.com/show/441460/fire-extinguisher.svg", 
  12: "https://www.svgrepo.com/show/532354/smoke-detector.svg", 
  13: "https://www.svgrepo.com/show/305220/scam.svg", 
  14: "https://www.svgrepo.com/show/441477/stairs-ladder.svg", 
  15: "https://www.svgrepo.com/show/441460/fire-extinguisher.svg", 
  16: "https://www.svgrepo.com/show/532354/smoke-detector.svg", 
  17: "https://www.svgrepo.com/show/441460/fire-extinguisher.svg", 
  18: "https://www.svgrepo.com/show/532354/smoke-detector.svg", 
  19: "https://www.svgrepo.com/show/441460/fire-extinguisher.svg", 
  20: "https://www.svgrepo.com/show/441477/stairs-ladder.svg", 
};

const questionsData = [
  { id: 1, question: "住宅中最重要的消防設備是甚麼？", options: ["滅火器", "緊急照明燈", "住宅用火災警報器", "緩降機"], correctAnswer: "住宅用火災警報器", explanation: "人們在睡覺時，對外界的視覺、觸覺及嗅覺都不甚靈敏，很難察覺火災的煙、熱或是燒焦味等到驚醒時，往往已經深陷火海，逃生困難，所以為了及早察覺火災，必須安裝住宅用火災警報器。", keyTerms: ["住宅用火災警報器"] },
  { id: 2, question: "使用滅火器時要注意，一般滅火器的有效射程為3至5公尺，無法近距離滅火時，請儘速逃生，並打119報案。", options: ["正確", "錯誤"], correctAnswer: "正確", explanation: "滅火器有效射程有限，若火勢過大無法靠近，應優先選擇逃生並報案。", keyTerms: ["滅火器", "有效射程"] },
  { id: 3, question: "火災時如果出口方向濃煙密布，千萬不要穿越濃煙，要退回安全的室內，關上門，並將門縫用東西塞住，防止濃煙竄入，然後將對戶外的窗戶打開，向外面求救。", options: ["正確", "錯誤"], correctAnswer: "正確", explanation: "這是正確的「關門求生」觀念，阻隔濃煙是存活關鍵。", keyTerms: ["關門求生", "濃煙密布"] },
  { id: 4, question: "有關住宅用火災警報器使用維護方式，下列何者錯誤？", options: ["安裝前後按一按測試鈕", "定期擦拭，以保持偵測靈敏", "當警報器電池快沒電時，會發出畢畢聲", "每年測試1次警報器是否正常動作"], correctAnswer: "每年測試1次警報器是否正常動作", explanation: "正確做法應為：安裝後定期(一個月1次)或外出3天以上時，請按下測試開關確認警報器是否正常動作，而非僅每年一次。", keyTerms: ["住宅用火災警報器", "定期測試"] },
  { id: 5, question: "偵煙式住宅用火災警報器不能裝在哪裡？", options: ["客廳", "廚房", "房間", "樓梯"], correctAnswer: "廚房", explanation: "因廚房平時可能有炒菜油煙，為了避免偵煙式住宅用火災警報器誤判，故類似廚房平時會產生煙粒子之場所，應裝設「定溫式」住宅用火災警報器為宜。", keyTerms: ["偵煙式", "定溫式", "誤判"] },
  { id: 6, question: "滅火器的使用順序，下列何者正確？", options: ["拉瞄壓掃", "瞄掃拉壓", "壓拉掃瞄", "掃壓瞄拉"], correctAnswer: "拉瞄壓掃", explanation: "滅火器的使用順序為：1.拉-拉插銷 2.瞄-瞄準火源底部 3.壓-壓握把 4.掃-向火源底部左右掃射。", keyTerms: ["滅火器", "拉瞄壓掃"] },
  { id: 7, question: "有關火場逃生避難的觀念，下列何者正確？", options: ["躲在浴室裡是最安全的", "逃生時要用濕毛巾摀口鼻", "開門若遇濃煙要越快穿越濃煙逃生", "如果樓梯間沒濃煙就往下逃生"], correctAnswer: "如果樓梯間沒濃煙就往下逃生", explanation: "不可躲在浴室：1)門多為塑膠不耐高溫 2)門下有通風百葉無法阻擋濃煙 3)無逃生出口。濕毛巾會浪費時間且無法擋高熱濃煙。遇濃煙應關門避難而非穿越。", keyTerms: ["濕毛巾", "濃煙"] },
  { id: 8, question: "為了避免火災發生，下列何者為錯誤的生活習慣？", options: ["作飯煮菜時人若暫時離開，應先關閉瓦斯", "火柴、打火機應妥善收藏，以免小孩玩火", "冬天使用電暖器取暖時，可同時烘乾衣物", "排煙機及風管的油污應定期清理"], correctAnswer: "冬天使用電暖器取暖時，可同時烘乾衣物", explanation: "使用電熱器時，應距離可燃物1公尺以上，不可用來烘衣物，以免過熱起火。", keyTerms: ["電暖器", "電熱器"] },
  { id: 9, question: "有關家庭逃生計畫的內容，下列何者為非？", options: ["應每1年全家人依計畫進行逃生演練1次", "全家人都要知道逃生至戶後的集結點", "要在家中找出2個不同方向之逃生避難路線", "窗戶若裝置鐵窗，應預留可開啟之逃生出口"], correctAnswer: "應每1年全家人依計畫進行逃生演練1次", explanation: "全家人應每6個月(半年)至少做1次逃生避難演練（建議每次輪流選擇日間及夜間時段進行演練），確認逃生計畫內容是具體可行的。", keyTerms: ["逃生計畫", "演練頻率"] },
  { id: 10, question: "身上著火時，應立即做的動作步驟為下列何者？", options: ["停、躺、滾", "沖、脫、泡、蓋、送", "走、跑、跳"], correctAnswer: "停、躺、滾", explanation: "若身上著火：【停】在原地，切勿奔跑以免助長火勢。【躺】下來，立刻將雙手摀在臉上，減少顏面傷殘機會。【滾】左右來回翻滾，直到火勢熄滅。", keyTerms: ["停躺滾"] },
  { id: 11, question: "阿豪與同事相揪團購滅火器，如何檢視廠商交貨之滅火器是否合格？", options: ["注意安全插梢是否固定未脫落", "產品應張貼有內政部登錄機構檢驗合格之標示", "滅火器上的壓力表，指針是否在綠色範圍", "以上皆是"], correctAnswer: "以上皆是", explanation: "檢查滅火器需注意：有認可標示、壓力表指針在綠色範圍、安全插梢固定且未鏽蝕、皮管無龜裂。", keyTerms: ["滅火器檢驗"] },
  { id: 12, question: "陳爸爸為了居家安全，想網購火紅熱銷的「住宅用火災警報器」，以下敘述何者正確？", options: ["一定要由專業技術人員安裝", "一層樓裝設一顆住宅用火災警報器即免除風險", "廚房為使用火源場所，不必裝設，避免誤報", "產品應張貼有內政部登錄機構檢驗合格之標示"], correctAnswer: "產品應張貼有內政部登錄機構檢驗合格之標示", explanation: "住警器安裝容易可自行安裝；每個居室都建議安裝；廚房應安裝「定溫式」；選購時務必認明合格標示。", keyTerms: ["住警器選購", "合格標示"] },
  { id: 13, question: "某民間協會稱其受消防機關委託，至公司進行防火宣導，順便推銷滅火器，下列作法何者最佳？", options: ["體諒其辛勞，買個幾具以示慰勞", "立即通報當地消防機關並拒絕購買", "協助向同仁推銷", "大量購買所推銷的滅火器並分送親朋好友"], correctAnswer: "立即通報當地消防機關並拒絕購買", explanation: "消防機關絕不會委託民間團體推銷消防安全設備，這通常是詐騙或推銷手法。", keyTerms: ["消防推銷"] },
  { id: 14, question: "在正常皆可使用之狀態下，於相同時間內，下列得以疏散最多人的防火避難設施或避難器具是？", options: ["安全梯", "緩降機", "救助袋", "避難梯"], correctAnswer: "安全梯", explanation: "避難逃生應以樓梯、通道、安全門為主。在無法利用其他通道進行逃生動作時，才選擇利用緩降機等其他避難器具逃生。", keyTerms: ["安全梯", "避難器具"] },
  { id: 15, question: "市售常見之泡沫滅火器，不應用於撲滅下列何種狀態之火災？", options: ["報紙堆起火", "炒菜時油鍋起火", "未通電的廢棄電線起火", "通電中的配電盤起火"], correctAnswer: "通電中的配電盤起火", explanation: "泡沫滅火器含水，通電中之電氣設備（如電器、變壓器、電線、配電盤等）引起之火災，不可使用泡沫，應適用二氧化碳滅火器或乾粉滅火器，以免觸電。", keyTerms: ["泡沫滅火器", "電氣火災"] },
  { id: 16, question: "台灣的建築物火災，以住宅火災佔多數，如發生火災，下列何項消防設備，可發揮早期預警之功能？", options: ["一氧化碳警報器", "住宅用火災警報器", "緊急照明燈", "緩降機"], correctAnswer: "住宅用火災警報器", explanation: "當人們處於睡眠狀態時，對外界的感官不甚靈敏。藉由住宅用火災警報器偵知火災及發出警報聲響，能輔助人們及早發現火災，越早採取逃生行動。", keyTerms: ["早期預警", "住宅用火災警報器"] },
  { id: 17, question: "消防安全設備的定義，下列何者為是？", options: ["滅火設備-指以水或其他滅火藥劑滅火之器具或設備", "警報設備-指報知火災發生之器具或設備", "避難逃生設備-指火災發生時為避難而方便使用之器具或設備", "以上皆是"], correctAnswer: "以上皆是", explanation: "消防安全設備包含滅火設備、警報設備、避難逃生設備以及消防搶救上之必要設備等。", keyTerms: ["消防安全設備"] },
  { id: 18, question: "林太太居住的集合住宅，其火警探測器時常警報鳴動誤動作，造成困擾，採下列何種解決方式較佳？", options: ["將火警受信總機開關關閉", "請管委會通知合格的消防專業技術人員檢修", "把火警探測器拆下來", "放著不管"], correctAnswer: "請管委會通知合格的消防專業技術人員檢修", explanation: "集合住宅管理權人應依消防法規定，委託消防專業技術人員定期檢修。關閉主機或拆除探測器會造成安全漏洞，違法且危險。", keyTerms: ["火警探測器", "誤動作"] },
  { id: 19, question: "乾粉滅火器之操作口訣為?", options: ["拉、瞄、壓、掃", "拉、壓、瞄、掃", "拉、壓、掃、瞄", "拉、掃、壓、瞄"], correctAnswer: "拉、瞄、壓、掃", explanation: "口訣：1.拉(插銷) 2.瞄(火源根部) 3.壓(把手) 4.掃(向火源根部左右掃射)。", keyTerms: ["乾粉滅火器", "操作口訣"] },
  { id: 20, question: "建築物內部最主要的避難逃生途徑應為?", options: ["屋頂", "直升機", "安全梯", "雲梯車"], correctAnswer: "安全梯", explanation: "避難逃生應以樓梯、通道、安全門為主，安全梯具有防火時效及排煙功能，是最主要的逃生路徑。", keyTerms: ["避難逃生途徑"] }
];

// Custom icons with a more illustrative style (保持不變)
const CustomAward = () => <img src="https://www.svgrepo.com/show/305286/prize-cup.svg" alt="Award" className="w-16 h-16" />;
const CustomAlert = () => <img src="https://www.svgrepo.com/show/441443/alert-triangle-danger.svg" alt="Alert" className="w-16 h-16" />;
const CustomCross = () => <img src="https://www.svgrepo.com/show/448208/cross.svg" alt="Cross" className="w-16 h-16" />;
const CustomHelp = () => <img src="https://www.svgrepo.com/show/496078/question-circle.svg" alt="Help" className="w-6 h-6 text-blue-500" />;


export default function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // --- [Gemini State] ---
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiText, setGeminiText] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showGeminiPanel, setShowGeminiPanel] = useState(false);
  const [termLoading, setTermLoading] = useState(false);
  const [termExplanations, setTermExplanations] = useState({});
  // --- [Gemini State 結束] ---

  const currentQuestion = questionsData[currentQuestionIndex];
  
  // --- [Gemini 清理函式] ---
  const cleanupGemini = useCallback(() => {
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }
    setGeminiText(null);
    setAudioUrl(null);
    setShowGeminiPanel(false);
    setTermExplanations({});
    setGeminiLoading(false);
    setTermLoading(false);
  }, [audioUrl]);
  
  // 在切換題目時清理 AI 相關的狀態
  useEffect(() => {
      cleanupGemini();
  }, [currentQuestionIndex, cleanupGemini]);

  // --- [Gemini API 邏輯 - **已移除硬編碼 API Key**] ---
  const generateSummaryAndTts = useCallback(async (question, explanation) => {
    // ⚠️ 請確保 `API_KEY` 是從安全的環境變數中取得，且最好通過後端代理呼叫
    //const API_KEY = ""; // 🚨 placeholder, MUST be replaced with a secure method
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // 🚨 placeholder, MUST be replaced with a secure method	
    if (!API_KEY) {
        setGeminiText("🚨 API Key 未設定或無效。請檢查配置。");
        setGeminiLoading(false);
        return;
    }
    
    // 1. Reset states
    setGeminiLoading(true);
    setGeminiText(null);
    setAudioUrl(null);
    setShowGeminiPanel(true);
    
    // API URLs (使用變數傳入 API Key)
    const geminiFlashUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
    const geminiTtsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;

    const prompt = `你是一位熱心又專業的消防宣導員。請用簡潔、鼓勵且口語化的方式，根據以下問題和正確解析，為學生提供一個重點複習，長度約 50 字中文。請特別強調安全的重要性。
    問題: "${question}"
    正確解析: "${explanation}"
    總結重點：`;

    try {
        // --- 1. Text Generation (Summary) ---
        const textPayload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: "你是一位熱心又專業的消防宣導員，用親切和鼓勵的口吻提供重點複習。" }] },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 100,
            }
        };

        let summaryText = null;
        let attempt = 0;
        
        while (attempt < 5) { // Retry logic (Text)
            const delay = Math.pow(2, attempt) * 1000;
            if (attempt > 0) await new Promise(resolve => setTimeout(resolve, delay));
            
            try {
                const textResponse = await fetch(geminiFlashUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(textPayload)
                });
                
                if (textResponse.ok) {
                    const result = await textResponse.json();
                    summaryText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (summaryText) break;
                }
            } catch (error) { /* Ignore internal error for retry */ }
            attempt++;
        }

        if (!summaryText) {
            setGeminiText("⚠️ 無法生成文字總結，請稍後再試。");
            setGeminiLoading(false);
            return;
        }
        
        setGeminiText(summaryText.trim());

        // --- 2. TTS Generation (Audio) ---
        const ttsPayload = {
            contents: [{
                parts: [{ text: `請用親切的語氣朗讀這段文字：${summaryText}` }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Kore" } // A firm, clear voice
                    },
                    languageCode: "zh-TW"  
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };
        
        let audioResponse;
        attempt = 0;
        
        while (attempt < 5) { // Retry logic (TTS)
            const delay = Math.pow(2, attempt) * 1000;
            if (attempt > 0) await new Promise(resolve => setTimeout(resolve, delay));
            
            try {
                audioResponse = await fetch(geminiTtsUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ttsPayload)
                });

                if (audioResponse.ok) {
                    const result = await audioResponse.json();
                    const part = result?.candidates?.[0]?.content?.parts?.[0];
                    const audioData = part?.inlineData?.data;
                    const mimeType = part?.inlineData?.mimeType;

                    if (audioData && mimeType && mimeType.startsWith("audio/")) {
                        const rateMatch = mimeType.match(/rate=(\d+)/);
                        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
                        
                        const pcmData = base64ToArrayBuffer(audioData);
                        const pcm16 = new Int16Array(pcmData);
                        const wavBlob = pcmToWav(pcm16, sampleRate);
                        const url = URL.createObjectURL(wavBlob);
                        setAudioUrl(url);
                        break;
                    }
                }
            } catch (error) { /* Ignore internal error for retry */ }
            attempt++;
        }
        
        if (!audioResponse || !audioResponse.ok) {
             console.error("TTS generation failed after retries.");
        }

    } catch (error) {
        console.error("Gemini API call failed:", error);
        setGeminiText("⚠️ 系統錯誤，無法生成輔助內容。");
    } finally {
        setGeminiLoading(false);
    }
  }, []); 

  const generateTermExplanation = async (term) => {
      setTermLoading(true);
      
      // ⚠️ 請確保 `API_KEY` 是從安全的環境變數中取得，且最好通過後端代理呼叫
      const API_KEY = ""; // 🚨 placeholder, MUST be replaced with a secure method
      if (!API_KEY) {
          setTermExplanations(prev => ({ ...prev, [term]: "🚨 API Key 未設定或無效。請檢查配置。" }));
          setTermLoading(false);
          return;
      }

      const geminiFlashUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

      const prompt = `請以簡短、專業且易懂的方式，解釋以下消防安全詞彙，長度約 30 字中文："${term}"。`;

      try {
          const textPayload = {
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: "你是一位專業的消防術語講師，用精煉的語言解釋詞彙。" }] },
              generationConfig: {
                  temperature: 0.5,
                  maxOutputTokens: 80,
              }
          };

          let explanationText = null;
          let attempt = 0;
          
          while (attempt < 5) { // Retry logic
              const delay = Math.pow(2, attempt) * 1000;
              if (attempt > 0) await new Promise(resolve => setTimeout(resolve, delay));
              
              try {
                  const textResponse = await fetch(geminiFlashUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(textPayload)
                  });
                  
                  if (textResponse.ok) {
                      const result = await textResponse.json();
                      explanationText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (explanationText) break;
                  }
              } catch (error) { /* Ignore internal error for retry */ }
              attempt++;
          }

          setTermExplanations(prev => ({
              ...prev,
              [term]: explanationText ? explanationText.trim() : "無法生成解說。"
          }));
          
      } catch (error) {
          console.error("Gemini Term API call failed:", error);
          setTermExplanations(prev => ({
              ...prev,
              [term]: "⚠️ 系統錯誤，無法生成解說。"
          }));
      } finally {
          setTermLoading(false);
      }
  };
  // --- [Gemini API 邏輯結束] ---


  const handleOptionClick = (option) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questionsData.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    cleanupGemini();
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  // Progress Percentage
  const progress = ((currentQuestionIndex + 1) / questionsData.length) * 100;

  // Custom icons
  const CustomAward = () => <img src="https://www.svgrepo.com/show/305286/prize-cup.svg" alt="Award" className="w-16 h-16" />;
  const CustomAlert = () => <img src="https://www.svgrepo.com/show/441443/alert-triangle-danger.svg" alt="Alert" className="w-16 h-16" />;
  const CustomCross = () => <img src="https://www.svgrepo.com/show/448208/cross.svg" alt="Cross" className="w-16 h-16" />;
  const CustomHelp = () => <img src="https://www.svgrepo.com/show/496078/question-circle.svg" alt="Help" className="w-6 h-6 text-blue-700" />;


  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center animate-fade-in-up transform transition-all duration-500 scale-100 hover:scale-[1.01]">
          <div className="flex justify-center mb-6">
            {score >= 16 ? (
              <div className="p-4 bg-yellow-100 rounded-full">
                <CustomAward />
              </div>
            ) : score >= 10 ? (
              <div className="p-4 bg-orange-100 rounded-full">
                <CustomAlert />
              </div>
            ) : (
              <div className="p-4 bg-red-100 rounded-full">
                <CustomCross />
              </div>
            )}
          </div>
          
          <h2 className="text-4xl font-extrabold text-slate-800 mb-2 font-serif tracking-tight">測驗完成！</h2>
          <p className="text-slate-600 mb-6 text-lg font-medium">您的防災知識掌握度</p>
          
          <div className="text-6xl font-black text-blue-700 mb-4 animate-bounce-in">
            {score} <span className="text-3xl text-slate-400">/ {questionsData.length}</span>
          </div>
          
          <p className="text-xl mb-8 font-semibold leading-relaxed text-slate-700">
            {score === 20 ? "🎉 太厲害了！您是防災達人！" : 
              score >= 16 ? "👍 表現優秀！只要再注意小細節即可。" :
              score >= 12 ? "🤔 還不錯，建議多複習防災觀念喔。" :
              "🚨 為了安全，請務必重新學習防災知識！"}
          </p>

          <button 
            onClick={restartQuiz}
            className="w-full flex items-center justify-center py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 transform"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            重新測驗
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center py-8 px-4 font-sans">
      
      {/* Header / Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between items-end mb-3 px-2">
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center tracking-wide">
            <CustomHelp />
            <span className="ml-2 text-blue-700">消防安全知識測驗</span>
          </h1>
          <span className="text-md font-semibold text-slate-500">
            第 <span className="text-blue-600">{currentQuestionIndex + 1}</span> / {questionsData.length} 題
          </span>
        </div>
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all duration-300 hover:scale-[1.005]">
        <div className="p-6 md:p-10">
          {/* Question Image */}
          {questionImages[currentQuestion.id] && (
            <div className="flex justify-center mb-6">
              <img src={questionImages[currentQuestion.id]} alt="Question illustration" className="w-32 h-32 object-contain animate-float" />
            </div>
          )}

          <h3 className="text-xl md:text-2xl font-bold text-blue-800 mb-8 leading-relaxed tracking-wide">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              
              let buttonStyle = "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50";
              let textStyle = "text-slate-700";
              let icon = null;

              if (isAnswered) {
                if (isCorrect) {
                  buttonStyle = "bg-green-50 border-green-500 text-green-800 shadow-md";
                  textStyle = "text-green-800 font-semibold";
                  icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                } else if (isSelected && !isCorrect) {
                  buttonStyle = "bg-red-50 border-red-500 text-red-800 shadow-md";
                  textStyle = "text-red-800 font-semibold";
                  icon = <XCircle className="w-5 h-5 text-red-600" />;
                } else {
                  buttonStyle = "border-slate-200 bg-slate-50 text-slate-500 opacity-70 cursor-not-allowed";
                  textStyle = "text-slate-500";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border-2 text-left text-lg font-medium transition-all duration-200 flex justify-between items-center ${buttonStyle} transform hover:-translate-y-0.5`}
                >
                  <span className={`flex-1 ${textStyle}`}>{option}</span>
                  {icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div className={`p-6 md:p-8 border-t-2 animate-fade-in transition-colors duration-300 ${selectedOption === currentQuestion.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start mb-5">
              <div className={`p-2 rounded-full mr-4 shrink-0 shadow-sm ${selectedOption === currentQuestion.correctAnswer ? 'bg-green-200' : 'bg-red-200'}`}>
                {selectedOption === currentQuestion.correctAnswer ? 
                  <CheckCircle className="w-7 h-7 text-green-700" /> : 
                  <XCircle className="w-7 h-7 text-red-700" />
                }
              </div>
              <div>
                <h4 className={`text-xl font-bold mb-2 tracking-wide ${selectedOption === currentQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                  {selectedOption === currentQuestion.correctAnswer ? '答對了！' : '答錯了！'}
                </h4>
                <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                  <span className="font-bold text-slate-800">解析：</span>
                  <span className="text-gray-600">{currentQuestion.explanation}</span>
                </p>
              </div>
            </div>

            {/* AI Assistant Features */}
            <div className="space-y-4 mb-6">
                <button
                    onClick={() => generateSummaryAndTts(currentQuestion.question, currentQuestion.explanation)}
                    disabled={geminiLoading}
                    className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {geminiLoading && showGeminiPanel ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ✨ AI 語音複習中...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 mr-2" />
                        ✨ 啟動 AI 語音複習
                      </>
                    )}
                </button>
                
                {/* AI Explanation Panel */}
                {showGeminiPanel && (
                  <div className="bg-orange-100 border border-orange-300 rounded-xl p-4 text-sm mt-3 animate-fade-in">
                    <div className="flex items-center mb-2">
                        <Bot className="w-5 h-5 text-orange-600 mr-2 shrink-0" />
                        <span className="font-bold text-orange-800">AI 消防宣導員提醒您：</span>
                    </div>
                    {geminiText ? (
                        <>
                            <p className="text-orange-700 leading-relaxed mb-3">{geminiText}</p>
                            {audioUrl && (
                                <audio controls autoPlay className="w-full mt-2">
                                    <source src={audioUrl} type="audio/wav" />
                                    您的瀏覽器不支援音訊播放。
                                </audio>
                            )}
                        </>
                    ) : (
                        <p className="text-orange-700">等待 AI 生成重點總結...</p>
                    )}
                  </div>
                )}

                {/* AI Terminology Explanation Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                    <span className="text-sm font-semibold text-slate-600 w-full mb-1">關鍵詞彙解說：</span>
                    {currentQuestion.keyTerms && currentQuestion.keyTerms.map(term => (
                        <div key={term} className="flex flex-col w-full md:w-auto">
                          <button
                            onClick={() => generateTermExplanation(term)}
                            disabled={termLoading}
                            className={`flex items-center px-3 py-2 text-xs font-semibold rounded-full transition-all duration-200 shadow-md ${
                                termLoading ? 'bg-slate-400 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            <BookOpen className="w-4 h-4 mr-1" />
                            ✨ 什麼是 "{term}"?
                          </button>
                          {termExplanations[term] && (
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 mt-1 text-xs text-indigo-800 animate-fade-in max-w-full">
                                {termExplanations[term]}
                              </div>
                          )}
                        </div>
                    ))}
                </div>
            </div>
            {/* End AI Assistant Features */}

            <button
              onClick={handleNextQuestion}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 active:scale-98"
            >
              {currentQuestionIndex + 1 === questionsData.length ? '查看結果' : '下一題'}
              <ChevronRight className="w-6 h-6 ml-2" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}