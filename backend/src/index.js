const restify = require('restify')

// iniciar o servidor
var server = restify.createServer({
  name: 'pratica-3'
})

// Array para armazenar os professores
let professores = []

// Middleware para permitir o parsing do corpo da requisição
server.use(restify.plugins.bodyParser())

// Endpoint para inserir um novo professor
server.post('/api/v1/professor/inserir', (req, res, next) => {
  const { nome, diciplina, email } = req.body

  // Simulação de inserção no banco de dados
  const novoProfessor = {
    id: professores.length + 1, // Simulação de um ID único
    nome,
    diciplina,
    email
  }

  professores.push(novoProfessor)

  res.send(201, novoProfessor)
  return next()
})

// Endpoint para listar todos os professores
server.get('/api/v1/professor/listar', (req, res, next) => {
  res.send(professores)
  return next()
})

// Endpoint para atualizar um professor existente
server.post('/api/v1/professor/atualizar', (req, res, next) => {
  const { id, nome, diciplina, email } = req.body

  const professorIndex = professores.findIndex(professor => professor.id === id)
  if (professorIndex === -1) {
    res.send(404, { message: 'Professor não encontrado' })
  } else {
    professores[professorIndex] = { id, nome, diciplina, email }
    res.send(200, professores[professorIndex])
  }

  return next()
})

// Endpoint para excluir um professores pelo ID
server.post('/api/v1/professor/excluir', (req, res, next) => {
  const { id } = req.body

  const professorIndex = professores.findIndex(professor => professor.id === id)
  if (professorIndex === -1) {
    res.send(404, { message: 'Professor não encontrado' })
  } else {
    professores.splice(professorIndex, 1)
    res.send(200, { message: 'Professor excluído com sucesso' })
  }

  return next()
})

// iniciar o servidor
var port = process.env.PORT || 5000
server.listen(port, function () {
  console.log(
    'Servidor iniciado',
    server.name,
    ' na url http://localhost:' + port
  )
})
