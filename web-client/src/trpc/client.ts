import type { AppRouter } from 'trpc/client';
import { createTRPCReact } from '@trpc/react-query';

// NOTE: Use on client side (web view)
const trpc = createTRPCReact<AppRouter>();

export default trpc;
