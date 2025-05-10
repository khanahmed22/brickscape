import { Suspense } from "react"
import PropertyListingPageD from "./property-list-client-D"
import Loading from "./loading"
export default function PropertySelfView(){
  return(
    <>
    <Suspense fallback={<Loading/>}>
      <PropertyListingPageD/>
    </Suspense>
    </>
  )
}