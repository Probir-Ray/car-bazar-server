const express = require('express')
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectID;
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
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');

        // GET API: All Products
        app.get('/allProducts', async(req, res) => {
          const cursor = productCollection.find({});
          const products = await cursor.toArray();
          res.send(products);
        })

        // GET API: All Review
        app.get('/review', async(req, res) => {
          const cursor = reviewCollection.find({});
          const review = await cursor.toArray();
          res.send(review);
        })

        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = {email};
          const user = await userCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin') {
            isAdmin = true;
          }
          res.json({admin: isAdmin});
        });

        // Filter data
        app.get('/purchase/:purchaseId', async (req, res) => {
          const id = req.params.purchaseId;
          const query = { _id: ObjectId(id) };
          const order = await productCollection.findOne(query);
          console.log('load id', id);
          res.send(order);
      })

        // Post API: Add new Product
        app.post('/products', async(req, res) => {
          const newProduct = req.body;
          const result = await productCollection.insertOne(newProduct);
          res.json(result);
        });


        // Add Orders API
        app.post('/orders', async (req, res) => {
          const order = req.body;
          const result = await orderCollection.insertOne(order);
          res.json(result);
        });

        // Post API: Add new Review
        app.post('/reviews', async(req, res) => {
          const newReview = req.body;
          const result = await reviewCollection.insertOne(newReview);
          res.json(result);
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