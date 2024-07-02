import { z } from "zod";

export const userNameValidation = z
	.string()
	.min(2, "Username should be of atleast 2 characters")
	.max(20, "Username should be no more than 20 characters")
	.regex(
		/^[a-zA-Z0-9]+$/,
		"Username should not contain any special characters"
	);

export const signUpSchemaValidation = z.object({
	username: userNameValidation,
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, "Password should contain at least 6 characters")
		.max(15, "Password should contain at most 15 characters")
		.regex(
			/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,15}$/,
			"Password must contain at least one uppercase letter, one number, and one special character"
		),
});
