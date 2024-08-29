const express = require("express");
const path = require("path");
const bp = require("body-parser");
const cors = require("cors");


const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json())

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
const dbPath = path.join(__dirname, "mydatabase.db");

let db = null;

const port = process.env.PORT || 5000;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//get all posts

app.get('/posts', async (req, res) => {
    try {
        const postsQuery = 'SELECT * FROM posts ORDER BY createdDate DESC';
        const posts= await db.all(postsQuery)
        res.send(posts)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
}
});

//get single post

app.get('/posts/:id', async (req, res) => {
    try{
        const getPostById=`select * from posts where id= ${req.params.id}`
        const postsById=await db.all(getPostById)
        if (!postsById.length) return res.status(404).json({ error: 'Post not found' });
        res.json(postsById[0]);
    }
    catch(err){
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});


app.get('/',(request,response)=>{
  response.send('hi')
})

app.post('/posts',async(request,response)=>{
    try {
        const { title, content } = request.body;
        const insertQuery = `INSERT INTO posts (title, content) VALUES ("${title}","${content}")`;
        const result= await db.run(insertQuery)
        response.status(201).json({ id: result.insertId, title, content });
    } catch (err) {
        response.status(500).json({ error: 'Failed to create post' });
    }

})


app.delete('/posts/:id', async (req, res) => {
    try {
        const deleteQuery=`DELETE FROM posts WHERE id = ${req.params.id}`
        const result=db.run(deleteQuery)
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});


app.put('/posts/:id', async (req, res) => {
  try {
      const { title, content } = req.body;
      const updateQuery=`update posts set title='${title}',content='${content}' where id=${req.params.id}`
      console.log(updateQuery)
      db.run(updateQuery)
      res.status(204).end();
  } catch (err) {
      res.status(500).json({ error: 'Failed to update post' });
  }
});





module.exports = app;