import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import UploadBox from "../components/UploadBox";
import FileList from "../components/FileList";

export default function Dashboard() {
  const { logout } = useAuth();
  const [refresh, setRefresh] = useState(false);

  return (
    <>
      <button onClick={logout}>Logout</button>

      {/* NOT inside a form */}
      <UploadBox onUpload={() => setRefresh(!refresh)} />

      <FileList refresh={refresh} />
    </>
  );
}
