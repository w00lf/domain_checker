const Queue = require('bull');
const domainCheckQueue = new Queue('domain check');
const {
  setQueues
} = require('bull-board');
setQueues([domainCheckQueue]);
const app = require('express')()
const {
  UI
} = require('bull-board')

app.use('/admin/queues', UI)
app.listen(8282, () => {
  console.log(`Example app listening at http://localhost:8282`)
})