import { useEffect, useState } from "react";
import api from "../api/api";

export default function FileList({ refresh }) {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [email, setEmail] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");

  useEffect(() => {
    api.get("/files").then((res) => setFiles(res.data.files));
  }, [refresh]);

  const download = async (id, name) => {
    const res = await api.get(`/files/${id}/download`, {
      responseType: "blob",
    });

    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  // 🔹 Share with user by email
  const shareWithUser = async () => {
    setShareError("");
    setShareSuccess("");

    try {
      await api.post(`/files/${activeFile.id}/share/users`, {
        userEmails: [email],
      });

      setShareSuccess("File shared successfully");
      setEmail("");
    } catch (err) {
      setShareError(err.response?.data?.message || "User does not exist");
    }
  };

  // 🔹 Share via link
  const generateLink = async () => {
    const res = await api.post(`/files/${activeFile.id}/share/link`);

    setShareLink(res.data.link);
  };

  return (
    <>
      <ul>
        {files.map((f) => (
          <li key={f.id}>
            {f.original_name}
            {f.role === "viewer" && (
              <span style={{ color: "gray", marginLeft: 6 }}>(shared)</span>
            )}
            <button onClick={() => download(f.id, f.original_name)}>
              Download
            </button>

            {f.role === "owner" && (
              <button
                onClick={() => {
                  setActiveFile(f);
                  setShareLink("");
                  setShareError("");
                  setShareSuccess("");
                }}
              >
                Share
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* 🔐 SHARE PANEL */}
      {activeFile && (
        <div style={{ border: "1px solid #ccc", padding: 10, marginTop: 20 }}>
          <h4>Share: {activeFile.original_name}</h4>

          <input
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={shareWithUser}>Share with user</button>

          {shareSuccess && <p style={{ color: "green" }}>{shareSuccess}</p>}

          {shareError && <p style={{ color: "red" }}>{shareError}</p>}

          <hr />

          <button onClick={generateLink}>Generate share link</button>

          {shareLink && (
            <div>
              <input value={shareLink} readOnly />
              <button onClick={() => navigator.clipboard.writeText(shareLink)}>
                Copy
              </button>
            </div>
          )}

          <br />
          <button onClick={() => setActiveFile(null)}>Close</button>
        </div>
      )}
    </>
  );
}
