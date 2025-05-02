import { Suspense } from "react"
import BlogMakerClient from "./blog-maker-client"

export default function CreateBlogPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading blog maker...</div>}>
      <BlogMakerClient />
    </Suspense>
  )
}

