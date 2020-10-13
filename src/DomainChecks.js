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
import moment from 'moment';
import {
  Create,
  Datagrid,
  DateField,
  Edit,
  ImageField,
  List,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
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

const DomainCheckCreate = (props) => (
    <Create {...props}>
        <SimpleForm redirect="list">
            <ReferenceInput label="Domain" source="domainId" reference="Domain">
                <SelectInput optionText="host" />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);

const DomainCheckEdit = (props) => (
    <Edit {...props}>
        <SimpleForm redirect="list">
            <TextInput disabled label="Id" source="id" />
            <TextInput source="status" validate={required()} />
        </SimpleForm>
    </Edit>
);

const DomainCheckShow = props => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="status" />
            <ImageField source="imageUrl" />
            <DateField source="createdAt" showTime />
            <DateField source="updatedAt" showTime />
        </SimpleShowLayout>
    </Show>
);

const StatusField = ({ record = {}, source }) => {
    const classes = useStyles();
    return <span className={classes[record[source]]}>{record[source]} ({moment.duration(moment().diff(record.updatedAt)).humanize()} ago)</span>
};
StatusField.defaultProps = { label: 'Status' };

// const StatusField = ({ record, source }) => {
//     const classes = useStyles();
//     return <TextField className={classes[record.status]} record={record} label='Status' source={source} />
// }

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
        <Datagrid rowClick="show" {...props}>
            <TextField source="id" />
            <TextField source="Domain.host" />
            <StatusField source="status" />
            <DateField source="updatedAt" sortByOrder="DESC" showTime />
        </Datagrid>
    </List>);
};

export {
  DomainCheckCreate,
  DomainCheckEdit,
  DomainCheckShow,
  DomainCheckList,
}