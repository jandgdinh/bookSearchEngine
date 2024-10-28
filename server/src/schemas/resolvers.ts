import { BookDocument } from '../models/Book';
import { User } from '../models/index';
import { signToken, AuthenticationError } from '../services/auth';


interface IUser {
    _id: string;
    username: string;
    email: string;
    bookCount: number;
    savedBooks: BookDocument[];
  }
  
  interface AddUserArgs {
    username: string;
    email: string;
    password: string;
  }
  
  interface SaveBookArgs {
    input: {
      bookId: string;
      authors: string[];
      description: string;
      title: string;
      image: string;
      link: string;
    };
  }
  
  interface LoginArgs {
    email: string;
    password: string;
  }
  
  interface RemoveBookArgs {
    bookId: string;
  }
  
  interface Context {
    user?: IUser;
  }

const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: Context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks');

                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        login: async (_parent: any, { email, password }: LoginArgs) => {
            const user = await
                User.findOne({ email, password });
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        addUser: async (_parent: any,  { username, email, password }: AddUserArgs) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        saveBook: async (_parent: any, { input }: SaveBookArgs, context: Context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            } else {
                throw new AuthenticationError('You need to be logged in to save a book');
            }
        },
        removeBook: async (_parent: any, { bookId }: RemoveBookArgs, context: Context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            } else {
                throw new AuthenticationError('You need to be logged in to remove a book');
            }
        }
    }
}

export default resolvers;
