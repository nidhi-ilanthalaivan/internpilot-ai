'use client';

import { useState } from 'react';

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    setLoading(true);

    // Prepare the file using FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the file to your FastAPI backend route
      const response = await fetch('http://127.0.0.1:8000/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      // Store the extracted text into state
      setExtractedText(data.resume_text);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Something went wrong during the upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Resume Upload (Functional Only)</h3>
      
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload & Extract'}
        </button>
      </form>

      {/* Display the extracted text on the screen */}
      {extractedText && (
        <div style={{ marginTop: '20px' }}>
          <h4>Extracted Text View:</h4>
          <pre style={{ 
            background: '#f4f4f4', 
            padding: '15px', 
            whiteSpace: 'pre-wrap', 
            color: '#333' 
          }}>
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}