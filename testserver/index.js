const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("*", (req, res) => {
    res.send();
    console.log(req.body);
})

app.listen(3003, (err) => {
    if (err) return

    console.log("listening on 3003")
});