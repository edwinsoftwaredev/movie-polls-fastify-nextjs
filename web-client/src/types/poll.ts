import type { InferQueryOutput } from 'trpc/client/utils';

export type Poll = InferQueryOutput<'poll'>['getPoll']['poll'];
