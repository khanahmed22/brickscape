import { Suspense } from "react"
import PropertyMakerClient from "./property-maker-client"
import Loading from "./loading"

export const metadata = {
  title: "Create Property",
}

export default function CreatePropertyPage() {

  
  return (
    <Suspense fallback={<Loading/>}>
      <PropertyMakerClient />
    </Suspense>
  )
}

