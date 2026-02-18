import { os } from '../base';
import { PreRegistrationInsertSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';

export const create = os
  .input(PreRegistrationInsertSchema)
  .output(z.object({ success: z.boolean(), position: z.number() }))
  .handler(async ({ input, context }) => {
    const { supabase } = context;

    const { error } = await supabase
      .from('pre_registrations')
      .insert(input);

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation — email already registered, upsert instead
        const { error: upsertError } = await supabase
          .from('pre_registrations')
          .upsert(input, { onConflict: 'email' });

        if (upsertError) {
          throw new Error(`Failed to update registration: ${upsertError.message}`);
        }
      } else {
        throw new Error(`Failed to create registration: ${error.message}`);
      }
    }

    // Count registrations in the same area for position
    let query = supabase
      .from('pre_registrations')
      .select('id', { count: 'exact', head: true });

    if (input.zip_code) {
      query = query.eq('zip_code', input.zip_code);
    } else if (input.city) {
      query = query.eq('city', input.city);
    }

    const { count } = await query;

    return { success: true, position: count ?? 1 };
  });
