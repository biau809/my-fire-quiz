import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RotateCcw, Award, ChevronRight, HelpCircle, Volume2, Bot, BookOpen, VolumeX } from 'lucide-react';

// --- [嵌入式圖示組件集] ---

// 1. 煙霧警報器圖示
const SmokeDetectorIcon = ({ className }) => (
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" fill="#E0F2FE" stroke="#3B82F6" strokeWidth="2"/>
        <path d="M8 8a8 8 0 0 1 8 8" stroke="#FBBF24" strokeWidth="1.5"/>
        <path d="M16 8a8 8 0 0 0-8 8" stroke="#FBBF24" strokeWidth="1.5"/>
        <path d="M12 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#DC2626"/>
        <path d="M12 6v6l4 2" stroke="#1D4ED8" strokeWidth="2"/>
        <path d="M8 12h8" stroke="#1D4ED8" strokeWidth="2"/>
    </svg>
);

// 2. 滅火器圖示
const FireExtinguisherIcon = ({ className }) => (
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 7v-3" stroke="#374151" strokeWidth="2"/>
        <path d="M9 4h6" stroke="#374151" strokeWidth="2"/>
        <path d="M15 4l1-2" stroke="#374151"/>
        <rect x="7" y="7" width="10" height="14" rx="2" fill="#FCA5A5" stroke="#DC2626" strokeWidth="2"/>
        <path d="M12 7v14" stroke="#B91C1C" strokeWidth="1"/>
        <path d="M15 11h-2" stroke="#B91C1C"/>
        <path d="M12 4l-3 3" stroke="#374151"/> 
    </svg>
);

// 3. 緊急出口/逃生圖示
const EmergencyExitIcon = ({ className }) => (
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 21h18" stroke="#374151"/>
        <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" fill="#D1FAE5"/>
        <path d="M12 11v4" stroke="#047857"/>
        <path d="M10 21v-4a2 2 0 0 1 4 0v4" fill="#fff"/>
        <circle cx="16" cy="12" r="1" fill="#047857"/>
        <path d="M19 4l-2 2" stroke="#059669"/>
    </svg>
);

// 4. 一般防災/火焰圖示
const GeneralSafetyIcon = ({ className }) => (
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3a7 7 0 0 0 2.9 2.8z" fill="#FEF3C7"/>
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5-2-1.6-3.5-4-4-6.5-2.224 1.946-3.072 3.857-2 6 .5 1 1 1.62 1 3a2.5 2.5 0 0 1-2.5 2.5" />
    </svg>
);

// --- [圖示分配對照表] ---
const questionIconMap = {
  1: SmokeDetectorIcon,
  2: FireExtinguisherIcon,
  3: EmergencyExitIcon,
  4: SmokeDetectorIcon,
  5: SmokeDetectorIcon,
  6: FireExtinguisherIcon,
  7: EmergencyExitIcon,
  8: GeneralSafetyIcon,
  9: EmergencyExitIcon,
  10: GeneralSafetyIcon,
  11: FireExtinguisherIcon,
  12: SmokeDetectorIcon,
  13: GeneralSafetyIcon,
  14: EmergencyExitIcon,
  15: GeneralSafetyIcon,
  16: SmokeDetectorIcon,
  17: GeneralSafetyIcon,
  18: SmokeDetectorIcon,
  19: FireExtinguisherIcon,
  20: EmergencyExitIcon
};

// --- [嵌入式圖示組件結束] ---

