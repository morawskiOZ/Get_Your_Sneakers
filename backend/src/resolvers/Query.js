const { forwardTo } = require("prisma-binding");

const Query = { 
  items: forwardTo("db"),
  item: forwardTo("db")
  // async items(parent, args, ctx, info) {
  //     console.log('getting items');
  //     const item = await ctx.db.query.items()
  //     return item
  //     }
};

module.exports = Query;
