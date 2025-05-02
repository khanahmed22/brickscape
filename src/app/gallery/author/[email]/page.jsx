"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Mail, User, Calendar, BookOpen, ArrowLeft, Clock } from "lucide-react"
import getSupabaseClient from "@/app/utils/supabase"
import { useSession,useUser } from "@clerk/nextjs"
import { Separator } from "@/components/ui/separator"



export default function AuthorPage() {
  const { email } = useParams()
  const router = useRouter()
  const decodedEmail = typeof email === "string" ? decodeURIComponent(email) : ""
  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { session } = useSession()
  const { user } = useUser()
  const authorName = user?.firstName;
  const authorAvatar = user?.imageUrl;


  useEffect(() => {
    async function fetchAuthorData() {
      try {
        setLoading(true)
        const clerkToken = await session?.getToken({ template: "supabase" })
        const client = getSupabaseClient(clerkToken)

        // Fetch author data from your database
        const { data, error } = await client
          .from("all_tasks")
          .select("email, created_at")
          .eq("email", decodedEmail)
          .order("created_at", { ascending: true })
          .limit(1)

        if (error) throw error

        // Count posts by this author
        const { count, error: countError } = await client
          .from("all_tasks")
          .select("*", { count: "exact" })
          .eq("email", decodedEmail)

        if (countError) throw countError

        // Fetch all posts by this author
        const { data: postsData, error: postsError } = await client
          .from("all_tasks")
          .select("id, name, description, created_at, slug, fileURL")
          .eq("email", decodedEmail)
          .order("created_at", { ascending: false })

        if (postsError) throw postsError

        // Create author profile (in a real app, you might have a separate authors table)
        const authorData= {
          email: decodedEmail,
          name: decodedEmail.split("@")[0], // Simple name extraction from email
          bio: "",
          avatar: authorAvatar,
          joinedDate: data && data.length > 0 ? new Date(data[0].created_at).toLocaleDateString() : "Unknown",
          postCount: count || 0,
        }

        setAuthor(authorData)
        setPosts(postsData || [])
      } catch (error) {
        console.error("Error fetching author data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (decodedEmail) {
      fetchAuthorData()
    }
  }, [decodedEmail, session])

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-8">
          <CardHeader className="pb-4">
            <Skeleton className="h-8 w-64 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4 mt-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Author Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn&apos;t find information for this author.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/gallery")}>Return to Gallery</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Author Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={author.avatar} alt={author.name || "Author"} />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>

            <div className="space-y-4 flex-1">
              <p className="font-bold">{authorName}</p>
              {/*<h2 className="text-xl font-bold">{author.name}</h2>*/}
              

              <div className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <span>{author.email}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Joined: {author.joinedDate}</span>
                </div>

                <div className="flex items-center text-muted-foreground">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>
                    {author.postCount} {author.postCount === 1 ? "post" : "posts"}
                  </span>
                </div>
              </div>

              <p className="mt-4">{author.bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Posts by {author.name}</h2>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No posts found for this author.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/gallery/${decodedEmail}/${post.slug}`)}
              >
                {post.fileURL ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.fileURL || "/placeholder.svg"}
                      alt={post.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground opacity-20" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{post.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{post.description}</p>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-8" />

      <div className="text-center">
        <Button onClick={() => router.push("/gallery")}>Back to Gallery</Button>
      </div>
    </div>
  )
}

