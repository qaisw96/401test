'use strict';

// import environmental variables from .env file
require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// variables from .env 
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Application setup
const app = express();
const client = new pg.Client(DATABASE_URL);

// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));

app.set('view engine', 'ejs');

// Routes
app.get('/home', renderAllCharacter) // route to get data from api & render it to home(index)
app.post('/favorite-character' , storeToDB  ) // route just to save data & redirect to /character/my-favorite
app.get('/character/my-favorite', renderFavFromDB) // route to render data from DB


app.get('/character/:id', renderSingleCharacterToDetailsPage)
app.put('/character/:id', updateCharacter)
app.delete('/character/:id', deleteCharacter)


app.get('/characters/create', renderCreatePage)
app.post('/characters/create', saveCreatedCharacter)
app.get('/my-fav-created', getAllCreatedCharacters)

// CallBack function 
function renderAllCharacter(req, res) {

    const url = 'http://hp-api.herokuapp.com/api/characters';
    const arr = [];

    superagent.get(url).then(results => {
        
        results.body.forEach(obj => {
            arr.push(new Character(obj)) 
            
        });
        res.render('index', {characters: arr})
    })

}

function storeToDB(req, res) {
    const {name, house, patronus, alive} = req.body
    
    const insertQuery = 'INSERT INTO test_table(name, house, patronus, alive, add_by) VALUES($1, $2, $3, $4, $5);'
    const safeVal = [name, house, patronus, alive, 'api']

    client.query(insertQuery, safeVal).then(() => {
        res.redirect('/character/my-favorite')
    })

}

function renderFavFromDB(req, res) {
    const sql = 'SELECT * FROM test_table WHERE add_by=$1;'
    const val = ['api']

    client.query(sql, val).then(results => {
        res.render('my-favourite', {characters: results.rows})
    })
}

function renderSingleCharacterToDetailsPage(req, res) {
    const characterId = req.params.id
    
    const sql = 'SELECT * FROM test_table WHERE id=$1;'
    const val = [characterId]

    client.query(sql, val).then(results => {
        res.render('view-details', {character: results.rows})
    })

}

function updateCharacter(req, res) {

    const characterId = req.params.id
    const {name, house, patronus, status} = req.body
     const sql = 'UPDATE test_table SET name=$1, house=$2, patronus=$3, alive=$4 WHERE id=$5;'
     const val = [name, house, patronus, status, characterId]

     client.query(sql, val).then(() => {
         res.redirect(`/character/${characterId}`)
     })



}

function deleteCharacter(req, res) {
    const characterId = req.params.id

    const sql = 'DELETE FROM test_table WHERE id=$1;'
    const val = [characterId]

    client.query(sql, val).then(() => {
        res.redirect('/character/my-favorite')
    })
}

function renderCreatePage(req, res) {
    res.render('create-character.ejs');
}

function saveCreatedCharacter(req, res) {
    const {name, house, patronus, status} = req.body

    const sql = 'INSERT INTO test_table(name, house, patronus, alive, add_by) VALUES($1, $2, $3, $4, $5);'

    const val = [name, house, patronus, status, 'user']

    client.query(sql, val).then(() => {
        res.redirect('/my-fav-created')
    })
}

function getAllCreatedCharacters (req, res) {
    const sql = 'SELECT * FROM test_table WHERE add_by=$1;'
    const val = ['user']

    client.query(sql, val).then(results => {
        res.render('my-favourite', {characters: results.rows})
    })
}


// Constructor function 

function Character(character) {
    this.name = character.name
    this.house = character.house
    this.patronus = character.patronus ? character.patronus : 'there is no patronus'
    this.alive = character.alive

}








// listening to Port & DB 
client.connect().then(() => {
    console.log('connect DB');
    app.listen(PORT, () => console.log(`listening to ${PORT} .....`))
}).catch((error) => console.log(error));


app.use('*', (req, res) => res.send('route is not exist'))