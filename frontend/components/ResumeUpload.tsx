'use client';

import { useState } from 'react';

interface ResumeData {
  skills: string[];
  projects: string[];
  experience: string[];
  education: string[];
}

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data: ResumeData = await response.json();
      console.log("🔥 DATA ARRIVED FROM BACKEND:", data); // Watch your F12 console for this!
      setParsedData(data);
    } catch (error) {
      console.error('Frontend Upload Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', margin: '20px' }}>
      <h3 style={{ color: '#fff' }}>Resume Upload (Structured AI Mode)</h3>
      
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf" onChange={handleFileChange} style={{ color: '#fff' }} />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          {loading ? 'Processing via Gemini...' : 'Upload & Parse'}
        </button>
      </form>

      {/* Structured UI display container */}
      {parsedData && (
        <div style={{ marginTop: '20px', background: '#222', padding: '15px', borderRadius: '6px', color: '#fff', textAlign: 'left' }}>
          <h4 style={{ borderBottom: '1px solid #444', paddingBottom: '5px' }}>Parsed Resume Schema:</h4>
          <p><strong>💡 Skills:</strong> {parsedData.skills?.join(', ') || 'None found'}</p>
          
          <p><strong>🚀 Projects:</strong></p>
          <ul>{parsedData.projects?.map((p, i) => <li key={i}>{p}</li>)}</ul>

          <p><strong>💼 Experience:</strong></p>
          <ul>{parsedData.experience?.map((e, i) => <li key={i}>{e}</li>)}</ul>

          <p><strong>🎓 Education:</strong></p>
          <ul>{parsedData.education?.map((edu, i) => <li key={i}>{edu}</li>)}</ul>
        </div>
      )}
    </div>
  );
}