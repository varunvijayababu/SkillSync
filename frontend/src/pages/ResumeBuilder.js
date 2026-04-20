import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import Button from "../components/Button";
import Card from "../components/Card";
import ProfileSyncBadge from "../components/ProfileSyncBadge";
import ProgressBar from "../components/ProgressBar";
import Section from "../components/Section";
import { generateResumeBuilder, saveLatestProfile, rewriteBulletApi, parseResume } from "../services/api";
import { Plus, Trash2, Sparkles, FileText, Download, Briefcase, GraduationCap, Code, Award, User, RefreshCw, Upload, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableSectionWrapper = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={`relative group ${isDragging ? "opacity-50" : ""}`}>
       <div {...attributes} {...listeners} className="absolute -left-6 top-1 cursor-move opacity-0 group-hover:opacity-100 p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-500 z-10 print-hidden" data-html2canvas-ignore>
         <GripVertical className="w-4 h-4"/>
       </div>
       {children}
    </div>
  );
};

const ResumePreview = ({ data, template, sections }) => {
  // Styles based on template
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
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              {data.skills.join(" • ")}
            </p>
          </div>
        );
      case "experience":
        return data.experience?.length > 0 && data.experience.some(e => e.company || e.role) && (
          <div className="mb-6" key="experience">
            <h3 className={st.sectionHeading}>Experience</h3>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => {
                if (!exp.company && !exp.role && !exp.description) return null;
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="font-bold text-gray-900 text-base">{exp.role || "Role"}</h4>
                      <span className="font-semibold text-gray-700 text-sm">{exp.company || "Company"}</span>
                    </div>
                    {exp.description && (
                      <ul className="list-disc list-outside ml-4 mt-1 text-sm text-gray-800 space-y-1">
                        {exp.description.split("\n").map((line, i) => line.trim() ? <li key={i} className="pl-1 leading-snug">{line.trim()}</li> : null)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "projects":
        return data.projects?.length > 0 && data.projects.some(p => p.title || p.description) && (
          <div className="mb-6" key="projects">
            <h3 className={st.sectionHeading}>Projects</h3>
            <div className="space-y-4">
              {data.projects.map((proj, idx) => {
                if (!proj.title && !proj.description) return null;
                return (
                  <div key={idx}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-base">{proj.title || "Project Name"}</h4>
                      {proj.techStack && <span className={st.techStack}>| {proj.techStack}</span>}
                    </div>
                    {proj.description && (
                      <ul className="list-disc list-outside ml-4 mt-1 text-sm text-gray-800 space-y-1">
                        {proj.description.split("\n").map((line, i) => line.trim() ? <li key={i} className="pl-1 leading-snug">{line.trim()}</li> : null)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "education":
        return data.education?.length > 0 && data.education.some(e => e.degree || e.institution) && (
          <div className="mb-6" key="education">
            <h3 className={st.sectionHeading}>Education</h3>
            <div className="space-y-3">
              {data.education.map((edu, idx) => {
                if (!edu.degree && !edu.institution) return null;
                return (
                  <div key={idx} className="flex justify-between items-baseline">
                    <h4 className="font-bold text-gray-900 text-base">{edu.degree || "Degree"}</h4>
                    <div className="text-right">
                      <span className="font-semibold text-gray-700 text-sm block">{edu.institution || "Institution"}</span>
                      {edu.year && <span className="text-sm text-gray-500">{edu.year}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "achievements":
        return data.achievements?.length > 0 && data.achievements.some(a => a) && (
          <div className="mb-6" key="achievements">
            <h3 className={st.sectionHeading}>Achievements</h3>
            <ul className="list-disc list-outside ml-4 mt-1 text-sm text-gray-800 space-y-1">
              {data.achievements.map((ach, idx) => ach ? <li key={idx} className="pl-1 leading-snug">{ach}</li> : null)}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="resume-preview" className="bg-white text-black p-10 shadow-xl mx-auto w-full max-w-[850px] min-h-[1100px] box-border">
      {/* HEADER */}
      <div className={st.headerText}>
        <h1 className={st.nameText}>{data.name || "Your Name"}</h1>
        <h2 className={st.roleText}>{data.role || "Target Role"}</h2>
      </div>

      {sections.map(section => {
        const rendered = renderSection(section);
        if (!rendered) return null;
        return <SortableSectionWrapper key={section} id={section}>{rendered}</SortableSectionWrapper>;
      })}
    </div>
  );
};

const DEFAULT_SECTIONS = ["skills", "experience", "projects", "education", "achievements"];

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({
    name: "",
    role: "Frontend Developer",
    skills: [],
    education: [{ degree: "", institution: "", year: "" }],
    experience: [{ company: "", role: "", description: "" }],
    projects: [{ title: "", techStack: "", description: "" }],
    achievements: [""],
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [improvingIndex, setImprovingIndex] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [profileSyncStatus, setProfileSyncStatus] = useState("local-only");
  const [template, setTemplate] = useState("modern");
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleImportResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setImporting(true);
      setError("");
      const res = await parseResume(formData);
      if (res) {
        setResumeData({
          name: res.name || "",
          role: res.role || "",
          skills: res.skills || [],
          education: res.education?.length ? res.education : [{ degree: "", institution: "", year: "" }],
          experience: res.experience?.length ? res.experience : [{ company: "", role: "", description: "" }],
          projects: res.projects?.length ? res.projects : [{ title: "", techStack: "", description: "" }],
          achievements: res.achievements?.length ? res.achievements : [""],
        });
        setSkillsInput((res.skills || []).join(", "));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to auto-fill from resume.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const generatePayloadText = () => {
    return {
      name: resumeData.name,
      role: resumeData.role,
      skills: resumeData.skills,
      education: resumeData.education.map(e => `${e.degree} at ${e.institution} (${e.year})`.trim()).filter(x => x && x !== "at ()"),
      experience: resumeData.experience.map(e => `${e.role} at ${e.company}\n${e.description}`.trim()).filter(x => x && x !== "at"),
      projects: resumeData.projects.map(p => `${p.title} (${p.techStack})\n${p.description}`.trim()).filter(x => x && x !== "()"),
      achievements: resumeData.achievements.filter(Boolean),
    };
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

  const handleAddField = (field, template) => {
    setResumeData({ ...resumeData, [field]: [...resumeData[field], template] });
  };

  const handleRemoveField = (field, idx) => {
    const updated = [...resumeData[field]];
    updated.splice(idx, 1);
    setResumeData({ ...resumeData, [field]: updated });
  };

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
    const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
    setResumeData({ ...resumeData, skills: arr });
  };

  const handleRewrite = async (text, section, idx, fieldKey) => {
    if (!text) return;
    try {
      setImprovingIndex(`${section}-${idx}`);
      const payload = { bullet: text, role: resumeData.role };
      const res = await rewriteBulletApi(payload);
      if (res?.improvedBullet) {
        handleChange(section, idx, fieldKey, res.improvedBullet);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to rewrite bullet.");
    } finally {
      setImprovingIndex(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeData.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = generatePayloadText();
      const data = await generateResumeBuilder(payload);
      setResult(data);
      localStorage.setItem("resumeData", JSON.stringify(resumeData));
      if (data?.analysis) {
        localStorage.setItem(
          "roadmapData",
          JSON.stringify({
            role: data.analysis.role || resumeData.role,
            matchedSkills: data.analysis.matchedSkills || [],
            missingSkills: data.analysis.missingSkills || [],
          })
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate AI analysis.");
    } finally {
      setLoading(false);
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
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const getLiveCoachingHints = (text) => {
    if (!text) return null;
    const actionVerbs = ["developed", "built", "implemented", "created", "increased", "decreased", "optimized", "managed", "led", "designed", "achieved"];
    const hasVerb = actionVerbs.some(v => text.toLowerCase().includes(v));
    const hasMetric = /\d+%|\$\d+|\d+/.test(text);

    if (!hasVerb && !hasMetric) return "Use action verbs and metrics.";
    if (!hasVerb) return "Missing action verbs.";
    if (!hasMetric) return "Add metrics to quantify impact.";
    return null;
  };

  const InputLabel = ({ children }) => <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{children}</label>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 transition-colors duration-300">
      <div className="max-w-[1500px] mx-auto space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500"/> AI Resume Builder
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Design, auto-fill, reorder, and export.</p>
              <ProfileSyncBadge status={profileSyncStatus} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            
            <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-4">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Template</span>
              <select 
                value={template} 
                onChange={(e) => setTemplate(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border-none outline-none rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                <option value="modern">Modern (Default)</option>
                <option value="minimal">Minimal</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleImportResume} />
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex items-center gap-2" disabled={importing}>
               {importing ? <div className="w-4 h-4 border-2 border-gray-500 rounded-full animate-spin border-t-transparent" /> : <Upload className="w-4 h-4"/>}
               Import from Resume
            </Button>
            
            <Button onClick={downloadPdf} variant="primary" className="flex items-center gap-2">
               <Download className="w-4 h-4"/> Export PDF
            </Button>
            
            <Button onClick={handleSubmit} disabled={loading} variant="success" className="flex items-center gap-2">
               {loading ? <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" /> : <Sparkles className="w-4 h-4"/>}
               Analyze ATS
            </Button>

            <Button onClick={handleSaveLatestProfile} variant="secondary" className="flex items-center gap-2">
               <User className="w-4 h-4"/> Use as latest profile
            </Button>

            <Button onClick={() => setSections(DEFAULT_SECTIONS)} variant="secondary" className="px-3" title="Reset Layout"><RefreshCw className="w-4 h-4"/></Button>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl border border-red-200">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT: FORM PANEL */}
          <div className="space-y-6 h-[80vh] overflow-y-auto pr-2 custom-scrollbar pb-20">
            <Card className="border-l-4 border-l-blue-500">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User className="w-5 h-5"/> Basic Info</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <InputLabel>Full Name</InputLabel>
                    <input className="w-full border p-2 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={resumeData.name} onChange={e => handleChange("name", null, null, e.target.value)} placeholder="John Doe"/>
                 </div>
                 <div>
                    <InputLabel>Target Role</InputLabel>
                    <input className="w-full border p-2 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={resumeData.role} onChange={e => handleChange("role", null, null, e.target.value)} placeholder="Software Engineer"/>
                 </div>
               </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Code className="w-5 h-5"/> Skills</h3>
               <textarea className="w-full border p-2 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white" rows="2" value={skillsInput} onChange={handleSkillsChange} placeholder="React, Node.js, Python, SQL"/>
               <div className="flex flex-wrap gap-2 mt-3">
                 {resumeData.skills.map(s => <span key={s} className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 rounded-full">{s}</span>)}
               </div>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5"/> Experience</h3>
               <div className="space-y-6">
                 {resumeData.experience.map((exp, idx) => (
                   <div key={idx} className="relative bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                     <button onClick={() => handleRemoveField("experience", idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                     <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                       <input className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white" placeholder="Company Name" value={exp.company} onChange={e => handleChange("experience", idx, "company", e.target.value)} />
                       <input className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white" placeholder="Job Title" value={exp.role} onChange={e => handleChange("experience", idx, "role", e.target.value)} />
                     </div>
                     <div className="relative">
                       <textarea className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white" rows="4" placeholder="Description (bullet points separated by new lines)" value={exp.description} onChange={e => handleChange("experience", idx, "description", e.target.value)} />
                       
                       <div className="flex items-center justify-between mt-2">
                         <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            {getLiveCoachingHints(exp.description) && `💡 ${getLiveCoachingHints(exp.description)}`}
                         </span>
                         <button onClick={() => handleRewrite(exp.description, "experience", idx, "description")} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {improvingIndex === `experience-${idx}` ? "Improving..." : <><Sparkles className="w-3 h-3"/> AI Improve</>}
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
                 <Button type="button" variant="secondary" onClick={() => handleAddField("experience", {company:"", role:"", description:""})} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2 inline"/> Add Experience</Button>
               </div>
            </Card>

            <Card className="border-l-4 border-l-pink-500">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Code className="w-5 h-5"/> Projects</h3>
               <div className="space-y-6">
                 {resumeData.projects.map((proj, idx) => (
                   <div key={idx} className="relative bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                     <button onClick={() => handleRemoveField("projects", idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                     <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                       <input className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white" placeholder="Project Title" value={proj.title} onChange={e => handleChange("projects", idx, "title", e.target.value)} />
                       <input className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white" placeholder="Tech Stack (e.g. React, Node)" value={proj.techStack} onChange={e => handleChange("projects", idx, "techStack", e.target.value)} />
                     </div>
                     <div className="relative">
                       <textarea className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white" rows="3" placeholder="Description" value={proj.description} onChange={e => handleChange("projects", idx, "description", e.target.value)} />
                       <div className="flex items-center justify-between mt-2">
                         <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            {getLiveCoachingHints(proj.description) && `💡 ${getLiveCoachingHints(proj.description)}`}
                         </span>
                         <button onClick={() => handleRewrite(proj.description, "projects", idx, "description")} className="text-xs bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300">
                            {improvingIndex === `projects-${idx}` ? "Improving..." : <><Sparkles className="w-3 h-3"/> AI Improve</>}
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
                 <Button type="button" variant="secondary" onClick={() => handleAddField("projects", {title:"", techStack:"", description:""})} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2 inline"/> Add Project</Button>
               </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5"/> Education</h3>
               <div className="space-y-4">
                 {resumeData.education.map((edu, idx) => (
                   <div key={idx} className="relative bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                     <button onClick={() => handleRemoveField("education", idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                       <input className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white md:col-span-1" placeholder="Degree (B.S. CS)" value={edu.degree} onChange={e => handleChange("education", idx, "degree", e.target.value)} />
                       <input className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white md:col-span-1" placeholder="Institution" value={edu.institution} onChange={e => handleChange("education", idx, "institution", e.target.value)} />
                       <input className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white md:col-span-1" placeholder="Year (2020-2024)" value={edu.year} onChange={e => handleChange("education", idx, "year", e.target.value)} />
                     </div>
                   </div>
                 ))}
                 <Button type="button" variant="secondary" onClick={() => handleAddField("education", {degree:"", institution:"", year:""})} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2 inline"/> Add Education</Button>
               </div>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 mb-8">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award className="w-5 h-5"/> Achievements</h3>
               <div className="space-y-3">
                 {resumeData.achievements.map((ach, idx) => (
                   <div key={idx} className="flex gap-2">
                     <input className="flex-1 border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white" placeholder="Award or achievement" value={ach} onChange={e => handleChange("achievements", idx, null, e.target.value)} />
                     <button onClick={() => handleRemoveField("achievements", idx)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                   </div>
                 ))}
                 <Button type="button" variant="secondary" onClick={() => handleAddField("achievements", "")} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2 inline"/> Add Achievement</Button>
               </div>
            </Card>

          </div>

          {/* RIGHT: LIVE PREVIEW PANEL w/ DND */}
          <div className="sticky top-8 bg-gray-200 dark:bg-gray-800 p-6 rounded-2xl border border-gray-300 dark:border-gray-700 h-[80vh] overflow-y-auto custom-scrollbar flex justify-center shadow-inner">
             <div className="transform scale-[0.6] sm:scale-75 md:scale-[0.8] lg:scale-[0.7] xl:scale-[0.85] origin-top w-full drop-shadow-2xl flex justify-center pb-20">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                    <ResumePreview data={resumeData} template={template} sections={sections} />
                  </SortableContext>
                </DndContext>
             </div>
          </div>

        </div>

        {/* ATS ANALYSIS RESULTS */}
        {result?.analysis && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
             <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">ATS Analysis Results</h2>
             <Card title={`Auto Analysis ${result.analysis.version || ""}`} subtitle={`Role: ${result.analysis.role}`}>
              <div className="space-y-4">
                <ProgressBar value={result.analysis.score || 0} label="Overall ATS score" color="bg-blue-500" />
                <ProgressBar value={result.analysis.roleReadinessPercentage || 0} label="Role readiness match" color="bg-emerald-500"/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <Section title="Matched Skills" items={result.analysis.matchedSkills || []} accent="text-emerald-700" display="badges" badgeVariant="success"/>
                  <Section title="Missing Skills" items={result.analysis.missingSkills || []} accent="text-red-700" display="badges" badgeVariant="danger"/>
                </div>
              </div>
            </Card>
          </div>
        )}

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
