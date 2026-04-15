import { useEffect, useState } from "react";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Card from "../components/Card";
import ProfileSyncBadge from "../components/ProfileSyncBadge";
import ProgressBar from "../components/ProgressBar";
import Section from "../components/Section";
import { fetchLatestProfile, uploadResume as uploadResumeApi } from "../services/api";

import { UploadCloud, FileText, Search, Play } from "lucide-react";
function Upload() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeInsight, setActiveInsight] = useState("heatmap");
  const [profileSyncStatus, setProfileSyncStatus] = useState("local-only");

  useEffect(() => {
    const loadLatestProfile = async () => {
      try {
        setProfileSyncStatus("syncing");
        let latestProfile = JSON.parse(localStorage.getItem("latestProfile") || "null");
        try {
          const remoteProfile = await fetchLatestProfile();
          if (remoteProfile) {
            latestProfile = remoteProfile;
            localStorage.setItem("latestProfile", JSON.stringify(remoteProfile));
            setProfileSyncStatus("synced");
          }
        } catch (remoteErr) {
          console.error("REMOTE PROFILE LOAD ERROR:", remoteErr);
          setProfileSyncStatus("local-only");
        }

        if (latestProfile?.role) {
          setRole((prev) => prev || latestProfile.role);
        }
        if (Array.isArray(latestProfile?.skills) && latestProfile.skills.length > 0) {
          setDescription((prev) => prev || `Core skills: ${latestProfile.skills.join(", ")}`);
        }
        if (!latestProfile) {
          setProfileSyncStatus("local-only");
        }
      } catch (e) {
        console.error("PROFILE AUTOLOAD ERROR:", e);
        setProfileSyncStatus("local-only");
      }
    };

    loadLatestProfile();
  }, []);

  const handleUpload = async () => {
    if (!file || !role) {
      setError("Please upload file and enter role.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);
    formData.append("description", description);

    try {
      setLoading(true);
      setError("");
      const data = await uploadResumeApi(formData);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Resume Analyzer</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Upload your resume, rank missing skills by priority, and track role readiness.
          </p>
          <div className="mt-2">
            <ProfileSyncBadge status={profileSyncStatus} />
          </div>
        </div>

        <Card title="Upload Resume" subtitle="Supported flow: PDF + target role + optional JD context">
          <input
            type="file"
            className="mb-3 w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <input
            className="border border-gray-200 dark:border-gray-700 p-2 mb-3 w-full rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400"
            placeholder="Enter Job Role (e.g. Frontend Developer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <textarea
            className="border border-gray-200 dark:border-gray-700 p-2 mb-4 w-full rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400"
            placeholder="Paste Job Description (optional)"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-3">{error}</div>}

          <Button onClick={handleUpload} disabled={loading} className="w-full flex items-center justify-center space-x-2">
            {loading ? (
              <>
                <div className="w-4 h-4 bg-white/80 rounded-full animate-ping"></div>
                <span>Analyzing your resume...</span>
              </>
            ) : <><UploadCloud className="w-5 h-5"/> <span>Analyze Resume</span></>}
          </Button>
        </Card>

        {result && (
          <Card title={`Analysis ${result.version || ""}`} subtitle={`Role: ${result.role || role}`}>
            <div className="space-y-5">
              {result.ethicalAts?.stuffingDetected && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-800">Ethical ATS Warning</p>
                  <p className="text-sm text-amber-700">{result.ethicalAts.warning}</p>
                </div>
              )}

              <ProgressBar
                value={result.roleReadinessPercentage ?? result.score ?? 0}
                label="Role readiness"
                color="bg-emerald-500"
              />
              <ProgressBar value={result.score ?? 0} label="Weighted readiness score" color="bg-blue-500" />

              {result.readinessBreakdown && (
                <Card
                  title="Readiness Breakdown"
                  subtitle="Weighted model: Critical x3, Important x2, Nice-to-have x1"
                  className="bg-slate-50 border-slate-200"
                >
                  <div className="space-y-3">
                    <ProgressBar
                      value={Math.round((result.readinessBreakdown.critical?.score || 0) * 100)}
                      label={`Critical (${result.readinessBreakdown.critical?.matched || 0}/${result.readinessBreakdown.critical?.total || 0})`}
                      color="bg-red-500"
                    />
                    <ProgressBar
                      value={Math.round((result.readinessBreakdown.important?.score || 0) * 100)}
                      label={`Important (${result.readinessBreakdown.important?.matched || 0}/${result.readinessBreakdown.important?.total || 0})`}
                      color="bg-amber-500"
                    />
                    <ProgressBar
                      value={Math.round((result.readinessBreakdown.niceToHave?.score || 0) * 100)}
                      label={`Nice-to-have (${result.readinessBreakdown.niceToHave?.matched || 0}/${result.readinessBreakdown.niceToHave?.total || 0})`}
                      color="bg-sky-500"
                    />
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section
                  title="Matched Skills"
                  items={result.matchedSkills || []}
                  accent="text-green-700"
                  display="badges"
                  badgeVariant="success"
                />
                <Section
                  title="Missing Skills"
                  items={result.missingSkills || []}
                  accent="text-red-700"
                  display="badges"
                  badgeVariant="danger"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Critical">
                  <Section title="High impact gaps" items={result.skillPriority?.critical || []} accent="text-red-700" />
                </Card>
                <Card title="Important">
                  <Section
                    title="Should address soon"
                    items={result.skillPriority?.important || []}
                    accent="text-amber-700"
                  />
                </Card>
                <Card title="Nice-to-have">
                  <Section
                    title="Can optimize later"
                    items={result.skillPriority?.niceToHave || []}
                    accent="text-sky-700"
                  />
                </Card>
              </div>

              <Section title="Suggestions" items={result.suggestions || []} />

              <Card
                title="Advanced Insights"
                subtitle="Interactive analysis: keyword heatmap, career paths, interview readiness"
                className="bg-slate-50 border-slate-200"
              >
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => setActiveInsight("heatmap")}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeInsight === "heatmap"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Keyword Heatmap
                  </button>
                  <button
                    onClick={() => setActiveInsight("career")}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeInsight === "career"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Career Paths
                  </button>
                  <button
                    onClick={() => setActiveInsight("interview")}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeInsight === "interview"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Interview Readiness
                  </button>
                </div>

                {activeInsight === "heatmap" && (
                  <div>
                    <p className="text-sm text-slate-600 mb-3">
                      Matched vs missing keywords with hit counts from your submitted content.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(result.keywordHeatmap || []).map((item) => (
                        <div
                          key={`${item.keyword}-${item.status}`}
                          className={`rounded-lg border p-3 ${
                            item.status === "matched"
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-800">{item.keyword}</p>
                            <span
                              className="text-xs"
                            >
                              <Badge variant={item.status === "matched" ? "success" : "danger"}>
                                {item.status}
                              </Badge>
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">Occurrences: {item.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeInsight === "career" && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Alternative role suggestions based on your matched skills.</p>
                    {(result.careerPathSuggestions || []).map((path) => (
                      <Card key={path.role} title={path.role} subtitle={path.reason}>
                        <ProgressBar value={path.matchScore || 0} label="Skill overlap" color="bg-violet-500" />
                      </Card>
                    ))}
                  </div>
                )}

                {activeInsight === "interview" && (
                  <div className="space-y-4">
                    <ProgressBar
                      value={result.interviewReadiness?.overallScore || result.score || 0}
                      label="Interview readiness score"
                      color="bg-indigo-500"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Section
                        title="Topics"
                        items={result.interviewReadiness?.topics || []}
                        accent="text-indigo-700"
                      />
                      <Section
                        title="Practice Questions"
                        items={result.interviewReadiness?.questions || []}
                        accent="text-indigo-700"
                      />
                    </div>
                    <Section
                      title="Tips"
                      items={result.interviewReadiness?.tips || []}
                      accent="text-indigo-700"
                    />
                  </div>
                )}
              </Card>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    localStorage.setItem(
                      "coverData",
                      JSON.stringify({
                        role: result.role || role,
                        skills: result.matchedSkills || [],
                      })
                    );
                    window.location.href = "/cover-letter";
                  }}
                >
                  Generate Cover Letter
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    localStorage.setItem(
                      "roadmapData",
                      JSON.stringify({
                        role: result.role || role,
                        missingSkills: result.missingSkills || [],
                      })
                    );
                    window.location.href = "/roadmap";
                  }}
                >
                  Generate Roadmap
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Upload;