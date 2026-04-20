import { useState, useRef } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { compareResumesApi } from "../services/api";
import { Upload, FileText, Trophy, CheckCircle, AlertTriangle, TrendingUp, Info } from "lucide-react";

function Compare() {
  const [role, setRole] = useState("");
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputARef = useRef(null);
  const fileInputBRef = useRef(null);

  const handleFileA = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileA(e.target.files[0]);
    }
  };

  const handleFileB = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileB(e.target.files[0]);
    }
  };

  const handleCompare = async () => {
    if (!fileA || !fileB) {
      setError("Please upload both resume PDFs to compare.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resumeA", fileA);
      formData.append("resumeB", fileB);
      formData.append("role", role || "professional");

      const res = await compareResumesApi(formData);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError("Failed to compare resumes.");
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({ file, fileRef, title, onChange }) => (
    <div 
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-white/50 dark:bg-gray-800/50'}`}
      onClick={() => fileRef.current?.click()}
    >
      <input type="file" accept=".pdf" className="hidden" ref={fileRef} onChange={onChange} />
      {file ? (
        <>
          <FileText className="w-10 h-10 text-blue-500 mb-2" />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center truncate w-full px-4">{file.name}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Click to replace</p>
        </>
      ) : (
        <>
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-xs text-gray-500 mt-1">Upload PDF</p>
        </>
      )}
    </div>
  );

  const SkillList = ({ title, items, icon, colorClass }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className={`flex items-center gap-2 text-sm ${colorClass}`}>
              {icon} <span className="font-medium capitalize">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const calculateDiff = () => {
    if (!result?.resumeA || !result?.resumeB) return null;
    const aMatched = result.resumeA.matchedSkills || [];
    const bMatched = result.resumeB.matchedSkills || [];
    
    const onlyInB = bMatched.filter(x => !aMatched.includes(x));
    const onlyInA = aMatched.filter(x => !bMatched.includes(x));
    const common = aMatched.filter(x => bMatched.includes(x));
    
    return { onlyInA, onlyInB, common };
  };

  const diffs = calculateDiff();
  const scoreDiff = result ? Math.abs((result.resumeA?.score || 0) - (result.resumeB?.score || 0)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-blue-500" /> Compare Resumes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">A/B test different versions of your resume.</p>
        </div>

        <Card title="Upload Resumes">
          <input
            className="w-full border p-3 rounded-lg mb-6 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-500"
            placeholder="Target Role (e.g. Frontend Developer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadBox file={fileA} fileRef={fileInputARef} title="Upload Resume A" onChange={handleFileA} />
            <UploadBox file={fileB} fileRef={fileInputBRef} title="Upload Resume B" onChange={handleFileB} />
          </div>
          {error && <p className="text-red-600 mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 text-sm font-medium">{error}</p>}
          <Button onClick={handleCompare} disabled={loading} className="mt-6 w-full h-12 flex items-center justify-center font-bold text-lg shadow-md hover:shadow-lg transition-all">
            {loading ? <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div> : "Compare Resumes"}
          </Button>
        </Card>

        {result && result.resumeA && result.resumeB && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* WHY WINNER SECTION */}
            {result.whyWinner && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex gap-4 items-start">
                <Info className="w-8 h-8 opacity-90 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 shadow-sm">Why {result.winner === "Tie" ? "it's a Tie" : `Resume ${result.winner} Won`}</h3>
                  <p className="text-blue-50 leading-relaxed font-medium">{result.whyWinner}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RESUME A */}
              <Card title="Resume A Analysis" className={result.winner === "A" ? "border-2 border-green-500 shadow-green-500/20 shadow-xl relative" : "relative"}>
                {result.winner === "A" && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-5">
                  <ProgressBar value={result.resumeA.score || 0} label="A.T.S Match Score" color="bg-blue-500" />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <SkillList title="Matched Skills" items={result.resumeA.matchedSkills} icon={<CheckCircle className="w-4 h-4"/>} colorClass="text-emerald-700 dark:text-emerald-400" />
                    <SkillList title="Missing Skills" items={result.resumeA.missingSkills} icon={<AlertTriangle className="w-4 h-4"/>} colorClass="text-red-700 dark:text-red-400" />
                  </div>

                  <div className={`mt-6 text-center text-xl font-extrabold py-3 rounded-xl border-2 ${result.winner === "A" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"}`}>
                    {result.winner === "A" ? (
                      <span className="flex items-center justify-center gap-2">🏆 WINNER <span className="text-sm font-semibold bg-green-200 dark:bg-green-800/50 px-2 py-0.5 rounded-full ml-1">+{scoreDiff}% edge</span></span>
                    ) : "Runner Up"}
                  </div>
                </div>
              </Card>

              {/* RESUME B */}
              <Card title="Resume B Analysis" className={result.winner === "B" ? "border-2 border-purple-500 shadow-purple-500/20 shadow-xl relative" : "relative"}>
                {result.winner === "B" && (
                  <div className="absolute -top-3 -right-3 bg-purple-500 text-white p-2 rounded-full shadow-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-5">
                  <ProgressBar value={result.resumeB.score || 0} label="A.T.S Match Score" color="bg-purple-500" />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <SkillList title="Matched Skills" items={result.resumeB.matchedSkills} icon={<CheckCircle className="w-4 h-4"/>} colorClass="text-emerald-700 dark:text-emerald-400" />
                    <SkillList title="Missing Skills" items={result.resumeB.missingSkills} icon={<AlertTriangle className="w-4 h-4"/>} colorClass="text-red-700 dark:text-red-400" />
                  </div>

                  <div className={`mt-6 text-center text-xl font-extrabold py-3 rounded-xl border-2 ${result.winner === "B" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"}`}>
                    {result.winner === "B" ? (
                      <span className="flex items-center justify-center gap-2">🏆 WINNER <span className="text-sm font-semibold bg-purple-200 dark:bg-purple-800/50 px-2 py-0.5 rounded-full ml-1">+{scoreDiff}% edge</span></span>
                    ) : "Runner Up"}
                  </div>
                </div>
              </Card>
            </div>

            {/* KEY DIFFERENCES SUMMARY */}
            {diffs && (diffs.onlyInA.length > 0 || diffs.onlyInB.length > 0) && (
              <Card title="Key Differences" className="border-t-4 border-t-amber-400">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {diffs.common.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-gray-400"/> Shared Core Skills</h4>
                      <ul className="flex flex-wrap gap-2">
                        {diffs.common.map(skill => <li key={skill} className="bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 text-xs px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-medium capitalize">{skill}</li>)}
                      </ul>
                    </div>
                  )}
                  {diffs.onlyInB.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Found Only in Resume B</h4>
                      <ul className="flex flex-wrap gap-2">
                        {diffs.onlyInB.map(skill => <li key={skill} className="bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-md font-medium capitalize">{skill}</li>)}
                      </ul>
                    </div>
                  )}
                  {diffs.onlyInA.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Found Only in Resume A</h4>
                      <ul className="flex flex-wrap gap-2">
                        {diffs.onlyInA.map(skill => <li key={skill} className="bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-md font-medium capitalize">{skill}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default Compare;
