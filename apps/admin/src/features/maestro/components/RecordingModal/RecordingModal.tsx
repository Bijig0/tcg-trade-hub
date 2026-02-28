import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import type { RecordingMeta, StepTimestamp } from '@/hooks/useRecording/useRecording';

type RecordingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pathId: string;
  recording: RecordingMeta | null;
  videoUrl: string | null;
  isRecording: boolean;
  onTriggerRecord: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  recordError: Error | null;
  /** Called when step changes during playback so parent can sync graph highlighting. */
  onStepChange?: (stepIndex: number) => void;
};

/** Finds which step is active at a given playback time. */
const findActiveStep = (
  currentMs: number,
  stepTimestamps: StepTimestamp[],
): number => {
  if (stepTimestamps.length === 0) return 0;

  let active = 0;
  for (const st of stepTimestamps) {
    if (currentMs >= st.timestampMs) {
      active = st.stepIndex;
    } else {
      break;
    }
  }
  return active;
};

const RecordingModal: FC<RecordingModalProps> = ({
  isOpen,
  onClose,
  pathId,
  recording,
  videoUrl,
  isRecording,
  onTriggerRecord,
  onDelete,
  isDeleting,
  recordError,
  onStepChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const animFrameRef = useRef<number>(0);

  // Track playback position and emit step changes
  const trackPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || !recording) return;

    const currentMs = video.currentTime * 1000;
    const step = findActiveStep(currentMs, recording.stepTimestamps);

    if (step !== currentStep) {
      setCurrentStep(step);
      onStepChange?.(step);
    }

    if (!video.paused && !video.ended) {
      animFrameRef.current = requestAnimationFrame(trackPlayback);
    }
  }, [recording, currentStep, onStepChange]);

  // Start/stop tracking on play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      animFrameRef.current = requestAnimationFrame(trackPlayback);
    };
    const onPause = () => {
      cancelAnimationFrame(animFrameRef.current);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onPause);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onPause);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [trackPlayback]);

  // Seek video to step timestamp
  const seekToStep = useCallback(
    (stepIndex: number) => {
      const video = videoRef.current;
      if (!video || !recording) return;

      const ts = recording.stepTimestamps.find(
        (s) => s.stepIndex === stepIndex,
      );
      if (ts) {
        video.currentTime = ts.timestampMs / 1000;
      }
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex);
    },
    [recording, onStepChange],
  );

  if (!isOpen) return null;

  const isGif = recording?.filename.endsWith('.gif');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recording: {pathId}
            </h2>
            {recording && (
              <p className="text-xs text-muted-foreground">
                {recording.stepTimestamps.length} step markers
                {recording.durationMs
                  ? ` / ${(recording.durationMs / 1000).toFixed(1)}s`
                  : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Video player */}
          <div className="flex flex-1 flex-col items-center justify-center bg-black/5 p-6 dark:bg-black/20">
            {recording && videoUrl ? (
              isGif ? (
                <img
                  src={videoUrl}
                  alt={`Recording of ${pathId}`}
                  className="max-h-[60vh] rounded-lg object-contain shadow-lg"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="max-h-[60vh] rounded-lg shadow-lg"
                >
                  <track kind="captions" />
                </video>
              )
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  No recording yet for this scenario.
                </p>
                <button
                  onClick={onTriggerRecord}
                  disabled={isRecording}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isRecording ? 'Recording...' : 'Record Now'}
                </button>
                {recordError && (
                  <p className="text-xs text-destructive">{recordError.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Right: Step timeline */}
          {recording && recording.stepTimestamps.length > 0 && (
            <div className="w-56 shrink-0 border-l border-border p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Steps
              </h3>
              <div className="space-y-1">
                {recording.stepTimestamps.map((st) => (
                  <button
                    key={st.stepIndex}
                    onClick={() => seekToStep(st.stepIndex)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      currentStep === st.stepIndex
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span
                      className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                        currentStep === st.stepIndex
                          ? 'bg-primary-foreground'
                          : 'bg-muted-foreground/40'
                      }`}
                    />
                    <span>Step {st.stepIndex}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {(st.timestampMs / 1000).toFixed(1)}s
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <div className="flex gap-2">
            {recording && (
              <>
                <button
                  onClick={onTriggerRecord}
                  disabled={isRecording}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  {isRecording ? 'Recording...' : 'Re-record'}
                </button>
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingModal;
export type { RecordingModalProps };
