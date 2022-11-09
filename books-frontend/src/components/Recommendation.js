import { useQuery } from "@apollo/client"
import { useState } from "react"
import { ALL_BOOKS, ME } from "../queries"

const Recommendation = ({ show, token }) => {
  const user = useQuery(ME)
  const books = useQuery(ALL_BOOKS)

  if (!show || !token) {
    return null
  }

  if (books.loading || user.loading) {
    return <div>loading...</div>
  }

  const genre = user.data.me.favouriteGenre
  const booksFiltered = books.data.allBooks.filter(b => b.genres.includes(genre))
  console.log(booksFiltered)
  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre <b>{genre}</b></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksFiltered.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendation