import { Suspense } from "react"
import PropertySearchPage from "./SearchClient"
import { Loader2 } from "lucide-react"

export const metadata = {
  title: "Property Search",
}

export default function CreateBlogPage() {

  
  return (
    <Suspense fallback={<div className="p-6"><Loader2></Loader2></div>}>
      <PropertySearchPage/>
    </Suspense>
  )
}

