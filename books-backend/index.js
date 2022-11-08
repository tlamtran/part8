const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/Book')
const Author = require('./models/Author')

const MONGODB_URI = 'mongodb+srv://fullstack:fullstack@cluster0.gxl4vxp.mongodb.net/library?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB', MONGODB_URI)
  })


const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    bookCount: Int!
    id: ID!
    born: Int
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({})
      if (!args.author && !args.genre) {
        return books
      }
      else if (args.author) {
        return books.filter(b => b.author.name === args.name)
      }
      else {
        return books.filter(b => b.genres.includes(args.genre))
      }
    }, 
    allAuthors: async () => {
      const map = new Map()
      const books = await Book.find({})
      const authors = await Author.find({})

      books.forEach(b => {
        if (map.has(b.author)) {
          map.set(b.author, map.get(b.author) + 1)
        }
        else {
          map.set(b.author, 1)
        }
      })
      authors.forEach(a => a.bookCount = map.get(a.name))
      return authors
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      const author = await Author.findOne({name: args.author})
      if (!author) {
        try {
          const newAuthor = new Author({
            name: args.author,
            born: null,
          })
          const response = await newAuthor.save()
          const book = new Book({ ...args, author: response._id })
          await book.save()
          return book
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }

      }
      else {
        try {
          const book = new Book({ ...args, author: author._id })
          await book.save()
          return book
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      }
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.messag, {
          invalidArgs: args
        })
      }
      
      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})