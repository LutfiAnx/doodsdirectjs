const express = require('express')
const app = express()
const path = require('path')
const port = 3001
// const processDoodstreamUrl = require('./controller/fetchController');
// const processController = require('./controller/processController');
const { processController } = require('./controller/processController')
const { processUrlController } = require('./controller/processUrlController')
const { processPopController } = require('./controller/processPopController')
const { processPopsController } = require('./controller/processPopsController')



const bodyParser = require('body-parser')

app.use(express.json())

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/main', (req,res) => {
    res.render('main.html')
})

app.get('/mainur', (req,res) => {
  res.render('mainur.html')
})

app.get('/mainpop', (req,res) => {
  res.render('mainpop.html')
})

app.get('/mainpops', (req,res) => {
  res.render('mainpops.html')
})


app.post('/fetch-link', async (req, res) => {
    const url = req.body.url;

    try {
        const result = await processController(url);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/fetch-link-url', async (req, res) => {
  const url = req.body.url;

  try {
      const result = await processUrlController(url);
      res.json({ result });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


app.post('/fetch-link-poop', async (req, res) => {
  const url = req.body.url;

  try {
      const result = await processPopController(url);
      res.json ({result});
  } catch (error) {
      res.status(500).json({error: error.message});
  }
})

app.post('/fetch-link-poops', async (req, res) => {
  const url = req.body.url;

  try {
      const result = await processPopsController(url);
      res.json ({result});
  } catch (error) {
      res.status(500).json({error: error.message});
  }
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
