var mongoose = require("mongoose");

mongoose.set("strictQuery", true);

// Connect to DB
mongoose.connect("mongodb+srv://aniframe20:dS2gjbUnyts0S6nW@cluster0.f5bhh4i.mongodb.net/AniFrames?retryWrites=true&w=majority");

// Event handlers for database connection
const db = mongoose.connection;

db.on("error", (error) => {
    console.error("DB : Error", error);
});

db.once("open", () => {
    console.log("DB : Connected");
});

module.exports = mongoose;
