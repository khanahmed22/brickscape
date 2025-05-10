"use client";

import useSWR from "swr";
import {
  Eye,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  LayoutGrid,
  LayoutList,
  Sparkles,
  MapPin,
  SquareDashedBottom,
  HousePlus,
} from "lucide-react";
import { useSession, useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import getSupabaseClient from "../utils/supabase";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator"


export default function Dashboard() {
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");

  const fetchTasks = async (clerkToken) => {
    const client = getSupabaseClient(clerkToken);
    const { data, error } = await client.from("tasks").select();
    if (error) throw error;
    return data;
  };

  const {
    data: tasks,
    error,
    isLoading,
    mutate,
  } = useSWR(
    user ? ["tasks", session] : null,
    async () => {
      const clerkToken = await session?.getToken({ template: "supabase" });
      return await fetchTasks(clerkToken);
    },
    { revalidateOnFocus: false }
  );

  function handleCreateButton() {
    setLoading(true);
    router.push("/create-property");
  }

  function handleViewBlog(slug) {
    setLoading(true)
  
    const blogPost = tasks.find((task) => task.slug === slug)

    if (blogPost) {
      
      const email = blogPost.email
      const id = blogPost.id
      router.push(`/dashboard/${slug}`)
    } else {
   
      router.push(`/dashboard/${slug}`)
    }
  }


  const filteredTasks = tasks
    ? tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    } else if (sortBy === "oldest") {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    } else if (sortBy === "alphabetical") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatPrice = (price) => {
    if (!price) return "Price on request"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

  return (
    <>
      <div className="mt-16 min-h-screen bg-background px-5 py-8 md:px-8 lg:px-12 ">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <p className="mb-6 flex items-center max-md:text-lg max-md:flex-col">
            Welcome Back
            <span className="max-md:text-lg ml-2 font-bold text-xl bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              {user?.firstName}!
            </span>
          </p>
          <div className="flex flex-col md:flex-row justify-between max-md:justify-center max-md:items-center items-start md:items-center mb-8">
            <div>
              <div className="flex items-center justify-start gap-x-3">
                <h1 className="text-3xl font-bold  md:text-4xl max-md:text-lg">
                  My Properties
                
                </h1>

                
               
              
              </div>
              
              
            </div>
            <Button
              size="lg"
              className="mt-4 md:mt-0 group"
              onClick={handleCreateButton}
              disabled={loading}
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                  <span className="max-md:hidden">
                  Create New Property
                  </span>
                  
                </>
              )}
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search property"
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 max-md:h-10">
                      <Filter className="mr-2 h-4 w-4" />
                      <span className="max-md:hidden">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      Newest first
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                      Oldest first
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                      Alphabetical
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="border rounded-md p-1 flex">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10 max-md:h-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10 max-md:h-8"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
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
          {!isLoading && sortedTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="bg-primary/5 p-6 rounded-full mb-6">
                <HousePlus className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">No ads yet</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Post your first property now
              </p>
              <Button
                size="lg"
                className="mt-4 md:mt-0 group max-md:sm"
                onClick={handleCreateButton}
                disabled={loading}
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                    Create New Ad
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Content - Grid View */}
          {!isLoading && sortedTasks.length > 0 && viewMode === "grid" && (
            <Tabs defaultValue="all" className="w-full">
              <div className="flex max-md:flex-col max-md:gap-y-3 justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Properties</TabsTrigger>
                  <TabsTrigger value="recent">Recently Updated</TabsTrigger>
                </TabsList>
                <p className="text-sm text-muted-foreground">
                  Showing {sortedTasks.length} listing
                  {sortedTasks.length !== 1 ? "s" : ""}
                </p>
              </div>

              <TabsContent value="all" className="mt-0">
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
                              src={
                                task.fileURL || "https://placehold.co/220x400"
                              }
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              alt={task.name || "Property image"}
                            />
                          </div>
                          {task.created_at && (
                            <Badge
                              variant="secondary"
                              className="absolute bottom-3 left-3"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(task.created_at)}
                            </Badge>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-1 text-xl">
                            {task.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4 flex-grow">

                        <div className="flex flex-wrap gap-2 mb-2 mt-2">
                            {task.genre ? (
                              <Badge variant="secondary" className="text-xs">
                                {task.genre}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground"
                              >
                                Uncategorized
                              </Badge>
                            )}
                          </div>
                         

                          

                          <div className="flex flex-col items-start space-y-2 justify-between text-muted-foreground line-clamp-2">
                          <span className="flex items-start text-sm"><MapPin size={17} className="mr-2"/> <span className="truncate ...">{task.location}</span></span> <span className="flex items-center space-x-2"><SquareDashedBottom size={17} className="mr-2"/> {task.area} Sq ft</span>
                          </div>

                          <Separator className="mb-2 mt-2"/>

                          <p className="text-white line-clamp-2 font-bold text-lg">
                            {formatPrice(task.price)}
                          </p>
                          

                          
                        </CardContent>
                        <CardFooter className="pt-0 pb-4">
                          <Button
                            className="w-full group"
                            onClick={() => handleViewBlog(task.slug)}
                            disabled={loading}
                          >
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
              </TabsContent>

              <TabsContent value="recent" className="mt-0">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {sortedTasks.slice(0, 6).map((task) => (
                    <motion.div key={task.id} variants={itemVariants}>
                      <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-shadow duration-300">
                        <div className="relative">
                          <div className="aspect-video overflow-hidden bg-muted">
                            <img
                              src={
                                task.fileURL ||
                                "/placeholder.svg?height=220&width=400"
                              }
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              alt={task.name || "Blog image"}
                            />
                          </div>
                          {task.created_at && (
                            <Badge
                              variant="secondary"
                              className="absolute bottom-3 left-3"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(task.created_at)}
                            </Badge>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-1 text-xl">
                            {task.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4 flex-grow">
                          <p className="text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0 pb-4">
                          <Button
                            className="w-full group"
                            onClick={() => handleViewBlog(task.id)}
                            disabled={loading}
                          >
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
              </TabsContent>
            </Tabs>
          )}

          {/* Content - List View */}
          {!isLoading && sortedTasks.length > 0 && viewMode === "list" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">All Blogs</h2>
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
                            src={
                              task.fileURL ||
                              "/placeholder.svg?height=200&width=200"
                            }
                            className="w-full h-full object-cover"
                            alt={task.name || "Blog image"}
                          />
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                          <h3 className="text-xl font-semibold mb-2 md:mb-0">
                            {task.name}
                          </h3>
                          {task.created_at && (
                            <Badge variant="outline" className="mb-2 md:mb-0">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(task.created_at)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={user?.imageUrl} />
                              <AvatarFallback>
                                {user?.firstName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {user?.fullName ||
                                user?.primaryEmailAddress?.emailAddress}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="group"
                            onClick={() => handleViewBlog(task.id)}
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
          {!isLoading && sortedTasks.length > 3 && (
            <div className="mt-16">
              <div className="flex items-center mb-6">
                <Sparkles className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-2xl font-bold">Featured Blogs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sortedTasks.slice(0, 3).map((task) => (
                  <Card
                    key={task.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={task.fileURL || "https://placehold.co/220x400"}
                        className="w-full h-full object-cover"
                        alt={task.name || "Blog image"}
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1">
                        {task.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewBlog(task.slug)}
                      >
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
  );
}
