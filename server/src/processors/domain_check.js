require('dotenv').config()

const Queue = require('bull');
const domainCheckQueue = new Queue('domain check');
const puppeteer = require('puppeteer');
const {
  Domain,
  DomainCheck
} = require('../../models/index');
const {
  RedisPubSub
} = require('graphql-redis-subscriptions');
const pubsub = new RedisPubSub();
const {
  modelUploadPath
} = require('../upload_helpers');
const path = require('path');

const updateDomainCheck = async (parent, args, context, _info) => {
  let domainCheck = await DomainCheck.findByPk(args.id);
  console.log(args);
  domainCheck.set({
    status: args.status,
    resultImage: args.resultImage,
  });
  await domainCheck.save();
  context.pubsub.publish("DOMAIN_CHECK_UPDATED", domainCheck.dataValues);
  return domainCheck;
}

domainCheckQueue.process(async (job) => {
  const domainCheck = await DomainCheck.findByPk(job.data.id);
  const domain = await Domain.findByPk(domainCheck.domainId);
  const url = domain.host;
  const basePath = modelUploadPath(domainCheck);
  const fileName = `${(new Date()).getTime()}.png`;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://${url}`);
    await page.screenshot({
      path: path.join(basePath, fileName)
    });
    await browser.close();
    return updateDomainCheck({}, {
      id: domainCheck.id,
      resultImage: fileName,
      status: 'done',
    },
    {
      pubsub,
    },
    {});
  } catch (err) {
    console.log(err);
    await updateDomainCheck({}, {
      id: domainCheck.id,
      status: 'error',
    }, {
      pubsub,
    },
    {});
    return Promise.reject(new Error(`Error requesting ${url}: ${err}`));
  }
});

// videoQueue.add({
//   video: 'http://example.com/video1.mov'
// });
// audioQueue.add({
//   audio: 'http://example.com/audio1.mp3'
// });
// imageQueue.add({
//   image: 'http://example.com/image1.tiff'
// });

module.exports = {
  domainCheckQueue
};