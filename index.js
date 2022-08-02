const express = require('express');
const App = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { ConnectionDB } = require('./Connection');
const fileupload = require('express-fileupload')


const port = process.env.PORT || 5000;

ConnectionDB();



App.use(fileupload({
    useTempFiles: true
}))
App.use(bodyParser.json())
App.use(cors());


App.get('/',(req,res)=>res.send("hello people"))

const userRoutes = require('./Routes/userRoutes')
App.use('/user',userRoutes)
const userActionRoutes = require('./Routes/userActionRoute')
App.use('/userActions',userActionRoutes)

App.listen(port,()=>console.log("Successfully connected to PORT",+port));
