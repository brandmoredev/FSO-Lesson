import { useState } from 'react'
import { useEffect } from 'react'
import './index.css'
import Note from './Note'
import noteService from './services/notes'
import Notification from './Notification'
import Footer from './Footer'
import loginService from './services/login'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const handleLogin = async e => {
    e.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password
      })

      window.localStorage.setItem('loggedNoteAppUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

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
  })

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
        </label>
      </div>
      <div>
        <label>
          password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  )
  
  const noteForm = () => (
    <form>
      <input type="text" value={newNote} onChange={handleNoteChange}/>
      <button onClick={addNote}>Add Note</button>
    </form>
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
