const typeDefs = `
  type Domain {
    id: ID!
    host: String
    createdAt: Date
    updatedAt: Date
  }

  type DomainCheck {
    id: ID!
    status: String
    createdAt: Date
    updatedAt: Date
  }

  type Query {
    domains(offset: Int, limit: Int): DomainConnection
    Domain(id: ID!): Domain
    allDomains(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: DomainFilter): [Domain]
    _allDomainsMeta(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: DomainFilter): ListMetadata
    domainChecks(offset: Int, limit: Int): DomainCheckConnection
    DomainCheck(id: ID!): DomainCheck
    allDomainChecks(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: DomainCheckFilter): [DomainCheck]
    _allDomainChecksMeta(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: DomainCheckFilter): ListMetadata
  }

  type DomainCheckConnection {
    rows: [DomainCheck]!
    count: Int
  }

  type DomainConnection {
    rows: [Domain]!
    count: Int
  }

  type Subscription {
    domainCheckAdded: DomainCheck
    domainCheckUpdated: DomainCheck
  }

  type Mutation {
    createDomain(host: String!): Domain!
    updateDomain(id: ID!, host: String!): Domain!
    deleteDomain(id: ID!): Domain
    createDomainCheck(status: String!): DomainCheck!
    updateDomainCheck(id: ID!, status: String!): DomainCheck!
    deleteDomainCheck(id: ID!): DomainCheck
  }

  type UpdateResponse {
    success: Boolean!
    message: String
  }

  input DomainCheckFilter {
    q: String
    id: ID
    status: String
  }

  input DomainFilter {
    q: String
    id: ID
    host: String
  }

  type ListMetadata {
    count: Int!
  }

  scalar Date
`;

module.exports = typeDefs;