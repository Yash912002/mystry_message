import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/user.model";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signupSchema";

const usernamequerySchema = z.object({
	username: userNameValidation,
});

export async function GET(request: Request) {

	await dbConnection();

	try {
		const { searchParams } = new URL(request.url);

		const queryParams = {
			username: searchParams.get("username"),
		};

		const result = usernamequerySchema.safeParse(queryParams);

		// console.log(result);

		if (!result.success) {
			const usernameErrors = result.error.format().username?._errors || [];

			return Response.json(
				{
					success: false,
					message: "Invalid query parameters",
				},
				{ status: 400 }
			);
		}

		const { username } = result.data;

		const existingVerifiedUser = await UserModel.findOne({
			username,
			isVerified: true,
		});

		if (existingVerifiedUser) {
			return Response.json(
				{
					success: false,
					message: "Username already exists",
				},
				{ status: 400 }
			);
		}

		return Response.json(
			{
				success: true,
				message: "Username is unique",
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error checking the username", error);
		return Response.json(
			{
				success: false,
				message: "Error checking the username",
			},
			{ status: 500 }
		);
	}
}
