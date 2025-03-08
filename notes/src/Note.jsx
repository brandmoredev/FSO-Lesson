const Note = ({ note, onClick }) => {
  const label = note.important
    ? 'make not important' : 'make important'

  return (
    <li className='note'>
      <span>{note.content}</span>
      <button onClick={onClick}>{label}</button>
    </li>
  )
}

export default Note
