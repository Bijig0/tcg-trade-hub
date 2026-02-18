import { os as baseOs } from '@orpc/server';
import type { Context } from './context';

/** Base oRPC instance scoped to our context. */
export const os = baseOs.$context<Context>();
