const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'SECRET'
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

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    name: String!
    bookCount: Int!
    id: ID!
    born: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      favouriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        const books = await Book
          .find({})
          .populate('author')
        return books
      }
      else if (args.author) {
        const books = await Book.find({})
        return books.filter(b => b.author.name === args.name)
      }
      else {
        const books = await Book
          .find({ genres: { $in: [args.genre] } })
          .populate('author')
        return books
      }
    }, 
    allAuthors: async () => {
      return Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (context.currentUser) {
        const author = await Author.findOne({name: args.author})
        if (!author) {
          try {
            const newAuthor = new Author({
              name: args.author,
              born: null,
              bookCount: 1
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
            author.bookCount += 1
            await author.save()
            const book = new Book({ ...args, author: author._id })
            await book.save()
            return book
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args
            })
          }
        }
      }
      else {
        throw new AuthenticationError('not authenticated')
      }
    },
    editAuthor: async (root, args, context) => {
      if (context.currentUser) {
        const author = await Author.findOne({ name: args.name })
      
        if (author) {
          try {
            author.born = args.setBornTo
            await author.save()
          } catch (error) {
            throw new UserInputError(error.messag, {
              invalidArgs: args
            })
          }
        }
        
        return author
      }
      else {
        throw new AuthenticationError('not authenticated')
      }
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre })
      
      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'password') {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})