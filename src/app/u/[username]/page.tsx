"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import { useParams } from "next/navigation";
import { MessageSchema } from "@/schemas/messageSchema";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
	return messageString.split(specialChar);
};

export default function SendMessage() {
	// It lets you read dynamic params from URL
	const params = useParams<{ username: string }>();
	const username = params.username;

	const form = useForm<z.infer<typeof MessageSchema>>({
		resolver: zodResolver(MessageSchema),
	});

	// It is a method from react-hook-form that allows you 
	// to observe the value of a specific form field in real-time.
	const messageContent = form.watch("content");

	const handleMessageClick = (message: string) => {
		form.setValue("content", message);
	};

	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (data: z.infer<typeof MessageSchema>) => {
		setIsLoading(true);
		try {
			const response = await axios.post<ApiResponse>("/api/send-message", {
				// Spreads all the properties of data 
				// into the payload for the API request
				...data,
				username,
			});

			toast({
				title: response.data.message,
				variant: "default",
			});
			// form.getValues() :- Retrieves the current state of form fields.

			// It ensures all existing form field values are preserved 
			// while resetting only the content field.
			form.reset({ ...form.getValues(), content: "" });
		} catch (error) {
			const axiosError = error as AxiosError<ApiResponse>;
			toast({
				title: "Error",
				description:
					axiosError.response?.data.message ?? "Failed to sent message",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
			<h1 className="text-4xl font-bold mb-6 text-center">
				Public Profile Link
			</h1>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Send Anonymous Message to @{username}</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Write your anonymous message here"
										className="resize-none"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex justify-center">
						{isLoading ? (
							<Button disabled>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Please wait
							</Button>
						) : (
							<Button type="submit" disabled={isLoading || !messageContent}>
								Send It
							</Button>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
}
