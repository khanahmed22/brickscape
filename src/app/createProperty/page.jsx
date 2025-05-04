import { Suspense } from "react"
import PropertyMakerClient from "./property-maker-client"

export const metadata = {
  title: "Create Property",
}

export default function CreateBlogPage() {

  
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <PropertyMakerClient />
    </Suspense>
  )
}

