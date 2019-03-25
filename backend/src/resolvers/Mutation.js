const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
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
    const item = await ctx.db.query.item({ where }, `{id title}`);
    // 2. Check if they own that item, or have the permissions
    //TO DO
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
          permission: {
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
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    console.log(res);
    return { message: "bravo" };
    // email the reset token
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
        resetTokenExpiry_gte: Date.now() - 60 * 60 * 1000
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
  }
};

module.exports = Mutations;
