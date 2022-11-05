import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries"
import { useQuery, useMutation } from "@apollo/client"
import { useState } from "react"

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  if (!props.show) {
    return null
  }

  const authors = useQuery(ALL_AUTHORS)  // eslint-disable-line 
  const [editBorn] = useMutation(EDIT_AUTHOR, { // eslint-disable-line 
    refetchQueries: [{query: ALL_AUTHORS}]
  }) 
  
  const setBirthyear = async (event) => {
    event.preventDefault()

    editBorn({
      variables: {
        name: name,
        born: Number(born)
      }
    })
    
    setName('')
    setBorn('')
  }

  if (authors.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={setBirthyear}>
        <div>
          name
          <input
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={e => setBorn(e.target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
