import { Workspace } from "@/components/app/workspace";
export default async function Page({params}:{params:Promise<{id:string}>}) { const {id}=await params; return <Workspace view="reports" reportId={id}/>; }
