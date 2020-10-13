import * as React from 'react';
import ReactDOM from 'react-dom';
import { Component, cloneElement } from 'react';
import buildGraphQLProvider, {
    buildQuery
} from 'ra-data-graphql-simple';
import {
    gql,
    ApolloProvider,
    ApolloClient,
    InMemoryCache,
    split,
    HttpLink,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import {
    Admin,
    Resource,
    adminReducer,
} from 'react-admin';
import {
    DomainList,
    DomainShow
} from './Domains';
import {
    DomainCheckCreate,
    DomainCheckEdit,
    DomainCheckList,
    DomainCheckShow
} from './DomainChecks';

const myBuildQuery = introspection => (fetchType, resource, params) => {
    console.log('Data provider set');
    const builtQuery = buildQuery(introspection)(fetchType, resource, params);

    console.log(fetchType);
    if (resource === 'DomainCheck' && fetchType === 'GET_LIST') {
        return {
            // Use the default query variables and parseResponse
            ...builtQuery,
            // Override the query
            query: gql `
                query allDomainChecks($page: Int, $perPage: Int, $sortField: String, $sortOrder: String, $filter: DomainCheckFilter) {
                    items: allDomainChecks(page: $page, perPage: $perPage, sortField: $sortField, sortOrder: $sortOrder, filter: $filter) {
                        id
                        status
                        domainId
                        Domain {
                            id
                            host
                            __typename
                        }
                        createdAt
                        updatedAt
                        __typename
                    }
                    total: _allDomainChecksMeta(page: $page, perPage: $perPage, filter: $filter) {
                        count
                        __typename
                    }
                }`,
        };
    }

    return builtQuery;
};


const httpLink = new HttpLink({
  uri: 'http://localhost:4000/'
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true
  }
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

const customReducer = (previousState = {}, args) => {
    // console.log(args);
    // console.log(previousState);
    // console.log(args.type);
    if (args.type === 'ADD_OPTIMISTIC') {
        const entries = previousState.resources[args.meta.resource].data;
        const newData = {
            ...entries,
            ...{
                [args.payload.data.id]: args.payload.data
            }
        }
        previousState.resources[args.meta.resource].data = newData;
        previousState.resources[args.meta.resource].list.ids = Object.keys(newData);
        const signature = Object.keys(previousState.resources[args.meta.resource].list.cachedRequests)[0];
        if (signature)
            previousState.resources[args.meta.resource].list.cachedRequests[signature].ids.unshift(args.payload.data.id);
        return previousState;
    }
    if (args.type === 'UPDATE_OPTIMISTIC') {
        console.log('My event');
        console.log(previousState);
        const payload = args.payload;
        let prevEntry = previousState.resources[args.meta.resource].data[payload.id]
        previousState.resources[args.meta.resource].data[payload.id] = {
            ...prevEntry,
            ...payload.data
        }
        console.log(previousState);
        console.log(previousState.resources[args.meta.resource][payload.id]);
        return previousState;
    }
    return adminReducer(previousState, args);
}

class App extends Component {
    constructor() {
        super();
        this.state = { dataProvider: null };
    }
    componentDidMount() {
        buildGraphQLProvider({
            clientOptions: {
                uri: 'http://localhost:4000',
            },
            buildQuery: myBuildQuery,
        }).then(dataProvider => this.setState({ dataProvider }));
    }
    render() {
        const { dataProvider } = this.state;
        if (!dataProvider) {
            return <div>Loading</div>;
        }
        return (
            <ApolloProvider client={apolloClient}>
                <Admin customReducers={{ admin: customReducer }} dataProvider={dataProvider}>
                    <Resource name="Domain" list={DomainList} show={DomainShow} />
                    <Resource name="DomainCheck" list={DomainCheckList} show={DomainCheckShow} create={DomainCheckCreate} edit={DomainCheckEdit} />
                </Admin>
            </ApolloProvider>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
