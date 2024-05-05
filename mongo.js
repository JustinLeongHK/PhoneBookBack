const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model("Person", personSchema, "Persons");

const dbName = "PhoneBook";

const url = `mongodb://fullstake:${password}@ac-7dieby0-shard-00-00.imsbaws.mongodb.net:27017,ac-7dieby0-shard-00-01.imsbaws.mongodb.net:27017,ac-7dieby0-shard-00-02.imsbaws.mongodb.net:27017/${dbName}?ssl=true&replicaSet=atlas-st4rb8-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

if (name === undefined || number === undefined) {
  Person.find().then((result) => {
    result.forEach((note) => {
      console.log(note);
    });
    mongoose.connection.close();
    process.exit(0);
  });
} else {
  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((result) => {
    console.log(`Added ${result.name} number ${result.number} to PhoneBook`);
    mongoose.connection.close();
  });
}
