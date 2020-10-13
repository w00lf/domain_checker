require('dotenv').config()

const {
  GraphQLServer,
} = require('graphql-yoga');
const typeDefs = require('./schema');
const {
  Domain,
  DomainCheck
} = require('../models/index');
const { withFilter } = require('apollo-server');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const pubsub = new RedisPubSub();
const Queue = require('bull');
const domainCheckQueue = new Queue('domain check');
const {
  downloadUrl
} = require('./upload_helpers');

function newDomainCheckubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("NEW_DOMAIN_CHECK")
}

const updateDomainCheck = async (parent, args, context, _info) => {
  let domainCheck = await DomainCheck.findByPk(args.id);
  domainCheck.set({
    status: args.status,
  });
  await domainCheck.save();
  context.pubsub.publish("DOMAIN_CHECK_UPDATED", domainCheck.dataValues);
  return domainCheck;
}

const resolvers = {
  Query: {
    Domain: async (parent, args, context, _info) => {
      const domain = await Domain.findByPk(args.id);
      return domain;
    },
    domains: (_, {
      offset = 0,
      limit = 10
    }) => Domain.findAndCountAll({
      offset: offset,
      limit: limit,
    }),
    allDomains: async (_, {
        page = 1,
        perPage = 10,
        sortField = 'id',
        sortOrder = 'ASC'
      }) => {
        console.log(sortField);
        const result = await Domain.findAndCountAll({
          offset: (page * perPage),
          limit: perPage,
          order: [
            [sortField, sortOrder]
          ]
        });
        console.log(result.rows);
        return result.rows;
      },
      _allDomainsMeta: async (_, {
        page = 1,
        perPage = 10
      }) => {
        const result = await DomainCheck.findAndCountAll({
          offset: (page * perPage),
          limit: perPage
        });
        return result;
      },
    DomainCheck: async (parent, args, context, _info) => {
      const domainCheck = await DomainCheck.findByPk(args.id, {
        include: Domain
      });
      domainCheck.imageUrl = downloadUrl(domainCheck, domainCheck.resultImage);
      return domainCheck;
    },
    domainChecks: (_, {
      offset = 0,
      limit = 10
    }) => DomainCheck.findAndCountAll({
      offset: offset,
      limit: limit,
      include: Domain,
    }),
    allDomainChecks: async (_, {
        page = 1,
        perPage = 10,
        sortField = 'id',
        sortOrder = 'ASC'
      }) => {
      console.log(sortField);
      const result = await DomainCheck.findAndCountAll({
                              offset: (page * perPage),
                              limit: perPage,
                              order: [[sortField, sortOrder]],
                              include: Domain,
                            });
      const resultEntries = result.rows.map((entry) => {
        if (entry.resultImage) entry.imageUrl = downloadUrl(entry, entry.resultImage);
        return entry;
      });
      return resultEntries;
    },
    _allDomainChecksMeta: async (_, { page = 1, perPage = 10 }) => {
      const result = await DomainCheck.findAndCountAll({
                              offset: (page * perPage),
                              limit: perPage
                            });
      return result;
    },
  },
  Mutation: {
    createDomain: async (parent, args, context, _info) => {
      const domain = await Domain.create({
        host: args.host,
      });
      return domain;
    },
    updateDomain: async (parent, args, context, _info) => {
      let domain = await Domain.findByPk(args.id);
      domain.set({
        host: args.host,
      });
      await domain.save();
      return domain;
    },
    createDomainCheck: async (parent, args, context, _info) => {
      const domainCheck = await DomainCheck.create({
        status: args.status,
        domainId: args.domainId
      });
      context.pubsub.publish("NEW_DOMAIN_CHECK", domainCheck);
      await domainCheckQueue.add({
        id: domainCheck.id
      });
      return domainCheck;
    },
    updateDomainCheck,
  },
  Subscription: {
    domainCheckAdded: {
      subscribe: newDomainCheckubscribe,
      resolve: payload => {
        return payload
      },
    },
    domainCheckUpdated: {
      subscribe: (parent, args, context, info) => {
        return context.pubsub.asyncIterator("DOMAIN_CHECK_UPDATED")
      },
      resolve: payload => {
        return payload
      },
    },
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: request => {
    return {
      ...request,
      pubsub
    }
  },
});
const express = require('express');
server.express.use('/uploads', express.static(process.env.BASE_UPLOADS_PATH));
server.start(() => console.log('Server is running on localhost:4000'));