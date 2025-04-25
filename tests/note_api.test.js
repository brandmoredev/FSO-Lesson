const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const Note = require('../models/note')
const User = require('../models/user')
const mongoose = require('mongoose')
const helper = require('../tests/test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)


describe('when there are some notes saved initially', () => {
  let testUser

  beforeEach(async () => {
    await Note.deleteMany({})
    await User.deleteMany({})
    
    testUser = new User({ username: 'testuser', name: 'Test User', passwordHash: 'hashedpw' })
    await testUser.save()

    const notesWithUser = helper.initialNotes.map(note => {
      return { ...note, user: testUser._id }
    })

    await Note.insertMany(notesWithUser)
  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')
  
    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })
  
  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')
  
    const contents = response.body.map(e => e.content)
    assert.strictEqual(contents.includes('HTML is easy'), true)
  })
  
  describe('viewing a specific note', () => {

    test('succeeds with a valid id', async () => {
      const notesAtStart = await helper.notesInDb()
    
      const noteToView = notesAtStart[0]
    
      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
      assert.deepStrictEqual(resultNote.body, noteToView)
    })

    test('fails with statuscode 404 if note does not exists', async () => {
      const validNoneExistingId = await helper.nonExistingId()

      await api
        .get(`/api/notes/${validNoneExistingId}`)
        .expect(404)
    })
  })

  describe('addition of new note', () => {

    test('succeeds with a valid data', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
        userId: testUser._id.toString()
      }
    
      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const response = await api.get('/api/notes')
    
      const contents = response.body.map(r => r.content)
    
      assert.strictEqual(response.body.length, helper.initialNotes.length + 1)
    
      assert(contents.includes('async/await simplifies making async calls'))
    })

    test('fails with status code 400 if data is invalid', async () => {
      const newNote = {
        important: true,
        userId: testUser._id.toString()
      }
    
      await api
        .post('/api/notes')
        .send(newNote)
        .expect(400)
    
      const response = await api.get('/api/notes')
    
      assert.strictEqual(response.body.length, helper.initialNotes.length)
    })
  })
  
  describe('deletion of a note', () => {

    test('succeeds with status code 204 if id is valid', async () =>{
      const notesAtStart = await helper.notesInDb()
      const noteToDelete = notesAtStart[0]
    
      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)
    
      const notesAtEnd = await helper.notesInDb()
    
      const contents = notesAtEnd.map(r => r.content)
      assert(!contents.includes(noteToDelete.content))
    
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
    })
  })
  
})


after(async () => {
  mongoose.connection.close()
})