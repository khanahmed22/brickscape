import { Suspense } from "react"
import DashboardClient from "./dashboard-client"
import Loading from "./loading"
export default function Dashboard(){
  return(
    <>
    <Suspense fallback={<Loading/>}>
      <DashboardClient/>
    </Suspense>
    
    </>
  )
}