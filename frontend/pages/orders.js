import React from "react"
import PleaseSignin from "../components/PleaseSignin"
import OrderList from "../components/OrderList"

const OrderPage = props => (
  <div>
    <PleaseSignin>
      <OrderList />
    </PleaseSignin>
  </div>
)

export default OrderPage
