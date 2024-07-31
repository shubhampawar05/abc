import User from "../model/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import Token from "../model/token.model.js"
import {generateAccessToken , generateRefreshToken} from "../utils/token.js"
export const RegisterUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, username } = req.body;
  const user = await User.findOne({ email: email });
  // console.log(user);
  if (user) {
    console.log("working");
    throw new ApiError(409, "User Already have Account");
  }
  if (!req.body.firstname) {
    throw new ApiError(400, "Please Enter Firstname");
  }
  if (!req.body.lastname) {
    throw new ApiError(400, "Please Enter Lastname");
  }
  if (!req.body.email) {
    throw new ApiError(400, "Please Enter Email");
  }
  if (!req.body.password) {
    throw new ApiError(400, "Please Enter Password");
  }
  if (!req.body.username) {
    throw new ApiError(400, "Please Enter Username");
  }
  // const date = new Date();
  const userCreated = await User.create({
    firstname,
    lastname,
    email,
    password,
    activeStatus: true,
    username,
  });
  console.log(userCreated);
  userCreated.ModificationTimeline.push({
    user: userCreated._id,
    action: "created",
  });
  await userCreated.save();
  if (!userCreated) {
    throw new ApiError(500, "Failed to create user");
  }
  const createdUser = await User.findById(userCreated._id).select("-password");
  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Created Succesfully"));
});

export const LoginUser = asyncHandler(async (req,res)=>{
  const user = await User.findOne({email : req.body.email});
  if(!user){
   throw new ApiError(404,"User Not Found");
  }
  if(!req.body.password){
    throw new ApiError(400,"Please Enter Password");
  }
  const isPasswordMatched = await user.isPasswordCorrect(req.body.password);
  if(!isPasswordMatched){
    throw new ApiError(401,"Incorrect Password");
  }
  const accessToken = await generateAccessToken({
    user : user._id
  })
  const refreshToken = await generateRefreshToken({
    user : user._id
  })
  
  console.log(accessToken);
  console.log(refreshToken);
  const loginedUser = await User.findById(user._id).select("-password");
  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  }
  console.log(user._id,"81");
  const TokenCreated = await Token.create({
    refreshtoken: refreshToken,
    User: user._id,
    loginType : "SimpleLogin",
    
  })
  if(!TokenCreated){
    throw new ApiError(500,"Server Error");
  }
  return res.status(200).cookie("AccessToken",accessToken).cookie("refreshToken",refreshToken).json(
    new ApiResponse(
        200,
        {
            user: loginedUser, accessToken, refreshToken
        },
        "User logged in successfully !!!."
    )
);
  // user.generateAccessToken()
})

export const Logout = asyncHandler(async (req,res)=>{
  console.log("logout controller");
  await Token.findOneAndDelete({
    refreshtoken: req.cookies.refreshToken,
  })
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None"
   };

return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logout successfull !!!."
        )
    );
})

export const GoogleAuthLogin = async (accessToken, refreshToken, profile, done) =>{
  try {
    // Check if user already exists in database
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      const accessToken = await generateAccessToken(
        {
          user : user._id
        }
      );
      const refreshToken = await generateRefreshToken(
        {
          user : user._id
        }
  
      );
      await Token.create({
        refreshToken,
        loginType: 'GoogleAuth',
        user: user._id,
      })
      return done(null, { user, accessToken, refreshToken });
    } else {
      // Create a new user if not found in the database
      const newUser = await User.create({
        googleId: profile.id,
        firstname: profile.name?.givenName,
        lastname: profile.name?.familyName || "none",
        email: profile.emails[0].value,
        username: profile.emails[0].value.split('@')[0],
        activeStatus: true,
        password: "GOOGLE", // or omit this field if you don't use it
      });

      // Log user creation in ModificationTimeline
      newUser.ModificationTimeline.push({
        user: newUser._id,
        action: "created",
      });
      const accessToken = await generateAccessToken(
        {
          user : newUser._id
        }
      );
      const refreshToken = await generateRefreshToken(
        {
          user : newUser._id
        }
      );
      await newUser.save();
      await Token.create({
        refreshToken,
        loginType: 'GoogleAuth',
        user: newUser._id,
      });

      
      return done(null, { newUser, accessToken, refreshToken });
    }
  } catch (err) {
    console.error('Error in Google OAuth strategy:', err);
    return done(err, null);
  }

}