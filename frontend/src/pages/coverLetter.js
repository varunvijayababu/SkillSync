import { useState } from "react";

function CoverLetter() {
  const [letter, setLetter] = useState("");

  const generate = async () => {
    const res = await fetch("http://localhost:5000/api/cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Varun",
        role: "Frontend Developer",
        skills: ["HTML", "CSS", "React"],
      }),
    });

    const data = await res.json();
    setLetter(data.letter);
  };

  return (
    <div>
      <h2>Cover Letter Generator</h2>
      <button onClick={generate}>Generate</button>

      <pre style={{ whiteSpace: "pre-wrap" }}>{letter}</pre>
    </div>
  );
}

export default CoverLetter;