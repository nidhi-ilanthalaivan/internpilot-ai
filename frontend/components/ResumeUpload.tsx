'use client';

import { useState, useEffect } from 'react';

interface ResumeData {
  skills: string[];
  projects: string[];
  experience: string[];
  education: string[];
}

interface CompatibilityScore {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  feedback_summary: string;
}

interface GeneratedQuestion {
  id: number;
  question: string;
  category: string;
  target_skill: string;
  ideal_answer_keywords: string[];
}

interface InterviewSessionPrep {
  job_title: string;
  questions: GeneratedQuestion[];
}

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [memoryLoading, setMemoryLoading] = useState<boolean>(true);

  // Job Matching States
  const [jobDescription, setJobDescription] = useState<string>('');
  const [matchResult, setMatchResult] = useState<CompatibilityScore | null>(null);
  const [matchLoading, setMatchLoading] = useState<boolean>(false);
  
  // Phase 2 Interview Prep States
  const [questionsPrep, setQuestionsPrep] = useState<InterviewSessionPrep | null>(null);
  const [interviewLoading, setInterviewLoading] = useState<boolean>(false);

  // Core Evaluation States
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [evaluations, setEvaluations] = useState<{ [key: number]: any }>({});
  const [evalLoading, setEvalLoading] = useState<{ [key: number]: boolean }>({});

  // 🧠 AUTOMATIC COGNITIVE MEMORY RESTORATION LAYER
  useEffect(() => {
    async function restoreSessionMemory() {
      try {
        const response = await fetch('http://127.0.0.1:8000/resume/latest');
        if (response.ok) {
          const storedProfile: ResumeData = await response.json();
          setParsedData(storedProfile);
          console.log("🎯 InternPilot Memory Engine: Restored active profile from DB layers.");
        }
      } catch (error) {
        console.log("ℹ️ No profile history found in backend memory yet.");
      } finally {
        setMemoryLoading(false);
      }
    }
    restoreSessionMemory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload status: ${response.status}`);

      const data: ResumeData = await response.json();
      setParsedData(data);
      setMatchResult(null);
      setQuestionsPrep(null);
      setAnswers({});
      setEvaluations({});
    } catch (error) {
      console.error('Upload Error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleMatchAnalysis = async () => {
    if (!parsedData || !jobDescription.trim()) {
      alert('Please parse your resume and provide a job description first!');
      return;
    }

    setMatchLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/resume/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_data: parsedData,
          job_description_text: jobDescription,
        }),
      });

      if (!response.ok) throw new Error(`Matching engine status: ${response.status}`);

      const data: CompatibilityScore = await response.json();
      setMatchResult(data);
      setQuestionsPrep(null);
      setAnswers({});
      setEvaluations({});
    } catch (error) {
      console.error('Matching Error:', error);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleStartInterviewPrep = async () => {
    if (!matchResult) return;
    setInterviewLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/resume/generate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: "Software Engineer", 
          match_report: matchResult,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate interview set.');

      const data: InterviewSessionPrep = await response.json();
      setQuestionsPrep(data);
    } catch (error) {
      console.error('Interview Generation Error:', error);
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleAnswerSubmit = async (qId: number, qText: string, focusArea: string) => {
    const userAnswer = answers[qId];
    if (!userAnswer || !userAnswer.trim()) {
      alert('Please type a response answer first!');
      return;
    }

    setEvalLoading(prev => ({ ...prev, [qId]: true }));

    try {
      const response = await fetch('http://127.0.0.1:8000/resume/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: qText,
          focus_area: focusArea,
          user_answer_text: userAnswer
        }),
      });

      if (!response.ok) throw new Error('Failed to score response.');

      const scoreData = await response.json();
      setEvaluations(prev => ({ ...prev, [qId]: scoreData }));
    } catch (error) {
      console.error(error);
    } finally {
      setEvalLoading(prev => ({ ...prev, [qId]: false }));
    }
  };

  if (memoryLoading) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', color: '#aaa', fontFamily: 'sans-serif' }}>
        <p>⚡ Synchronizing data arrays with local database memory...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* 🧠 MEMORY ESTABLISHED NOTIFICATION BADGE */}
      {parsedData && (
        <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50', borderRadius: '4px', padding: '10px 15px', color: '#4caf50', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '13px' }}>
          <span><strong>🧠 Persistent Profile Linked:</strong> Your extracted experiences and skills are safely mounted inside context state.</span>
          <button 
            onClick={() => { setParsedData(null); setMatchResult(null); setQuestionsPrep(null); }} 
            style={{ background: 'none', border: 'none', color: '#ff9800', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
          >
            Clear State Cache
          </button>
        </div>
      )}

      {/* SECTION 1: Resume Ingestion */}
      <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', background: '#1e1e1e', color: '#fff', marginBottom: '20px' }}>
        <h3>1. Resume Parser Ingestion Pipeline</h3>
        <form onSubmit={handleUpload}>
          <input type="file" accept=".pdf" onChange={handleFileChange} />
          <button type="submit" disabled={uploadLoading} style={{ padding: '6px 12px', cursor: 'pointer' }}>
            {uploadLoading ? 'Running Extraction...' : 'Upload & Process Schema'}
          </button>
        </form>

        {parsedData && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#2d2d2d', borderRadius: '4px', fontSize: '14px' }}>
            <p style={{ color: '#4caf50' }}>✓ Resume data loaded securely into state memory and local database.</p>
            <details>
              <summary style={{ cursor: 'pointer', color: '#2196f3' }}>View Cached Data Details</summary>
              <p style={{ margin: '10px 0 0 0' }}><strong>Skills Found:</strong> {parsedData.skills.join(', ')}</p>
            </details>
          </div>
        )}
      </div>

      {/* SECTION 2: Job Description Input */}
      {parsedData && (
        <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', background: '#1e1e1e', color: '#fff', marginBottom: '20px' }}>
          <h3>2. Target Job Description Core Analytics</h3>
          <textarea
            placeholder="Paste raw target job description copy here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            style={{ width: '100%', height: '150px', background: '#2d2d2d', color: '#fff', border: '1px solid #555', borderRadius: '4px', padding: '10px', boxSizing: 'border-box', marginBottom: '10px' }}
          />
          <button onClick={handleMatchAnalysis} disabled={matchLoading} style={{ width: '100%', padding: '10px', cursor: 'pointer', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            {matchLoading ? 'Gemini Evaluating Target Alignment...' : 'Analyze Role Compatibility'}
          </button>
        </div>
      )}

      {/* SECTION 3: Match Score Dashboard View */}
      {matchResult && (
        <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', background: '#1e1e1e', color: '#fff', marginBottom: '20px' }}>
          <h3>📊 Role Compatibility Engine Report</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginRight: '15px', color: matchResult.match_percentage >= 70 ? '#4caf50' : '#ff9800' }}>
              {matchResult.match_percentage}%
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Overall Match Score Matrix</p>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#4caf50' }}>💡 Matched Stack Alignments:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{matchResult.matched_skills.join(', ')}</p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#f44336' }}>⚠️ Missing Requirements / Skill Gaps:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{matchResult.missing_skills.join(', ')}</p>
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
            <button 
              onClick={handleStartInterviewPrep} 
              disabled={interviewLoading}
              style={{ width: '100%', padding: '12px', background: '#e91e63', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {interviewLoading ? 'Compiling Custom Challenge Questions...' : '🚀 Initialize Voice Prep Mock Interview Loop'}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: Practice Grid View + Live Feedback Response Engine */}
      {questionsPrep && (
        <div style={{ padding: '20px', border: '1px solid #e91e63', borderRadius: '8px', background: '#1c1115', color: '#fff' }}>
          <h3 style={{ marginTop: 0, color: '#e91e63' }}>🎯 Tailored Practice Challenges Generated</h3>
          
          {questionsPrep.questions.map((q) => (
            <div key={q.id} style={{ marginBottom: '25px', background: '#25181c', padding: '20px', borderRadius: '6px', borderLeft: '4px solid #e91e63' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', background: '#e91e63', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', marginRight: '8px' }}>
                  {q.category}
                </span>
                <span style={{ fontSize: '12px', color: '#aaa' }}>Focus Area: <strong>{q.target_skill}</strong></span>
              </div>
              
              <p style={{ margin: '15px 0', color: '#fff', fontSize: '16px', fontWeight: 'bold', fontStyle: 'italic' }}>
                "{q.question}"
              </p>

              {/* User Answer Typing Capture Box */}
              {!evaluations[q.id] && (
                <div>
                  <input 
                    type="text" 
                    placeholder="Type your response answer here to test grading mechanics..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    style={{ width: '100%', padding: '10px', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '10px' }}
                  />
                  <button 
                    onClick={() => handleAnswerSubmit(q.id, q.question, q.target_skill)}
                    disabled={evalLoading[q.id]}
                    style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {evalLoading[q.id] ? 'AI Assessment Grading...' : 'Submit Response Draft'}
                  </button>
                </div>
              )}

              {/* Dynamic Assessment Metrics Report Render */}
              {evaluations[q.id] && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#121214', borderRadius: '8px', border: '1px solid #2d2d30' }}>
                  
                  {/* Clean Grid Header with Score Ring Representation */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '15px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        fontSize: '22px', 
                        fontWeight: 'bold', 
                        color: evaluations[q.id].score >= 70 ? '#4caf50' : '#ff9800',
                        background: evaluations[q.id].score >= 70 ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        marginRight: '12px'
                      }}>
                        {evaluations[q.id].score}%
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>Evaluation Analytics</h5>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>AI Screen Score Matrix</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Split Layout for Strengths vs Weaknesses */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                    <div>
                      <strong style={{ color: '#4caf50', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ Key Strengths</strong>
                      <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', fontSize: '13px', color: '#bbb', lineHeight: '1.5' }}>
                        {evaluations[q.id].strengths.map((str: string, idx: number) => <li key={idx}>{str}</li>)}
                      </ul>
                    </div>
                    <div>
                      <strong style={{ color: '#f44336', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠️ Structural Gaps</strong>
                      <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', fontSize: '13px', color: '#bbb', lineHeight: '1.5' }}>
                        {evaluations[q.id].weaknesses.map((weak: string, idx: number) => <li key={idx}>{weak}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Single Line Coaching Alert Badge */}
                  <div style={{ background: '#1a1625', borderLeft: '3px solid #9c27b0', padding: '10px 12px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', color: '#d1c4e9', lineHeight: '1.4' }}>
                    <strong>💡 Pivot Strategy:</strong> {evaluations[q.id].constructive_feedback}
                  </div>
                  
                  {/* Dropdown Blueprint wrapper */}
                  <details style={{ borderTop: '1px solid #222', paddingTop: '12px' }}>
                    <summary style={{ color: '#2196f3', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', userSelect: 'none' }}>
                      View Ideal Answer Blueprint
                    </summary>
                    <p style={{ background: '#161b22', padding: '12px', borderRadius: '6px', fontStyle: 'italic', color: '#8b949e', fontSize: '13px', lineHeight: '1.5', marginTop: '10px', border: '1px solid #30363d' }}>
                      "{evaluations[q.id].ideal_answer_alternative}"
                    </p>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}