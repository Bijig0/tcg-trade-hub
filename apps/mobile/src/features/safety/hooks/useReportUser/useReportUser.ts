import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import type { ReportCategory } from '@tcg-trade-hub/database';

type ReportUserParams = {
  reportedUserId: string;
  reportedMessageId?: string | null;
  category: ReportCategory;
  description?: string | null;
};

/**
 * Hook that submits a report by inserting into the reports table.
 * Shows a success toast on completion.
 */
const useReportUser = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportedUserId,
      reportedMessageId,
      category,
      description,
    }: ReportUserParams) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reported_message_id: reportedMessageId ?? null,
        category,
        description: description?.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      Alert.alert('Report Submitted', 'Thank you. Our team will review your report.');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Failed to submit report');
    },
  });
};

export default useReportUser;
