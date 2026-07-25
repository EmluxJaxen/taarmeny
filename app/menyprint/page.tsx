import { getMenuData } from "@/lib/dal";
import PrintMenuClient from "./PrintMenuClient";

export const dynamic = "force-dynamic";

export default async function PrintMenuPage() {
  const menuData = await getMenuData();

  return <PrintMenuClient menuData={menuData} />;
}
