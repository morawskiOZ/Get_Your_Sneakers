import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import RemoveFromCart from "./RemoveFromCart"
import formatMoney from "../lib/formatMoney"

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3 {
    margin: 0;
  }
`

const CartItem = ({ cartItem }) => {
  const { item, quantity } = cartItem

  if (!item) {
    return (
      <CartItemStyles>
        <p>This Item has been removed, you can delete it! </p>
        <RemoveFromCart id={cartItem.id} />
      </CartItemStyles>
    )
  }

  return (
    <CartItemStyles>
      <img src={item.image} alt={item.title} width="100" />
      <div className="cart-item-details">
        <h3>{item.title}</h3>
        <p>
          {formatMoney(item.price * quantity)}
          <em>
            {quantity}x{formatMoney(item.price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>
  )
}

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired
}

export default CartItem
