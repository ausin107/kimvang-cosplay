import { redirect } from "next/navigation";

export default function RedirectToCatalog() {
  redirect("/catalog");
}
