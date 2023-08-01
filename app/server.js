
const fastify = require('fastify')({ logger: true });
const routes =  require('./routes')
const fastifyPostgres = require('@fastify/postgres');


fastify.register(fastifyPostgres, {
    connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_SERVICE}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
});



fastify.register(routes);

// run the server

const start = async () => {
    try {
        await fastify.listen(3000, '0.0.0.0');
        console.log(`Serveur en écoute sur le port ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();