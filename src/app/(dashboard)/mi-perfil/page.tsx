import {HrProfileWorkspace} from "@/views/Platform/HrProfileWorkspace";
export default async function MyProfilePage({searchParams}:{searchParams:Promise<{campana?:string}>}){const {campana}=await searchParams;return <HrProfileWorkspace campaignId={campana}/>;}
