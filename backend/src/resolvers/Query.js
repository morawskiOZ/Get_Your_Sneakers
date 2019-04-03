const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  async users(parent, args, ctx, info) {
    // check if loged in
    if (!ctx.request.userId) {
      throw new Error("Please log in");
    }
    // check if the user has perrmission
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    // if yes, query all the users
    return ctx.db.query.users({}, info);
  }
};

module.exports = Query;
