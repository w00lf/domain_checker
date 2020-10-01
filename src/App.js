import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import {
  useQuery,
  useSubscription,
  gql
} from '@apollo/client';
import './App.css';

const GET_INSURER = gql `
  query GetInsurers {
    insurers(offset: 0, limit: 10) {
      rows {
        title
      }
      count
    }
  }
`;

const INSURERS_SUBSCRIPTION = gql `
  subscription OnInsurerAdded {
    insurerAdded {
      id
      title
      slug
    }
  }
`;

function App() {
  const {
    subscribeToMore,
    loading,
    error,
    data
  } = useQuery(GET_INSURER);
  const [querySubscription, setQuerySubscription] = useState(null);

  useEffect(() =>
    subscribeToMore({
      document: INSURERS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newFeedItem = subscriptionData.data.insurerAdded;
        return {
          insurers: {
            count: prev.insurers.count,
            rows: [newFeedItem, ...prev.insurers.rows]
          }
        }
      }
    }));

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <div className="App">
      {
        data.insurers.rows.map(row => (
        <div>
          {
            row.title
          }
        </div>
      ))}
    </div>
  );
}

export default App;
