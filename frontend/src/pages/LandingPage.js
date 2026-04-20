import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  UploadCloud, FileText, Mic, CheckCircle, 
  Zap, Shield, Cpu, Target, PlayCircle
} from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="bg-white dark:bg-[#0B0F19] transition-colors duration-300 overflow-hidden font-sans pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
         {/* Premium Glowing Background Engine */}
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-indigo-500/30 to-purple-500/10 blur-[120px] rounded-full pointer-events-none dark:from-indigo-600/20 dark:to-purple-900/10" />
         <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 to-transparent blur-[100px] rounded-full pointer-events-none dark:from-blue-600/10" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-rose-400/20 to-transparent blur-[100px] rounded-full pointer-events-none dark:from-rose-600/10" />

         <motion.div 
           variants={containerVariants} initial="hidden" animate="visible"
           className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center"
         >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 backdrop-blur-md mb-8 shadow-sm">
               <SparklesIcon className="w-4 h-4 text-indigo-500" />
               <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide uppercase">Introducing SkillSync 2.0</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-8">
              AI that <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">evaluates you</span> <br className="hidden md:block"/> before recruiters do.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium mb-12 max-w-3xl leading-relaxed">
              Upload your resume and survive our brutal 3-phase AI hiring pipeline. We analyze your string logic, simulate the recruiter's 7-second glance, and subject you to a live voice technical interview.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
               <Link to="/upload" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                 <UploadCloud className="w-6 h-6"/> Upload Your Resume
               </Link>
               <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-black text-lg rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                 <PlayCircle className="w-6 h-6 text-indigo-500"/> See The Demo
               </button>
            </motion.div>
         </motion.div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="py-10 border-y border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20 backdrop-blur-sm relative z-10">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <TrustItem icon={<CheckCircle/>} title="ATS Optimized" />
            <TrustItem icon={<Target/>} title="Deep Gap Detection" />
            <TrustItem icon={<Shield/>} title="Brutal Recruiter Logic" />
            <TrustItem icon={<Mic/>} title="Live Voice Interviewer" />
         </div>
      </section>

      {/* 3. FEATURE FLOW */}
      <section className="py-24 px-6 relative z-10">
         <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">From Resume to Job Ready</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">The pipeline forcing you to become the perfect candidate.</p>
         </div>

         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FlowCard 
              step="01" 
              icon={<UploadCloud className="w-8 h-8"/>} 
              title="Upload & Parse" 
              desc="Drop your PDF. We instantly parse your entire string mapping to find your implicit technical footprint." 
              color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" border="border-blue-100 dark:border-blue-900/50"
            />
            <FlowCard 
              step="02" 
              icon={<FileText className="w-8 h-8"/>} 
              title="Auto-Optimization" 
              desc="Recruiter simulation instantly flags generic bullets and rewrites them using rigorous STAR metrics." 
              color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" border="border-emerald-100 dark:border-emerald-900/50"
            />
            <FlowCard 
              step="03" 
              icon={<Cpu className="w-8 h-8"/>} 
              title="Target Matching" 
              desc="We map your updated profile exactly to a live Job Description to output your explicit ATS passing probability." 
              color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" border="border-amber-100 dark:border-amber-900/50"
            />
            <FlowCard 
              step="04" 
              icon={<Mic className="w-8 h-8"/>} 
              title="The Final Boss" 
              desc="Defeat the 3-Persona Hiring Panel and survive a multi-round live voice synthesis technical interview." 
              color="text-rose-500" bg="bg-rose-50 dark:bg-rose-900/20" border="border-rose-100 dark:border-rose-900/50"
            />
         </div>
      </section>

      {/* 4. PRODUCT PREVIEW SECTION */}
      <section className="py-24 px-6 relative z-10 bg-gray-50 dark:bg-gray-800/20 border-y border-gray-100 dark:border-gray-800/50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <div className="inline-block px-3 py-1 mb-4 text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded-full tracking-widest uppercase">
                 Engine Deep Dive
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Stop guessing. <br/>Start simulating.</h2>
               <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                 Traditional resume builders just give you templates. SkillSync acts as an adversarial hiring committee. We evaluate your phrasing, flag your technical gaps, and force you to orally answer the exact questions a manager will ask based on those gaps.
               </p>
               <ul className="space-y-4">
                 <ListItem text="Deep semantic ATS compatibility rating."/>
                 <ListItem text="Voice-to-Text dynamic behavioral grading."/>
                 <ListItem text="Intelligent Cover Letter auto-tailoring engine."/>
               </ul>
            </div>
            
            {/* Visual Abstract Panel */}
            <div className="relative h-[500px] w-full rounded-3xl bg-gradient-to-br from-indigo-900 to-gray-900 p-8 shadow-2xl border border-indigo-700 overflow-hidden group">
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02MCAwaC02MHY2MGg2MFoiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPgo8L3N2Zz4=')] opacity-30" />
               <motion.div initial={{y:50, opacity:0}} whileInView={{y:0, opacity:1}} transition={{duration:0.6}} viewport={{once:true}} className="relative z-10 w-full h-full bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4">
                  
                  {/* Mock UI component */}
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-black dark:text-white">Live Voice Interview</span>
                    <span className="px-2 py-1 bg-rose-100 text-rose-600 dark:bg-rose-900/30 text-xs font-bold rounded">Recording...</span>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                    <p className="text-sm font-bold text-indigo-500 mb-2">Technical Lead Questions:</p>
                    <p className="text-xl font-black dark:text-white leading-snug">"Why should we risk hiring you when your resume lacks explicit Docker experience?"</p>
                    
                    <div className="mt-8 space-y-2">
                       <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4"></div>
                       <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2"></div>
                       <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-5/6"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-900 dark:bg-white rounded-xl shadow mt-2"></div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* 5. DIFFERENTIATION */}
      <section className="py-24 px-6 relative z-10">
         <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-16">The Market Standard vs. SkillSync</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
               <table className="w-full text-left font-medium">
                  <thead>
                     <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="p-6 text-gray-400 font-bold uppercase tracking-widest text-xs w-1/3">Feature</th>
                        <th className="p-6 text-gray-500 font-bold uppercase tracking-widest text-xs border-r border-gray-100 dark:border-gray-700">Generic Builders</th>
                        <th className="p-6 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-sm bg-indigo-50 dark:bg-indigo-900/10">SkillSync AI</th>
                     </tr>
                  </thead>
                  <tbody>
                     <CompareRow title="Formatting" bad="Manual PDF manipulation" good="1-Click Auto-Build"/>
                     <CompareRow title="Bullet Points" bad="Static text templates" good="Automatic quantified STAR rewriting"/>
                     <CompareRow title="Job Matching" bad="Not provided" good="Mathematical ATS target matching"/>
                     <CompareRow title="Interview Prep" bad="Read static blog posts" good="Live Voice Generative AI Simulation"/>
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20 relative z-10 overflow-hidden bg-gray-900 dark:bg-[#0B0F19]">
         <div className="max-w-4xl mx-auto text-center px-6 relative z-20">
            <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-6"/>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">Stop getting ghosted.</h2>
            <p className="text-xl text-gray-400 font-medium mb-12">Force your resume past the filters and dominate the technical interview.</p>
            <Link to="/upload" className="inline-flex px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.4)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.6)] transition-all hover:scale-105 flex-col md:flex-row items-center justify-center gap-3">
                 <UploadCloud className="w-7 h-7"/> Upload Your Resume For Free
            </Link>
         </div>
      </section>
      
    </div>
  );
}

