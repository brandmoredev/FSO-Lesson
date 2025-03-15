require('dotenv').config()

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('dist'));

const cors = require('cors');
app.use(cors());

const Note = require('./models/note')

const requestLogger = (request, response, next) => {
  console.log('Method', request.method)
  console.log('Path', request.path)
  console.log('Body', request.body)
  console.log('---')
  next();
}

app.use(requestLogger);

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  
  Note.findById(id).then(note => {
    response.json(note)
  })
})

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  notes = notes.filter(note => note.id !== id);

  response.status(204).end();
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(note => Number(note.id)))
    : 0;

  return String(maxId + 1);
}
app.post('/api/notes', (request, response) => {
  const body = request.body;

  if(!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.put('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  const body = request.body;

  const note = notes.find(note => note.id === id);
  if (!note) {
    return response.status(404).end();
  }

  const updatedNote = {
    ...note,
    important: body.important
  }

  notes = notes.map(note => note.id !== id ? note : updatedNote);

  response.json(updatedNote);
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint);