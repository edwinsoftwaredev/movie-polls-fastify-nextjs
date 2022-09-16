import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (req, res) => {
    const hasCsrfToken = !!req.session.get('_csrf');
    if (!hasCsrfToken) await res.generateCsrf();
  });
};

export default routes;
