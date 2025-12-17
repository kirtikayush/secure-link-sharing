import api from "../api/api";

export default function UploadBox({ onUpload }) {
  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("files", file);

    await api.post("/files/upload", formData);

    e.target.value = "";
    onUpload();
  };

  return <input type="file" onChange={upload} />;
}
