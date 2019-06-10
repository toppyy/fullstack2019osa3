
require('dotenv').config()
const express = require('express')
const app = express()


// static
app.use(express.static('build'))

// bodyparser
const bodyParser = require('body-parser')
app.use(bodyParser.json())



// morgan
const morgan = require('morgan')

// token for body
morgan.token('body', function (req, res) {  return req.method!=='POST' ? '' : JSON.stringify(req.body)  })

// cors
const cors = require('cors')
app.use(cors())



const logginFunction = function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.body(req,res)
    ].join(' ')
  }

app.use(morgan(logginFunction))

// db

const Person = require('./models/person')


// Data
let persons =  [
      {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
    ]
  
// API 
app.get('/API/persons', (request, response ,next) => {
    Person.find({}).then(persons => response.json(persons)).catch(error => next(error))
  })

// Single
app.get('/API/persons/:id', (request, response, next) => {

    
    Person.findById(request.params.id).then(person => {

      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    }).catch(error => next(error))

})

// Delete
app.delete('/API/persons/:id', (request, response, next) => {


    Person.findByIdAndDelete(request.params.id).then(person => {
      console.log('deleted',person)
      response.status(204).end()
    }).catch(error => next(error))


})

// Create new 

app.post('/api/persons',(request,response, next) => {

    // Check that name and number is posted
    if (!request.body.name | !request.body.number) {

    response.status(400).json({'error': 'must provide name and number'})

    }  
    // Try to find person and if found, update. Else create new.
    Person.findOneAndUpdate({ name: request.body.name}
                  ,{ name: request.body.name, number: request.body.number}
                  ,{ new: true, upsert: true} ) 
          .then(updatedPerson => {

            console.log('updated/created', updatedPerson)
            response.json(updatedPerson.toJSON())
              
    }).catch(error => next(error))
})

// Update


app.put('/api/persons/:id',(request,response, next) => {

  console.log('updating',request.body.name,request.body.number)

 
  // Try to find person and if found, update. Else create new.
  Person.findByIdAndUpdate(request.body.id
                ,{ name: request.body.name, number: request.body.number}
                ,{ new: true, upsert: false, useFindAndModify: false} ) 
        .then(updatedPerson => {

          console.log('updated', updatedPerson)
          response.json(updatedPerson.toJSON())
            
  }).catch(error => next(error))

})

// info
app.get('/info', (request, response, next) => {
    console.log(request)


    Person.find({}).then(persons => {
      let responsetext = '<p>Phonebook has info for ' + persons.length + ' persons.</p>' 
      responsetext += '<p>' + Date() + '</p>'    
      response.send(responsetext)

    }).catch(error => next(error))

    
  })


// error handler

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


// Mount

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})