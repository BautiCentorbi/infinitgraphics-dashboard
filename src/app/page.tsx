import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role === "admin") redirect("/admin");
  if (session.user.clientSlug) redirect(`/c/${session.user.clientSlug}`);

  redirect("/login");
}
