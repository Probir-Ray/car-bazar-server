const express = require('express')
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xrfjl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('car_bazar');
        const userCollection = database.collection('users');

        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = {email};
          const user = await userCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin') {
            isAdmin = true;
          }
          res.json({admin: isAdmin});
        })

        // Add new user to db
        app.post('/users', async(req, res) => {
          const user = req.body;
          const result = await userCollection.insertOne(user);
          res.json(result);
          console.log(result);
        });

        // Make admin method
        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email}
          const updateDoc = {$set: {role: 'admin'}};
          const result = await userCollection.updateOne(filter, updateDoc);
          res.json(result);
        });

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})