const express = require('express') // import express
const bodyParser = require('body-parser') // import body-parser
const {graphqlHTTP} = require('express-graphql') // import graphql to use as middleware
const { buildSchema } = require('graphql') // import the function to build our schema

const app = express() // create express server

const blogs = []; // create an array of the Blogs we will store. This is temporary until we start using MongoDB.

app.use(bodyParser.json()) // use body-parser middleware to parse incoming json

app.use('/graphql', graphqlHTTP({ // set up our graphql endpoint with the express-graphql middleware
    // build a graphql schema
    schema: buildSchema(`
        type Blog {
            _id: ID!
            title: String!
            text: String!
            description: String!
            date: String
        }

        input BlogInput {
            title: String!
            text: String!
            description: String!
            date: String
        }


        type blogQuery {
            blogs: [Blog!]!
        }

        type blogMutation {
            createBlog(blogInput: BlogInput): Blog
        }

        schema {
            query: blogQuery
            mutation: blogMutation
        }
    `),
    rootValue: {
      blogs: () => {

        // return all the blogs unfiltered using Model
        return Blog.find().then(blogs => {
            return blogs
        }).catch(err => {
            throw err
        })
      },
      createBlog: (args) => {

          const blog = new Blog({
              title: args.blogInput.title,
              text: args.blogInput.text,
              description: args.blogInput.description,
              date: new Date()
          })

          // save new blog using model which will save in MongoDB
          return blog.save().then(result => {
              console.log(result)
              return result
          }).catch(err => {
              console.log(err)
              throw err
          })
      }
    }, // an object with resolver functions
    graphiql: true // enable the graphiql interface to test our queries
}))

app.listen(5000) // setup server to run on port 5000