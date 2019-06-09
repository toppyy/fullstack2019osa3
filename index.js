
const express = require('express')
const app = express()

// cors
const cors = require('cors')

app.use(cors())
// bodyparser
const bodyParser = require('body-parser')
app.use(bodyParser.json())

// static
app.use(express.static('build'))

// morgan
const morgan = require('morgan')

// token for body
morgan.token('body', function (req, res) {  return req.method!=='POST' ? '' : JSON.stringify(req.body)  })


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
app.get('/API/persons', (request, response) => {
    response.json(persons)
  })

// Single
app.get('/API/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    
    if (!person) {
        response.status(404).end()
    } else {
        response.json(person)
    }

})

// Delete
app.delete('/API/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)

    if (!person) {
        response.status(404).end()
    } else {
        persons = persons.filter(p => p.id !== id)
        response.status(204).end()
    }

})


app.post('/api/persons',(request,response) => {

    
    let isNameAlready = persons.find(p => p.name === request.body.name) !== undefined
    let isNumberAlready = persons.find(p => p.number === request.body.number) !== undefined
   
    // Check that name and number is posted
    if (!request.body.name | !request.body.number) {

        response.status(400).json({'error': 'must provide name and number'})

    } else  if (isNameAlready) { // Check for existing listings

        response.status(400).json({'error': 'name already listed'})

    } else if (isNumberAlready) {

        response.status(400).json({'error': 'number already listed'})

    } else { // All checks passed
        let newPerson =      {
        name: request.body.name,
        number: request.body.number,
        id:  Math.floor(Math.random() * Math.floor(9999999))

        }

        persons.push(newPerson)

        response.json(newPerson)
    }

})

// info
app.get('/info', (request, response) => {
    console.log(request)

    let responsetext = '<p>Phonebook has info for ' + persons.length + ' persons.</p>' 
    responsetext += '<p>' + Date() + '</p>'    
    response.send(responsetext)
  })

// Mount

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})