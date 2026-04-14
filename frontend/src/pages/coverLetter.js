import { useEffect, useState } from "react";

function CoverLetter() {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateLetter();
  }, []);

  const generateLetter = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const coverData = JSON.parse(localStorage.getItem("coverData"));

      if (!user || !coverData) {
        alert("Missing data. Please analyze resume first.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          role: coverData.role,
          skills: coverData.skills,
        }),
      });

      const data = await res.json();
      setLetter(data?.data?.letter || data?.letter || "");

    } catch (err) {
      console.error(err);
      alert("Failed to generate ❌");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(letter);
    alert("Copied to clipboard ✅");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      <h1 className="text-2xl font-bold mb-6">
        Your AI Cover Letter ✍️
      </h1>

      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">

        {loading ? (
          <p className="text-center text-gray-500">
            Generating your cover letter...
          </p>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded border whitespace-pre-wrap">
              {letter}
            </div>

            <button
              onClick={copyText}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Copy to Clipboard
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default CoverLetter;