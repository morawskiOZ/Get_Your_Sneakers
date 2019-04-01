import gql from "graphql-tag";
import { Query } from "react-apollo";

import Error from "./ErrorMessage";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import propTypes from 'prop-types'

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"
];

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map(permission => (
                  <th>{permission}</th>
                ))}
                <th>{"\u{02193}"}</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <User user={user} />
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

const User = ({ user: { name, email, id } }) => {
  User.propTypes = {
    user: propTypes.shape({
      name: propTypes.string,
      email: propTypes.string,
      id: propTypes.string,
      permissions: propTypes.array,
    }).isRequired
  }
  const [permission, setPermision] = useState()
  return (
    <tr>
      <td>{name}</td>
      <td>{email}</td>
      {possiblePermissions.map(permission => (
        <td>
          <label htmlFor={`${id}-permission-${permission}`}>
            <input type="checkbox" />
          </label>
        </td>
      ))}
      <td>
        <SickButton> Update </SickButton>
      </td>
    </tr>
  );
};

export default Permissions;
