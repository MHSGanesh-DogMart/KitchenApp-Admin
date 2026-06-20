import { redirect } from "next/navigation";

// Root → login. Once auth is wired, gate this with a session check
// and redirect signed-in admins to /dashboard.
export default function RootPage() {
  redirect("/login");
}
