"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import useSWR from "swr"
import { useSession, useUser } from "@clerk/nextjs"
import getSupabaseClient from "@/app/utils/supabase"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import parse from "html-react-parser"
import { slugify } from "@/app/utils/slugify"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

import {
  Copy,
  ArrowLeft,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MapPin,
  Home,
  SquareIcon as SquareFootIcon,
  Phone,
  User,
  MessageSquare,
  Heart,
  Bed,
  Bath,
  Car,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSupabaseData } from "@/app/utils/SupabaseContext"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompletion } from "ai/react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

import { WhatsappShareButton, WhatsappIcon } from "next-share"
import { TwitterShareButton, TwitterIcon } from "next-share"
import { FacebookShareButton, FacebookIcon } from "next-share"

export default function PropertyListingPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [area, setArea] = useState("")
  const [location, setLocation] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [fileURL, setFileURL] = useState("")
  const [fileURLs, setFileURLs] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [authorEmail, setAuthorEmail] = useState("")
  const [authorAvatar, setAuthorAvatar] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactMessage, setContactMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const router = useRouter()
  const { blogId: id } = useParams()
  const { user } = useUser()
  const { session } = useSession()

  const [actionType, setActionType] = useState(null)
  const authorName = user?.firstName

  const { countData, setCountData } = useSupabaseData()
  const [currentCount, setCurrentCount] = useState(countData[0]?.count || 0)
  const [slug, setNewSlug] = useState(slugify(name))
  const pathname = usePathname()
  const allowCopy = useRef(false) // Ref to allow copy action

  // Mock property features - in a real app, these would come from the database
  const propertyFeatures = {
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    yearBuilt: 2018,
    propertyType: "House",
    furnished: "Partially",
  }

  function copyUrl() {
    allowCopy.current = true // Allow the copy action
    const el = document.createElement("input")
    el.value = window.location.href
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
    allowCopy.current = false // Reset the flag
    toast.success("Listing URL copied to clipboard")
  }

  useEffect(() => {
    setCurrentCount(countData[0]?.count || 0)
  }, [countData])

  // Handle keyboard navigation for image slider
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

  const { complete, completion } = useCompletion({
    api:
      actionType === "paraphrase"
        ? "/api/rephrase"
        : actionType === "summarize"
          ? "/api/summarize"
          : actionType === "spellcheck"
            ? "/api/spellchecker"
            : actionType === "generateBlog"
              ? "/api/generateBlog"
              : "",
    body: { text: blogContent },
  })

  const {
    data: property,
    mutate,
    isLoading: isPropertyLoading,
    error: propertyError,
  } = useSWR(id ? ["slug", id] : null, async () => {
    if (user) {
      const clerkToken = await session?.getToken({ template: "supabase" })
      const client = clerkToken ? getSupabaseClient(clerkToken) : getSupabaseClient()
      const { data, error } = await client.from("all_tasks").select().eq("slug", id).single()
      if (error) throw error
      return data
    } else {
      // Fetch without authentication
      const client = getSupabaseClient()
      const { data, error } = await client.from("all_tasks").select().eq("slug", id).single()
      if (error) throw error
      return data
    }
  })

  useMemo(() => {
    if (property) {
      setName(property.name)
      setDescription(property.description)
      setBlogContent(property.blogContent)
      setFileURL(property.fileURL)
      // Handle fileURLs array if it exists, otherwise create an array with the single fileURL
      setFileURLs(property.fileURLs || (property.fileURL ? [property.fileURL] : []))
      setAuthorEmail(property.email)
      setAuthorAvatar(property.authorAvatar)
      setPrice(property.price)
      setArea(property.area)
      setLocation(property.location || "Not specified")
    }
  }, [property])

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

  // Image slider navigation
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

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setIsSending(true)

    // Simulate sending a message
    setTimeout(() => {
      toast.success("Your message has been sent to the seller")
      setContactName("")
      setContactEmail("")
      setContactMessage("")
      setIsSending(false)
    }, 1500)
  }

  // Loading skeleton for the property view
  if (isPropertyLoading) {
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

  // Error state
  if (propertyError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">Error Loading Property</CardTitle>
            <CardDescription>
              We couldn&apos;t load the property listing you requested. It may have been deleted or you may not have
              permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Error details: {propertyError.message || "Unknown error"}</p>
            <Button onClick={() => router.push("/gallery")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Property Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // View Mode
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push("/gallery")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - 2/3 width on desktop */}
            <div className="lg:col-span-2">
              {/* Property Title and Badge */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{name}</h1>
                <Badge variant="outline" className="mt-2 md:mt-0 px-3 py-1.5 text-sm">
                  {propertyFeatures.propertyType || "Residential"}
                </Badge>
              </div>

              {/* Location */}
              <div className="flex items-center text-muted-foreground mb-6">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{location || "Location not specified"}</span>
              </div>

              {/* Image Slider */}
              {fileURLs && fileURLs.length > 0 && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border bg-muted">
                    {/* Navigation Arrows - Only show if there are multiple images */}
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

                    {/* Fullscreen Button */}
                    <button
                      onClick={toggleFullscreen}
                      className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none"
                      aria-label="Toggle fullscreen"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>

                    {/* Current Image */}
                    <img
                      className="w-full h-full object-cover"
                      src={fileURLs[currentImageIndex] || "/placeholder.svg"}
                      alt={name || "Property image"}
                    />

                    {/* Image Counter - Only show if there are multiple images */}
                    {fileURLs.length > 1 && (
                      <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                        {currentImageIndex + 1} / {fileURLs.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails - Only show if there are multiple images */}
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

              {/* Property Features */}
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
                  <Car className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Parking</p>
                    <p className="font-medium">{propertyFeatures.parking || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border rounded-md">
                  <SquareFootIcon className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-medium">{formatArea(area)}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border rounded-md">
                  <Home className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-medium">{propertyFeatures.yearBuilt || "N/A"}</p>
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

              {/* Description */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Property Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {description || blogContent ? parse(description || blogContent) : "No description available."}
                  </div>
                </CardContent>
              </Card>

              {/* Share Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Share2 className="mr-2 h-5 w-5" />
                    Share this property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-4">
                    <FacebookShareButton url={`https://property-listings.com${pathname}`} hashtag={"#realestate"}>
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>

                    <TwitterShareButton
                      url={`https://property-listings.com${pathname}`}
                      title={`Check out this property: ${name}`}
                    >
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <WhatsappShareButton
                      url={`https://property-listings.com${pathname}`}
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

            {/* Sidebar - 1/3 width on desktop */}
            <div className="lg:col-span-1">
              {/* Price Card */}
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
                      <span className="font-medium">{price && area ? formatPrice(price / area) : "Not available"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Furnished</span>
                      <span className="font-medium">{propertyFeatures.furnished || "No"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Listed by</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                      <img
                        src={authorAvatar || "/placeholder.svg?height=48&width=48"}
                        alt="Seller"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{authorName || "Property Owner"}</p>
                      <p className="text-sm text-muted-foreground">Seller</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="mr-2 h-4 w-4" />
                      Contact Seller
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/gallery/author/${encodeURIComponent(authorEmail)}`)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send a Message</CardTitle>
                  <CardDescription>Interested in this property? Send a message to the seller.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
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

      {/* Fullscreen Image Viewer */}
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

          {/* Image Counter */}
          {fileURLs.length > 1 && (
            <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
              {currentImageIndex + 1} / {fileURLs.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
