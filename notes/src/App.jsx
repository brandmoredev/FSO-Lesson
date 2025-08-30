import { useRef, useState } from 'react'
import { useEffect } from 'react'
import './index.css'
import Note from './Note'
import noteService from './services/notes'
import Notification from './Notification'
import Footer from './Footer'
import loginService from './services/login'
import LoginForm from './LoginForm'
import Togglable from './Togglable'
import NoteForm from './NoteForm'

const App = () => {
  const [notes, setNotes] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)
  const noteFormRef = useRef()

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)

      window.localStorage.setItem('loggedNoteAppUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
    } catch {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility()
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
  }

  const toggleImportance = (id) => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important}

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote))})
      .catch(() => {
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

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const loginForm = () => (
    <Togglable buttonLabel="log in">
      <LoginForm login={handleLogin} />
    </Togglable>
  )
  
  const noteForm = () => (
    <Togglable buttonLabel="new note" ref={noteFormRef}>
      <NoteForm createNote={addNote} />
    </Togglable>
  )


  return (
    <div>
      <h1>Notes - AutoDeploy</h1>

      <Notification message={errorMessage}/>

      {user === null
        ? loginForm()
        : <div>
            <p>{user.username} logged in</p>
            {noteForm()}
          </div>
      }

      <h2>Notes</h2>
      <ul>
        {notes && notes?.map((note) => (
          <Note key={note.id} note={note} onClick={() => toggleImportance(note.id)}/>
        ))}
      </ul>

      <Footer />
    </div>
  )
}

export default App;
