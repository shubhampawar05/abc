import express from "express";
import passport from "../utils/google-statergy.js";
// verifyJWT
// import { setAccessTokenCookie, setRefreshTokenCookie } from '../utils/token.js';
import Token from "../model/token.model.js"; // Adjust the path as per your project structure
// import { verify } from "jsonwebtoken";
import { verifyJWT } from "../utils/verifyJWT.js";
// import passport from "../utils/google-statergy.js";
// import passport from "passport";
// console.log(8,process.env);
const googleRouter = express.Router();

googleRouter.use(passport.initialize());

googleRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

googleRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    try {
      // Successful authentication, get the user and tokens from passport
      const { userDetails, accessToken, refreshToken } = req.user;
      res
        .status(200)
        .cookie("AccessToken", accessToken)
        .cookie("refreshToken", refreshToken);
      res.redirect("/home");
      // Set tokens as cookies
      // setAccessTokenCookie(res, accessToken);
      // setRefreshTokenCookie(res, refreshToken);

      // Return success response
      // return res.status(200).json({
      //   message: "User logged in successfully",
      //   user: userDetails,
      //   accessToken,
      //   refreshToken
      // });
    } catch (err) {
      console.error("Error in Google OAuth callback:", err);
      return res.status(500).json({
        message: "Failed to log in user",
        error: err.message,
      });
    }
  }
);
googleRouter.get("/logout", (req, res) => {
  console.log(req.logOut);
  req.logout(function(err) {
  // if (err) { return next(err); }
  res.clearCookie("AccessToken");
  res.clearCookie("refreshToken");
  res.redirect("/home1");
  });

  
});
googleRouter.get("/home", verifyJWT,(req, res) => {
  res.send("Hello there!");
});
googleRouter.get("/home1", (req, res) => {
  res.send("Hello there1!");
});

export default googleRouter;
