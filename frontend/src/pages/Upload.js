import { useState } from "react";

function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", "frontend");

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <h2>Upload Resume</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>Upload</button>

      {result && (
        <div>
          <h3>ATS Score: {result.score}%</h3>

          <h4>Matched Skills:</h4>
          <ul>
            {result.matchedSkills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h4>Missing Skills:</h4>
          <ul>
            {result.missingSkills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Upload;