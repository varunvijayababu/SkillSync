import { useEffect, useState } from "react";
import Button from "../components/Button";
import Badge from "../components/Badge";

import { 
  PlayCircle, BrainCircuit, Target, AlertTriangle,
  CheckCircle, RefreshCcw, HelpCircle,
  ArrowRight, Zap, Lightbulb, Activity
} from "lucide-react";

export default function InterviewPrep() {
  const [data, setData] = useState({ role: "Developer", matched: [], missing: [] });
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");
  
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(null);
  
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showSample, setShowSample] = useState(false);

  useEffect(() => {
    let raw = localStorage.getItem("roadmapData");
    if (raw) {
       try {
         const parsed = JSON.parse(raw);
         setData({
            role: parsed.role || "Developer",
            matched: parsed.matchedSkills || [],
            missing: parsed.missingSkills || []
         });
       } catch (e) {}
    }
  }, []);

  const generateQuestions = () => {
    setLoading(true);
    // Simulate AI generation delay
    setTimeout(() => {
       const qs = [];
       
       // Dynamic Generation Logic
       if (data.matched.length > 0) {
          qs.push({
             type: "Core Competency",
             text: `I see you have experience with ${data.matched[0]}. Could you walk me through a complex challenge you solved using it?`,
             sample: `In my last project, we faced significant performance degradation. I analyzed the bottlenecks in our ${data.matched[0]} implementation, refactored the data flow, and utilized memoization techniques. This resulted in a 40% reduction in render times and a noticeably smoother user experience.`
          });
       }
       
       qs.push({
          type: "Behavioral",
          text: `Tell me about a time you had to learn a completely new technology or domain on the fly. How did you approach it?`,
          sample: `During a critical sprint, we decided to pivot to a new streaming API that none of us had used. Recognizing the tight deadline, I spent the weekend reading the core documentation and building a small proof-of-concept. I then presented my findings to the team on Monday, which allowed us to securely integrate the API three days ahead of schedule.`
       });
       
       if (data.missing.length > 0) {
          qs.push({
             type: "Weak Area",
             text: `Our tech stack heavily relies on ${data.missing[0]}, which doesn't seem to be your primary focus. How would you rapidly get up to speed?`,
             sample: `While I haven't used ${data.missing[0]} extensively in production, I have a very strong absolute foundation in similar architectural patterns. I adapt quickly, and my strategy would be to digest the official docs immediately, shadow a senior engineer during my first week, and contribute to small bug fixes to learn the codebase practically.`
          });
       }
       
       if (difficulty !== "Easy") {
          qs.push({
             type: "System Design",
             text: `If you were tasked to design a highly scalable ${data.role} architecture from scratch to handle 10x our current load, what key pieces would you prioritize?`,
             sample: `Scalability requires loose coupling. I'd prioritize breaking down monoliths into microservices, implementing aggressive caching layers (like Redis), and utilizing message queues to handle asynchronous workloads gracefully.`
          });
       }

       if (difficulty === "Hard") {
          qs.push({
             type: "Stress Test",
             text: `Describe a scenario where your technical decision directly caused a production incident. How did you handle the fallout and what did you learn?`,
             sample: `Early in my career, I deployed a database migration script that didn't account for schema locks, causing a 10-minute outage. I immediately rolled back, communicated transparently with stakeholders, and then implemented a strict staging-environment verification protocol. It taught me that speed should never come at the expense of safety mechanisms.`
          });
       }

       setQuestions(qs);
       setActiveQuestionIdx(0);
       setUserAnswer("");
       setFeedback(null);
       setShowSample(false);
       setLoading(false);
    }, 1200);
  };

  const handleSelectQuestion = (idx) => {
     setActiveQuestionIdx(idx);
     setUserAnswer("");
     setFeedback(null);
     setShowSample(false);
  };

  const submitAnswer = () => {
     if (!userAnswer.trim()) return;

     let score = 55; // base score
     let feedbackList = [];
     
     // 1. Length & Depth
     if (userAnswer.length < 100) {
        score -= 15;
        feedbackList.push("Your answer is too brief. Try to use the STAR method (Situation, Task, Action, Result) to provide more depth.");
     } else if (userAnswer.length > 150) {
        score += 15;
        feedbackList.push("Good length and detail. You effectively elaborated your experience.");
     }
     
     // 2. Metrics & Impact
     if (userAnswer.match(/\\d+(%|x|\\$|ms|users)/i)) {
        score += 20;
        feedbackList.push("Excellent use of quantified metrics (numbers/percentages) to prove impact.");
     } else {
        feedbackList.push("Try quantifying your results. Add numbers like 'improved by 20%' or 'managed 5 people'.");
     }
     
     // 3. Structure
     const lowerAns = userAnswer.toLowerCase();
     if (lowerAns.includes("result") || lowerAns.includes("led to") || lowerAns.includes("because")) {
        score += 10;
     } else {
        feedbackList.push("Connect your actions clearly to outcomes. Use phrases like 'which resulted in...'.");
     }

     setFeedback({
        score: Math.max(0, Math.min(100, score)),
        suggestions: feedbackList
     });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 md:px-8 py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col md:flex-row justify-between items-start gap-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 p-8 opacity-5">
            <BrainCircuit className="w-96 h-96 text-indigo-500" />
          </div>
          
          <div className="z-10 flex-1">
            <div className="inline-block px-3 py-1 mb-3 text-sm font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full flex items-center gap-2 w-max">
              <Zap className="w-4 h-4"/> AI Interview Simulator
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Technical Interview Prep</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Practice answering AI-generated questions tailored specifically to your resume gaps and the <strong>{data.role}</strong> role.
            </p>

            {/* Weak Area Detection */}
            <div className="mt-6 flex flex-wrap gap-6">
               <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl p-4 flex-1 min-w-[250px]">
                 <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                   <AlertTriangle className="w-4 h-4"/> Identified Weak Topics
                 </span>
                 <div className="flex flex-wrap gap-2">
                   {data.missing.length > 0 ? (
                     data.missing.slice(0, 4).map(s => <Badge key={s} variant="danger" className="text-xs">{s}</Badge>)
                   ) : (
                     <span className="text-sm text-gray-500">None! You are fully aligned.</span>
                   )}
                 </div>
               </div>

               <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex-1 min-w-[250px]">
                 <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 mb-3">
                   <Target className="w-4 h-4"/> Simulation Settings
                 </span>
                 <div className="flex items-center gap-2">
                   {["Easy", "Medium", "Hard"].map(level => (
                     <button 
                       key={level}
                       onClick={() => setDifficulty(level)}
                       className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all ${
                         difficulty === level 
                           ? "bg-indigo-600 text-white shadow-md" 
                           : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                       }`}
                     >
                       {level}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          <div className="z-10 w-full md:w-auto">
            <Button onClick={generateQuestions} disabled={loading} className="w-full md:w-auto px-8 py-5 text-lg font-black bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex justify-center items-center gap-2">
              {loading ? <Activity className="w-6 h-6 animate-spin"/> : <PlayCircle className="w-6 h-6"/>}
              {loading ? "Initializing..." : "Start Simulation"}
            </Button>
          </div>
        </div>

        {/* Playground Section */}
        {questions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
            
            {/* Left: Questions List */}
            <div className="lg:col-span-4 space-y-4">
               <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                 <HelpCircle className="w-5 h-5 text-indigo-500"/> Generated Questions
               </h3>
               <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSelectQuestion(idx)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                        activeQuestionIdx === idx 
                          ? "bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.02] dark:bg-indigo-900/20 dark:border-indigo-400" 
                          : "bg-white border-gray-100 hover:border-indigo-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                         <span className="text-xs font-black uppercase tracking-widest text-indigo-500">{q.type}</span>
                         {activeQuestionIdx === idx && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>}
                      </div>
                      <p className={`text-sm font-bold line-clamp-3 ${activeQuestionIdx === idx ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {q.text}
                      </p>
                    </button>
                  ))}
               </div>
            </div>

            {/* Right: Practice Panel */}
            {activeQuestionIdx !== null && (
              <div className="lg:col-span-8">
                 <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    
                    {/* Active Question Display */}
                    <div className="mb-6">
                      <span className="inline-block px-3 py-1 mb-3 text-xs font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-md">
                        Interviewer Question {activeQuestionIdx + 1}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-snug">
                        "{questions[activeQuestionIdx].text}"
                      </h2>
                    </div>

                    {/* Answer Area */}
                    <div className="flex-1 flex flex-col gap-4 relative">
                       <textarea 
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          disabled={feedback !== null}
                          className="w-full h-48 md:h-64 p-5 rounded-2xl bg-gray-50 focus:bg-white dark:bg-gray-900 border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-gray-700 dark:focus:ring-indigo-900 transition-all resize-none text-base font-medium text-gray-800 dark:text-gray-200 disabled:opacity-50"
                          placeholder="Type your answer here using the STAR method..."
                       />
                       
                       {!feedback ? (
                         <div className="flex justify-between items-center">
                            <button 
                              onClick={() => setShowSample(!showSample)}
                              className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                            >
                              <Lightbulb className="w-4 h-4"/> Stuck? View AI Sample Answer
                            </button>
                            <Button onClick={submitAnswer} className="px-6 shadow-md flex items-center gap-2">
                              Submit Answer <ArrowRight className="w-4 h-4"/>
                            </Button>
                         </div>
                       ) : (
                         <div className="flex justify-end mt-2">
                            <Button onClick={() => handleSelectQuestion(activeQuestionIdx)} variant="secondary" className="flex items-center gap-2 border border-gray-300">
                              <RefreshCcw className="w-4 h-4"/> Try Again
                            </Button>
                         </div>
                       )}

                       {/* Sample Reveal */}
                       {showSample && !feedback && (
                         <div className="mt-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 animate-fade-in-up">
                           <p className="text-xs font-black text-indigo-500 uppercase tracking-wider mb-2">AI Generated Sample</p>
                           <p className="text-sm text-gray-700 dark:text-gray-300 font-medium italic">"{questions[activeQuestionIdx].sample}"</p>
                         </div>
                       )}

                       {/* Feedback Evaluation */}
                       {feedback && (
                         <div className="mt-4 animate-fade-in-up border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Score Dial */}
                              <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                                <span className="text-xs font-black uppercase text-gray-500 mb-2">Evaluation Score</span>
                                <div className="relative">
                                  <svg className="w-24 h-24 transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-800" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={40 * 2 * Math.PI} strokeDashoffset={40 * 2 * Math.PI - (feedback.score / 100) * 40 * 2 * Math.PI} className={`${feedback.score >= 80 ? 'text-emerald-500' : feedback.score >= 50 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000`} />
                                  </svg>
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <span className="text-2xl font-black text-gray-800 dark:text-white">{feedback.score}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Suggestions */}
                              <div className="flex-1 flex flex-col justify-center">
                                <h4 className="font-extrabold text-sm uppercase tracking-widest text-gray-500 mb-3">AI Feedback</h4>
                                <ul className="space-y-3">
                                  {feedback.suggestions.map((sug, i) => {
                                    const isPos = sug.includes("Good") || sug.includes("Excellent");
                                    return (
                                      <li key={i} className={`flex items-start gap-3 p-3 rounded-xl border  ${isPos ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300" : "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-300"}`}>
                                        {isPos ? <CheckCircle className="w-5 h-5 shrink-0"/> : <AlertTriangle className="w-5 h-5 shrink-0"/>}
                                        <span className="text-sm font-semibold">{sug}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                         </div>
                       )}

                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
