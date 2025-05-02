"use client"

import useSWR from "swr"
import { Eye, Search, Filter, ArrowUpRight, Clock, LayoutGrid, LayoutList, Sparkles, BookOpen } from "lucide-react"
import { useSession, useUser } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import getSupabaseClient from "../utils/supabase"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function GalleryPage() {
  const { user } = useUser()
  const { session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedGenre, setSelectedGenre] = useState("")
  const [dataReady, setDataReady] = useState(false)

  const fetchTasks = async (clerkToken) => {
    const client = clerkToken ? getSupabaseClient(clerkToken) : getSupabaseClient()

    const { data, error } = await client.from("all_tasks").select()
    if (error) throw error
    return data
  }

  const {
    data: all_tasks,
    error,
    isLoading,

    mutate,
  } = useSWR(
    "all_tasks", // Always fetch data, not conditional on user
    async () => {
      if (user) {
        const clerkToken = await session?.getToken({ template: "supabase" })
        return await fetchTasks(clerkToken)
      } else {
        // Fetch without authentication
        return await fetchTasks(null)
      }
    },
    { revalidateOnFocus: false },
  )

  // Set dataReady to true when data is loaded
  useEffect(() => {
    if (all_tasks && !isLoading) {
      // Add a small delay to ensure UI transitions smoothly
      const timer = setTimeout(() => {
        setDataReady(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setDataReady(false)
    }
  }, [all_tasks, isLoading])

  function handleViewBlog(slug) {
    setLoading(true)
    // Find the specific blog post with the matching slug
    const blogPost = all_tasks.find((task) => task.slug === slug)

    if (blogPost) {
      // Extract email from the specific blog post
      const email = blogPost.email
      const id = blogPost.id
      router.push(`/gallery/${email}/${slug}`)
    } else {
      // Fallback if blog post not found
      router.push(`/gallery/${slug}`)
    }
  }

  // Get unique genres from all tasks
  const uniqueGenres = useMemo(() => {
    if (!all_tasks) return []

    const genres = all_tasks
      .map((task) => task.genre || "Uncategorized")
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()

    return genres
  }, [all_tasks])

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!all_tasks) return []

    return all_tasks.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.genre && task.genre.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesGenre =
        !selectedGenre || (selectedGenre === "Uncategorized" && !task.genre) || task.genre === selectedGenre

      return matchesSearch && matchesGenre
    })
  }, [all_tasks, searchTerm, selectedGenre])

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      } else if (sortBy === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0)
      } else if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name)
      }
      return 0
    })
  }, [filteredTasks, sortBy])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <>
      <div className="mt-16 min-h-screen bg-background px-4 py-8 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">Properties</h1>
              <p className="text-muted-foreground mt-1">Explore all properties</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties"
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={selectedGenre}
                  onValueChange={(value) => setSelectedGenre(value === "clear" ? "" : value)}
                >
                  <SelectTrigger className="h-12 min-w-[180px]">
                    <SelectValue placeholder="Filter by genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Clear Filter Option */}
                    <SelectItem key="clear" value="clear">
                      Clear Filter
                    </SelectItem>

                    {uniqueGenres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <Filter className="mr-2 h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest first</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest first</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>Alphabetical</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="border rounded-md p-1 flex">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {(!dataReady || isLoading) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[220px] w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {dataReady && sortedTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="bg-primary/5 p-6 rounded-full mb-6">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">No ads found</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                {searchTerm || selectedGenre
                  ? "Try adjusting your search or filter criteria to find more properties."
                  : "Start your writing journey by creating your first blog post. Share your thoughts, ideas, and stories with the world."}
              </p>
              {(searchTerm || selectedGenre) && (
                <div className="flex gap-3">
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  )}
                  {selectedGenre && (
                    <Button variant="outline" onClick={() => setSelectedGenre("")}>
                      Clear Genre Filter
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Content - Grid View */}
          {dataReady && sortedTasks.length > 0 && viewMode === "grid" && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{selectedGenre ? `${selectedGenre} Properties` : "All Properties"}</h2>
                <p className="text-sm text-muted-foreground">
                  Showing {sortedTasks.length} listing
                  {sortedTasks.length !== 1 ? "s" : ""}
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedTasks.map((task) => (
                  <motion.div key={task.id} variants={itemVariants}>
                    <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-shadow duration-300">
                      <div className="relative">
                        <div className="aspect-video overflow-hidden bg-muted">
                          <img
                            src={task.fileURL || "https://placehold.co/220x400" || "/placeholder.svg"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt={task.name || "Blog image"}
                          />
                        </div>
                        {task.created_at && (
                          <Badge variant="secondary" className="absolute bottom-3 left-3">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(task.created_at)}
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-1 text-xl">{task.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4 flex-grow">
                        <div className="flex flex-wrap gap-2 mb-2 mt-2">
                          {task.genre ? (
                            <Badge variant="secondary" className="text-xs">
                              {task.genre}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Uncategorized
                            </Badge>
                          )}
                        </div>
                        <div>
                          {task.area} Sq.ft
                          
                        </div>

                        <div>
                        Location {task.location} 
                        </div>

                        <div>
                          USD {task.price}
                        </div>
                        <Separator className="mb-2 mt-4" />
                        
                        
                      </CardContent>
                      <CardFooter className="pt-0 pb-4">
                        <Button className="w-full group" onClick={() => handleViewBlog(task.slug)} disabled={loading}>
                          {loading ? (
                            "Loading..."
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              View Property
                              <ArrowUpRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Content - List View */}
          {dataReady && sortedTasks.length > 0 && viewMode === "list" && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{selectedGenre ? `${selectedGenre} Properties` : "All Properties"}</h2>
                <p className="text-sm text-muted-foreground">
                  Showing {sortedTasks.length} blog
                  {sortedTasks.length !== 1 ? "s" : ""}
                </p>
              </div>

              {sortedTasks.map((task) => (
                <motion.div key={task.id} variants={itemVariants}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 lg:w-1/5">
                        <div className="h-full aspect-video md:aspect-square overflow-hidden bg-muted">
                          <img
                            src={task.fileURL || "/placeholder.svg?height=200&width=200" || "/placeholder.svg"}
                            className="w-full h-full object-cover"
                            alt={task.name || "Blog image"}
                          />
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                          <h3 className="text-xl font-semibold mb-2 md:mb-0">{task.name}</h3>
                          <p>{task.email}</p>
                          {task.created_at && (
                            <Badge variant="outline" className="mb-2 md:mb-0">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(task.created_at)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {task.genre ? (
                            <Badge variant="secondary" className="text-xs">
                              {task.genre}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Uncategorized
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={user?.imageUrl} />
                              <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground"></span>
                          </div>
                          <Button
                            size="sm"
                            className="group"
                            onClick={() => handleViewBlog(task.slug)}
                            disabled={loading}
                          >
                            {loading ? (
                              "Loading..."
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Featured Section */}
          {dataReady && sortedTasks.length > 3 && (
            <div className="mt-16">
              <div className="flex items-center mb-6">
                <Sparkles className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-2xl font-bold">Featured Properties</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sortedTasks.slice(0, 3).map((task) => (
                  <Card key={task.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={task.fileURL || "/placeholder.svg?height=220&width=400" || "/placeholder.svg"}
                        className="w-full h-full object-cover"
                        alt={task.name || "Blog image"}
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1">{task.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {task.genre ? (
                          <Badge variant="secondary" className="text-xs">
                            {task.genre}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Uncategorized
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4">
                      <Button variant="outline" className="w-full" onClick={() => handleViewBlog(task.slug)}>
                        Read
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

