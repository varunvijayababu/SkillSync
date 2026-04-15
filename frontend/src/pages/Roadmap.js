import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";

function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [skillInsights, setSkillInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    generateRoadmap();
  }, []);

  const generateRoadmap = async () => {
    try {
      setLoading(true);
      setError("");

      const stored = localStorage.getItem("roadmapData");

      if (!stored) {
        setError("No analysis data found. Please analyze resume first.");
        return;
      }

      let data;
      try {
        data = JSON.parse(stored);
      } catch {
        setError("Corrupted roadmap data.");
        return;
      }

      const role = data?.role || "Frontend Developer";
      const skills = Array.isArray(data?.missingSkills)
        ? data.missingSkills
        : [];

      const res = await fetch("http://localhost:5000/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, skills }),
      });

      if (!res.ok) throw new Error("Server error");

      const result = await res.json();
      const roadmapPayload = result?.data?.roadmap || result?.roadmap;
      const insightsPayload = result?.data?.skillInsights || roadmapPayload?.skillInsights || [];

      if (!roadmapPayload) throw new Error("Invalid response");

      setRoadmap(roadmapPayload);
      setSkillInsights(Array.isArray(insightsPayload) ? insightsPayload : []);

    } catch (err) {
      console.error("ROADMAP ERROR:", err);
      setError("Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const getSections = () => {
    if (!roadmap) return [];
    if (Array.isArray(roadmap.sections) && roadmap.sections.length > 0) return roadmap.sections;

    // Backward compatibility for old payloads.
    return [
      { title: "Beginner", timeline: "Weeks 1-2", items: (roadmap.beginner || []).map((skill) => ({ skill })) },
      {
        title: "Intermediate",
        timeline: "Weeks 3-6",
        items: (roadmap.intermediate || []).map((skill) => ({ skill })),
      },
      { title: "Advanced", timeline: "Weeks 7+", items: (roadmap.advanced || []).map((skill) => ({ skill })) },
    ];
  };

  const getPriorityFocus = () => {
    if (!roadmap) return [];
    if (Array.isArray(roadmap.priorityFocus)) return roadmap.priorityFocus;
    return (roadmap.missingSkillsFocus || []).map((item) => ({ skill: item }));
  };

  const copyRoadmap = async () => {
    try {
      const sections = getSections();
      const priorityFocus = getPriorityFocus();
      const text = `
${roadmap.role}

${sections
  .map(
    (section) =>
      `${section.title} (${section.timeline}):\n${section.items
        .map(
          (item) =>
            `- ${item.skill}${item.difficulty ? ` | ${item.difficulty}` : ""}${item.estimatedTime ? ` | ${item.estimatedTime}` : ""}`
        )
        .join("\n")}`
  )
  .join("\n\n")}

Priority Focus:
${priorityFocus.map((item) => `- ${item.skill}`).join("\n")}
`;

      await navigator.clipboard.writeText(text);
      setError("");
    } catch {
      setError("Failed to copy roadmap text.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Intelligent Learning Roadmap</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Structured by timeline, with estimated effort, difficulty, and curated resources.
          </p>
        </div>

        {error && (
          <Card title="Roadmap Error">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </Card>
        )}

        <Card>
        {loading ? (
          <div className="flex flex-col gap-4 py-8">
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ) : roadmap ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Target Role: {roadmap.role}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {getSections().map((section) => (
                <Card key={section.title} title={`${section.title}`} subtitle={section.timeline}>
                  <div className="space-y-3">
                    {section.items.map((item, idx) => (
                      <div key={`${item.skill}-${idx}`} className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                        <p className="font-medium text-slate-800">{item.skill}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Difficulty: {item.difficulty || "N/A"} | Time: {item.estimatedTime || "N/A"}
                        </p>
                        {item.resourceLink && (
                          <a
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                            href={item.resourceLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Resource
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {getPriorityFocus().length > 0 && (
              <Card
                title="Priority Focus"
                subtitle="Missing skills that should be addressed first"
                className="border border-red-200 bg-red-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getPriorityFocus().map((item, idx) => (
                    <div key={`${item.skill}-${idx}`} className="rounded-lg border border-red-200 bg-white p-3">
                      <p className="font-medium text-red-700">{item.skill}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Difficulty: {item.difficulty || "N/A"} | Time: {item.estimatedTime || "N/A"}
                      </p>
                      {item.reason && <p className="text-xs text-slate-500 mt-1">{item.reason}</p>}
                      {item.resourceLink && (
                        <a
                          className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                          href={item.resourceLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Resource
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {roadmap.topResources && (
              <Card title="Top Resources" subtitle="Curated and quality-filtered learning options">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "officialDocs", label: "Official Docs" },
                    { key: "youtubePlaylists", label: "YouTube / Playlists" },
                    { key: "courses", label: "Courses" },
                  ].map((group) => (
                    <Card key={group.key} title={group.label}>
                      <div className="space-y-3">
                        {(roadmap.topResources[group.key] || []).map((resource, idx) => (
                          <div key={`${resource.title}-${idx}`} className="rounded-lg border border-slate-200 p-3">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {resource.title}
                            </a>
                            <p className="text-xs text-slate-500 mt-1">
                              {resource.price} | {resource.level}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {Array.isArray(roadmap.projects) && roadmap.projects.length > 0 && (
              <Card title="Projects" subtitle="Hands-on work to reinforce your roadmap">
                <ul className="list-disc ml-5 space-y-2 text-sm text-slate-700">
                  {roadmap.projects.map((project, idx) => (
                    <li key={`${project}-${idx}`}>{project}</li>
                  ))}
                </ul>
              </Card>
            )}

            <Card title="Skill Insights" subtitle="Why missing skills matter and where they are used">
              {skillInsights.length === 0 ? (
                <p className="text-sm text-slate-500">No insights available yet. Upload a resume to generate insights 🚀</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillInsights.map((insight, idx) => (
                    <div key={`${insight.skill}-${idx}`} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                      <h4 className="text-base font-semibold text-slate-900">{insight.skill}</h4>
                      <p className="text-sm text-slate-600 mt-1">{insight.importance}</p>
                      <p className="text-sm text-slate-500 mt-2">{insight.usage}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Button onClick={copyRoadmap} className="w-full">
              Copy Full Roadmap
            </Button>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">
            No insights available yet. Upload a resume to generate insights 🚀
          </p>
        )}
        </Card>
      </div>
    </div>
  );
}

export default Roadmap;