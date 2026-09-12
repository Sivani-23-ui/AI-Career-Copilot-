'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui';
import ProgressBar from '@/components/ui/ProgressBar';
import type { ResumeAnalysis } from '@/types';
import {
  FileText, Upload, CheckCircle, AlertCircle, Lightbulb,
  Loader2, X, File,
} from 'lucide-react';

type InputMode = 'pdf' | 'text';

export default function ResumePage() {
  const [mode, setMode] = useState<InputMode>('pdf');
  const [resumeText, setResumeText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLatest, setFetchingLatest] = useState(true);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [extractedChars, setExtractedChars] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/resume/latest')
      .then((res) => {
        const r = res.data.resume;
        if (r?.extractedData) {
          setAnalysis({
            ...r.extractedData,
            strengths: r.strengths,
            missingSkills: r.missingSkills,
            suggestions: r.suggestions,
            overallScore: r.overallScore,
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetchingLatest(false));
  }, []);

  // ── PDF selection ────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10 MB.');
      return;
    }
    setPdfFile(file);
    setExtractedChars(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File size must be under 10 MB.'); return; }
    setPdfFile(file);
    setExtractedChars(null);
  };

  const removeFile = () => {
    setPdfFile(null);
    setExtractedChars(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Analyze: PDF upload ──────────────────────────────────────
  const handleUploadAnalyze = async () => {
    if (!pdfFile) { toast.error('Please select a PDF file first.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', pdfFile);
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(res.data.analysis);
      setDemoMode(res.data.demoMode);
      setExtractedChars(res.data.extractedTextLength);
      // Update localStorage skills
      const stored = localStorage.getItem('user');
      if (stored && res.data.analysis?.skills?.length) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, skills: res.data.analysis.skills }));
      }
      toast.success(
        res.data.demoMode
          ? `Demo analysis complete! (${res.data.extractedTextLength} chars extracted)`
          : `PDF analysed successfully! (${res.data.extractedTextLength} chars extracted)`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'PDF analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Analyze: pasted text ─────────────────────────────────────
  const handleTextAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      toast.error('Please paste your resume text (at least 50 characters).');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/resume/analyze', { resumeText });
      setAnalysis(res.data.analysis);
      setDemoMode(res.data.demoMode);
      setExtractedChars(null);
      // Update localStorage skills
      const stored = localStorage.getItem('user');
      if (stored && res.data.analysis?.skills?.length) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, skills: res.data.analysis.skills }));
      }
      toast.success(res.data.demoMode ? 'Demo analysis complete!' : 'Resume analysed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => (mode === 'pdf' ? handleUploadAnalyze() : handleTextAnalyze());

  if (fetchingLatest) return <LoadingSpinner text="Loading resume data..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">Resume Analyzer</h1>
        <p className="section-subtitle">
          Upload your PDF resume or paste your resume text. AI will extract skills, highlight strengths, and suggest improvements.
        </p>
      </div>

      {/* ── Mode tabs ── */}
      <div className="flex gap-1 mb-5 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setMode('pdf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'pdf' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <File className="w-4 h-4" /> Upload PDF
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'text' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Paste Text
        </button>
      </div>

      {/* ── Input area ── */}
      <div className="card mb-6">
        {mode === 'pdf' ? (
          <>
            {/* Drop zone */}
            {!pdfFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-900">Click to upload or drag &amp; drop</p>
                  <p className="text-sm text-slate-500 mt-1">PDF only · Max 10 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              /* Selected file info */
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <File className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{pdfFile.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{formatBytes(pdfFile.size)}</p>
                  {extractedChars !== null && (
                    <p className="text-xs text-green-600 mt-1">✓ {extractedChars.toLocaleString()} characters extracted</p>
                  )}
                </div>
                <button
                  onClick={removeFile}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {pdfFile && (
              <p className="text-xs text-slate-400 mt-3">
                Text will be extracted automatically when you click &quot;Analyze Resume&quot;.
              </p>
            )}
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Paste Your Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={10}
              placeholder={`Paste your full resume here...\n\nExample:\nJane Smith\nEmail: jane@example.com\n\nEducation: B.Tech Computer Science, ABC University (2021-2025)\n\nSkills: Python, JavaScript, React, HTML, CSS\n\nExperience: Software Intern at XYZ (Jun-Aug 2023)...\n\nProjects: E-Commerce App, Weather Dashboard...`}
              className="input-field font-mono text-xs resize-none"
            />
            <span className="text-xs text-slate-400 mt-1 block">{resumeText.length} characters</span>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || (mode === 'pdf' && !pdfFile)}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Upload className="w-4 h-4" /> Analyze Resume</>
            )}
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {analysis && (
        <div className="space-y-5">
          {demoMode && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <span>🧪</span>
              <span>Demo mode — configure an AI API key for real analysis.</span>
            </div>
          )}

          {/* Score */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900">Resume Score</h2>
              <span className={`text-3xl font-bold ${analysis.overallScore >= 70 ? 'text-green-600' : analysis.overallScore >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                {analysis.overallScore}/100
              </span>
            </div>
            <ProgressBar
              value={analysis.overallScore}
              color={analysis.overallScore >= 70 ? 'bg-green-500' : analysis.overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}
              size="lg"
              showPercent={false}
            />
            <p className="text-xs text-slate-400 mt-2">This is an AI estimate, not an HR evaluation.</p>
          </div>

          {/* Skills */}
          {analysis.skills?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> Extracted Skills ({analysis.skills.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((s) => <span key={s} className="skill-tag skill-tag-blue">{s}</span>)}
              </div>
            </div>
          )}

          {/* Strengths */}
          {analysis.strengths?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> Strengths
              </h2>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-green-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing skills */}
          {analysis.missingSkills?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Skills to Develop
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((s) => <span key={s} className="skill-tag skill-tag-red">{s}</span>)}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-500" /> Improvement Suggestions
              </h2>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-blue-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education / Experience / Projects */}
          {(analysis.education?.length > 0 || analysis.experience?.length > 0 || analysis.projects?.length > 0) && (
            <div className="grid md:grid-cols-3 gap-5">
              {analysis.education?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">🎓 Education</h3>
                  <ul className="space-y-1">{analysis.education.map((e, i) => <li key={i} className="text-xs text-slate-600">{e}</li>)}</ul>
                </div>
              )}
              {analysis.experience?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">💼 Experience</h3>
                  <ul className="space-y-1">{analysis.experience.map((e, i) => <li key={i} className="text-xs text-slate-600">{e}</li>)}</ul>
                </div>
              )}
              {analysis.projects?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">🔨 Projects</h3>
                  <ul className="space-y-1">{analysis.projects.map((p, i) => <li key={i} className="text-xs text-slate-600">{p}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