const questionsData = [
  { id: 1, question: "住宅中最重要的消防設備是甚麼？", options: ["滅火器", "緊急照明燈", "住宅用火災警報器", "緩降機"], correctAnswer: "住宅用火災警報器", explanation: "人們在睡覺時，對外界的視覺、觸覺及嗅覺都不甚靈敏，很難察覺火災的煙、熱或是燒焦味等到驚醒時，往往已經深陷火海，逃生困難，所以為了及早察覺火災，必須安裝住宅用火災警報器。", keyTerms: ["住宅用火災警報器"] },
  { id: 2, question: "使用滅火器時要注意，一般滅火器的有效射程為3至5公尺，無法近距離滅火時，請儘速逃生，並打119報案。", options: ["正確", "錯誤"], correctAnswer: "正確", explanation: "滅火器有效射程有限，若火勢過大無法靠近，應優先選擇逃生並報案。", keyTerms: ["滅火器", "有效射程"] },
  { id: 3, question: "火災時如果出口方向濃煙密布，千萬不要穿越濃煙，要退回安全的室內，關上門，並將門縫用東西塞住，防止濃煙竄入，然後將對戶外的窗戶打開，向外面求救。", options: ["正確", "錯誤"], correctAnswer: "正確", explanation: "這是正確的「關門求生」觀念，阻隔濃煙是存活關鍵。", keyTerms: ["關門求生", "濃煙密布"] },
  { id: 4, question: "有關住宅用火災警報器使用維護方式，下列何者錯誤？", options: ["安裝前後按一按測試鈕", "定期擦拭，以保持偵測靈敏", "當警報器電池快沒電時，會發出畢畢聲", "每年測試1次警報器是否正常動作"], correctAnswer: "每年測試1次警報器是否正常動作", explanation: "正確做法應為：安裝後定期(一個月1次)或外出3天以上時，請按下測試開關確認警報器是否正常動作，而非僅每年一次。", keyTerms: ["住宅用火災警報器", "定期測試"] },
  { id: 5, question: "偵煙式住宅用火災警報器不能裝在哪裡？", options: ["客廳", "廚房", "房間", "樓梯"], correctAnswer: "廚房", explanation: "因廚房平時可能有炒菜油煙，為了避免偵煙式住宅用火災警報器誤判，故類似廚房平時會產生煙粒子之場所，應裝設「定溫式」住宅用火災警報器為宜。", keyTerms: ["偵煙式", "定溫式", "誤判"] },
  { id: 6, question: "滅火器的使用順序，下列何者正確？", options: ["拉瞄壓掃", "瞄掃拉壓", "壓拉掃瞄", "掃壓瞄拉"], correctAnswer: "拉瞄壓掃", explanation: "滅火器的使用順序為：1.拉-拉插銷 2.瞄-瞄準火源底部 3.壓-壓握把 4.掃-向火源底部左右掃射。", keyTerms: ["滅火器", "拉瞄壓掃"] },
  { id: 7, question: "有關火場逃生避難的觀念，下列何者正確？", options: ["躲在浴室裡是最安全的", "逃生時要用濕毛巾摀口鼻", "開門若遇濃煙要越快穿越濃煙逃生", "如果樓梯間沒濃煙就往下逃生"], correctAnswer: "如果樓梯間沒濃煙就往下逃生", explanation: "不可躲在浴室：1)門多為塑膠不耐高溫 2)門下有通風百葉無法阻擋濃煙 3)無逃生出口。濕毛巾會浪費時間且無法擋高熱濃煙。遇濃煙應關門避難而非穿越。", keyTerms: ["濕毛巾", "濃煙"] },
  { id: 8, question: "為了避免火災發生，下列何者為錯誤的生活習慣？", options: ["作飯煮菜時人若暫時離開，應先關閉瓦斯", "火柴、打火機應妥善收藏，以免小孩玩火", "冬天使用電暖器取暖時，可同時烘乾衣物", "排煙機及風管的油污應定期清理"], correctAnswer: "冬天使用電暖器取暖時，可同時烘乾衣物", explanation: "電暖器溫度高，若長時間將衣物覆蓋，可能導致機體過熱引發火災。", keyTerms: ["電暖器", "烘乾衣物"] },
  { id: 9, question: "平時應規劃2個逃生出口，其中一個為主要逃生出口，另一個為替代逃生出口，且應讓家人都知道，同時約定集合地點。", options: ["正確", "錯誤"], correctAnswer: "正確", explanation: "平時規劃逃生避難路線圖及約定集合地點是避難三步驟之一。", keyTerms: ["逃生出口", "集合地點"] },
  { id: 10, question: "如果衣服不小心著火時，應立即怎麼做？", options: ["趕快跑動找水來滅火", "趕快用手拍熄", "立即停下來，倒在地上，用手保護臉部，來回滾動", "用手撥開火苗"], correctAnswer: "立即停下來，倒在地上，用手保護臉部，來回滾動", explanation: "口訣為「停、躺、滾」，可有效隔絕空氣，撲滅身上的火。", keyTerms: ["停躺滾"] },
  { id: 11, question: "使用滅火器時，應瞄準火源的什麼位置進行射擊？", options: ["火焰中央", "火焰最頂端", "火源底部", "水箱"], correctAnswer: "火源底部", explanation: "滅火藥劑直接噴向火源底部才能有效阻斷火勢的燃料。", keyTerms: ["滅火器", "火源底部"] },
  { id: 12, question: "下列何者為住宅用火災警報器的種類？", options: ["偵煙式", "定溫式", "以上皆是", "閃光式"], correctAnswer: "以上皆是", explanation: "常見的家警器分為偵煙式（感應煙霧）和定溫式（感應溫度）兩種。", keyTerms: ["偵煙式", "定溫式"] },
  { id: 13, question: "下列何者不屬於應報案的情形？", options: ["聞到濃濃的燒焦味", "家裡失火", "有人受困火場", "看到路邊有火警假警報器"], correctAnswer: "看到路邊有火警假警報器", explanation: "報案是針對正在發生或即將發生火災的緊急情況。路邊的假警報器非緊急狀況，應通報相關單位處理。", keyTerms: ["報案"] },
  { id: 14, question: "如果你是在公共場所，發現火災時，應大聲喊叫或以其他方法通知他人，立即撥打119報案，並啟動場所內警報設備，然後往逃生避難設備逃生。", options: ["正確", "錯誤"], correctAnswer: "正確", explanation: "火災報案、通知他人與啟動警報是公共場所火災初期應變的重要步驟。", keyTerms: ["公共場所", "119"] },
  { id: 15, question: "若要避免發生電器火災，下列敘述何者錯誤？", options: ["電線不可壓在重物或家具下方", "延長線不要串接延長線", "電線走火時，可以用水滅火", "用電量較大的電器，應使用獨立插座"], correctAnswer: "電線走火時，可以用水滅火", explanation: "電線走火是電器火災，用水滅火可能導致觸電危險或擴大短路。應使用乾粉滅火器或關閉電源。", keyTerms: ["電器火災", "電線走火", "用水滅火"] },
  { id: 16, question: "住宅用火災警報器應裝設在哪些地方？", options: ["臥室", "樓梯", "廚房", "以上皆是"], correctAnswer: "以上皆是", explanation: "臥室、樓梯、走廊及廚房都是建議優先裝設的地點。", keyTerms: ["住宅用火災警報器", "臥室", "樓梯"] },
  { id: 17, question: "消防安全設備的定義，下列何者為是？", options: ["滅火設備-指以水或其他滅火藥劑滅火之器具或設備", "警報設備-指報知火災發生之器具或設備", "避難逃生設備-指火災發生時為避難而方便使用之器具或設備", "以上皆是"], correctAnswer: "以上皆是", explanation: "消防安全設備包含滅火設備、警報設備、避難逃生設備以及消防搶救上之必要設備等。", keyTerms: ["消防安全設備"] },
  { id: 18, question: "林太太居住的集合住宅，其火警探測器時常警報鳴動誤動作，造成困擾，採下列何種解決方式較佳？", options: ["將火警受信總機開關關閉", "請管委會通知合格的消防專業技術人員檢修", "把火警探測器拆下來", "放著不管"], correctAnswer: "請管委會通知合格的消防專業技術人員檢修", explanation: "集合住宅管理權人應依消防法規定，委託消防專業技術人員定期檢修。關閉主機或拆除探測器會造成安全漏洞，違法且危險。", keyTerms: ["火警探測器", "誤動作"] },
  { id: 19, question: "乾粉滅火器之操作口訣為?", options: ["拉、瞄、壓、掃", "拉、壓、瞄、掃", "拉、壓、掃、瞄", "拉、掃、壓、瞄"], correctAnswer: "拉、瞄、壓、掃", explanation: "口訣：1.拉插銷 2.瞄火源底部 3.壓握把 4.掃左右。", keyTerms: ["乾粉滅火器", "口訣"] },
  { id: 20, question: "火場逃生時，為避免吸入濃煙，下列何種逃生姿勢最正確？", options: ["站立逃生", "趴在地上逃生", "用濕毛巾摀口鼻逃生", "彎腰低姿勢逃生"], correctAnswer: "彎腰低姿勢逃生", explanation: "濃煙會向上竄升，所以應採低姿勢逃生，但不是趴著，以免阻礙移動速度。", keyTerms: ["濃煙", "低姿勢逃生"] },
];

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [geminiText, setGeminiText] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [termExplanations, setTermExplanations] = useState({});
  const [termLoading, setTermLoading] = useState(false);

  const currentQuestion = questionsData[currentQuestionIndex];

  // --- [瀏覽器內建語音播放 (Web Speech API)] ---
  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      console.error("Browser does not support text-to-speech");
      return;
    }
    
    window.speechSynthesis.cancel(); // 停止目前播放

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW'; 
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 

    utterance.onstart = () => setIsAudioPlaying(true);
    utterance.onend = () => setIsAudioPlaying(false);
    utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setIsAudioPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
  }, []);

  // --- [Gemini API 呼叫核心 - 終極智慧重試機制] ---
  // 自動嘗試不同的模型名稱，包含您看到的 'gemini-pro-latest'
  const callGeminiAPI = async (API_KEY, payload) => {
    // 定義嘗試的模型順序，加入您的 Key 能看到的確切名稱
    const modelsToTry = [
        "gemini-pro-latest", // 您的清單中看到的名稱，優先嘗試
        "gemini-1.5-flash", 
        "gemini-pro",
        "gemini-1.5-flash-001"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
        
        try {
            console.log(`Trying Gemini model: ${modelName}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // 檢查是否成功 (有 candidates 代表成功)
            if (response.ok && data.candidates && data.candidates.length > 0) {
                console.log(`Success with model: ${modelName}`);
                return data.candidates[0].content.parts[0].text;
            } else {
                // 如果 API 回傳錯誤結構
                const errorMsg = data.error?.message || "Unknown error";
                console.warn(`Model ${modelName} failed:`, errorMsg);
                lastError = errorMsg;
                // 迴圈繼續，嘗試下一個模型...
            }
        } catch (error) {
            console.error(`Network error with model ${modelName}:`, error);
            lastError = error.message;
        }
    }
    
    // 如果所有模型都失敗，拋出最後一個錯誤
    throw new Error(lastError || "All models failed. Please check API Key.");
  };


  // --- [生成重點總結] ---
  const handleGenerateSummary = useCallback(async () => {
    if (geminiLoading) return;
    setGeminiLoading(true);
    setGeminiText("");
    stopSpeaking();

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
        setGeminiText("🚨 錯誤：未讀取到 API Key。請檢查 .env 檔案。");
        setGeminiLoading(false);
        return;
    }

    const payload = {
      contents: [{ 
        parts: [{ 
          text: `針對這個問題的答案和解釋，請用不超過 50 個字的口語化、親切語氣，寫一個台灣消防安全知識的重點總結。
          問題: ${currentQuestion.question}
          答案: ${currentQuestion.correctAnswer}
          解釋: ${currentQuestion.explanation}` 
        }] 
      }]
    };

    try {
        // 使用新的呼叫函式
        const text = await callGeminiAPI(API_KEY, payload);
        setGeminiText(text.trim());
        speakText(text.trim());
    } catch (error) {
        setGeminiText(`⚠️ 生成失敗 (所有模型皆嘗試無效)：\n${error.message}`);
    } finally {
        setGeminiLoading(false);
    }
  }, [currentQuestion, speakText, stopSpeaking]);

  // --- [術語解釋] ---
  const handleExplainTerm = async (term) => {
    if (termLoading || termExplanations[term]) return;
    setTermLoading(true);

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
        setTermExplanations(prev => ({ ...prev, [term]: "🚨 API Key 未設定。" }));
        setTermLoading(false);
        return;
    }

    const payload = {
      contents: [{ 
        parts: [{ 
          text: `請用簡潔的白話文，解釋「${term}」這個消防安全或防災相關的名詞。` 
        }] 
      }]
    };

    try {
        const text = await callGeminiAPI(API_KEY, payload);
        setTermExplanations(prev => ({ ...prev, [term]: text.trim() }));
    } catch (error) {
        setTermExplanations(prev => ({ ...prev, [term]: `⚠️ 錯誤: ${error.message}` }));
    } finally {
      setTermLoading(false);
    }
  };


  // --- [測驗邏輯] ---
  const handleOptionClick = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    stopSpeaking(); 
    setGeminiText(""); 
    if (currentQuestionIndex + 1 < questionsData.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    stopSpeaking();
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setGeminiText("");
    setTermExplanations({});
  };

  useEffect(() => {
    return () => {
        window.speechSynthesis.cancel();
    };
  }, []);


  // --- [JSX 渲染輔助組件] ---
  const CustomHelp = () => (
    <HelpCircle className="w-6 h-6 text-blue-500 mr-1" />
  );

  const CustomBot = () => (
    <Bot className="w-5 h-5 text-green-500 mr-2" />
  );

  const CustomVolume = () => (
    <Volume2 className={`w-5 h-5 transition-colors ${isAudioPlaying ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
  );


  // --- [主要渲染] ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center py-8 px-4 font-sans">
        <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-blue-200 animate-slide-in-up">
          <div className="flex flex-col items-center text-center">
            <Award className="w-16 h-16 text-yellow-500 mb-4 animate-bounce-slow" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 tracking-wide">測驗結果</h2>
            <p className="text-xl text-slate-600 mb-6">您已完成所有 {questionsData.length} 道題目！</p>
            <div className="bg-blue-50 p-6 rounded-xl w-full mb-8 shadow-inner">
              <p className="text-5xl font-black text-blue-700">
                {score} / {questionsData.length}
              </p>
              <p className="text-lg font-semibold text-blue-600 mt-2">
                總得分
              </p>
            </div>
            
            {score / questionsData.length >= 0.8 ? (
              <p className="text-green-600 font-bold text-lg mb-8">
                🎉 恭喜您！您的消防安全知識非常優秀！
              </p>
            ) : (
              <p className="text-red-600 font-bold text-lg mb-8">
                💡 知識可以更精進喔！重新測驗以加深印象。
              </p>
            )}

            <button 
              onClick={handleRestartQuiz}
              className="w-full py-3 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 transform" 
            >
              <RotateCcw className="w-5 h-5 mr-2" /> 重新測驗
            </button>
          </div>
        </div>
      </div>
    );
  }

  const CurrentIconComponent = questionIconMap[currentQuestion.id] || GeneralSafetyIcon;

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
            className="h-full bg-blue-500 transition-all duration-500 ease-out" 
            style={{ width: `${((currentQuestionIndex + 1) / questionsData.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-blue-200 animate-fade-in-up">
        
        {/* Question Image/Icon */}
        <div className="flex justify-center mb-6">
            <CurrentIconComponent className="w-32 h-32 object-contain animate-float" />
        </div>

        {/* Question Text */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 text-center leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedOption;
            
            let buttonClass = "bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700";
            if (isAnswered) {
              if (isSelected && isCorrect) {
                buttonClass = "bg-green-100 text-green-800 border-green-400 shadow-lg";
              } else if (isSelected && !isCorrect) {
                buttonClass = "bg-red-100 text-red-800 border-red-400 shadow-lg line-through opacity-70";
              } else if (isCorrect) {
                buttonClass = "bg-green-50 text-green-700 border-green-300 shadow-md";
              } else {
                buttonClass = "bg-slate-100 text-slate-500 opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 font-semibold transition-all duration-200 flex items-center justify-between transform hover:scale-[1.01] ${buttonClass}`}
              >
                <span>{option}</span>
                {isAnswered && isSelected && (
                  isCorrect ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" /> : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-2" />
                )}
                {isAnswered && !isSelected && isCorrect && (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation and Next Button */}
        {isAnswered && (
          <div className="animate-slide-down">
            <div className={`p-4 md:p-6 rounded-xl mb-6 shadow-md border-l-4 ${selectedOption === currentQuestion.correctAnswer ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <div className="flex items-center mb-3">
                {selectedOption === currentQuestion.correctAnswer ? <CheckCircle className="w-7 h-7 text-green-700" /> : <XCircle className="w-7 h-7 text-red-700" /> }
                <h4 className={`text-xl font-bold ml-3 tracking-wide ${selectedOption === currentQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                  {selectedOption === currentQuestion.correctAnswer ? '答對了！' : '答錯了！'}
                </h4>
              </div>
              <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                <span className="font-bold block mb-1">正解：{currentQuestion.correctAnswer}</span>
                <span className="font-bold text-indigo-600 block mt-3">💡 解釋：</span>
                {currentQuestion.explanation}
              </p>
            </div>

            {/* AI Assistant Features */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl shadow-inner border border-indigo-200">
                <h5 className="text-lg font-bold text-indigo-700 mb-3 flex items-center">
                    <CustomBot /> AI 消防安全助手
                </h5>
                <div className="mb-4">
                    <button
                        onClick={handleGenerateSummary}
                        disabled={geminiLoading}
                        className={`w-full py-2 flex items-center justify-center rounded-lg font-semibold transition-all duration-300 transform ${
                            geminiLoading
                                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                                : 'bg-blue-200 text-blue-800 hover:bg-blue-300 active:scale-98'
                        }`}
                    >
                        {geminiLoading ? '生成中...' : '💬 生成重點總結 (含語音)'}
                        {(geminiText && !geminiLoading) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); isAudioPlaying ? stopSpeaking() : speakText(geminiText); }}
                            className="ml-3 p-1 rounded-full hover:bg-blue-400 active:scale-95 transition-all"
                            title={isAudioPlaying ? "停止播放" : "播放語音"}
                          >
                            {isAudioPlaying ? <VolumeX className="w-5 h-5 text-red-500" /> : <CustomVolume />}
                          </button>
                        )}
                    </button>
                    {geminiText && (
                        <div className={`mt-3 p-3 rounded-lg border border-blue-300 bg-white text-slate-800 text-sm animate-fade-in`}>
                          <p style={{whiteSpace: 'pre-wrap'}}>{geminiText}</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 border-t border-indigo-200 pt-3">
                    <p className="text-sm font-semibold text-indigo-600 mb-2">點擊查詢相關術語：</p>
                    <div className="flex flex-wrap gap-2">
                    {currentQuestion.keyTerms.map((term, index) => (
                        <div key={index} className="max-w-full">
                          <button
                            onClick={() => handleExplainTerm(term)}
                            disabled={termLoading}
                            className={`flex items-center px-3 py-2 text-xs font-semibold rounded-full transition-all duration-200 shadow-md ${
                                termLoading && !termExplanations[term] ? 'bg-slate-400 text-white animate-pulse' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            <BookOpen className="w-4 h-4 mr-1" />
                            {termLoading && !termExplanations[term] ? '查詢中...' : `✨ 什麼是 "${term}"?`}
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
};

export default App;