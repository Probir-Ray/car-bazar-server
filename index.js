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


        // GET API: All Orders
        app.get('/allOrder', async(req, res) => {
          const cursor = orderCollection.find({});
          const orders = await cursor.toArray();
          res.send(orders);
        })

        
        // GET API: Manage Products
        app.get('/manageProducts', async(req, res) => {
          const cursor = productCollection.find({});
          const products = await cursor.toArray();
          res.send(products);
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
          res.send(order);
      })


        // Filter customer order
        app.get('/myOrders/:email', async (req, res) => {
          const result = await orderCollection.find({ email: req.params.email  }).toArray();
          res.send(result);
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


        // Update order status
        app.put('/statusUpdate/:id', async(req, res) => {
          const id = req.params.id;
          const filter = {_id: ObjectId(id)}
          const updateDoc = {$set: {status: true}};
          const result = await orderCollection.updateOne(filter, updateDoc);
          res.json(result);
        });


        // Delete API: Delete a Product
        app.delete('/products/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)}
          const result = await productCollection.deleteOne(query);
          res.json(result);
        });


        // Delete API: Delete an Order
        app.delete('/order/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)}
          const result = await orderCollection.deleteOne(query);
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