import React, { Component } from "react"
import PropTypes from "prop-types"
import { Mutation } from "react-apollo"
import gql from "graphql-tag"
import styled from "styled-components"

import { CURRENT_USER_QUERY } from "./User"

export const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`

export default class RemoveFromCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  }
  // this gets called as soon as we get response back from the server after a mutation
  // has been performed
  update = (cache, payload) => {
    // read the cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY })
    // remove that item from the cart
    const cartItemId = payload.data.removeFromCart.id
    data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId)
    // write it back to the cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data })
  }
  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{
          __typename: "Mutation",
          removeFromCart: {
            __typename: "CartItem",
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { loading, error }) => (
          <BigButton
            title="Delete Item"
            disabled={loading}
            onClick={() => {
              removeFromCart().catch(err => alert(err.message))
            }}
          >
            x
          </BigButton>
        )}
      </Mutation>
    )
  }
}
