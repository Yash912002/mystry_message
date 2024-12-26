import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/user.model";
import dbConnection from "@/lib/dbConnection";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			// Credentials which are required for sign in
			credentials: {
				email: { label: "email", type: "text" },
				password: { label: "Password", type: "password" },
			},

			// Steps to perform when user tries to sign in
			async authorize(credentials: any): Promise<any> {
				// Check if the database is connected or not
				await dbConnection();
				try {
					// Find the user with given username or email
					const user = await UserModel.findOne({
						$or: [
							{ email: credentials.identifier },
							{ username: credentials.identifier },
						],
					});

					if (!user) {
						throw new Error("No user found with this Email ID");
					}

					if (!user.isVerified) {
						throw new Error("Please verify your account first");
					}

					// Check if the given password matches the password
					// stored in the database 
					const isPasswordCorrect = await bcrypt.compare(
						credentials.password,
						user.password
					);

					// If it is correct reuturn the user else throw the error
					if (isPasswordCorrect) {
						return user;
					} else {
						throw new Error("Incorrect password");
					}
				} catch (err: any) {
					throw new Error(err);
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token._id = user._id?.toString();
				token.isVerified = user.isVerified;
				token.isAcceptingMessages = user.isAcceptingMessages;
				token.username = user.username;
			}
			return token;
		},
		async session({ session, token }) {
			if(token) {
				session.user._id = token._id 
				session.user.isVerified = token.isVerified 
				session.user.isAcceptingMessages = token.isAcceptingMessages 
				session.user.username = token.username 
			}
			return session;
		},
	},
	pages: {
		signIn: "/sign-in",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};
