import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type StepTimestamp = {
  stepIndex: number;
  timestampMs: number;
};

type RecordingMeta = {
  id: number;
  pathId: string;
  filename: string;
  durationMs: number | null;
  stepTimestamps: StepTimestamp[];
  createdAt: string;
};

const GRAPH_SERVER_URL = 'http://localhost:4243';

const recordingKeys = {
  all: ['recordings'] as const,
  list: () => [...recordingKeys.all, 'list'] as const,
  detail: (pathId: string) => [...recordingKeys.all, 'detail', pathId] as const,
};

/** Fetches the list of all recording path IDs (lightweight). */
const useRecordingList = () =>
  useQuery({
    queryKey: recordingKeys.list(),
    queryFn: async (): Promise<RecordingMeta[]> => {
      const res = await fetch(`${GRAPH_SERVER_URL}/api/recordings`);
      if (!res.ok) throw new Error('Failed to fetch recordings');
      return res.json() as Promise<RecordingMeta[]>;
    },
    staleTime: 30_000,
  });

/** Fetches recording metadata + provides video URL for a specific path. */
const useRecording = (pathId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: recordingKeys.detail(pathId ?? ''),
    queryFn: async (): Promise<RecordingMeta> => {
      const res = await fetch(
        `${GRAPH_SERVER_URL}/api/recordings/${encodeURIComponent(pathId!)}`,
      );
      if (!res.ok) throw new Error('Recording not found');
      return res.json() as Promise<RecordingMeta>;
    },
    enabled: !!pathId,
  });

  const videoUrl = pathId
    ? `${GRAPH_SERVER_URL}/api/recordings/${encodeURIComponent(pathId)}/file`
    : null;

  const recordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${GRAPH_SERVER_URL}/api/recordings/${encodeURIComponent(pathId!)}/record`,
        { method: 'POST' },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error((err as { error: string }).error);
      }
      return res.json() as Promise<RecordingMeta>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordingKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${GRAPH_SERVER_URL}/api/recordings/${encodeURIComponent(pathId!)}`,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error('Failed to delete recording');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordingKeys.all });
    },
  });

  return {
    recording: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    videoUrl,
    triggerRecord: recordMutation.mutate,
    isRecording: recordMutation.isPending,
    recordError: recordMutation.error,
    deleteRecording: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export { useRecording, useRecordingList, recordingKeys };
export type { RecordingMeta, StepTimestamp };
