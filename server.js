const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

const dbUri = 'mongodb+srv://user:user@cluster0.3mjbf.mongodb.net/chatApp?retryWrites=true&w=majority';

let messages = [
    { name: 'Tim', message: 'Hi' },
    { name: 'Jane', message: 'Hello' }
]

const Message = mongoose.model('message', {
    name:'string',
    message:'string'
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, data) => {
        if(err){
            res.sendStatus(500);
        }else{
            res.send(data);
        }
    })
})

app.post('/messages', (req, res) => {
    let message = new Message(req.body);
    message.save((err) =>{
        if(err){
            res.sendStatus(500);
        }else{
            messages.push(req.body);
            io.emit('message', req.body);
            res.sendStatus(200);
        }
    })   
})

io.on('connection', (socket) => {
    console.log('a user connected');
})


const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}
mongoose.connect(dbUri,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

const server = http.listen(3000, ()=>{
    console.log('server is listening on port', server.address().port)
})