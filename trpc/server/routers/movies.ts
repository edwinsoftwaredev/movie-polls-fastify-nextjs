import { router } from '../init-tRPC';

// TODO: Remove routes that are already public
const moviesRouter = router({});

export default router({ movies: moviesRouter });
