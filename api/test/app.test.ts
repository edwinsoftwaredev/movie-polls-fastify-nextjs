import Fastify from 'fastify';
import { test, expect, describe, beforeAll, afterAll } from 'vitest';
import { fetch } from 'undici';
import server from '../src/server';
const f = Fastify({
  logger: true,
});

f.register(server);

describe.concurrent('suite', async () => {
  const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 8080;
  const v1 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: 'ddc26480-ed32-4827-8846-3ba1348f154a',
    movieId: 550,
  };
  const v2 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: '0c98aa24-b0b7-4d29-9e5f-9f9cf29fb8f5',
    movieId: 550,
  };
  const v3 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: '48a3bf29-2514-4c90-97d5-5eab297bb724',
    movieId: 550,
  };
  const v4 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: '75bd9cd8-f582-4245-9db5-dd6f045d7e14',
    movieId: 550,
  };
  const v5 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: 'bf97e103-b7a5-4260-828e-1ee21825015c',
    movieId: 550,
  };
  const v6 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: 'c7087494-f547-4372-9eae-dfa69f00d340',
    movieId: 550,
  };
  const v7 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: 'c7704a2d-60be-47bc-a6bd-496e5ed2667f',
    movieId: 550,
  };
  const v8 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: 'ddba1441-64fa-43d2-9010-e73165fff607',
    movieId: 550,
  };
  const v9 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: 'e4bbe2d8-cf3e-4b06-a50d-5f37535545e0',
    movieId: 550,
  };
  const v10 = {
    pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
    votingTokenId: 'ede32d46-79bd-4727-9088-3c041cacb57e',
    movieId: 550,
  };

  const v11 = {
    pollId: 'eadb28d7-9a92-452a-b678-4434279e16ed',
    votingTokenId: '10fa4245-2fc8-490d-8cc3-3ebdd7d0f3d7',
    movieId: 550,
  };
  const v12 = {
    pollId: 'eadb28d7-9a92-452a-b678-4434279e16ed',
    votingTokenId: '1d064962-fc71-48f6-9bee-9ec2c6d045e4',
    movieId: 550,
  };
  const v13 = {
    pollId: 'eadb28d7-9a92-452a-b678-4434279e16ed',
    votingTokenId: '1d891e86-e62f-43a7-9148-146646d81ac5',
    movieId: 550,
  };
  const v14 = {
    pollId: 'eadb28d7-9a92-452a-b678-4434279e16ed',
    votingTokenId: '4c31d05c-ca1f-4b16-b6e7-aad11bf9c81c',
    movieId: 550,
  };
  const v15 = {
    pollId: 'eadb28d7-9a92-452a-b678-4434279e16ed',
    votingTokenId: '7280205e-f77b-40d7-b3f3-81b953b75255',
    movieId: 550,
  };

  beforeAll(async () => {
    f.listen({ port }, (err: any) => {
      if (err) {
        f.log.error(err);
        process.exit();
      }
    });
    await f.ready();
  });

  test.skip.each(new Array(500).fill(v1))('%j', async (a) => {
    const result = await fetch(
      `http://localhost:${port}/trpc/publicPollRoutes/publicPoll.vote`,
      {
        method: 'POST',
        body: JSON.stringify(a),
      }
    ).then((res) => res.json());

    expect(result).toMatchObject(
      expect.objectContaining({
        result: {
          data: {
            pollData: {
              id: 'ddc26480-ed32-4827-8846-3ba1348f154a',
              pollId: '0d4fffb8-ae15-476a-a0c6-fd4e346ca423',
              unused: false,
            },
          },
        },
      })
    );
  });

  test.skip.each([
    v1,
    v2,
    v3,
    v4,
    v5,
    v6,
    v7,
    v8,
    v9,
    v10,
    v11,
    v12,
    v13,
    v14,
    v15,
  ])('%j', async (a) => {
    const result = await fetch(
      `http://localhost:${port}/trpc/publicPollRoutes/publicPoll.vote`,
      {
        method: 'POST',
        body: JSON.stringify(a),
      }
    ).then((res) => res.json());

    expect(result).toMatchObject(
      expect.objectContaining({
        result: {
          data: {
            pollData: {
              id: a.votingTokenId,
              pollId: a.pollId,
              unused: false,
            },
          },
        },
      })
    );
  });
});
