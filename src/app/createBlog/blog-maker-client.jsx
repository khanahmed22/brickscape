"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSession, useUser } from "@clerk/nextjs"
import getSupabaseClient from "@/app/utils/supabase"
import { useSupabaseData } from "@/app/utils/SupabaseContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCompletion } from "ai/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  DollarSign,
  Sparkles,
  ImageUp,
  Type,
  FileText,
  CheckCircle2,
  FileImage,
  Send,
  SquareDashedBottom,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { slugify } from "@/app/utils/slugify"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dynamically import JoditEditor with SSR disabled
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] border rounded-md bg-muted/20 flex items-center justify-center">Loading editor...</div>
  ),
})

export default function BlogMakerClient() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [area, setArea] = useState("")
  const [location,setLocation] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [slug, setSlug] = useState("")
  const [genre, setGenre] = useState("")
  const { user } = useUser()
  const { session } = useSession()
  const editorRef = useRef(null)
  const router = useRouter()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [fileURLs, setFileURLs] = useState([])
  const [coverImageURL, setCoverImageURL] = useState("")
  const [actionType, setActionType] = useState(null)

  const [imageSrc, setImageSrc] = useState(null)

  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState("")

  const email = user?.primaryEmailAddress?.emailAddress || ""
  const authorName = user?.firstName
  const authorAvatar = user?.imageUrl

  const { countData, setCountData } = useSupabaseData()
  const currentCount = countData?.[0]?.count || 0

  const [loading, setloading] = useState(false)

  const {
    complete: completeParaphrase,
    completion: paraphraseCompletion,
    isLoading: paraphraseLoading,
  } = useCompletion({
    api: "/api/rephrase",
    body: { text: blogContent },
  })

  const {
    complete: completeSummarize,
    completion: summarizeCompletion,
    isLoading: summarizeLoading,
  } = useCompletion({
    api: "/api/summarize",
    body: { text: blogContent },
  })

  const {
    complete: completeSpellcheck,
    completion: spellcheckCompletion,
    isLoading: spellcheckLoading,
  } = useCompletion({
    api: "/api/spellchecker",
    body: { text: blogContent },
  })

  const {
    complete: completeGenerateBlog,
    completion: generateBlogCompletion,
    isLoading: generateBlogLoading,
  } = useCompletion({
    api: "/api/generateBlog",
    body: { text: blogContent },
  })

  // Combined loading state for UI
  const aiLoading = paraphraseLoading || summarizeLoading || spellcheckLoading || generateBlogLoading

  useEffect(() => {
    if (!user) return

    async function loadTasks() {
      setLoading(true)
      const clerkToken = await session?.getToken({ template: "supabase" })
      const client = getSupabaseClient(clerkToken)
      const { data, error } = await client.from("tasks").select()
      if (!error) setTasks(data)
      setLoading(false)
    }

    loadTasks()
  }, [user, session])

  // Update slug when name changes
  useEffect(() => {
    setSlug(slugify(name))
  }, [name])

  // Handle completions from different AI actions
  useEffect(() => {
    if (paraphraseCompletion) {
      setBlogContent(paraphraseCompletion)
      toast.success("Blog content rephrased successfully")
    }
  }, [paraphraseCompletion])

  useEffect(() => {
    if (summarizeCompletion) {
      setBlogContent(summarizeCompletion)
      toast.success("Blog content summarized successfully")
    }
  }, [summarizeCompletion])

  useEffect(() => {
    if (spellcheckCompletion) {
      setBlogContent(spellcheckCompletion)
      toast.success("Spelling corrected successfully")
    }
  }, [spellcheckCompletion])

  useEffect(() => {
    if (generateBlogCompletion) {
      setBlogContent(generateBlogCompletion)
      toast.success("Blog generated successfully")
    }
  }, [generateBlogCompletion])

  async function createTask(e) {
    e.preventDefault()
    const clerkToken = await session?.getToken({ template: "supabase" })
    const client = getSupabaseClient(clerkToken)

    try {
      setPublishing(true)

      if (editingTaskId) {
        await client
          .from("tasks")
          .update({
            name,
            description,
            price,
            area,
            blogContent,
            location,
            fileURL: coverImageURL,
            fileURLs,
            slug,
            genre,
          })
          .eq("id", editingTaskId)

        setTasks(
          tasks.map((task) =>
            task.id === editingTaskId
              ? { ...task, name, description, price, area,location, blogContent, fileURL: coverImageURL, fileURLs, slug, genre }
              : task,
          ),
        )
        setEditingTaskId(null)
      } else {
        // Create the blog post data object
        const blogData = {
          name,
          email,
          authorName,
          authorAvatar,
          description,
          price,
          area,
          location,
          blogContent,
          fileURL: coverImageURL,
          fileURLs,
          slug,
          genre,
        }

        // Insert into tasks table
        const { data, error } = await client.from("tasks").insert(blogData).select()

        if (error) throw error

        // Also insert the same data into all_tasks table
        const { error: allTasksError } = await client.from("all_tasks").insert(blogData)

        if (allTasksError) {
          console.error("Error inserting into all_tasks:", allTasksError)
          toast.warning("Blog saved to tasks but failed to save to all_tasks")
        }
      }

      setName("")
      setDescription("")
      setBlogContent("")
      setFileURLs([])
      setCoverImageURL("")
      setSlug("")
      setGenre("")
      setPrice("")
      setArea("")
      setLocation("")

      toast.success("Blog published successfully")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Error publishing blog: " + error.message)
    } finally {
      setPublishing(false)
    }
  }

  const config = useMemo(
    () => ({
      placeholder:
        "Start writing your blog content here... or Write Topic Name with number of words for Blog made by AI",
      width: "100%",
      height: "400px",
      uploader: {
        insertImageAsBase64URI: true,
        url: "https://freeimage.host/api/1/upload",
        filesVariableName: (i) => `source[${i}]`,
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_FREE_IMAGE_HOST_KEY}`,
        },
        format: "json",
        isSuccess: (resp) => !resp.error,
        process: (resp) => ({
          files: resp.image ? [resp.image.url] : [],
          path: resp.image ? resp.image.url : "",
          error: resp.error,
        }),
      },
    }),
    [],
  )

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleUpload = async () => {
    const clerkToken = await session?.getToken({ template: "supabase" })
    const client = getSupabaseClient(clerkToken)

    try {
      setUploading(true)

      if (!files.length) {
        toast.info("Please select files to upload")
        return
      }

      const uploadedUrls = []

      // Upload each file
      for (const file of files) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { data, error } = await client.storage.from("images").upload(filePath, file)

        if (error) {
          toast.error(`Error uploading ${file.name}: ${error.message}`)
          continue
        }

        const { data: publicUrlData, error: urlError } = client.storage.from("images").getPublicUrl(filePath)

        if (urlError) {
          toast.error(`Error getting URL for ${file.name}: ${urlError.message}`)
          continue
        }

        uploadedUrls.push(publicUrlData.publicUrl)
      }

      if (uploadedUrls.length > 0) {
        setFileURLs([...fileURLs, ...uploadedUrls])

        // Set the first uploaded image as cover if no cover is selected yet
        if (!coverImageURL) {
          setCoverImageURL(uploadedUrls[0])
        }

        toast.success(`${uploadedUrls.length} files uploaded successfully`)
      }
    } catch (error) {
      toast.error("Error uploading files: " + error.message)
    } finally {
      setUploading(false)
      setFiles([])
    }
  }

  const handleUploadGeneratedImage = async () => {
    if (!imageSrc) {
      toast.info("Please generate an image first")
      return
    }

    try {
      setUploading(true)

      // Fetch the image as a blob
      const response = await fetch(imageSrc)
      const blob = await response.blob()

      // Create a file from the blob
      const fileName = `ai-generated-${Math.random()}.png`
      const aiGeneratedFile = new File([blob], fileName, { type: "image/png" })

      // Get Supabase client
      const clerkToken = await session?.getToken({ template: "supabase" })
      const client = getSupabaseClient(clerkToken)

      // Upload to Supabase
      const { data, error } = await client.storage.from("images").upload(fileName, aiGeneratedFile)

      if (error) {
        throw error
      }

      // Get public URL
      const { data: publicUrlData, error: urlError } = client.storage.from("images").getPublicUrl(fileName)

      if (urlError) {
        throw urlError
      }

      // Update the fileURL state
      setFileURLs([...fileURLs, publicUrlData.publicUrl])
      toast.success("AI-generated image uploaded successfully")
    } catch (error) {
      toast.error("Error uploading AI-generated image: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const updateCountInSupabase = async (newCount) => {
    const clerkToken = await session?.getToken({ template: "supabase" })
    const client = getSupabaseClient(clerkToken)

    const { error } = await client.from("ai_table").update({ count: newCount }).eq("email", email)

    if (error) {
      console.error("Error updating count in Supabase:", error)
      toast.error("Failed to update AI usage count")
    }
  }

  const handleAiAction = async (type) => {
    if (!blogContent) {
      toast.error("Text field is empty. Write something first.")
      return
    }

    if (currentCount <= 0) {
      toast.error("You've used all your AI actions. Please upgrade your plan.")
      return
    }

    setActionType(type)

    const newCount = currentCount - 1
    setCountData([{ ...countData[0], count: newCount }])

    await updateCountInSupabase(newCount)

    // Call the appropriate complete function based on action type
    switch (type) {
      case "paraphrase":
        completeParaphrase(blogContent)
        break
      case "summarize":
        completeSummarize(blogContent)
        break
      case "spellcheck":
        completeSpellcheck(blogContent)
        break
      case "generateBlog":
        completeGenerateBlog(blogContent)
        break
      default:
        break
    }
  }

  const fetchImage = async () => {
    setloading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`)
      }

      const { image } = await response.json()
      setImageSrc(image)
    } catch (err) {
      setError(err.message)
    } finally {
      setloading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/*<SideBar />*/}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Ad Maker</h1>
              <p className="text-muted-foreground mt-1">Create your Property</p>
            </div>
            <Badge variant="outline" className="px-3 py-1.5">
              <Sparkles className="w-4 h-4 mr-1.5 text-primary" />
              <span className="font-medium">
                {currentCount} AI actions remaining{" "}
                <span
                  className="font-semibold text-red-500 hover:underline hover:text-red-600 hover:font-bold ml-2 cursor-pointer"
                  onClick={() => router.push("/pricing")}
                >
                  Upgrade
                </span>
              </span>
            </Badge>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="content">
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="media">
                <FileImage className="w-4 h-4 mr-2" />
                Featured Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      <Type className="w-4 h-4 inline mr-2" />
                      Title
                    </label>
                    <Input
                      id="title"
                      autoFocus
                      type="text"
                      placeholder="Enter Property Title e.g. A beautiful house in LA"
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      required
                      className="h-12"
                      aria-label="Blog Title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Description
                    </label>
                    <Input
                      id="description"
                      type="text"
                      placeholder="Describe your property, its features, area it is in etc"
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                      required
                      className="h-12"
                      aria-label="Blog Description"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="genre" className="text-sm font-medium">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Property Type
                    </label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger id="genre" className="h-12">
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Flat">Flat</SelectItem>
                        <SelectItem value="Farm House">Farm House</SelectItem>
                        <SelectItem value="Room">Room</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Shop">Shop</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Factory">Factory</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Price
                    </label>
                    <Input
                      id="price"
                      autoFocus
                      type="number"
                      placeholder="Enter Price"
                      onChange={(e) => setPrice(e.target.value)}
                      value={price}
                      required
                      className="h-12"
                      aria-label="Price"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="area" className="text-sm font-medium">
                      <SquareDashedBottom className="w-4 h-4 inline mr-2" />
                      Area
                    </label>
                    <Input
                      id="area"
                      autoFocus
                      type="number"
                      placeholder="Enter Area in Sq. ft"
                      onChange={(e) => setArea(e.target.value)}
                      value={area}
                      required
                      className="h-12"
                      aria-label="Area"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Location
                    </label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Enter location of your property"
                      onChange={(e) => setLocation(e.target.value)}
                      value={location}
                      required
                      className="h-12"
                      aria-label="LOCATION"
                    />
                  </div>
                </CardContent>
              </Card>

              <div>
                <form onSubmit={createTask}>
                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto"
                      disabled={publishing || !name || !description || !slug || !price || !area || !coverImageURL || !location}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {publishing ? "Publishing..." : "Publish Property To Gallery"}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Upload Your Own Image</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="flex-1">
                        <label htmlFor="image-upload" className="text-sm font-medium block mb-2">
                          Upload Image (Max: 50MB)
                        </label>
                        <Input
                          id="image-upload"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="cursor-pointer"
                          aria-label="Select files to upload"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading || !files.length}
                        className="min-w-[120px]"
                      >
                        {uploading ? (
                          "Uploading..."
                        ) : (
                          <>
                            <ImageUp className="w-4 h-4 mr-2" />
                            Upload Images
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {fileURLs.length > 0 && (
                    <div className="mt-8 border-t pt-6">
                      <h3 className="text-sm font-medium mb-4">Property Images</h3>

                      {/* Product Image Gallery - E-commerce Style */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* Main Image Display */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                          <img
                            src={coverImageURL || fileURLs[0]}
                            alt="Main view"
                            className="h-full w-full object-cover object-center"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                              Cover Image
                            </Badge>
                          </div>
                        </div>

                        {/* Thumbnails Grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
                          {fileURLs.map((url, index) => (
                            <div
                              key={index}
                              className={`relative aspect-square cursor-pointer rounded-md overflow-hidden border transition-all ${
                                url === coverImageURL ? "ring-2 ring-primary ring-offset-1" : "hover:opacity-90"
                              }`}
                              onClick={() => setCoverImageURL(url)}
                            >
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Thumbnail ${index + 1}`}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Click on a thumbnail to set it as the cover image. The cover image will be displayed as the
                          main image in listings.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
