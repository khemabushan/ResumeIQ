"use client";

import { useState, useCallback } from "react";
import type { AnalysisResult, UploadStatus } from "@/types/analysis";
import { analyzeResume, MOCK_RESULT } from "@/lib/api";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export function useResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const reset = useCallback(() => {
    setFile(null);
    setJobDescription("");
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  const selectFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    setError(null);
    setFile(f);
    setStatus("idle");
    setResult(null);
  }, []);

  const analyze = useCallback(async () => {
    if (!file) return;
    setError(null);
    setStatus("uploading");
    setProgress(20);

    try {
      if (USE_MOCK) {
        // Simulate network latency in dev
        await new Promise((r) => setTimeout(r, 800));
        setProgress(60);
        setStatus("analyzing");
        await new Promise((r) => setTimeout(r, 1200));
        setProgress(100);
        setResult(MOCK_RESULT);
        setStatus("done");
        return;
      }

      setProgress(40);
      setStatus("analyzing");
      const data = await analyzeResume(file, jobDescription);
      setProgress(100);
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
      setProgress(0);
    }
  }, [file, jobDescription]);

  return {
    file,
    jobDescription,
    setJobDescription,
    status,
    result,
    error,
    progress,
    selectFile,
    analyze,
    reset,
  };
}
