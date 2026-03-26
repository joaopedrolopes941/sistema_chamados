import Fastify from 'fastify'
import { Pool } from 'pg'

const servidor = Fastify();

const sql = new Pool({
    user: "postgres",
    password: "senai",
    host: "localhost",
    port: 5432,
    database: "sistema_chamados"
})

servidor.post('/chamados', async (request, reply) => {
    const body = request.body

    if (!body || !body.titulo || !body.id_usuario) {
        return reply.status(400).send({
            message: "titulo e id_usuario obrigatórios"
        })
    }

    const usuario = await sql.query(
        'SELECT * FROM usuarios WHERE id = $1',
        [body.id_usuario]
    )

    if (usuario.rows.length === 0) {
        return reply.status(404).send({
            message: "usuário não encontrado"
        })
    }

    const resultado = await sql.query(
        'INSERT INTO chamados (titulo, descricao, id_usuario) VALUES ($1, $2, $3) RETURNING *',
        [body.titulo, body.descricao, body.id_usuario]
    )

    if (resultado.rows.length === 0) {
        reply.status(400).send({
            message: "Erro ao criar chamado"
        })
    } else if (resultado.rows.length === 1) {
        reply.status(201).send({
            message: "Chamado criado com sucesso"
        })
    }
})

servidor.listen({
    port: 3000
})