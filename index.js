const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const admin = require("firebase-admin");
const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEYS, "base64").toString('utf-8')
const serviceAccount = JSON.parse(decoded)


const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.PORT || 3000



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});








app.get("/", (req, res) => {
    res.send("Food Expiry Tracker Server Is running")
})
const verifyToken = async (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1]

    try {
        const decoded = await admin.auth().verifyIdToken(token)
        req.decodedEmail = decoded.email
        next()

    }
    catch (error) {
        res.status(401).send({ message: "Unauthorized Access" })
    }
}



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.7hhwads.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
        // await client.connect();
        const foodCollection = client.db("foodExpiryDb").collection("foods")

        // all foods 
        app.get("/foods", async (req, res) => {
            const skip = Number(req.query.skip) || 0
            const limit = Number(req.query.limit) || 0



            const total = await foodCollection.countDocuments();
            const result = await foodCollection.find().skip(skip).limit(limit).toArray()

            res.send({ result, total })
        })

        // my items 
        app.get("/myItems", verifyToken, async (req, res) => {
            const user = req.query.email
            const skip = Number(req.query.skip)
            const limit = Number(req.query.limit)
            // tokens  
            // const token = req.headers.authorization.split(" ")[1]
            if (user !== req.decodedEmail) {
                return res.status(403).send({ message: "Authenticated but no permission" })
            }



            const query = { userEmail: user }

            const total = await foodCollection.countDocuments(query);
            const result = await foodCollection.find(query).skip(skip).limit(limit).toArray()

            res.send({ total, result })
        })


        // food details 
        app.get("/foods/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query)
            res.send(result)

        })
        // nearly expire 6 foods 
        app.get("/nearlyExpire", async (req, res) => {
            const limit = Number(req.query.limit) || 0
            const today = new Date().toISOString()

            const after5Days = new Date()
            after5Days.setDate(new Date().getDate() + 5)

            const after5DaysIso = after5Days.toISOString()

            const query = {
                $and: [
                    { expiryDate: { $lt: after5DaysIso } },
                    { expiryDate: { $gt: today } }
                ]
            }
            const result = await foodCollection.find(query).sort({ expiryDate: 1 }).limit(limit).toArray()
            res.send(result)
        })


        // search 
        app.get("/search", async (req, res) => {
            const search = req.query.search
            const query = { name: { $regex: search, $options: "i" } }
            const total = await foodCollection.countDocuments(query)
            const result = await foodCollection.find(query).limit(12).toArray()
            res.send({ result, total })
        })
        // category 
        app.get("/category", async (req, res) => {
            console.log(req.query.category)
            const query = { category: req.query.category }
            const total = await foodCollection.countDocuments(query)
            const result = await foodCollection.find(query).limit(12).toArray()
            res.send({ result, total })
        })


        // expire count 
        app.get("/expire-count", async (req, res) => {
            const today = new Date()
            const after5Days = new Date()
            after5Days.setDate(today.getDate() + 5)

            const expiredQuery = { expiryDate: { $lte: today.toISOString() } }

            const expirySoonQuery = {
                $and: [
                    { expiryDate: { $lt: after5Days.toISOString() } },
                    { expiryDate: { $gt: today.toISOString() } }
                ]
            }


            const expiredCount = await foodCollection.countDocuments(expiredQuery)
            const expirySoonCount = await foodCollection.countDocuments(expirySoonQuery)
            res.send({ expiredCount, expirySoonCount })




        })


        // add food 
        app.post("/foods", verifyToken, async (req, res) => {
            const data = req.body
            const result = await foodCollection.insertOne(data)
            res.send(result)
        })


        // update food 
        app.put("/foods/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const data = req.body
            const update = { $set: data }
            const result = await foodCollection.updateOne(query, update)
            res.send(result)
        })
        // add notes 
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
        // delete food 
        app.delete("/foods/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.deleteOne(query)
            res.send(result)
        })



















        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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
