import { useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { ALL_BOOKS, ALL_GENRES } from "../queries"

const Books = (props) => {
  const [genre, setGenre] = useState(null)
  const bookGenres = useQuery(ALL_GENRES)
  const books = useQuery(ALL_BOOKS, {
    variables: { genre }
  })

  useEffect(() => {
    books.refetch()
  }, [genre]) // eslint-disable-line

  if (!props.show) {
    return null
  }

  if (books.loading || bookGenres.loading) {
    return <div>loading...</div>
  }

  let genres = []
  bookGenres.data.allBooks
    .forEach(book => genres = genres.concat(book.genres))
  genres = [...new Set(genres)]
  
  return (
    <div>
      <h2>books</h2>
      {genre ? <p>in genre <b>{genre}</b></p> : null}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map(genre =>
          <button key={genre} onClick={() => setGenre(genre)}>{genre}</button>)}
      </div>
    </div>
  )
}

export default Books
