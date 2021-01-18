const express = require('express');
const cors = require('cors');
const {uuid, isUuid} = require('uuidv4');
const crypto = require('crypto');
const { response } = require('express');

const app = express();
const logins = []

const dataCrypto = {
  algorithm: "aes256",
  key: "cryptographData",
  type: "hex"
}


app.use(express.json())
app.use(cors())


function titleString(string){
  let sentence = string.toLowerCase().split(" ")
  for(var i = 0; i < sentence.length; i++){
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }
  const value = sentence.join(" ")
  return value
}

function idIsValid(request, response, next){
  const {id} = request.params;
  if(!isUuid(id)){
    return response.status(400).json('Params is not valid ID');
  }
  return next();
}

function cryptography(password){
  const cipher = crypto.createCipher(dataCrypto.algorithm, dataCrypto.key);
  cipher.update(password);
  return cipher.final(dataCrypto.type);
}


app.get('/login', (request, response)=>{
  const {email, password} = request.body;
  const cryptPassw = cryptography(password);
  const exist = logins.find(login => login.email === email)

  if(!exist){return response.status(401).json({msg: "You do not have register"})}
  
  if(cryptPassw === exist.password && email === exist.email){
    return response.status(202).json({msg: true})
  }
  return response.status(203).json({msg: false})
})



app.post('/login', (request, response)=>{
  const {name, email, password} = request.body;
  const exist = logins.find(login => login.email === email);
  if (exist){
    return response.status(400).json({error: "This email has already exist"})
  }
  const cryptPassw = cryptography(password)
  const user = {id: uuid(), name, email, password: cryptPassw};
  logins.push(user);
  return response.status(201).json(user)
})


app.put('/login/alterpass', (request, response)=>{
  const {email, password} = request.body;
  const exist = logins.find(login => login.email === email);
  const userIndex = logins.findIndex(use => use.email === email);
  if (userIndex < 0){
    return response.status(400).json({error: "This email do not exist"});
  }
  if (exist.password === password){
    return response.status(200).json({msg: "Charge to a different password than the previous one"});
  }
  const cryptPassw = cryptography(password);
  const user = {id: exist.id, name: exist.name, email: exist.email, password: cryptPassw}
  logins[userIndex] = user;
  return response.status(201).json(user)
})







app.listen(3338);