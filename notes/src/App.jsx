import { useState } from 'react'
import { useEffect } from 'react'
import './index.css'
import Note from './Note'
import noteService from './services/notes'
import Notification from './Notification'
import Footer from './Footer'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  const handleNoteChange = (e) => {
    setNewNote(e.target.value)
  }

  const addNote = (e) => {
    e.preventDefault()
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }

    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
        setNewNote('')
      })
  }

  const toggleImportance = (id) => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important}

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote))})
      .catch(error => {
        setErrorMessage(`Note '${note.content}' was already removed from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000);
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes )
      })
  }, [])

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage}/>
      <ul>
        {notes.map((note) => (
          <Note key={note.id} note={note} onClick={() => toggleImportance(note.id)}/>
        ))}
      </ul>
      <form>
        <input type="text" value={newNote} onChange={handleNoteChange}/>
        <button onClick={addNote}>Add Note</button>
      </form>
      <Footer />
    </div>
  )
}

export default App;
