require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

app.get("/api/persons", (request, response) => {
  Person.find({}).then((person) => {
    response.json(person);
  });
});

morgan.token("myToken", (req, res) => {
  return JSON.stringify({
    name: req.body.name,
    number: req.body.number,
  });
});

app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-length] :myToken"
  )
);

const randomKey = () => {
  return Math.random(7);
};

// app.get("/api/persons", (request, response) => {
//   response.json(persons);
// });

app.get("/api/info", (request, response) => {
  let currentdate = new Date();
  let datetime =
    "Last Sync: " +
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();
  response.send(
    `<p>Phonebook has info for ${persons.length} people.</p> ${datetime}`
  );
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  const id = request.params.id;

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// the unknown endpoint handler responds to all requests with 404 unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  // handle error caused by invalid object id for Mongo
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  // handle input data error
  else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  // In all other error situations, the middleware passes the error forward to the default Express error handler.
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
