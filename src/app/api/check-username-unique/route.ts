import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signupSchema";
import { NextResponse } from "next/server";

const usernamequerySchema = z.object({
	username: userNameValidation,
});

export async function GET(request: Request) {

	await dbConnection();

	try {
		// Parse the incoming request URL and extract searchParams.
		const { searchParams } = new URL(request.url);

		// Retrieve the value of the "username" query parameter 
		// from searchParams.
		const queryParams = {
			username: searchParams.get("username"),
		};

		// Validate the queryParams object against the usernamequerySchema.
		const result = usernamequerySchema.safeParse(queryParams);

		// console.log(result);

		if (!result.success) {
			const usernameErrors = result.error.format().username?._errors || [];

			return NextResponse.json(
				{
					success: false,
					message: "Invalid query parameters",
				},
				{ status: 400 }
			);
		}

		// Extracting the username from the result
		const { username } = result.data;

		// Check if the username already exists in the database
		const existingVerifiedUser = await UserModel.findOne({
			username,
			isVerified: true,
		});

		// Return error, if it exists
		if (existingVerifiedUser) {
			return NextResponse.json(
				{
					success: false,
					message: "Username already exists",
				},
				{ status: 400 }
			);
		}

		//* Return success if username is unique
		return NextResponse.json(
			{
				success: true,
				message: "Username is unique",
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error checking the username", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error checking the username",
			},
			{ status: 500 }
		);
	}
}
