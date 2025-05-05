"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, useUser } from "@clerk/nextjs"
import getSupabaseClient from "../utils/supabase"
import {
  Search,
  MapPin,
  Building,
  ArrowRight,
  Home,
  DollarSign,
  SquareDashedBottom,
  Clock,
  Eye,
  ArrowUpRight,
  Filter,
  LayoutGrid,
  LayoutList,
  ArrowLeft,
  X,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Property Search",
  
}

export default function PropertySearchPage() {
  const { user } = useUser()
  const { session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()


  const initialSearchTerm = searchParams.get("q") || ""
  const initialPurpose = searchParams.get("purpose") || "all"
  const initialArea = searchParams.get("area") || ""
  const initialPropertyType = searchParams.get("type") || ""
  const initialPriceRange = searchParams.get("price") || ""


  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [purpose, setPurpose] = useState(initialPurpose)
  const [area, setArea] = useState(initialArea)
  const [priceRange, setPriceRange] = useState(initialPriceRange)
  const [propertyType, setPropertyType] = useState(initialPropertyType)
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [dataReady, setDataReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(initialPurpose === "rent" ? "rent" : "buy")


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

 
  const filteredProperties = useMemo(() => {
    if (!properties) return []

    return properties.filter((property) => {
   
      const matchesSearch =
        !searchTerm ||
        property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchTerm.toLowerCase())

  
      const matchesPurpose =
        purpose === "all" ||
        (purpose === "buy" && property.purpose?.toLowerCase() === "sell") ||
        (purpose === "rent" && property.purpose?.toLowerCase() === "rent")

     
      const matchesArea = !area || property.location === area

     
      const matchesPropertyType = !propertyType || property.genre === propertyType

     
      let matchesPriceRange = true
      if (priceRange) {
        const price = Number(property.price) || 0
        if (priceRange === "0-50000") {
          matchesPriceRange = price <= 50000
        } else if (priceRange === "50000-100000") {
          matchesPriceRange = price > 50000 && price <= 100000
        } else if (priceRange === "100000-200000") {
          matchesPriceRange = price > 100000 && price <= 200000
        } else if (priceRange === "200000+") {
          matchesPriceRange = price > 200000
        }
      }

      return matchesSearch && matchesPurpose && matchesArea && matchesPropertyType && matchesPriceRange
    })
  }, [properties, searchTerm, purpose, area, propertyType, priceRange])

  const sortedProperties = useMemo(() => {
    return [...filteredProperties].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      } else if (sortBy === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0)
      } else if (sortBy === "price-high") {
        return (Number(b.price) || 0) - (Number(a.price) || 0)
      } else if (sortBy === "price-low") {
        return (Number(a.price) || 0) - (Number(b.price) || 0)
      } else if (sortBy === "alphabetical") {
        return a.name?.localeCompare(b.name)
      }
      return 0
    })
  }, [filteredProperties, sortBy])


  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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


    const url = `/property-search?${params.toString()}`
    window.history.pushState({}, "", url)
  }

  function clearFilters() {
    setSearchTerm("")
    setPurpose("all")
    setArea("")
    setPropertyType("")
    setPriceRange("")

    router.push("/property-search")
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
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

 

  return (
    <div className="min-h-screen bg-background">
      {/* Search Section */}
      <section className="py-8 px-4 md:px-8 lg:px-12 ">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Property Search</h1>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-secondary rounded-lg shadow-md overflow-hidden"
          >
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="px-4 pt-4">
                <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                  <TabsTrigger
                    value="buy"
                    onClick={() => {
                      setPurpose("buy");
                      
                      const params = new URLSearchParams(
                        window.location.search
                      );
                      params.set("purpose", "buy");
                      const url = `/property-search?${params.toString()}`;
                      window.history.pushState({}, "", url);
                    }}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Buy
                  </TabsTrigger>
                  <TabsTrigger
                    value="rent"
                    onClick={() => {
                      setPurpose("rent");
                     
                      const params = new URLSearchParams(
                        window.location.search
                      );
                      params.set("purpose", "rent");
                      const url = `/property-search?${params.toString()}`;
                      window.history.pushState({}, "", url);
                    }}
                  >
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
                      <SelectItem value="50000-100000">
                        $50,000 - $100,000
                      </SelectItem>
                      <SelectItem value="100000-200000">
                        $100,000 - $200,000
                      </SelectItem>
                      <SelectItem value="200000+">$200,000+</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      size="lg"
                      className="h-12 flex-1"
                      onClick={handleSearch}
                    >
                      Search Properties
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12"
                      onClick={clearFilters}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Search Results</h2>
              <p className="text-muted-foreground mt-1">
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "property" : "properties"}{" "}
                found
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    Sort
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
                  <DropdownMenuItem onClick={() => setSortBy("price-high")}>
                    Price: High to Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-low")}>
                    Price: Low to High
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
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm ||
            area ||
            propertyType ||
            priceRange ||
            purpose !== "all") && (
            <div className="mb-6 flex flex-wrap gap-2">
              <div className="text-sm text-muted-foreground mr-2 flex items-center">
                Active filters:
              </div>

              {purpose !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {purpose === "buy" ? "For Sale" : "For Rent"}
                  <button
                    onClick={() => {
                      setPurpose("all");
                      const params = new URLSearchParams(
                        window.location.search
                      );
                      params.delete("purpose");
                      const url = `/property-search?${params.toString()}`;
                      window.history.pushState({}, "", url);
                    }}
                    className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      const params = new URLSearchParams(
                        window.location.search
                      );
                      params.delete("q");
                      const url = `/property-search?${params.toString()}`;
                      window.history.pushState({}, "", url);
                    }}
                    className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {area && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Area: {area}
                  <button
                    onClick={() => {
                      setArea("");
                      const params = new URLSearchParams(
                        window.location.search
                      );
                      params.delete("area");
                      const url = `/property-search?${params.toString()}`;
                      window.history.pushState({}, "", url);
                    }}
                    className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {propertyType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {propertyType}
                  <button
                    onClick={() => {
                      setPropertyType("");
                      const params = new URLSearchParams(
                        window.location.search
                      );
                      params.delete("type");
                      const url = `/property-search?${params.toString()}`;
                      window.history.pushState({}, "", url);
                    }}
                    className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {priceRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price:{" "}
                  {priceRange === "0-50000"
                    ? "$0 - $50,000"
                    : priceRange === "50000-100000"
                    ? "$50,000 - $100,000"
                    : priceRange === "100000-200000"
                    ? "$100,000 - $200,000"
                    : priceRange === "200000+"
                    ? "$200,000+"
                    : priceRange}
                  <button
                    onClick={() => {
                      setPriceRange("");
                      const params = new URLSearchParams(
                        window.location.search
                      );
                      params.delete("price");
                      const url = `/property-search?${params.toString()}`;
                      window.history.pushState({}, "", url);
                    }}
                    className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                Clear all filters
              </Button>
            </div>
          )}

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
          {dataReady && sortedProperties.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="bg-primary/5 p-6 rounded-full mb-6">
                <Building className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">No properties found</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Try adjusting your search or filter criteria to find more
                properties.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </motion.div>
          )}

          {/* Grid View */}
          {dataReady && sortedProperties.length > 0 && viewMode === "grid" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedProperties.map((property) => (
                <motion.div key={property.id} variants={itemVariants}>
                  <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={
                            property.fileURL || "https://placehold.co/220x400"
                          }
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={property.name || "Property image"}
                        />
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2 mb-2">
                        <Badge
                          variant={getPurposeBadgeVariant(property.purpose)}
                        >
                          {property.purpose === "rent"
                            ? "For Rent"
                            : "For Sale"}
                        </Badge>
                      </div>
                      {property.created_at && (
                        <Badge
                          variant="secondary"
                          className="absolute bottom-3 left-3"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDate(property.created_at)}
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1 text-xl">
                        {property.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 flex-grow">
                      

                    

                      

                      <div className="flex flex-wrap gap-2 mt-3">
                        {property.genre && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {property.genre}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 items-start justify-between text-muted-foreground line-clamp-2">
                        <span className="flex items-center space-x-2 text-sm">
                          <MapPin size={17} className="mr-2" /> {property.location}
                        </span>{" "}
                        <span className="flex items-center space-x-2 text-sm">
                          <SquareDashedBottom size={17} className="mr-2"/> {property.area} Sq ft
                        </span>
                      </div>

                      <Separator className="mb-2 mt-2" />

                      <p className=" line-clamp-2 font-bold text-lg">
                         {formatPrice(property.price)}
                      </p>
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
          )}

          {/* List View */}
          {dataReady && sortedProperties.length > 0 && viewMode === "list" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {sortedProperties.map((property) => (
                <motion.div key={property.id} variants={itemVariants}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 lg:w-1/5 relative">
                        <div className="h-full aspect-video md:aspect-square overflow-hidden bg-muted">
                          <img
                            src={
                              property.fileURL ||
                              "/placeholder.svg?height=200&width=200"
                            }
                            className="w-full h-full object-cover"
                            alt={property.name || "Property image"}
                          />
                        </div>
                        <Badge
                          variant={getPurposeBadgeVariant(property.purpose)}
                          className="absolute top-2 left-2"
                        >
                          {property.purpose === "rent"
                            ? "For Rent"
                            : "For Sale"}
                        </Badge>
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                          <h3 className="text-xl font-semibold mb-2 md:mb-0">
                            {property.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {property.genre && (
                              <Badge variant="outline" className="mb-2 md:mb-0">
                                {property.genre}
                              </Badge>
                            )}
                            {property.created_at && (
                              <Badge variant="outline" className="mb-2 md:mb-0">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatDate(property.created_at)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {property.location || "Location not specified"}
                            </span>
                          </div>

                          <div className="flex items-center font-medium">
                            <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>{formatPrice(property.price)}</span>
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <SquareDashedBottom className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>
                              {property.area
                                ? `${property.area} sq ft`
                                : "Area not specified"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                            {property.description || "No description available"}
                          </p>
                          <Button
                            size="sm"
                            className="group"
                            onClick={() => handleViewProperty(property.slug)}
                            disabled={loading}
                          >
                            {loading ? (
                              "Loading..."
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                View Property
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

          {/* Pagination (if needed) */}
          {dataReady && sortedProperties.length > 12 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-primary text-primary-foreground"
                >
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
