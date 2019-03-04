const apiPort = process.env.PORT || 8080;

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {queryCar, changeCarOwner, createCar, queryAllCars} = require("./jeff");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS,PUT,PATCH,DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,Content-type,Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});
// app.use(express.static("../landing-page/public"));
app.enable("trust proxy");

app.get("/", (req, res)=> {
    res.sendStatus(200);

})
app.get("/queryCar/:numId", queryCar);
app.get("/queryAllCars", queryAllCars);
app.post("/createCar/:numId", createCar);
app.post("/changeCarOwner/:numId/:charge/:jailtime/:date", changeCarOwner);

app.listen(apiPort, () => {
    console.log(`Server is running at port ${apiPort}`);
});