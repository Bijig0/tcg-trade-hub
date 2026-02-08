import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button/Button';
import { MAX_RATING_COMMENT_LENGTH } from '@/config/constants';
import { meetupKeys } from '../../queryKeys';
import { profileKeys } from '../../../profile/queryKeys';

export type RatingModalProps = {
  visible: boolean;
  onClose: () => void;
  meetupId: string;
  rateeId: string;
};

/**
 * Modal for rating a trade partner after both users complete a meetup.
 * Provides 1-5 star selection and an optional comment (max 200 chars).
 */
const RatingModal = ({ visible, onClose, meetupId, rateeId }: RatingModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const submitRating = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (score < 1 || score > 5) throw new Error('Please select a rating');

      const { error } = await supabase.from('ratings').insert({
        meetup_id: meetupId,
        rater_id: user.id,
        ratee_id: rateeId,
        score,
        comment: comment.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
      queryClient.invalidateQueries({ queryKey: meetupKeys.detail(meetupId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.ratings(rateeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.publicProfile(rateeId) });
      setScore(0);
      setComment('');
      onClose();
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Failed to submit rating');
    },
  });

  const handleClose = () => {
    setScore(0);
    setComment('');
    onClose();
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        onPress={handleClose}
        className="flex-1 items-center justify-center bg-black/50"
      >
        <Pressable
          onPress={() => {}}
          className="mx-6 w-[85%] rounded-xl border border-border bg-card p-6"
        >
          <Text className="mb-2 text-center text-xl font-bold text-card-foreground">
            Rate Your Trade
          </Text>

          <Text className="mb-6 text-center text-sm text-muted-foreground">
            How was your experience?
          </Text>

          {/* Star rating */}
          <View className="mb-6 flex-row items-center justify-center gap-2">
            {stars.map((star) => (
              <Pressable
                key={star}
                onPress={() => setScore(star)}
                className="p-1"
              >
                <Text
                  className={cn(
                    'text-3xl',
                    star <= score ? 'text-yellow-400' : 'text-muted',
                  )}
                >
                  {star <= score ? '\u2605' : '\u2606'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Comment input */}
          <View className="mb-6 gap-1.5">
            <Text className="text-sm font-medium text-foreground">
              Comment (optional)
            </Text>
            <TextInput
              value={comment}
              onChangeText={(text) => setComment(text.slice(0, MAX_RATING_COMMENT_LENGTH))}
              placeholder="How was the trade?"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              className="min-h-[80px] rounded-lg border border-input bg-background p-3 text-base text-foreground"
              textAlignVertical="top"
            />
            <Text className="text-right text-xs text-muted-foreground">
              {comment.length}/{MAX_RATING_COMMENT_LENGTH}
            </Text>
          </View>

          {/* Actions */}
          <View className="gap-3">
            <Button
              onPress={() => submitRating.mutate()}
              disabled={score === 0 || submitRating.isPending}
            >
              <Text className="text-base font-semibold text-primary-foreground">
                {submitRating.isPending ? 'Submitting...' : 'Submit Rating'}
              </Text>
            </Button>

            <Button variant="ghost" onPress={handleClose}>
              <Text className="text-base font-medium text-muted-foreground">Skip</Text>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RatingModal;
