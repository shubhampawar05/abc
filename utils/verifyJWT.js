import JWT from 'jsonwebtoken';
import ApiError from "./apiError.js";
import asyncHandler from "./asyncHandler.js";
import ApiResponse from "./apiResponse.js";
import User from "../model/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
  try {
    //   console.log("working1");
      const accessToken = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "");
      console.log(accessToken);
      if (!accessToken) {
          throw new ApiError(401, "Unauthorized request");
      }
    //  console.log(process.env.SECRET_KEY_ACCESS)
      const decodedToken = JWT.verify(accessToken, process.env.SECRET_KEY_ACCESS);
      console.log(decodedToken?.user);
  
      const user = await User.findById(decodedToken?.user).select("-password");
  
      if (!user) {
          throw new ApiError(401, "Invalid access token");
      }
  
      req.user = user;
      next();
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access token");
  }
});

