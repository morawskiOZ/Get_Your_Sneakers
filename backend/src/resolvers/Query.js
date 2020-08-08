const { forwardTo } = require("prisma-binding")
const { hasPermission } = require("../utils")

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    )
  },
  async users(parent, args, ctx, info) {
    // check if loged in
    if (!ctx.request.userId) {
      throw new Error("Please log in")
    }
    // check if the user has perrmission
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"])
    // if yes, query all the users
    return ctx.db.query.users({}, info)
  },
  async order(parent, args, ctx, info) {
    // must be log in
    if (!ctx.request.userId) {
      throw new Error("Please log in")
    }
    // query the curr order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id }
      },
      info
    )
    // check permision to see the order
    const ownsOrder = order.user.id === ctx.request.userId
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      "ADMIN"
    )
    // return the order
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error("You can not see this")
    }
    return order
  },
  async orders(parent, args, ctx, info) {
    // must be log in
    const { userId } = ctx.request
    if (!userId) {
      throw new Error("Please log in")
    }
    return ctx.db.query.orders(
      {
        where: {
          user: { id: userId }
        }
      },
      info
    )
  }
}

module.exports = Query
