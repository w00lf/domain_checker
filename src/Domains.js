import * as React from 'react';
import {
  Datagrid,
  DateField,
  List,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

const DomainShow = props => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="host" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </SimpleShowLayout>
    </Show>
);

const DomainList = (props) => {
    return (<List {...props}>
        <Datagrid {...props}>
            <TextField source="id" />
            <TextField source="host" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" sortByOrder="DESC" />
        </Datagrid>
    </List>);
};

export {
  DomainShow,
  DomainList
}