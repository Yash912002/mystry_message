import dbConnection from "@/lib/dbConnection"; 
import UserModel from "@/model/user.model"; 
import bcrypt from "bcryptjs"; 
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"; 
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	await dbConnection();

	try {
		// Parse the request body to get user details
		const { username, email, password } = await request.json();

		// Check if a verified user with the same username already exists
		const existingUserVerifiedByUsername = await UserModel.findOne({
			username,
			isVerified: true,
		});

		if (existingUserVerifiedByUsername) {
			// If username exists and is verified, return an error response
			return NextResponse.json(
				{
					success: false,
					message: "Username already exists",
				},
				{ status: 400 }
			);
		}

		// Check if a user with the same email already exists
		const existingUserByEmail = await UserModel.findOne({
			email,
		});

		// Generate a verification code
		const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

		if (existingUserByEmail) {
			if (existingUserByEmail.isVerified) {
				// If email exists and user is verified, return an error response
				return NextResponse.json(
					{
						success: false,
						message: "User already exists with this Email ID",
					},
					{ status: 400 }
				);
			} else {
				// If email exists but user is not verified, update user details
				const hashedPassword = await bcrypt.hash(password, 10); 
				existingUserByEmail.password = hashedPassword;
				existingUserByEmail.verifyCode = verifyCode;
				existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // Set code expiry to 1 hour
				await existingUserByEmail.save(); // Save the updated user
			}
		} else {
			// If email does not exist, create a new user
			const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

			// Set the verification code expiry to 1 hour from now
			const expiryDate = new Date();
			expiryDate.setHours(expiryDate.getHours() + 1);

			// Create a new user with the provided details
			const newUser = new UserModel({
				username,
				email,
				password: hashedPassword,
				verifyCode,
				verifyCodeExpiry: expiryDate,
				isVerified: false,
				isAcceptingMessage: true,
				messages: [],
			});

			// Save the new user to the database
			await newUser.save();
		}

		// Send verification email
		const emailResponse = await sendVerificationEmail(
			email,
			username,
			verifyCode
		);

		// If email sending fails, return an error response
		if (!emailResponse.success) {
			return NextResponse.json(
				{
					success: false,
					message: emailResponse.message,
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "User registered successfully. Please verify your email",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error registering user", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error registering user",
			},
			{ status: 500 }
		);
	}
}
