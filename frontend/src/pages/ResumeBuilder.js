import { useState } from "react";
import html2pdf from "html2pdf.js";
import Button from "../components/Button";
import Card from "../components/Card";
import ProfileSyncBadge from "../components/ProfileSyncBadge";
import { saveLatestProfile, rewriteBulletApi } from "../services/api";
import {
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Download,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  User,
  RefreshCw,
  GripVertical,
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableSectionWrapper = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${isDragging ? "opacity-50" : ""}`}>
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-6 top-1 cursor-move rounded bg-gray-100 p-1 text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-gray-200 z-10 print-hidden"
        data-html2canvas-ignore
      >
        <GripVertical className="w-4 h-4" />
      </div>
      {children}
    </div>
  );
};

const ResumePreview = ({ data, template, sections }) => {
  const getStyles = () => {
    switch (template) {
      case "minimal":
        return {
          headerText: "text-center pb-4 mb-4",
          nameText: "text-2xl font-normal text-gray-900 tracking-tight",
          roleText: "text-lg text-gray-500",
          sectionHeading: "text-base font-bold uppercase mb-2 text-gray-900",
          techStack: "text-sm text-gray-500",
        };
      case "professional":
        return {
          headerText: "text-left border-b-2 border-gray-900 pb-3 mb-5",
          nameText: "text-3xl font-serif font-bold text-gray-900",
          roleText: "text-xl font-serif text-gray-700 italic",
          sectionHeading: "text-lg font-serif font-bold border-b border-gray-400 mb-3 text-gray-900 pb-1",
          techStack: "text-sm italic font-serif text-gray-700",
        };
      case "modern":
      default:
        return {
          headerText: "text-center border-b-2 border-indigo-600 pb-4 mb-6",
          nameText: "text-3xl font-bold uppercase tracking-wider text-indigo-900",
          roleText: "text-xl text-indigo-700 mt-1",
          sectionHeading: "text-lg font-bold uppercase border-b border-indigo-200 mb-3 text-indigo-800 tracking-wide",
          techStack: "text-sm font-semibold text-indigo-600",
        };
    }
  };

  const st = getStyles();

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case "skills":
        return data.skills?.length > 0 && (
          <div className="mb-6" key="skills">
            <h3 className={st.sectionHeading}>Skills</h3>
            <p className="text-sm font-medium leading-relaxed text-gray-800">{data.skills.join(" • ")}</p>
          </div>
        );
      case "experience":
        return data.experience?.length > 0 && data.experience.some((e) => e.company || e.role) && (
          <div className="mb-6" key="experience">
            <h3 className={st.sectionHeading}>Experience</h3>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => {
                if (!exp.company && !exp.role && !exp.description) return null;

                return (
                  <div key={idx}>
                    <div className="mb-1 flex items-end justify-between">
                      <h4 className="text-base font-bold text-gray-900">{exp.role || "Role"}</h4>
                      <span className="text-sm font-semibold text-gray-700">{exp.company || "Company"}</span>
                    </div>
                    {exp.description && (
                      <ul className="mt-1 ml-4 list-disc list-outside space-y-1 text-sm text-gray-800">
                        {exp.description
                          .split("\n")
                          .map((line, i) => (line.trim() ? <li key={i} className="pl-1 leading-snug">{line.trim()}</li> : null))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "projects":
        return data.projects?.length > 0 && data.projects.some((p) => p.title || p.description) && (
          <div className="mb-6" key="projects">
            <h3 className={st.sectionHeading}>Projects</h3>
            <div className="space-y-4">
              {data.projects.map((proj, idx) => {
                if (!proj.title && !proj.description) return null;

                return (
                  <div key={idx}>
                    <div className="mb-1 flex items-baseline gap-2">
                      <h4 className="text-base font-bold text-gray-900">{proj.title || "Project Name"}</h4>
                      {proj.techStack && <span className={st.techStack}>| {proj.techStack}</span>}
                    </div>
                    {proj.description && (
                      <ul className="mt-1 ml-4 list-disc list-outside space-y-1 text-sm text-gray-800">
                        {proj.description
                          .split("\n")
                          .map((line, i) => (line.trim() ? <li key={i} className="pl-1 leading-snug">{line.trim()}</li> : null))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "education":
        return data.education?.length > 0 && data.education.some((e) => e.degree || e.institution) && (
          <div className="mb-6" key="education">
            <h3 className={st.sectionHeading}>Education</h3>
            <div className="space-y-3">
              {data.education.map((edu, idx) => {
                if (!edu.degree && !edu.institution) return null;

                return (
                  <div key={idx} className="flex items-baseline justify-between">
                    <h4 className="text-base font-bold text-gray-900">{edu.degree || "Degree"}</h4>
                    <div className="text-right">
                      <span className="block text-sm font-semibold text-gray-700">{edu.institution || "Institution"}</span>
                      {edu.year && <span className="text-sm text-gray-500">{edu.year}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "achievements":
        return data.achievements?.length > 0 && data.achievements.some((a) => a) && (
          <div className="mb-6" key="achievements">
            <h3 className={st.sectionHeading}>Achievements</h3>
            <ul className="mt-1 ml-4 list-disc list-outside space-y-1 text-sm text-gray-800">
              {data.achievements.map((ach, idx) => (ach ? <li key={idx} className="pl-1 leading-snug">{ach}</li> : null))}
            </ul>
          </div>
        );
      case "certifications":
        return data.certifications?.length > 0 && data.certifications.some((c) => c) && (
          <div className="mb-6" key="certifications">
            <h3 className={st.sectionHeading}>Certifications</h3>
            <ul className="mt-1 ml-4 list-disc list-outside space-y-1 text-sm text-gray-800">
              {data.certifications.map((cert, idx) => (cert ? <li key={idx} className="pl-1 leading-snug">{cert}</li> : null))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  const contactLine = [
    data.contactInfo?.email,
    data.contactInfo?.phone,
    data.contactInfo?.location,
    data.contactInfo?.linkedin,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div id="resume-preview" className="mx-auto min-h-[1100px] w-full max-w-[850px] box-border bg-white p-10 text-black shadow-xl">
      <div className={st.headerText}>
        <h1 className={st.nameText}>{data.name || "Your Name"}</h1>
        <h2 className={st.roleText}>{data.role || "Target Role"}</h2>
        {contactLine && <p className="mt-2 text-sm text-gray-600">{contactLine}</p>}
      </div>

      {sections.map((section) => {
        const rendered = renderSection(section);
        if (!rendered) return null;
        return (
          <SortableSectionWrapper key={section} id={section}>
            {rendered}
          </SortableSectionWrapper>
        );
      })}
    </div>
  );
};

const DEFAULT_SECTIONS = ["skills", "experience", "projects", "education", "achievements", "certifications"];

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({
    name: "",
    role: "Frontend Developer",
    skills: [],
    contactInfo: { email: "", phone: "", location: "", linkedin: "" },
    education: [{ degree: "", institution: "", year: "" }],
    experience: [{ company: "", role: "", description: "" }],
    projects: [{ title: "", techStack: "", description: "" }],
    achievements: [""],
    certifications: [""],
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [improvingIndex, setImprovingIndex] = useState(null);
  const [error, setError] = useState("");
  const [profileSyncStatus, setProfileSyncStatus] = useState("local-only");
  const [template, setTemplate] = useState("modern");
  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((items) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleChange = (field, idx, key, value) => {
    const updated = { ...resumeData };

    if (typeof idx === "number" && key) {
      updated[field][idx][key] = value;
    } else if (typeof idx === "number" && !key) {
      updated[field][idx] = value;
    } else {
      updated[field] = value;
    }

    setResumeData(updated);
  };

  const handleAddField = (field, templateValue) => {
    setResumeData({ ...resumeData, [field]: [...resumeData[field], templateValue] });
  };

  const handleRemoveField = (field, idx) => {
    const updated = [...resumeData[field]];
    updated.splice(idx, 1);
    setResumeData({ ...resumeData, [field]: updated });
  };

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
    const arr = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setResumeData({ ...resumeData, skills: arr });
  };

  const handleRewrite = async (text, section, idx, fieldKey) => {
    if (!text) return;

    try {
      setImprovingIndex(`${section}-${idx}`);
      setError("");
      const payload = {
        text,
        section,
        role: resumeData.role,
      };
      const res = await rewriteBulletApi(payload);
      if (res?.improvedBullet) {
        handleChange(section, idx, fieldKey, res.improvedBullet);
      } else {
        throw new Error("Rewrite API returned no suggestion");
      }
    } catch (e) {
      console.error("REWRITE UI ERROR:", e);
      setError(e.message || "Failed to rewrite bullet.");
    } finally {
      setImprovingIndex(null);
    }
  };

  const handleSaveLatestProfile = async () => {
    if (!resumeData.name.trim()) {
      setError("Name is required before saving your latest profile.");
      return;
    }

    const profilePayload = {
      name: resumeData.name,
      role: resumeData.role,
      skills: resumeData.skills,
      education: resumeData.education
        .map((e) => `${e.degree} at ${e.institution} (${e.year})`.trim())
        .filter((item) => item && item !== "at ()"),
      experience: resumeData.experience
        .map((e) => `${e.role} at ${e.company}\n${e.description}`.trim())
        .filter((item) => item && item !== "at"),
      projects: resumeData.projects
        .map((p) => `${p.title} (${p.techStack})\n${p.description}`.trim())
        .filter((item) => item && item !== "()"),
      achievements: resumeData.achievements.filter(Boolean),
      certifications: resumeData.certifications.filter(Boolean),
    };

    try {
      setProfileSyncStatus("syncing");
      setError("");
      localStorage.setItem("latestProfile", JSON.stringify(profilePayload));
      localStorage.setItem("resumeData", JSON.stringify(resumeData));
      await saveLatestProfile(profilePayload);
      setProfileSyncStatus("synced");
    } catch (err) {
      console.error(err);
      setProfileSyncStatus("local-only");
      setError("Saved locally, but remote profile sync failed.");
    }
  };

  const downloadPdf = () => {
    const element = document.getElementById("resume-preview");
    const opt = {
      margin: 0,
      filename: `${(resumeData.name || "Resume").replace(/\s+/g, "_")}_SkillSync_${template}.pdf`,
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const getLiveCoachingHints = (text) => {
    if (!text) return null;

    const actionVerbs = ["developed", "built", "implemented", "created", "increased", "decreased", "optimized", "managed", "led", "designed", "achieved"];
    const hasVerb = actionVerbs.some((v) => text.toLowerCase().includes(v));
    const hasMetric = /\d+%|\$\d+|\d+/.test(text);

    if (!hasVerb && !hasMetric) return "Use action verbs and metrics.";
    if (!hasVerb) return "Missing action verbs.";
    if (!hasMetric) return "Add metrics to quantify impact.";
    return null;
  };

  const InputLabel = ({ children }) => (
    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">{children}</label>
  );



  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 transition-colors duration-300 dark:bg-gray-900">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:flex-row lg:items-center">
          <div>
            <h1 className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-3xl font-bold text-transparent">
              <FileText className="h-8 w-8 text-blue-500" />
              AI Resume Builder
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Design, auto-fill, reorder, and export.</p>
              <ProfileSyncBadge status={profileSyncStatus} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="flex items-center gap-2 border-r border-gray-200 pr-4 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Template</span>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="rounded-lg border-none bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 outline-none dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="modern">Modern (Default)</option>
                <option value="minimal">Minimal</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <Button onClick={downloadPdf} variant="primary" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>

            <Button onClick={handleSaveLatestProfile} variant="secondary" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Use as latest profile
            </Button>

            <Button onClick={() => setSections(DEFAULT_SECTIONS)} variant="secondary" className="px-3" title="Reset Layout">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-100 p-4 text-red-700">{error}</div>}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <div className="custom-scrollbar h-[80vh] space-y-6 overflow-y-auto pr-2 pb-20">
            <Card className="border-l-4 border-l-blue-500">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <User className="w-5 h-5" />
                Basic Info
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <InputLabel>Full Name</InputLabel>
                  <input className="w-full rounded-lg border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={resumeData.name} onChange={(e) => handleChange("name", null, null, e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <InputLabel>Target Role</InputLabel>
                  <input className="w-full rounded-lg border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={resumeData.role} onChange={(e) => handleChange("role", null, null, e.target.value)} placeholder="Software Engineer" />
                </div>
                <div>
                  <InputLabel>Email</InputLabel>
                  <input className="w-full rounded-lg border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={resumeData.contactInfo.email} onChange={(e) => handleChange("contactInfo", null, null, { ...resumeData.contactInfo, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div>
                  <InputLabel>Phone</InputLabel>
                  <input className="w-full rounded-lg border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={resumeData.contactInfo.phone} onChange={(e) => handleChange("contactInfo", null, null, { ...resumeData.contactInfo, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <InputLabel>Location</InputLabel>
                  <input className="w-full rounded-lg border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={resumeData.contactInfo.location} onChange={(e) => handleChange("contactInfo", null, null, { ...resumeData.contactInfo, location: e.target.value })} placeholder="Bengaluru, India" />
                </div>
                <div>
                  <InputLabel>LinkedIn</InputLabel>
                  <input className="w-full rounded-lg border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={resumeData.contactInfo.linkedin} onChange={(e) => handleChange("contactInfo", null, null, { ...resumeData.contactInfo, linkedin: e.target.value })} placeholder="linkedin.com/in/username" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Code className="w-5 h-5" />
                Skills
              </h3>
              <textarea className="w-full rounded-lg border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" rows="2" value={skillsInput} onChange={handleSkillsChange} placeholder="React, Node.js, Python, SQL" />
              <div className="mt-3 flex flex-wrap gap-2">
                {resumeData.skills.map((s) => (
                  <span key={s} className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/30">
                    {s}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Briefcase className="w-5 h-5" />
                Experience
              </h3>
              <div className="space-y-6">
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx} className="relative rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <button onClick={() => handleRemoveField("experience", idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="mb-3 grid grid-cols-2 gap-3 pr-8">
                      <input className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Company Name" value={exp.company} onChange={(e) => handleChange("experience", idx, "company", e.target.value)} />
                      <input className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Job Title" value={exp.role} onChange={(e) => handleChange("experience", idx, "role", e.target.value)} />
                    </div>
                    <div className="relative">
                      <textarea className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" rows="4" placeholder="Description (bullet points separated by new lines)" value={exp.description} onChange={(e) => handleChange("experience", idx, "description", e.target.value)} />

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          {getLiveCoachingHints(exp.description) && `Tip: ${getLiveCoachingHints(exp.description)}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleRewrite(exp.description, "experience", idx, "description")} className="flex items-center gap-1 rounded-lg bg-indigo-100 px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {improvingIndex === `experience-${idx}` ? "Improving..." : <><Sparkles className="w-3 h-3" /> AI Improve</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => handleAddField("experience", { company: "", role: "", description: "" })} className="w-full border-dashed">
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add Experience
                </Button>
              </div>
            </Card>

            <Card className="border-l-4 border-l-pink-500">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Code className="w-5 h-5" />
                Projects
              </h3>
              <div className="space-y-6">
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx} className="relative rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <button onClick={() => handleRemoveField("projects", idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="mb-3 grid grid-cols-2 gap-3 pr-8">
                      <input className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Project Title" value={proj.title} onChange={(e) => handleChange("projects", idx, "title", e.target.value)} />
                      <input className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Tech Stack (e.g. React, Node)" value={proj.techStack} onChange={(e) => handleChange("projects", idx, "techStack", e.target.value)} />
                    </div>
                    <div className="relative">
                      <textarea className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" rows="3" placeholder="Description" value={proj.description} onChange={(e) => handleChange("projects", idx, "description", e.target.value)} />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          {getLiveCoachingHints(proj.description) && `Tip: ${getLiveCoachingHints(proj.description)}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleRewrite(proj.description, "projects", idx, "description")} className="flex items-center gap-1 rounded-lg bg-pink-100 px-3 py-1.5 text-xs text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300">
                            {improvingIndex === `projects-${idx}` ? "Improving..." : <><Sparkles className="w-3 h-3" /> AI Improve</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => handleAddField("projects", { title: "", techStack: "", description: "" })} className="w-full border-dashed">
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add Project
                </Button>
              </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <GraduationCap className="w-5 h-5" />
                Education
              </h3>
              <div className="space-y-4">
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="relative rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <button onClick={() => handleRemoveField("education", idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 gap-3 pr-8 md:grid-cols-3">
                      <input className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white md:col-span-1" placeholder="Degree (B.S. CS)" value={edu.degree} onChange={(e) => handleChange("education", idx, "degree", e.target.value)} />
                      <input className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white md:col-span-1" placeholder="Institution" value={edu.institution} onChange={(e) => handleChange("education", idx, "institution", e.target.value)} />
                      <input className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white md:col-span-1" placeholder="Year (2020-2024)" value={edu.year} onChange={(e) => handleChange("education", idx, "year", e.target.value)} />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => handleAddField("education", { degree: "", institution: "", year: "" })} className="w-full border-dashed">
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add Education
                </Button>
              </div>
            </Card>

            <Card className="mb-8 border-l-4 border-l-yellow-500">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Award className="w-5 h-5" />
                Achievements
              </h3>
              <div className="space-y-3">
                {resumeData.achievements.map((ach, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input className="flex-1 rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Award or achievement" value={ach} onChange={(e) => handleChange("achievements", idx, null, e.target.value)} />
                    <button onClick={() => handleRemoveField("achievements", idx)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => handleAddField("achievements", "")} className="w-full border-dashed">
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add Achievement
                </Button>
              </div>
            </Card>

            <Card className="mb-8 border-l-4 border-l-cyan-500">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Award className="w-5 h-5" />
                Certifications
              </h3>
              <div className="space-y-3">
                {resumeData.certifications.map((cert, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input className="flex-1 rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Certification" value={cert} onChange={(e) => handleChange("certifications", idx, null, e.target.value)} />
                    <button onClick={() => handleRemoveField("certifications", idx)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => handleAddField("certifications", "")} className="w-full border-dashed">
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add Certification
                </Button>
              </div>
            </Card>
          </div>

          <div className="custom-scrollbar sticky top-8 flex h-[80vh] justify-center overflow-y-auto rounded-2xl border border-gray-300 bg-gray-200 p-6 shadow-inner dark:border-gray-700 dark:bg-gray-800">
            <div className="origin-top transform scale-[0.6] sm:scale-75 md:scale-[0.8] lg:scale-[0.7] xl:scale-[0.85] w-full justify-center pb-20 drop-shadow-2xl flex">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                  <ResumePreview data={resumeData} template={template} sections={sections} />
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        @media print { .print-hidden { display: none !important; } }
      `}</style>
    </div>
  );
}
