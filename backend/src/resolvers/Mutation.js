const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

const { hasPermission } = require("../utils");
const { transport, makeANiceEmail } = require("../mail");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // way to creacte relationship between user and item
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );

    console.log(item);
    return item;
  },
  updateItem(parent, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the id from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. Find the item
    const item = await ctx.db.query.item({ where }, `{id title user { id}}`);
    // 2. Check if they own that item, or have the permissions
    //TO DO
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );
    if (!ownsItem && !hasPermission) {
      throw new Error("You don/'t have permission to do that!");
    }
    // 3. Delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // lowercase user's email
    args.email = args.email.toLowerCase();
    // hash their passoword
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: {
            set: ["USER"]
          }
        }
      },
      info
    );
    // crate the JWT token
    const token = jwt.sign(
      {
        userId: user.id
      },
      process.env.APP_SECRET
    );
    // Set the jwt as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });
    // Return user to the browser
    return user;
  },
  async signin(parents, { email, password }, ctx, info) {
    // check if there is user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error("No such user found");
    }
    // check if pass correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password");
    }
    // jwt token
    const token = jwt.sign(
      {
        userId: user.id
      },
      process.env.APP_SECRET
    );
    //cookie with tooken
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });
    // return the userrr
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  },

  async requestReset(parent, args, ctx, info) {
    // check if the user exist
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error("No such user found");
    }
    // set a reset token and expiry
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    // email the reset token
    const mailRes = await transport.sendMail({
      from: "Piotrek@wp.pl",
      to: user.email,
      subject: " your password reset",
      html: makeANiceEmail(`Your Password Reset Token is here \n\n
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}"> Click here to reset!</a>`)
    });

    // return a msg
    return { message: "bravo" };
  },

  async resetPassword(parent, args, ctx, info) {
    // check if pass match
    if (args.password !== args.confirmPassword) {
      throw new Error("Your Passwords don NOT match");
    }
    // check if legit token
    // check if expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("invalid or expired token");
    }
    // hash new pass
    const password = await bcrypt.hash(args.password, 10);
    //save the new pass to the user and remove old reset token
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // setThe JWt cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });
    // return new user
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    // 1. check if logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }
    // query the user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );
    // check if user has permissions
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    // update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    // user sing in?
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be signed in to do that!");
    }
    // query the user current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        item: { id: args.id },
        user: { id: userId }
      }
    });
    // check if item is already in cart
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    //if not create a new cart item
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: { connect: { id: userId } },
          item: { connect: { id: args.id } }
        }
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{id, user { id}}`
    );
    // make sure we find an item
    if (!cartItem) throw new Error("No cartItem");
    // make sure they own the cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("Not gonna happen");
    }
    // delete that cart item
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    );
  }
};

module.exports = Mutations;
