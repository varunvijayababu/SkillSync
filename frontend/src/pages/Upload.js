import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import Section from "../components/Section";
import { uploadResume as uploadResumeApi } from "../services/api";

function Upload() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resume Analyzer</h1>
          <p className="text-slate-600 mt-1">
            Upload your resume, rank missing skills by priority, and track role readiness.
          </p>
        </div>

        <Card title="Upload Resume" subtitle="Supported flow: PDF + target role + optional JD context">
          <input
            type="file"
            className="mb-3 w-full border border-gray-200 rounded-lg p-2 bg-white"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <input
            className="border border-gray-200 p-2 mb-3 w-full rounded-lg"
            placeholder="Enter Job Role (e.g. Frontend Developer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <textarea
            className="border border-gray-200 p-2 mb-4 w-full rounded-lg"
            placeholder="Paste Job Description (optional)"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <Button onClick={handleUpload} disabled={loading} className="w-full">
            {loading ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </Card>

        {result && (
          <Card title={`Analysis ${result.version || ""}`} subtitle={`Role: ${result.role || role}`}>
            <div className="space-y-5">
              <ProgressBar
                value={result.roleReadinessPercentage ?? result.score ?? 0}
                label="Role readiness"
                color="bg-emerald-500"
              />
              <ProgressBar value={result.score ?? 0} label="ATS score" color="bg-blue-500" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title="Matched Skills" items={result.matchedSkills || []} accent="text-green-700" />
                <Section title="Missing Skills" items={result.missingSkills || []} accent="text-red-700" />
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