"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSession, useUser } from "@clerk/nextjs"
import getSupabaseClient from "../utils/supabase"
import {
  Search,
  MapPin,
  Building,
  ArrowRight,
  Home,
  DollarSign,
  Eye,
  ArrowUpRight,
  Shield,
  TrendingUp,
  Handshake,
  Award,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  const { user } = useUser()
  const { session } = useSession()
  const router = useRouter()
  const canvasRef = useRef(null)


  const [searchTerm, setSearchTerm] = useState("")
  const [purpose, setPurpose] = useState("all")
  const [area, setArea] = useState("")
  const [priceRange, setPriceRange] = useState("any")
  const [propertyType, setPropertyType] = useState("")
  const [dataReady, setDataReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("buy")


  const fetchProperties = async (clerkToken) => {
    const client = clerkToken ? getSupabaseClient(clerkToken) : getSupabaseClient()
    const { data, error } = await client.from("all_tasks").select()
    if (error) throw error
    return data
  }

  const {
    data: properties,
    error,
    isLoading,
  } = useSWR(
    "all_properties",
    async () => {
      if (user) {
        const clerkToken = await session?.getToken({ template: "supabase" })
        return await fetchProperties(clerkToken)
      } else {
        return await fetchProperties(null)
      }
    },
    { revalidateOnFocus: false },
  )


  useEffect(() => {
    if (properties && !isLoading) {
      const timer = setTimeout(() => {
        setDataReady(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setDataReady(false)
    }
  }, [properties, isLoading])


  const uniquePropertyTypes = useMemo(() => {
    if (!properties) return []

    const types = properties
      .map((property) => property.genre || "Uncategorized")
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()

    return types
  }, [properties])


  const uniqueAreas = useMemo(() => {
    if (!properties) return []

    const areas = properties
      .map((property) => property.location || "")
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()

    return areas
  }, [properties])

  
  const formatPrice = (price) => {
    if (!price) return "Price on request"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  function handleViewProperty(slug) {
    setLoading(true)
    const property = properties.find((p) => p.slug === slug)

    if (property) {
      const email = property.email
      router.push(`/gallery/${email}/${slug}`)
    } else {
      router.push(`/gallery/${slug}`)
    }
  }

  function handleSearch() {
   
    const params = new URLSearchParams()
    if (searchTerm) params.append("q", searchTerm)
    if (purpose && purpose !== "all") params.append("purpose", purpose)
    if (area) params.append("area", area)
    if (propertyType) params.append("type", propertyType)
    if (priceRange) params.append("price", priceRange)

  
    router.push(`/propertySearch?${params.toString()}`)
  }

  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  }

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
      },
    },
  }

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

  
  const getPurposeBadgeVariant = (purpose) => {
    if (!purpose) return "outline"
    switch (purpose?.toLowerCase()) {
      case "rent":
        return "secondary"
      case "sell":
        return "default"
      default:
        return "outline"
    }
  }

  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight * 0.8)

  
    const pixelSize = 20
    const cols = Math.ceil(width / pixelSize)
    const rows = Math.ceil(height / pixelSize)
    const pixels = []

 
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        pixels.push({
          x: x * pixelSize,
          y: y * pixelSize,
          size: pixelSize,
          color: `rgba(${Math.random() * 50 + 30}, ${Math.random() * 50 + 100}, ${Math.random() * 50 + 150}, ${Math.random() * 0.3 + 0.1})`,
          speed: Math.random() * 0.2 + 0.1,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }


    let animationId
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

     
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#1a365d")
      gradient.addColorStop(1, "#2d3748")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

     
      pixels.forEach((pixel) => {
        pixel.phase += pixel.speed
        const alpha = ((Math.sin(pixel.phase) + 1) / 2) * 0.5 + 0.1
        ctx.fillStyle = pixel.color.replace(/[\d.]+\)$/, `${alpha})`)
        ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

   
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight * 0.8
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />

        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-background" />

        <div className="relative z-10 max-w-5xl w-full px-4 md:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center mb-8">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">Find Your Dream Property</h1>
            <p className="text-lg text-white/90 max-w-xl mx-auto">
              Discover the perfect home, apartment, or commercial space that fits your needs
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className=" backdrop-blur-md rounded-lg shadow-xl overflow-hidden"
          >
            <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                  <TabsTrigger value="buy" onClick={() => setPurpose("buy")}>
                    <Home className="mr-2 h-4 w-4" />
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="rent" onClick={() => setPurpose("rent")}>
                    <Building className="mr-2 h-4 w-4" />
                    Rent
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by location, property name..."
                      className="pl-10 h-12"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger className="h-12">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Area" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Area</SelectItem>
                      {uniqueAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="h-12">
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Property Type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      {uniquePropertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="h-12">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Price Range" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Price</SelectItem>
                      <SelectItem value="0-50000">$0 - $50,000</SelectItem>
                      <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
                      <SelectItem value="200000+">$200,000+</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button size="lg" className="h-12 bg-primary" onClick={handleSearch}>
                    Search Properties
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Tabs>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-center mt-8 gap-4"
          >
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm">
              {properties ? properties.length : "0"}+ Properties
            </Badge>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm">
              {uniqueAreas.length}+ Locations
            </Badge>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm">
              {uniquePropertyTypes.length} Property Types
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Brickscape Section */}
      <section className="py-20 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Brickscape</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re committed to providing exceptional service and making your property journey seamless and successful
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Expertise</h3>
              <p className="text-muted-foreground">
                With years of industry experience, our team of professionals provides trusted guidance through every
                step of your property journey.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Insights</h3>
              <p className="text-muted-foreground">
                Access to real-time market data and trends helps you make informed decisions whether buying, selling, or
                renting.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Handshake className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Service</h3>
              <p className="text-muted-foreground">
                We understand that every client has unique needs, and we tailor our approach to ensure your specific
                requirements are met.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-16 bg-card rounded-xl shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-8 md:col-span-2 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4">Your Journey with Brickscape</h3>
                <ul className="space-y-4">
                  <motion.li variants={itemVariants} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Free property valuation and market analysis</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Professional photography and virtual tours</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Dedicated agent throughout your entire journey</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Transparent communication and no hidden fees</span>
                  </motion.li>
                </ul>
                <motion.div variants={itemVariants} className="mt-6">
                  <Button onClick={() => router.push("/contact")} className="group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </div>
              <div className="bg-muted relative hidden md:block">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop')",
                  }}
                />
                <div className="absolute inset-0 bg-primary/20" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex items-center mb-8"
          >
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-3xl font-bold">Featured Properties</h2>
          </motion.div>

          {dataReady && properties && properties.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {properties.slice(0, 3).map((property) => (
                <motion.div key={property.id} variants={itemVariants}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={property.fileURL || "/placeholder.svg?height=400&width=600"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={property.name || "Property image"}
                          loading="lazy"
                        />
                      </div>
                      <Badge variant={getPurposeBadgeVariant(property.purpose)} className="absolute top-3 left-3">
                        {property.purpose === "rent" ? "For Rent" : "For Sale"}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{property.location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center font-medium text-lg">
                        <DollarSign className="h-5 w-5 mr-1 flex-shrink-0" />
                        <span>{formatPrice(property.price)}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4">
                      <Button
                        className="w-full group"
                        onClick={() => handleViewProperty(property.slug)}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted animate-pulse rounded-md" />
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded-md w-3/4" />
                      <div className="h-6 bg-muted animate-pulse rounded-md w-1/2" />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4">
                    <div className="h-10 bg-muted animate-pulse rounded-md w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" onClick={() => router.push("/propertySearch")} className="group">
              Explore All Properties
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-8 lg:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don&apos;t just take our word for it - hear from some of our satisfied clients
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="italic mb-6">
                  &quot;Brickscape made selling my home an incredibly smooth process. Their team was professional,
                    responsive, and got me a great price. I couldn&apos;t be happier with the service.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
                      JD
                    </div>
                    <div>
                      <p className="font-semibold">John Doe</p>
                      <p className="text-sm text-muted-foreground">Home Seller</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="italic mb-6">
                  &quot;As first-time homebuyers, we were nervous about the process. Brickscape guided us every step of the
                    way and helped us find our dream home within our budget.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
                      JS
                    </div>
                    <div>
                      <p className="font-semibold">Jane Smith</p>
                      <p className="text-sm text-muted-foreground">Home Buyer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="italic mb-6">
                  &quot;I&apos;ve been renting through Brickscape for three years now. Their property management is exceptional,
                    and any maintenance issues are addressed promptly.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
                      RJ
                    </div>
                    <div>
                      <p className="font-semibold">Robert Johnson</p>
                      <p className="text-sm text-muted-foreground">Tenant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mt-12 text-center"
          >
            
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto bg-primary/10 rounded-2xl p-8 md:p-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Perfect Property?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg mb-8 max-w-2xl mx-auto">
              Whether you&apos;re looking to buy, sell, or rent, our team of experts is here to help you every step of the
              way.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push("/propertySearch")}>
                Browse Properties
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/contact")}>
                Contact Us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
