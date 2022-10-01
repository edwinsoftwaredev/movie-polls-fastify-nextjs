import createRouter from 'trpc/createRouter';

export const account = createRouter().query('getUser', {
  resolve: async ({ input, ctx }) => {
    const {
      req,
      res,
      session: { userSession },
    } = ctx;
    return { userSession };
  },
});
