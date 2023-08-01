async function routes(fastify, options) {
    // Testing route
    fastify.get('/', async (request, reply) => {
        return { hello: 'world' };
    });

    // INIT TABLE. Launch just once to create the table
    fastify.get('/initDB', (req, reply) => {
        fastify.pg.connect(onConnect);
        function onConnect(err, client, release) {
            if (err) return reply.send(err);
            client.query(
                'CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL PRIMARY KEY,"name" varchar(30),"description" varchar(30),"tweets" integer);',
                function onResult(err, result) {
                    release();
                    reply.send(err || result);
                }
            );
        }
    });

    //GET AL USERS

    fastify.route({
        method: 'GET',
        url: '/users',
        handler: async function (request, reply) {
            try {
                const client = await fastify.pg.connect();
                const result = await client.query('SELECT * FROM users');
                client.release();
                reply.send(result.rows);
            } catch (err) {
                reply.send(err);
            }
        },
    });


    //GET ONE USER if exists
    fastify.route({
        method: 'GET',
        url: '/users/:id',
        handler: async function (request, reply) {
            try {
                const client = await fastify.pg.connect();
                const result = await client.query('SELECT * FROM users WHERE id = $1', [request.params.id]);
                client.release();
                reply.send(result.rows[0]);
            } catch (err) {
                reply.send(err);
            }
        },
    });

    //Create users
    fastify.route({
        method: 'POST',
        url: '/users',
        handler: async function (request, reply) {
            try {
                const client = await fastify.pg.connect();
                const newUser = request.body;
                const result = await client.query('INSERT into users (name, description, tweets) VALUES ($1, $2, $3) RETURNING *', [
                    newUser.name,
                    newUser.description,
                    newUser.tweets,
                ]);
                client.release();
                reply.send(result.rows[0]);
            } catch (err) {
                reply.send(err);
            }
        },
    });

    //UPDATE ONE USER fields
    fastify.route({
        method: 'PUT',
        url: '/users/:id',
        handler: async function (request, reply) {
            try {
                const client = await fastify.pg.connect();
                const oldUserReq = await client.query('SELECT * FROM users WHERE id = $1', [request.params.id]);
                const oldUser = oldUserReq.rows[0];

                const name = request.body.name || oldUser.name;
                const description = request.body.description || oldUser.description;
                const tweets = request.body.tweets || oldUser.tweets;

                await client.query(
                    'UPDATE users SET name = $1, description = $2, tweets = $3 WHERE id = $4',
                    [name, description, tweets, request.params.id]
                );

                client.release();
                reply.send(`Updated: ${request.params.id}`);
            } catch (err) {
                reply.send(err);
            }
        },
    });

    //DELETE ONE USER if exists
    fastify.route({
        method: 'DELETE',
        url: '/users/:id',
        handler: async function (request, reply) {
            try {
                const client = await fastify.pg.connect();
                await client.query('DELETE FROM users WHERE id = $1', [request.params.id]);
                client.release();
                reply.send(`Deleted: ${request.params.id}`);
            } catch (err) {
                reply.send(err);
            }
        },
    });
}

module.exports = routes;