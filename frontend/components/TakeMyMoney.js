import React, { Component } from "react"
import StripeCheckout from "react-stripe-checkout"
import { Mutation } from "react-apollo"
import Router from "next/router"
import NProgress from "nprogress"
import PropTypes from "prop-types"
import gql from "graphql-tag"
import calcTotalPrice from "../lib/calcTotalPrice"
import Error from "./ErrorMessage"
import User, { CURRENT_USER_QUERY } from "./User"

export const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`

const totalItems = cart => {
  return cart.reduce((total, cartItem) => total + cartItem.quantity, 0)
}

export default class TakeMyMoney extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  onToken = async (res, createOrder) => {
    NProgress.start()
    // call the mutation once we have stripe token
    const order = await createOrder({
      variables: {
        token: res.id
      }
    }).catch(err => {
      alert(err.message)
    })
    Router.push({
      pathname: "/order",
      query: { id: order.data.createOrder.id }
    })
  }

  render() {
    return (
      <User>
        {({ data: { me }, loading }) => {
          if (loading) return null
          return (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
              {createOrder => (
                <StripeCheckout
                  amount={calcTotalPrice(me.cart)}
                  name="Piotr's sklep"
                  description={`Order of ${totalItems(me.cart)} items!`}
                  image={
                    me.cart.length && me.cart[0].item && me.cart[0].item.image
                  }
                  stripeKey="pk_test_QocZdYgo2uMglCzXUTeos00q00YwPSlJd8"
                  currency="USD"
                  email={me.email}
                  token={res => this.onToken(res, createOrder)}
                >
                  {this.props.children}
                </StripeCheckout>
              )}
            </Mutation>
          )
        }}
      </User>
    )
  }
}
