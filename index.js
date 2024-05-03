const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

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

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

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

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const contact = persons.find((contact) => contact.id == id);
  if (contact) {
    response.json(contact);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((contact) => contact.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name && !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const conflict = persons.some((person) => person.name === body.name);

  if (conflict) {
    return response.status(409).json({ error: "name must be unique" });
  }

  const person = {
    id: randomKey(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
