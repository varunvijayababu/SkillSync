import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import ProfileSyncBadge from "../components/ProfileSyncBadge";
import { fetchLatestProfile } from "../services/api";

function CoverLetter() {
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileSyncStatus, setProfileSyncStatus] = useState("local-only");
  const [hasProfileData, setHasProfileData] = useState(true);
  const [error, setError] = useState("");

  const generateCoverLetterText = (resumeData, analysisData) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const matchedSkills = analysisData.matchedSkills || [];
    const missingSkills = analysisData.missingSkills || [];
    const projects = resumeData.projects || [];
    const experience = resumeData.experience || [];
    const name = user.name || resumeData.name || "Candidate";
    const role = analysisData.role || "Developer";

    const topSkills = matchedSkills.slice(0, 3).join(", ");
    const focusSkills = missingSkills.slice(0, 2).join(", ");

    const hasProjects = projects.length > 0;
    const hasExperience = experience.length > 0;

    const intro = `Dear Hiring Manager,\n\nI am excited to apply for the position of ${role}.`;
    const skillsPart = topSkills ? ` I have developed strong skills in ${topSkills}.` : "";

    let experiencePart = "";
    if (hasExperience) {
      experiencePart = " I have gained practical experience that has strengthened my problem-solving abilities.";
    } else if (hasProjects) {
      experiencePart = " I have built projects that demonstrate my ability to apply concepts in real-world scenarios.";
    } else {
      experiencePart = " I am continuously learning and improving my technical skills.";
    }

    const growthPart = focusSkills
      ? ` I am currently focusing on improving skills like ${focusSkills} to better align with industry expectations.`
      : "";

    const closing = `\n\nI am confident that my dedication and eagerness to learn will make me a valuable addition to your team.\n\nThank you for your time and consideration.\n\nSincerely,\n${name}\n`;

    return intro + skillsPart + experiencePart + growthPart + closing;
  };

  const loadCoverLetter = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let resumeData = JSON.parse(localStorage.getItem("resumeData") || "{}");
      let analysisData = JSON.parse(localStorage.getItem("roadmapData") || "{}");
      let latestProfile = JSON.parse(localStorage.getItem("latestProfile") || "null");

      try {
        setProfileSyncStatus("syncing");
        const remoteProfile = await fetchLatestProfile();
        if (remoteProfile) {
          latestProfile = remoteProfile;
          localStorage.setItem("latestProfile", JSON.stringify(remoteProfile));
          setProfileSyncStatus("synced");
        } else {
          setProfileSyncStatus("local-only");
        }
      } catch (remoteErr) {
        console.error("REMOTE PROFILE LOAD ERROR:", remoteErr);
        setProfileSyncStatus("local-only");
      }

      if ((!resumeData.name || resumeData.name === "") && latestProfile) {
        resumeData = {
          ...resumeData,
          ...latestProfile,
        };
      }

      if (!analysisData.role && latestProfile?.role) {
        analysisData = {
          ...analysisData,
          role: latestProfile.role,
          matchedSkills: analysisData.matchedSkills || latestProfile.skills || [],
          missingSkills: analysisData.missingSkills || [],
        };
      }

      if (!resumeData.name && !analysisData.role) {
        setHasProfileData(false);
        setCoverLetter("No profile data found. Please analyze resume first.");
        return;
      }

      setHasProfileData(true);
      const generatedText = generateCoverLetterText(resumeData, analysisData);
      setCoverLetter(generatedText);

    } catch (err) {
      console.error(err);
      setHasProfileData(false);
      setError("Failed to generate insights.");
      setCoverLetter("No profile data found. Please analyze resume first.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("coverLetter");
    if (saved) {
      setCoverLetter(saved);
      setLoading(false);
      return;
    }
    loadCoverLetter();
  }, [loadCoverLetter]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setError("");
    } catch {
      setError("Failed to copy cover letter.");
    }
  };

  const saveCoverLetter = () => {
    localStorage.setItem("coverLetter", coverLetter);
    alert("Saved successfully ✅");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        Your AI Cover Letter ✍️
      </h1>
      <div>
        <ProfileSyncBadge status={profileSyncStatus} />
      </div>
      {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl">{error}</div>}

      <Card className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex flex-col gap-4 py-8">
            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Edit your cover letter before applying
            </h3>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full min-h-[400px] p-6 border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-7 text-gray-700 dark:text-gray-200 transition"
              placeholder="Your cover letter will appear here..."
            />

            <div className="flex justify-end gap-4 mt-6">
              <Button onClick={saveCoverLetter} variant="secondary">
                Save
              </Button>
              <Button
                onClick={loadCoverLetter}
              >
                Regenerate
              </Button>
              {hasProfileData && (
                <Button
                  onClick={copyText}
                  variant="success"
                >
                  Copy
                </Button>
              )}
            </div>
          </>
        )}
      </Card>
      </div>
    </div>
  );
}

export default CoverLetter;