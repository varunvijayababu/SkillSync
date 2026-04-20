import { useEffect, useState, useRef } from "react";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { RefreshCcw } from "lucide-react";

import { 
  Users, Briefcase, Target,
  CheckCircle, AlertTriangle,
  Mic, MicOff, Volume2,
  Award, Command, Zap
} from "lucide-react";

export default function FinalBoss() {
  const [phase, setPhase] = useState("START"); // START, PANEL, PRE_INTERVIEW, INTERVIEW, DEBRIEF
  const [resumeData, setResumeData] = useState({ role: "Developer", skills: [], missing: [], exp: [] });
  
  const [panelResult, setPanelResult] = useState(null);
  
  // Interview state
  const [rounds, setRounds] = useState([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interviewResults, setInterviewResults] = useState([]);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    try {
      const roadmap = JSON.parse(localStorage.getItem("roadmapData") || "{}");
      const latest = JSON.parse(localStorage.getItem("latestProfile") || "{}");
      const rData = JSON.parse(localStorage.getItem("resumeData") || "{}");

      setResumeData({
        role: roadmap.role || latest.role || "Developer",
        skills: latest.skills || roadmap.matchedSkills || ["JavaScript", "React"],
        missing: roadmap.missingSkills || ["Docker"],
        exp: rData.experience || []
      });
    } catch (e) {}
  }, []);

  const runPanel = () => {
    setPhase("LOADING");
    
    setTimeout(() => {
      const skills = resumeData.skills;
      const missing = resumeData.missing;
      const hasExp = resumeData.exp.length > 0;

      // Tech Recruiter
      const techDecision = missing.length > 2 ? "REJECTED" : missing.length > 0 ? "BORDERLINE" : "SHORTLISTED";
      const techNotes = {
        strengths: skills.length > 0 ? `Good core foundation in ${skills[0]}.` : "Shows willingness to learn.",
        weaknesses: missing.length > 0 ? `Missing production experience with ${missing[0]}.` : "None explicitly found.",
        reasoning: techDecision === "SHORTLISTED" ? "Meets technical thresholds." : "Too much risk regarding modern toolchain."
      };

      // HR Recruiter
      const hrDecision = "SHORTLISTED";
      const hrNotes = {
        strengths: "Formatting is clean. Background checks out.",
        weaknesses: "Slight lack of explicit soft-skill mentions.",
        reasoning: "Candidate seems stable and communicate properly on paper."
      };

      // Manager
      const mgrDecision = hasExp ? "SHORTLISTED" : "BORDERLINE";
      const mgrNotes = {
        strengths: hasExp ? "Previous tenure demonstrates delivery capability." : "Can mold into culture.",
        weaknesses: !hasExp ? "Will require extensive ramp-up time." : "Unsure about independent leadership capability.",
        reasoning: hasExp ? "Ready to integrate into the team." : "Needs seniors to babysit initial tickets."
      };

      let decisions = [techDecision, hrDecision, mgrDecision];
      let shortlistCount = decisions.filter(d => d === "SHORTLISTED").length;
      let rejectCount = decisions.filter(d => d === "REJECTED").length;

      let consensus = "BORDERLINE";
      if (rejectCount >= 2) consensus = "REJECTED";
      else if (shortlistCount >= 2) consensus = "SHORTLISTED";

      setPanelResult({
        personas: [
          { role: "Technical Lead", decision: techDecision, ...techNotes, icon: <Command className="w-8 h-8 text-blue-500"/> },
          { role: "HR Representative", decision: hrDecision, ...hrNotes, icon: <Users className="w-8 h-8 text-pink-500"/> },
          { role: "Hiring Manager", decision: mgrDecision, ...mgrNotes, icon: <Briefcase className="w-8 h-8 text-emerald-500"/> }
        ],
        consensus,
        summary: `The panel is leaning ${consensus}. The HR team gave the green light, but Technical constraints ${techDecision === "SHORTLISTED" ? "were cleared." : "caused friction."} The Hiring Manager is ${mgrDecision === "SHORTLISTED" ? "eager to meet." : "hesitant on ramp-up speed."}`,
        improvements: [
          "Defend your soft skills aggressively in the HR round.",
          "Prepare to speak highly technically on your missing gaps.",
          "Show extreme initiative and maturity to the Manager."
        ]
      });

      // Prepare Voice Rounds
      setRounds([
        { 
          type: "Technical", 
          interviewer: "Lead Engineer",
          q: `Explain a time you solved a severe architectural problem using ${skills[0] || 'your core stack'}. Let's dive deep.` 
        },
        { 
          type: "HR", 
          interviewer: "Talent Partner",
          q: `We value extreme ownership. Tell me about a time you took the blame for a failure, and how you fixed it.` 
        },
        { 
          type: "Manager", 
          interviewer: "VP of Engineering",
          q: `Why should I risk hiring you over someone with 5 more years of experience? What is your operational edge?` 
        }
      ]);

      setPhase("PANEL");
    }, 1500);
  };

  const startVoiceInterview = () => {
    setPhase("INTERVIEW");
    setCurrentRoundIdx(0);
    setTranscript("");
    setInterviewResults([]);
    askQuestion(rounds[0].q);
  };

  const askQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceCapture = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser doesn't support the Speech API. Please type your answer in the box.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalStr = Array.from(event.results).map(r => r[0].transcript).join('');
        setTranscript(finalStr);
      };
      
      recognition.onend = () => setIsListening(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  const submitAnswer = () => {
    if (isListening && recognitionRef.current) captureStop();

    // Evaluate
    let score = 60;
    let feedbackStr = [];
    let metricsHit = false;

    if (transcript.length < 50) {
      score -= 20;
      feedbackStr.push("Clarity Check: Answer was too brief, lacking structure.");
    } else {
      score += 15;
    }

    if (/\d+(%|x|\$)/.test(transcript)) {
      score += 15;
      metricsHit = true;
      feedbackStr.push("Impact Check: Excellent use of quantified metrics.");
    } else {
      feedbackStr.push("Impact Check: Try to add numbers to prove your scale.");
    }

    if (transcript.toLowerCase().includes("result") || transcript.toLowerCase().includes("because")) {
      score += 10;
      feedbackStr.push("Structure Check: Strong logical flow connecting actions to outcomes.");
    } else {
      feedbackStr.push("Structure Check: Failed to clearly outline the 'Result'. Use STAR method.");
    }

    const currentRes = {
      round: rounds[currentRoundIdx].type,
      question: rounds[currentRoundIdx].q,
      answer: transcript,
      score: Math.min(100, Math.max(0, score)),
      feedback: feedbackStr,
      metricsHit
    };

    const newResults = [...interviewResults, currentRes];
    setInterviewResults(newResults);

    if (currentRoundIdx + 1 < rounds.length) {
       // next round
       setCurrentRoundIdx(currentRoundIdx + 1);
       setTranscript("");
       askQuestion(rounds[currentRoundIdx + 1].q);
    } else {
       // Finished
       setPhase("DEBRIEF");
    }
  };

  const captureStop = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-16">
      
      {/* Top Navbar Simulation Layer */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
             <Target className="w-6 h-6 text-rose-500" /> FINAL BOSS MODE
           </h2>
           <div className="flex gap-2">
              <Badge variant={phase !== "START" ? "success" : "secondary"}>System Active</Badge>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-10">

        {phase === "START" && (
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl border border-gray-200 dark:border-gray-700 text-center flex flex-col items-center justify-center animate-fade-in-up min-h-[60vh]">
              <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                 <Command className="w-12 h-12" />
              </div>
              <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">The Final Gauntlet</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mb-12">
                Face the ultimate challenge. First, survive the brutal 3-persona AI Hiring Panel. Then, jump into a multi-round live voice interview.
              </p>
              <Button onClick={runPanel} className="px-10 py-5 text-xl font-black rounded-2xl shadow-[0_10px_30px_rgba(225,29,72,0.3)] bg-rose-600 hover:bg-rose-700 text-white border-0 flex items-center gap-3 hover:scale-105 transition-transform">
                 <Zap className="w-6 h-6"/> Face The Hiring Panel
              </Button>
           </div>
        )}

        {phase === "LOADING" && (
           <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300">Assembling the Board of Directors...</p>
           </div>
        )}

        {phase === "PANEL" && panelResult && (
           <div className="space-y-8 animate-fade-in-up">
              
              <div className={`p-8 rounded-3xl text-white shadow-xl ${panelResult.consensus === 'SHORTLISTED' ? 'bg-emerald-600' : panelResult.consensus === 'REJECTED' ? 'bg-rose-600' : 'bg-amber-600'}`}>
                 <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Panel Consensus Final Verdict</p>
                 <h2 className="text-5xl font-black mb-4">{panelResult.consensus}</h2>
                 <p className="text-lg font-medium opacity-90 max-w-3xl leading-relaxed">{panelResult.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {panelResult.personas.map((p, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden flex flex-col justify-between h-full">
                     <div>
                       <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-gray-700">
                         {p.icon}
                         <div>
                           <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{p.role}</h4>
                           <Badge variant={p.decision === 'SHORTLISTED' ? 'success' : p.decision === 'REJECTED' ? 'danger' : 'warning'} className="text-[10px] mt-1">{p.decision}</Badge>
                         </div>
                       </div>
                       
                       <div className="space-y-4 mb-6">
                         <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Strengths Detected</span>
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 leading-tight mt-1">"{p.strengths}"</p>
                         </div>
                         <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Risks Highlighted</span>
                            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 leading-tight mt-1">"{p.weaknesses}"</p>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Reasoning</span>
                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium italic">{p.reasoning}</p>
                         </div>
                       </div>
                     </div>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-900 rounded-3xl p-8 shadow-inner border border-indigo-700 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                   <h3 className="text-2xl font-black mb-2 flex items-center gap-2"><Mic className="w-6 h-6"/> Phase 2: Live Voice Interview</h3>
                   <p className="opacity-80 font-medium">The panel is ready to speak with you. Ensure your microphone is enabled.</p>
                 </div>
                 <Button onClick={startVoiceInterview} className="px-8 py-4 font-black shadow-lg bg-indigo-500 hover:bg-indigo-600 border-none w-full md:w-auto">
                   Enter the Interview Room
                 </Button>
              </div>

           </div>
        )}

        {phase === "INTERVIEW" && rounds.length > 0 && (
           <div className="animate-fade-in-up">
              
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                   Live Interview Simulation 
                 </h2>
                 <div className="flex gap-2">
                   {rounds.map((r, i) => (
                      <div key={i} className={`h-2 w-12 rounded-full ${i === currentRoundIdx ? 'bg-rose-500' : i < currentRoundIdx ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                   ))}
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 md:p-10 flex flex-col">
                 
                 <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                   <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center shrink-0">
                     <Volume2 className="w-6 h-6"/>
                   </div>
                   <div>
                      <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">{rounds[currentRoundIdx].interviewer} ({rounds[currentRoundIdx].type} Round)</p>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                        "{rounds[currentRoundIdx].q}"
                      </h3>
                   </div>
                 </div>

                 <div className="flex-1 mt-4 relative">
                   <textarea
                     value={transcript}
                     onChange={(e) => setTranscript(e.target.value)}
                     className="w-full h-48 md:h-64 p-5 rounded-2xl bg-gray-50 focus:bg-white dark:bg-gray-900 border border-gray-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-gray-700 dark:focus:border-rose-800 transition-all resize-none text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner"
                     placeholder="Dictate your answer via voice or type here..."
                   />
                   
                   {/* Audio Visualizer Mock */}
                   {isListening && (
                     <div className="absolute inset-x-0 bottom-4 flex justify-center items-center gap-1">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="w-1.5 bg-rose-500 rounded-full animate-pulse" style={{height: `${Math.random() * 20 + 5}px`, animationDelay: `${i * 0.1}s`}}></div>
                        ))}
                     </div>
                   )}
                 </div>

                 <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                    <button 
                      onClick={toggleVoiceCapture}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md w-full sm:w-auto justify-center ${isListening ? 'bg-rose-100 text-rose-600 border border-rose-200 animate-pulse' : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105'}`}
                    >
                      {isListening ? <><MicOff className="w-5 h-5"/> Stop Listening</> : <><Mic className="w-5 h-5"/> Answer via Voice</>}
                    </button>
                    
                    <Button onClick={submitAnswer} className="px-8 shadow-lg flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-none w-full sm:w-auto justify-center">
                      Submit Response
                    </Button>
                 </div>
              </div>

           </div>
        )}

        {phase === "DEBRIEF" && (
           <div className="space-y-8 animate-fade-in-up">
             
             <div className="bg-gradient-to-br from-indigo-900 to-gray-900 rounded-3xl p-10 shadow-2xl text-white text-center border border-indigo-700/50">
                <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"/>
                <p className="text-sm font-black uppercase tracking-widest opacity-70 mb-2">Simulation Complete</p>
                <h2 className="text-4xl font-black mb-4">Post-Interview Evaluation</h2>
                <p className="text-lg font-medium opacity-90 max-w-2xl mx-auto">
                  You successfully faced the gauntlet. Here is how your verbal communication structured up against our analytical constraints.
                </p>
             </div>

             <div className="space-y-6">
                {interviewResults.map((res, i) => (
                   <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-6">
                      
                      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl md:w-48 shrink-0">
                         <div className="relative">
                            <svg className="w-20 h-20 transform -rotate-90">
                              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-800" />
                              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={34 * 2 * Math.PI} strokeDashoffset={34 * 2 * Math.PI - (res.score / 100) * 34 * 2 * Math.PI} className={`${res.score >= 80 ? 'text-emerald-500' : res.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`} />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
                              <span className="text-xl font-black text-gray-900 dark:text-white">{res.score}</span>
                            </div>
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest text-gray-400 mt-3">{res.round} Round</span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                         <h4 className="font-extrabold text-sm uppercase tracking-widest text-indigo-500 mb-2">Question Asked</h4>
                         <p className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-gray-700">
                           "{res.question}"
                         </p>
                         
                         <h4 className="font-extrabold text-sm uppercase tracking-widest text-emerald-500 mb-2 mt-2">Analysis Breakdown</h4>
                         <ul className="space-y-2">
                           {res.feedback.map((fb, idx) => {
                             const isPos = fb.includes("Excellent") || fb.includes("Strong") || fb.includes("Good");
                             return (
                               <li key={idx} className="flex gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 items-start">
                                 {isPos ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"/> : <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0"/>}
                                 {fb}
                               </li>
                             )
                           })}
                         </ul>
                      </div>
                   </div>
                ))}
             </div>

             <div className="flex justify-center pt-8">
               <Button onClick={() => setPhase("START")} className="px-10 py-4 font-black bg-gray-900 text-white rounded-xl shadow-lg border-none flex items-center gap-2 dark:bg-white dark:text-gray-900">
                 Run Boss Mode Again <RefreshCcw className="w-4 h-4"/>
               </Button>
             </div>

           </div>
        )}

      </div>
    </div>
  );
}
