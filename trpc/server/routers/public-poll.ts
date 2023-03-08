import { router } from 'server/init-tRPC';

const publicPollRouter = router({});

export default router({ publicPoll: publicPollRouter });
