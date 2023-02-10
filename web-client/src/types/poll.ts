import type { InferQueryOutput } from 'trpc/client/utils';

export type Poll = InferQueryOutput<'poll'>['inactivePolls']['polls'][0];
