import { AppHead } from "../../components/Head";
import { MainNav } from "../../components/nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ContentWrapper } from "../../layouts/content-wrapper";
import MainLayout from "../../layouts/main";

export default function Dashboard () {
  return (
    <>
      <AppHead />
      <MainNav showDashboardMenu/>     
    </>
  )
}

