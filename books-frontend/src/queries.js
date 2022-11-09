import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    } 
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

export const ME = gql`
  query {
    me {
      username
      favouriteGenre
    }
  }
`


export const ALL_BOOKS = gql`
  query($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
        born
        bookCount
      }
      published
      genres
    }
  }
`

export const ALL_GENRES = gql`
  query {
    allBooks {
      genres
    }
  }
`

export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!,
    $author: String!,
    $published: Int!,
    $genres: [String!]!
  ) {
      addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
      ) {
        title
        published
        genres
      }
  }
`

export const EDIT_AUTHOR = gql`
  mutation editBorn($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
      born
      id
    }
  }
`