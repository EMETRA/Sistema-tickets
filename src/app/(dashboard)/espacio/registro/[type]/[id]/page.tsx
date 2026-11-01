import { RecordPage } from '@/views/Platform/RecordPage';
export default async function PlatformRecordPage({params}:{params:Promise<{type:string;id:string}>}){const{type,id}=await params;return <RecordPage type={type} id={id}/>;}
