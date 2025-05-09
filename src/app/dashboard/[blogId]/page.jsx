"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import useSWR from "swr"
import { useSession, useUser } from "@clerk/nextjs"
import getSupabaseClient from "@/app/utils/supabase"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { slugify } from "@/app/utils/slugify"
import {
  Type,
  DollarSign,
  ShowerHead,
  SquareDashedBottom,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Save,
  Trash,
  ImageUp,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Calendar,
  Copy,
  Maximize2,
  X,
  MapPin,
  Home,
  Bed,
  Bath,
  Heart,
  Phone,
  MessageSquare,
  User,
  Info,
  Hammer,
  Pyramid,
  Map,
} from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WhatsappShareButton, WhatsappIcon } from "next-share"
import { TwitterShareButton, TwitterIcon } from "next-share"
import { FacebookShareButton, FacebookIcon } from "next-share"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

const PropertyMap = dynamic(() => import("../../../components/property-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] border rounded-md bg-muted/20 flex items-center justify-center">Loading map...</div>
  ),
})

const MapSelector = dynamic(() => import("../../../components/map-selector"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] border rounded-md bg-muted/20 flex items-center justify-center">Loading map...</div>
  ),
})

export default function PropertyListingPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [area, setArea] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
  const [purpose, setPurpose] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [bed, setBed] = useState("")
  const [bathroom, setBathroom] = useState("")
  const [year, setYear] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fileURL, setFileURL] = useState("")
  const [fileURLs, setFileURLs] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [existingFilePath, setExistingFilePath] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const [slug, setNewSlug] = useState(slugify(name))
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactMessage, setContactMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const router = useRouter()
  const { blogId: id } = useParams()
  const { user } = useUser()
  const { session } = useSession()

  const email = user?.primaryEmailAddress?.emailAddress || ""
  const authorName = user?.firstName || "Property Owner"
  const authorAvatar = user?.imageUrl

  const [genre, setGenre] = useState("")
  const pathname = usePathname()
  const allowCopy = useRef(false)

  const propertyFeatures = {
    bedrooms: bed,
    bathrooms: bathroom,
    year: year,
    propertyType: genre || "Residential",
  }

  function copyUrl() {
    allowCopy.current = true
    const el = document.createElement("input")
    el.value = window.location.href
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
    allowCopy.current = false
    toast.success("Listing URL copied to clipboard")
  }

  function CallSeller() {
    window.open(`tel:${phoneNumber}`, "_self")
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === "ArrowLeft") {
          navigateImages("prev")
        } else if (e.key === "ArrowRight") {
          navigateImages("next")
        } else if (e.key === "Escape") {
          setIsFullscreen(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen, fileURLs, currentImageIndex])

  const {
    data: property,
    mutate,
    isLoading: isPropertyLoading,
    error: propertyError,
  } = useSWR(user && id ? ["slug", id] : null, async () => {
    const clerkToken = await session?.getToken({ template: "supabase" })
    const client = getSupabaseClient(clerkToken)
    const { data, error } = await client.from("tasks").select().eq("slug", id).single()
    if (error) throw error
    return data
  })

  useMemo(() => {
    if (property) {
      setName(property.name)
      setDescription(property.description)
      setBlogContent(property.blogContent)
      setFileURL(property.fileURL)
      setFileURLs(property.fileURLs || (property.fileURL ? [property.fileURL] : []))
      setGenre(property.genre || "")
      setPrice(property.price)
      setArea(property.area)
      setLocation(property.location)
      setCoordinates(property.coordinates || { lat: null, lng: null })
      setPurpose(property.purpose)
      setBed(property.bed)
      setBathroom(property.bathroom)
      setYear(property.year)
      setPhoneNumber(property.phoneNumber)
    }
  }, [property])

  const handleLocationSelect = (lat, lng, address) => {
    setCoordinates({ lat, lng })
    if (address) {
      setLocation(address)
    }
  }

  async function deleteProperty() {
    const clerkToken = await session?.getToken({ template: "supabase" })
    const client = getSupabaseClient(clerkToken)

    try {
      await client.from("tasks").delete().eq("slug", id)
      await client.from("all_tasks").delete().eq("slug", id)

      mutate()
      toast.success("Property listing deleted successfully")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Error deleting property: " + error.message)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    const clerkToken = await session?.getToken({ template: "supabase" })
    const client = getSupabaseClient(clerkToken)

    try {
      setUploading(true)

      if (!file) {
        toast.info("Please select a file to upload")
        return
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      if (existingFilePath) {
        const { error: deleteError } = await client.storage.from("images").remove([existingFilePath])
        if (deleteError) {
          throw deleteError
        }
      }

      const { data, error } = await client.storage.from("images").upload(filePath, file)
      if (error) {
        throw error
      }

      const { data: publicUrlData, error: urlError } = client.storage.from("images").getPublicUrl(filePath)
      if (urlError) {
        throw urlError
      }

      const newFileURL = publicUrlData.publicUrl
      setFileURL(newFileURL)
      setFileURLs([...fileURLs, newFileURL])
      setExistingFilePath(filePath)

      toast.success("File uploaded successfully")
    } catch (error) {
      toast.error("Error uploading file: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const createOrUpdateProperty = async (e) => {
    e.preventDefault()
    const clerkToken = await session?.getToken({ template: "supabase" })
    const client = getSupabaseClient(clerkToken)

    try {
      if (id) {
        await client
          .from("tasks")
          .update({
            name,
            description,
            price,
            area,
            location,
            coordinates,
            purpose,
            bed,
            bathroom,
            year,
            phoneNumber,
            blogContent,
            fileURL,
            fileURLs,
            slug: slug,
            genre,
          })
          .eq("slug", id)

        await client
          .from("all_tasks")
          .update({
            name,
            description,
            price,
            area,
            location,
            coordinates,
            purpose,
            bed,
            bathroom,
            year,
            phoneNumber,
            blogContent,
            fileURL,
            fileURLs,
            slug: slug,
            genre,
          })
          .eq("slug", id)
      } else {
        const propertyData = {
          name,
          email,
          description,
          location,
          coordinates,
          price,
          area,
          purpose,
          bed,
          bathroom,
          year,
          phoneNumber,
          blogContent,
          fileURL,
          fileURLs,
          slug: slug,
          genre,
        }

        await client.from("tasks").insert(propertyData)
        await client.from("all_tasks").insert(propertyData)
      }
      mutate()
      setFile(null)
      toast.success("Property listing saved successfully")
      setEditMode(false)

      if (!id || id !== slug) {
        router.push(`/blog/${slug}`)
      }

      router.push("/dashboard")
    } catch (error) {
      toast.error("Error saving property: " + error.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const formatPrice = (price) => {
    if (!price) return "Price on request"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatArea = (area) => {
    if (!area) return "Area not specified"
    return `${area} sq ft`
  }

  useEffect(() => {
    setNewSlug(slugify(name))
  }, [name])

  const navigateImages = (direction) => {
    if (!fileURLs || fileURLs.length <= 1) return

    let newIndex
    if (direction === "next") {
      newIndex = (currentImageIndex + 1) % fileURLs.length
    } else {
      newIndex = (currentImageIndex - 1 + fileURLs.length) % fileURLs.length
    }

    setCurrentImageIndex(newIndex)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setIsSending(true)

    setTimeout(() => {
      toast.success("Your message has been sent to the seller")
      setContactName("")
      setContactEmail("")
      setContactMessage("")
      setIsSending(false)
    }, 1500)
  }

  if (isPropertyLoading && !editMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-32 mb-4" />

            <div className="flex justify-between items-start mb-6">
              <div className="w-full max-w-2xl">
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-2/3" />

                <div className="flex items-center mt-4">
                  <Skeleton className="h-6 w-32 mr-4" />
                  <Skeleton className="h-6 w-40" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>

          <Skeleton className="w-full h-[400px] mb-8 rounded-lg" />

          <div className="space-y-4 mb-12">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>

          <Separator className="my-8" />

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (propertyError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">Error Loading Property</CardTitle>
            <CardDescription>
              We couldn&apos;t load the property you requested. It may have been deleted or you may not have permission
              to view it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Error details: {propertyError.message || "Unknown error"}</p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!editMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <div className="mb-5 flex items-center justify-center gap-x-2 text-lg font-bold bg-secondary p-2 text-slate-700 dark:text-white rounded-lg">
              <Info size={20} /> How buyers see your property
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{name}</h1>
                  <Badge variant="outline" className="mt-2 md:mt-0 px-3 py-1.5 text-sm">
                    {purpose || "For Sale"}
                  </Badge>
                </div>

                <div className="flex items-center text-muted-foreground mb-6">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{location || "Location not specified"}</span>
                </div>

                {fileURLs && fileURLs.length > 0 && (
                  <div className="mb-8 rounded-lg overflow-hidden">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border bg-muted">
                      {fileURLs.length > 1 && (
                        <>
                          <button
                            onClick={() => navigateImages("prev")}
                            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => navigateImages("next")}
                            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none"
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={toggleFullscreen}
                        className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none"
                        aria-label="Toggle fullscreen"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>

                      <img
                        className="w-full h-full object-cover"
                        src={fileURLs[currentImageIndex] || "/placeholder.svg"}
                        alt={name || "Property image"}
                      />

                      {fileURLs.length > 1 && (
                        <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                          {currentImageIndex + 1} / {fileURLs.length}
                        </div>
                      )}
                    </div>

                    {fileURLs.length > 1 && (
                      <div className="grid grid-cols-6 gap-2 mt-2">
                        {fileURLs.map((url, index) => (
                          <div
                            key={index}
                            className={`relative aspect-square cursor-pointer rounded-md overflow-hidden border transition-all ${
                              index === currentImageIndex ? "ring-2 ring-primary ring-offset-1" : "hover:opacity-90"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Thumbnail ${index + 1}`}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center p-3 border rounded-md">
                    <Bed className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="font-medium">{propertyFeatures.bedrooms || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-md">
                    <Bath className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-medium">{propertyFeatures.bathrooms || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-md">
                    <Hammer className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year Built</p>
                      <p className="font-medium">{propertyFeatures.year || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-md">
                    <SquareDashedBottom className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="font-medium">{formatArea(area)}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-md">
                    <Home className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-medium">{genre || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-md">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Listed</p>
                      <p className="font-medium">{property?.created_at ? formatDate(property.created_at) : "N/A"}</p>
                    </div>
                  </div>
                </div>

                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-xl">Property Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {description || "No description available."}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Property Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {coordinates && coordinates.lat && coordinates.lng ? (
                      <PropertyMap coordinates={coordinates} address={location} propertyTitle={name} />
                    ) : (
                      <div className="p-4 text-center border rounded-md bg-muted/20">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No map location available for this property</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2 mb-8">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)} aria-label="Edit property">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Property
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" aria-label="Delete property">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your property listing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={deleteProperty}>
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Share2 className="mr-2 h-5 w-5" />
                      Share this property
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-4">
                      <FacebookShareButton url={`https://brickscape.vercel.app/${pathname}`} hashtag={"#realestate"}>
                        <FacebookIcon size={32} round />
                      </FacebookShareButton>

                      <TwitterShareButton
                        url={`https://brickscape.vercel.app/${pathname}`}
                        title={`Check out this property: ${name}`}
                      >
                        <TwitterIcon size={32} round />
                      </TwitterShareButton>
                      <WhatsappShareButton
                        url={`https://brickscape.vercel.app/${pathname}`}
                        title={`Check out this property: ${name}`}
                        separator=" - "
                      >
                        <WhatsappIcon size={32} round />
                      </WhatsappShareButton>

                      <button
                        onClick={copyUrl}
                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Copy link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-3xl font-bold">{formatPrice(price)}</p>
                      </div>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per sq ft</span>
                        <span className="font-medium">
                          {price && area ? formatPrice(price / area) : "Not available"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purpose</span>
                        <span className="font-medium">{purpose || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Listed on</span>
                        <span className="font-medium">
                          {property?.created_at ? formatDate(property.created_at) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Listed by</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                        <img
                          src={authorAvatar || "/placeholder.svg?height=48&width=48" || "/placeholder.svg"}
                          alt="Seller"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{authorName}</p>
                        <p className="text-sm text-muted-foreground">Property Owner</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button variant="outline" onClick={() => CallSeller()} className="w-full justify-start">
                        <Phone className="mr-2 h-4 w-4" />
                        Contact Seller
                      </Button>
                      <Button variant="outline"  className="flex gap-x-2 w-full justify-start">
                      <WhatsappIcon size={23} className="rounded-3xl"/>
                      <a className="flex" href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Send a Message</CardTitle>
                    <CardDescription>Interested in this property? Send a message to the seller.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContactSubmit} className="space-y-4" id="form">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Your Name
                        </label>
                        <Input
                          id="name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Your Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message
                        </label>
                        <Textarea
                          id="message"
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="I'm interested in this property..."
                          rows={4}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSending}>
                        {isSending ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {isFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 focus:outline-none"
              aria-label="Close fullscreen"
            >
              <X className="h-6 w-6" />
            </button>

            {fileURLs.length > 1 && (
              <>
                <button
                  onClick={() => navigateImages("prev")}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 focus:outline-none"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={() => navigateImages("next")}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 focus:outline-none"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <img
              src={fileURLs[currentImageIndex] || "/placeholder.svg"}
              alt={`Fullscreen image ${currentImageIndex + 1}`}
              className="max-h-screen max-w-full object-contain"
            />

            {fileURLs.length > 1 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
                {currentImageIndex + 1} / {fileURLs.length}
              </div>
            )}
          </div>
        )}
      </div>
    )
  } else {
    if (isPropertyLoading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background"
        >
          <div className="flex">
            <div className="flex-1 p-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Skeleton className="h-10 w-40 mb-2" />
                    <Skeleton className="h-5 w-64" />
                  </div>
                  <Skeleton className="h-8 w-48" />
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-7 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-40" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Skeleton className="h-7 w-32 mb-1" />
                      <Skeleton className="h-5 w-64" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-[400px] w-full mb-6" />
                      <div className="mt-6">
                        <Skeleton className="h-5 w-32 mb-3" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        <div className="flex">
          <div className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
                  <p className="text-muted-foreground mt-1">Make changes to your property listing</p>
                </div>
              </div>

              <form onSubmit={createOrUpdateProperty}>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="content">
                      <FileText className="w-4 h-4 mr-2" />
                      Property Details
                    </TabsTrigger>
                    <TabsTrigger value="location">
                      <MapPin className="w-4 h-4 mr-2" />
                      Location
                    </TabsTrigger>
                    <TabsTrigger value="media">
                      <ImageUp className="w-4 h-4 mr-2" />
                      Property Images
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Property Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="purpose" className="text-sm font-medium">
                            <Pyramid className="w-4 h-4 inline mr-2" />
                            Select Purpose
                          </label>
                          <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger id="purpose" className="h-12">
                              <SelectValue placeholder="Select your Purpose" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uncategorized">Uncategorized</SelectItem>
                              <SelectItem value="Rent">Rent</SelectItem>
                              <SelectItem value="Sell">Sell</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="title" className="text-sm font-medium">
                            <Type className="w-4 h-4 inline mr-2" />
                            Property Title
                          </label>
                          <Input
                            id="title"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter a compelling title"
                            className="h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="description" className="text-sm font-medium">
                            <FileText className="w-4 h-4 inline mr-2" />
                            Description
                          </label>
                          <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a detailed description of the property"
                            className="min-h-[120px] resize-none"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="genre" className="text-sm font-medium">
                            <Home className="w-4 h-4 inline mr-2" />
                            Property Type
                          </label>
                          <Select value={genre} onValueChange={setGenre}>
                            <SelectTrigger id="genre" className="h-12">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="House">House</SelectItem>
                              <SelectItem value="Apartment">Apartment</SelectItem>
                              <SelectItem value="Condo">Condo</SelectItem>
                              <SelectItem value="Townhouse">Townhouse</SelectItem>
                              <SelectItem value="Villa">Villa</SelectItem>
                              <SelectItem value="Land">Land</SelectItem>
                              <SelectItem value="Commercial">Commercial</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="price" className="text-sm font-medium">
                              <DollarSign className="w-4 h-4 inline mr-2" />
                              Price
                            </label>
                            <Input
                              id="price"
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder="Enter Price"
                              className="h-12"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="area" className="text-sm font-medium">
                              <SquareDashedBottom className="w-4 h-4 inline mr-2" />
                              Area (sq ft)
                            </label>
                            <Input
                              id="area"
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
                            <label htmlFor="bed" className="text-sm font-medium items-center">
                              <Bed className="w-4 h-4 inline mr-2" />
                              No. of Beds
                            </label>
                            <Input
                              id="bed"
                              type="number"
                              placeholder="How many beds?"
                              onChange={(e) => setBed(e.target.value)}
                              value={bed}
                              required
                              className="h-12"
                              aria-label="bed"
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="bathroom" className="text-sm font-medium items-center">
                              <ShowerHead className="w-4 h-4 inline mr-2" />
                              No. of Bathrooms
                            </label>
                            <Input
                              id="bathroom"
                              type="number"
                              placeholder="How many bathrooms?"
                              onChange={(e) => setBathroom(e.target.value)}
                              value={bathroom}
                              required
                              className="h-12"
                              aria-label="bathroom"
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="yearBuilt" className="text-sm font-medium items-center">
                              <Hammer className="w-4 h-4 inline mr-2" />
                              Year Built
                            </label>
                            <Input
                              id="yearBuilt"
                              type="number"
                              placeholder="When was it built?"
                              onChange={(e) => setYear(e.target.value)}
                              value={year}
                              required
                              className="h-12"
                              aria-label="year built"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="phoneNumber" className="text-sm font-medium">
                              <Phone className="w-4 h-4 inline mr-2" />
                              Seller Phone Number
                            </label>
                            <Input
                              id="phoneNumber"
                              type="number"
                              placeholder="Enter Phone number"
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              value={phoneNumber}
                              required
                              className="h-12"
                              aria-label="phone number"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="location" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Property Location</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="location" className="text-sm font-medium">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Property Address
                          </label>
                          <div className="flex gap-2">
                            <Input
                              id="location"
                              type="text"
                              placeholder="Enter address of your property"
                              onChange={(e) => setLocation(e.target.value)}
                              value={location}
                              required
                              className="h-12 flex-1"
                              aria-label="LOCATION"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowMap(!showMap)}
                              className="h-12"
                            >
                              <Map className="w-4 h-4 mr-2" />
                              {showMap ? "Hide Map" : "Show Map"}
                            </Button>
                          </div>
                        </div>

                        {showMap && (
                          <div className="mt-4">
                            <MapSelector
                              onLocationSelect={handleLocationSelect}
                              initialAddress={location}
                              initialCoordinates={coordinates.lat && coordinates.lng ? coordinates : null}
                            />
                            {coordinates.lat && coordinates.lng && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                Selected coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="media">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Property Images</CardTitle>
                        <CardDescription>Upload high-quality images of your property</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
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
                                  onChange={handleFileChange}
                                  className="cursor-pointer"
                                  accept="image/*"
                                  aria-label="Select file to upload"
                                />
                              </div>
                              <Button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading || !file}
                                className="min-w-[120px]"
                              >
                                {uploading ? (
                                  "Uploading..."
                                ) : (
                                  <>
                                    <ImageUp className="w-4 h-4 mr-2" />
                                    Upload
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {fileURLs && fileURLs.length > 0 && (
                            <div className="mt-8 border-t pt-6">
                              <h3 className="text-sm font-medium mb-4">Uploaded Images</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {fileURLs.map((url, index) => (
                                  <div
                                    key={index}
                                    className={`relative rounded-md overflow-hidden border cursor-pointer transition-all ${
                                      url === fileURL ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-90"
                                    }`}
                                    onClick={() => setFileURL(url)}
                                  >
                                    <img
                                      src={url || "/placeholder.svg"}
                                      alt={`Image ${index + 1}`}
                                      className="w-full h-48 object-cover"
                                    />
                                    {url === fileURL && (
                                      <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                                          <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                                          Cover Image
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={!name || !description || !price || !purpose || !bed || !bathroom || !year || !phoneNumber}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
}
