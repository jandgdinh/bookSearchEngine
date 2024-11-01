import jwt from 'jsonwebtoken';
import { Request } from 'express';

const secret = 'your-secret-key';
const expiration = '2h';

export const authMiddleware = ({ req }: { req: Request }) => {
  // Get token from request body, query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;

  // If the token is in the headers, split out "Bearer"
  if (req.headers.authorization) {
    token = token.split(' ')[1];
  }

  if (!token) {
    return req;
  }

  try {
    // Decode and attach user data to the request object
    const { data } = jwt.verify(token, secret, { maxAge: expiration }) as any;
    req.user = data;
  } catch {
    console.log('Invalid token');
  }

  // Return the request object so it can be accessed in the resolver
  return req;
};

export const signToken = (user: any) => {
  const payload = { _id: user._id, email: user.email, username: user.username };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};