// Sub-components
function SparklesIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3z" />
    </svg>
  );
}

function TrustItem({ icon, title }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 p-4">
      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
         {icon}
      </div>
      <span className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-widest">{title}</span>
    </div>
  );
}

function FlowCard({ step, icon, title, desc, color, bg, border }) {
  return (
    <div className={`p-8 rounded-3xl border-2 ${border} ${bg} flex flex-col h-full transform transition duration-300 hover:-translate-y-2 hover:shadow-xl`}>
       <div className="flex justify-between items-start mb-6">
         <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm ${color}`}>
           {icon}
         </div>
         <span className="text-4xl font-black text-black/5 dark:text-white/5">{step}</span>
       </div>
       <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{title}</h3>
       <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function ListItem({ text }) {
  return (
    <li className="flex items-start gap-3">
       <CheckCircle className="w-6 h-6 text-indigo-500 shrink-0"/>
       <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{text}</span>
    </li>
  );
}

function CompareRow({ title, bad, good }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
       <td className="p-6 font-bold text-gray-800 dark:text-gray-200">{title}</td>
       <td className="p-6 text-gray-500 font-medium border-r border-gray-100 dark:border-gray-700 flex items-center gap-2"><XCircleIcon className="w-4 h-4 text-gray-400"/> {bad}</td>
       <td className="p-6 text-gray-900 dark:text-white font-black bg-indigo-50/50 dark:bg-indigo-900/5 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 shrink-0"/> {good}</td>
    </tr>
  );
}

function XCircleIcon({ className }) {
   return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
   );
}
