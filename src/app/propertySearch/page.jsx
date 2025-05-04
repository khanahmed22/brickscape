import { Suspense } from "react"
import PropertySearchPage from "./SearchClient"

export const metadata = {
  title: "Property Search",
}

export default function CreateBlogPage() {

  
  return (
    <Suspense fallback={<div className="p-6">Loading Search Page...</div>}>
      <PropertySearchPage/>
    </Suspense>
  )
}

