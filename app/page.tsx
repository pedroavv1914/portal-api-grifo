import { redirect } from "next/navigation";
import { getSessionAndClaims } from "@/lib/auth";

export default async function Home() {
  const { session } = await getSessionAndClaims();
  if (session) redirect("/dashboard");
  redirect("/login");
}
