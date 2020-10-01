import * as React from 'react';
import {
    useSubscription,
    gql,
} from '@apollo/client';
import {
  useSelector,
  useDispatch
} from 'react-redux';
import {
  makeStyles
} from '@material-ui/core/styles';
import {
  List,
  Datagrid,
  Show,
  DateField,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

const DOMAIN_ADDED_SUBSCRIPTION = gql `
    subscription domainCheckAdded {
        domainCheckAdded {
            id
            status
        }
    }
`;

const DOMAIN_CHECK_UPDATED_SUBSCRIPTION = gql `
    subscription domainCheckUpdated {
        domainCheckUpdated {
            id
            status
        }
    }
`;

const DomainCheckShow = props => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="host" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </SimpleShowLayout>
    </Show>
);

const StatusField = ({ record, source }) => {
    const classes = useStyles();
    return <TextField className={classes[record.status]} record={record} label='Status' source={source} />
}

const useStyles = makeStyles({
    created: {
        color: 'black'
    },
    started: {
        color: 'purple'
    },
    done: {
        color: 'green'
    },
    error: {
        color: 'red'
    },
});

const DomainCheckList = (props) => {
    console.log('rerender list');
    const resource = "DomainCheck";
    const storeData = useSelector((store) => store.admin.resources[resource].data);
    console.log(storeData);
    const dispatch = useDispatch();
    useSubscription(
        DOMAIN_CHECK_UPDATED_SUBSCRIPTION, {
            variables: {},
            onSubscriptionData: (data) => {
                const {
                    subscriptionData: {
                        data: {
                            domainCheckUpdated
                        }
                    }
                } = data;
                console.log(domainCheckUpdated);
                dispatch({
                    type: 'UPDATE_OPTIMISTIC',
                    payload: {
                        id: domainCheckUpdated.id,
                        data: domainCheckUpdated
                    },
                    meta: {
                        resource: resource,
                    }
                });
            },
            shouldResubscribe: true
        }
    );
    useSubscription(
        DOMAIN_ADDED_SUBSCRIPTION, {
            variables: {},
            onSubscriptionData: (eventData) => {
                const {
                    subscriptionData: {
                        data: {
                            domainCheckAdded
                        }
                    }
                } = eventData;
                console.log(domainCheckAdded);
                dispatch({
                    type: 'ADD_OPTIMISTIC',
                    payload: {
                        data: domainCheckAdded
                    },
                    meta: {
                        resource
                    }
                });
            },
            shouldResubscribe: true
        }
    );
    return (<List {...props}>
        <Datagrid {...props}>
            <TextField source="id" />
            <StatusField source="status" />
            <DateField source="updated_at" sortByOrder="DESC" />
        </Datagrid>
    </List>);
};

export {
  DomainCheckShow,
  DomainCheckList
}