import PropertyListClient from "./property-list-client"
import { Suspense } from "react"
import Loading from "./loading"
export default function PropertyGalleryPage(){
  return(
    <>
    <Suspense fallback={<Loading/>}>
      <PropertyListClient/>
    </Suspense>
    </>
  )
}