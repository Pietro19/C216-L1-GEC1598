const restify = require('restify')
const { Pool } = require('pg')

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres', // Usuário do banco de dados
  host: process.env.POSTGRES_HOST || 'db', // Este é o nome do serviço do banco de dados no Docker Compose
  database: process.env.POSTGRES_DB || 'livros',
  password: process.env.POSTGRES_PASSWORD || 'password', // Senha do banco de dados
  port: process.env.POSTGRES_PORT || 5432
})

// iniciar o servidor
var server = restify.createServer({
  name: 'pratica-Final'
})

// Iniciando o banco de dados
async function initDatabase() {
  try {
    await pool.query('DROP TABLE IF EXISTS livros')
    await pool.query(
      'CREATE TABLE IF NOT EXISTS livros (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, autor VARCHAR(255) NOT NULL, genero VARCHAR(255) NOT NULL)'
    )
    console.log('Banco de dados inicializado com sucesso')
  } catch (error) {
    console.error(
      'Erro ao iniciar o banco de dados, tentando novamente em 5 segundos:',
      error
    )
    setTimeout(initDatabase, 5000)
  }
}
// Middleware para permitir o parsing do corpo da requisição
server.use(restify.plugins.bodyParser())

// Endpoint para inserir um novo livro
server.post('/api/v1/livro/inserir', async (req, res, next) => {
  const { nome, autor, genero } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO livros (nome, autor, genero) VALUES ($1, $2, $3) RETURNING *',
      [nome, autor, genero]
    )
    res.send(201, result.rows[0])
    console.log('livro inserido com sucesso:', result.rows[0])
  } catch (error) {
    console.error('Erro ao inserir livro:', error)
    res.send(500, { message: 'Erro ao inserir livro' })
  }
  return next()
})

// Endpoint para listar todos os livros
server.get('/api/v1/livro/listar', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM livros')
    res.send(result.rows)
    console.log('livros encontrados:', result.rows)
  } catch (error) {
    console.error('Erro ao listar livros:', error)
    res.send(500, { message: 'Erro ao listar livros' })
  }
  return next()
})

// Endpoint para atualizar um livro existente
server.post('/api/v1/livro/atualizar', async (req, res, next) => {
  const { id, nome, autor, genero } = req.body

  try {
    const result = await pool.query(
      'UPDATE livros SET nome = $1, autor = $2, genero = $3 WHERE id = $4 RETURNING *',
      [nome, autor, genero, id]
    )
    if (result.rowCount === 0) {
      res.send(404, { message: 'livro não encontrado' })
    } else {
      res.send(200, result.rows[0])
      console.log('livro atualizado com sucesso:', result.rows[0])
    }
  } catch (error) {
    console.error('Erro ao atualizar livro:', error)
    res.send(500, { message: 'Erro ao atualizar livro' })
  }

  return next()
})

// Endpoint para excluir um livro pelo ID
server.post('/api/v1/livro/excluir', async (req, res, next) => {
  const { id } = req.body

  try {
    const result = await pool.query('DELETE FROM livros WHERE id = $1', [id])
    if (result.rowCount === 0) {
      res.send(404, { message: 'livro não encontrado' })
    } else {
      res.send(200, { message: 'livro excluído com sucesso' })
      console.log('livro excluído com sucesso')
    }
  } catch (error) {
    console.error('Erro ao excluir livro:', error)
    res.send(500, { message: 'Erro ao excluir livro' })
  }

  return next()
})
// endpoint para resetar o banco de dados
server.del('/api/v1/database/reset', async (req, res, next) => {
  try {
    await pool.query('DROP TABLE IF EXISTS livros')
    await pool.query(
      'CREATE TABLE livros (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, autor VARCHAR(255) NOT NULL, genero VARCHAR(255) NOT NULL)'
    )
    res.send(200, { message: 'Banco de dados resetado com sucesso' })
    console.log('Banco de dados resetado com sucesso')
  } catch (error) {
    console.error('Erro ao resetar o banco de dados:', error)
    res.send(500, { message: 'Erro ao resetar o banco de dados' })
  }

  return next()
})
// iniciar o servidor
var port = process.env.PORT || 5000
// configurando o CORS
server.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  )
  if (req.method === 'OPTIONS') {
    res.send(200)
  } else {
    next()
  }
})
server.listen(port, function () {
  console.log(
    'Servidor iniciado',
    server.name,
    ' na url http://localhost:' + port
  )
  // Iniciando o banco de dados
  console.log('Iniciando o banco de dados')
  initDatabase()
})
