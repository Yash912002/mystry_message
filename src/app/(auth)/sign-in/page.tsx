"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function page() {
	const { data: session } = useSession();
	if (session) {
		return (
			<>
				Signed in as {session.user.email} <br />
				<button onClick={() => signOut()}>Sign out</button>
			</>
		);
	}
	return (
		<>
			Not signed in <br />
			<button
				className="bg-blue-600 text-white p-2 m-5 rounded-md"
				onClick={() => signIn()}
			>
				Sign in
			</button>
		</>
	);
}
