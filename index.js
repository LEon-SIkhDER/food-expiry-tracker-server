const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("Food Expiry Tracker Server Is running")
})

// 
// 

const uri = "mongodb+srv://food-expiry-tracker:h4hKGEHI9W5Y3AXg@cluster0.7hhwads.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const foodCollection = client.db("foodExpiryDb").collection("foods")

        app.get("/foods", async (req, res) => {
            const skip = Number(req.query.skip) || 0
            const limit = Number(req.query.limit) || 0
            const user = req.query.email
            const query = {}
            if (user) {
                query.userEmail = user
            }

            const total = await foodCollection.countDocuments(query);
            const result = await foodCollection.find(query).skip(skip).limit(limit).toArray()
            res.send({ result, total })
            // user ? res.send(result) : res.send({ result, total })
        })

        app.get("/foods/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query)
            res.send(result)

        })




        app.post("/foods", async (req, res) => {
            const data = req.body
            const result = await foodCollection.insertOne(data)
            res.send(result)
        })



        app.put("/foods/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const data = req.body
            const update = { $set: data }
            const result = await foodCollection.updateOne(query, update)
            res.send(result)
        })

        app.patch("/foods/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const data = req.body.notes

            const update = {
                $push: {
                    notes: data
                }
            }
            const options = { upsert: true }
            const result = await foodCollection.updateOne(query, update, options)
            res.send(result)




        })

        app.delete("/foods/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.deleteOne(query)
            res.send(result)
        })


















        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


































app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})
