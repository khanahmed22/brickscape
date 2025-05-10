import { Suspense } from "react"
import PropertySearchPage from "./SearchClient"
import Loading from "./loading"

export const metadata = {
  title: "Property Search",
}

export default function CreateBlogPage() {

  
  return (
    <Suspense fallback={<Loading/>}>
      <PropertySearchPage/>
    </Suspense>
  )
}

