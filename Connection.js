const mongoose = require("mongoose");
const mongoURL =
  "mongodb+srv://Tell-Us:Aspirine7@cluster0.ltnlfil.mongodb.net/test";

const ConnectionDB = async () => {
  try {
    const Connection = await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (Connection) console.log("Connected to DB");
    else console.log("Not Connected to DB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { ConnectionDB };