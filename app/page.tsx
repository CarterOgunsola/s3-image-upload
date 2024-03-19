//added list of files
"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  // Fetch the list of files when the component mounts
  useEffect(() => {
    async function getFiles() {
      try {
        const response = await fetch("/api/list");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const fileList = await response.json();
        setFiles(fileList);
      } catch (error) {
        console.error(
          "There has been a problem with your fetch operation:",
          error,
        );
      }
    }
    getFiles();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);

    // Assuming your NEXT_PUBLIC_BASE_URL is set correctly in the .env.local
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      },
    );

    if (response.ok) {
      const { url, fields } = await response.json();

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        alert("Upload successful!");
        getFiles(); // Refresh the list after a successful upload
      } else {
        console.error("S3 Upload Error:", uploadResponse);
        alert("Upload failed.");
      }
    } else {
      console.error("Error getting pre-signed URL:", response);
      alert("Failed to get pre-signed URL.");
    }

    setUploading(false);
  };

  return (
    <main>
      <h1>Upload a File to S3</h1>
      <form onSubmit={handleSubmit}>
        <input
          id="file"
          type="file"
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              setFile(files[0]);
            }
          }}
          accept="image/png, image/jpeg, video/mp4, text/plain"
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      <section>
        <h2>Files in S3 Bucket</h2>
        <ul>
          {files.map((file, index) => (
            <li key={index}>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
