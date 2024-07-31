import jwt from "jsonwebtoken";

export const generateAccessToken = async function(userDetails){
  const token = await jwt.sign(userDetails, process.env.SECRET_KEY_ACCESS, { expiresIn: '1h' });
  return token;
}


export const generateRefreshToken = async function(userDetails){
  const token = await jwt.sign(userDetails, process.env.SECRET_KEY_REFRESH, { expiresIn: '10d' });
  return token;
}

