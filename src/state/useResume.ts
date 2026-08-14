import { useEffect, useState } from 'react';
import { getResume, type ResumePoint } from '../lib/resumeState';

// Reads the saved resume point once on mount. The reading screen writes it as you
// pray and clears it on completion, so the landing page reflects the latest state
// whenever it (re)mounts. null when there's nothing to resume.
export function useResume(): ResumePoint | null {
  const [resume, setResume] = useState<ResumePoint | null>(null);
  useEffect(() => {
    setResume(getResume());
  }, []);
  return resume;
}
