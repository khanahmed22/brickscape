"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import useSWR from "swr";
import { useSession, useUser } from "@clerk/nextjs";
import getSupabaseClient from "@/app/utils/supabase";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompletion } from "ai/react";
import parse from "html-react-parser";
import { slugify } from "@/app/utils/slugify";
import {
  Type,
  DollarSign,
  Sparkles,
  SquareDashedBottom,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Save,
  Trash,
  ImageUp,
  FileText,
  Wand2,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Calendar,
  Loader2,
  Copy,
  Maximize2,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useSupabaseData } from "@/app/utils/SupabaseContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsappShareButton, WhatsappIcon } from "next-share";

import { TwitterShareButton, TwitterIcon } from "next-share";

import { FacebookShareButton, FacebookIcon } from "next-share";
import { usePathname } from "next/navigation";

export default function BlogPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [location,setLocation] = useState("")
  const [blogContent, setBlogContent] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [fileURLs, setFileURLs] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [existingFilePath, setExistingFilePath] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slug, setNewSlug] = useState(slugify(name));
  const router = useRouter();
  const { blogId: id } = useParams();
  const { user } = useUser();
  const { session } = useSession();
  const editorRef = useRef(null);

  const email = user?.primaryEmailAddress?.emailAddress || "";

  const [actionType, setActionType] = useState(null);

  const { countData, setCountData } = useSupabaseData();
  const [currentCount, setCurrentCount] = useState(countData[0]?.count || 0);

  const [prompt, setPrompt] = useState("adorable pig");
  const [imageSrc, setImageSrc] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [genre, setGenre] = useState("");
  const pathname = usePathname();
  const allowCopy = useRef(false); // Ref to allow copy action

  function copyUrl() {
    allowCopy.current = true; // Allow the copy action
    const el = document.createElement("input");
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    allowCopy.current = false; // Reset the flag
    toast.success("Copied To Clipboard");
  }

  useEffect(() => {
    setCurrentCount(countData[0]?.count || 0);
  }, [countData]);

  const {
    complete,
    completion,
    isLoading: aiLoading,
  } = useCompletion({
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
  });

  const {
    data: blog,
    mutate,
    isLoading: isBlogLoading,
    error: blogError,
  } = useSWR(user && id ? ["slug", id] : null, async () => {
    const clerkToken = await session?.getToken({ template: "supabase" });
    const client = getSupabaseClient(clerkToken);
    const { data, error } = await client
      .from("tasks")
      .select()
      .eq("slug", id)
      .single();
    if (error) throw error;
    return data;
  });

  useMemo(() => {
    if (blog) {
      setName(blog.name);
      setDescription(blog.description);
      setBlogContent(blog.blogContent);
      setFileURL(blog.fileURL);
      // Handle fileURLs array if it exists, otherwise create an array with the single fileURL
      setFileURLs(blog.fileURLs || (blog.fileURL ? [blog.fileURL] : []));
      setGenre(blog.genre || "");
      setPrice(blog.price);
      setArea(blog.area);
      setLocation(blog.location)
    }
  }, [blog]);

  // Handle keyboard navigation for image slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === "ArrowLeft") {
          navigateImages("prev");
        } else if (e.key === "ArrowRight") {
          navigateImages("next");
        } else if (e.key === "Escape") {
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, fileURLs, currentImageIndex]);

  async function deleteBlog() {
    const clerkToken = await session?.getToken({ template: "supabase" });
    const client = getSupabaseClient(clerkToken);

    try {
      // Delete from both tables
      await client.from("tasks").delete().eq("slug", id);
      await client.from("all_tasks").delete().eq("slug", id);

      mutate();
      toast.success("Blog deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Error deleting blog: " + error.message);
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const clerkToken = await session?.getToken({ template: "supabase" });
    const client = getSupabaseClient(clerkToken);

    try {
      setUploading(true);

      if (!file) {
        toast.info("Please select a file to upload");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      if (existingFilePath) {
        const { error: deleteError } = await client.storage
          .from("images")
          .remove([existingFilePath]);
        if (deleteError) {
          throw deleteError;
        }
      }

      const { data, error } = await client.storage
        .from("images")
        .upload(filePath, file);
      if (error) {
        throw error;
      }

      const { data: publicUrlData, error: urlError } = client.storage
        .from("images")
        .getPublicUrl(filePath);
      if (urlError) {
        throw urlError;
      }

      const newFileURL = publicUrlData.publicUrl;
      setFileURL(newFileURL);
      setFileURLs([...fileURLs, newFileURL]);
      setExistingFilePath(filePath);

      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Error uploading file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadGeneratedImage = async () => {
    if (!imageSrc) {
      toast.info("Please generate an image first");
      return;
    }

    try {
      setUploading(true);

      // Fetch the image as a blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // Create a file from the blob
      const fileName = `ai-generated-${Math.random()}.png`;
      const aiGeneratedFile = new File([blob], fileName, { type: "image/png" });

      // Get Supabase client
      const clerkToken = await session?.getToken({ template: "supabase" });
      const client = getSupabaseClient(clerkToken);

      // Delete existing file if there is one
      if (existingFilePath) {
        const { error: deleteError } = await client.storage
          .from("images")
          .remove([existingFilePath]);
        if (deleteError) {
          console.error("Error deleting existing file:", deleteError);
        }
      }

      // Upload to Supabase
      const { data, error } = await client.storage
        .from("images")
        .upload(fileName, aiGeneratedFile);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData, error: urlError } = client.storage
        .from("images")
        .getPublicUrl(fileName);

      if (urlError) {
        throw urlError;
      }

      // Update the fileURL state and set the existing file path
      const newFileURL = publicUrlData.publicUrl;
      setFileURL(newFileURL);
      setFileURLs([...fileURLs, newFileURL]);
      setExistingFilePath(fileName);

      toast.success("AI-generated image uploaded successfully");
    } catch (error) {
      toast.error("Error uploading AI-generated image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const createOrUpdateBlog = async (e) => {
    e.preventDefault();
    const clerkToken = await session?.getToken({ template: "supabase" });
    const client = getSupabaseClient(clerkToken);

    try {
      if (id) {
        // Update the tasks table
        await client
          .from("tasks")
          .update({
            name,
            description,
            price,
            area,
            location,
            blogContent,
            fileURL,
            fileURLs,
            slug: slug,
            genre,
          })
          .eq("slug", id);

        // Also update the all_tasks table with the same data
        await client
          .from("all_tasks")
          .update({
            name,
            description,
            price,
            area,
            location,
            blogContent,
            fileURL,
            fileURLs,
            slug: slug,
            genre,
          })
          .eq("slug", id);
      } else {
        // For new blog posts, insert into both tables
        const blogData = {
          name,
          email,
          description,
          location,
          price,
          area,
          blogContent,
          fileURL,
          fileURLs,
          slug: slug,
          genre,
        };

        await client.from("tasks").insert(blogData);
        await client.from("all_tasks").insert(blogData);
      }
      mutate();
      setFile(null);
      toast.success("Blog saved successfully");
      setEditMode(false);

      // If this is a new blog or the slug changed, redirect to the new URL
      if (!id || id !== slug) {
        router.push(`/blog/${slug}`);
      }

      router.push("/dashboard");
    } catch (error) {
      toast.error("Error saving blog: " + error.message);
    }
  };

  const updateCountInSupabase = async (newCount) => {
    const clerkToken = await session?.getToken({ template: "supabase" });
    const client = getSupabaseClient(clerkToken);

    const { error } = await client
      .from("ai-table")
      .update({ count: newCount })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating count in Supabase:", error);
      toast.error("Failed to update AI usage count");
      return false;
    }
    return true;
  };

  const handleAiAction = async (type) => {
    if (!blogContent) {
      toast.error("Text field is empty. Write something first.");
      return;
    }

    if (currentCount <= 0) {
      toast.error("You've used all your AI actions. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    setActionType(type);

    try {
      const newCount = currentCount - 1;
      const updated = await updateCountInSupabase(newCount);

      if (updated) {
        setCurrentCount(newCount);
        setCountData([{ ...countData[0], count: newCount }]);
        await complete(blogContent);
      }
    } catch (error) {
      toast.error("Error processing AI action: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (completion) {
      setBlogContent(completion);
      let successMessage = "";
      if (actionType === "paraphrase") {
        successMessage = "Blog content rephrased successfully";
      } else if (actionType === "summarize") {
        successMessage = "Blog content summarized successfully";
      } else if (actionType === "spellcheck") {
        successMessage = "Spelling checked and corrected successfully";
      } else if (actionType === "generateBlog") {
        successMessage = "Blog generated successfully";
      }
      toast.success(successMessage);
    }
  }, [completion, actionType]);

  const config = useMemo(
    () => ({
      placeholder: "Start writing your blog content here...",
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
    []
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  useEffect(() => {
    setNewSlug(slugify(name));
  }, [name]);

  const fetchImage = async () => {
    setGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const { image } = await response.json();
      setImageSrc(image);
    } catch (err) {
      setImageError(err.message);
    } finally {
      setGeneratingImage(false);
    }
  };

  // Image slider navigation
  const navigateImages = (direction) => {
    if (!fileURLs || fileURLs.length <= 1) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentImageIndex + 1) % fileURLs.length;
    } else {
      newIndex = (currentImageIndex - 1 + fileURLs.length) % fileURLs.length;
    }

    setCurrentImageIndex(newIndex);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Loading skeleton for the blog view
  if (isBlogLoading && !editMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
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
    );
  }

  // Error state
  if (blogError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">
              Error Loading Blog
            </CardTitle>
            <CardDescription>
              We couldn&apos;t load the blog post you requested. It may have
              been deleted or you may not have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Error details: {blogError.message || "Unknown error"}
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!editMode) {
    // View Mode
    return (
      <div className="min-h-screen bg-background px-2">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-2">
                  {name}
                </h1>
               
                <p className="text-muted-foreground text-lg">{price}</p>
                <p className="text-muted-foreground text-lg">{location}</p>

                {blog?.genre && (
                  <Badge variant="secondary" className="mt-2">
                    {blog.genre}
                  </Badge>
                )}

                <div className="flex items-center mt-4 text-sm text-muted-foreground">
                  {blog?.created_at && (
                    <div className="flex items-center mr-4">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  aria-label="Edit blog"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      aria-label="Delete blog"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your blog post.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button variant="destructive" onClick={deleteBlog}>
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {fileURLs && fileURLs.length > 0 && (
            <div className="mb-8 rounded-lg overflow-hidden">
              {/* Image Slider */}
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
                  className="w-full h-[400px] object-cover"
                  src={fileURLs[currentImageIndex] || "/placeholder.svg"}
                  alt={name || "Blog cover"}
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
                        index === currentImageIndex
                          ? "ring-2 ring-primary ring-offset-1"
                          : "hover:opacity-90"
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

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            {description}
          </div>

          <Separator className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Share2 className="mr-2 h-5 w-5" />
                Share this article with yourself
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <FacebookShareButton
                  url={`https://inkwise-ai.vercel.app/${pathname}`}
                  hashtag={"#happyblogging"}
                >
                  <FacebookIcon size={32} round />
                </FacebookShareButton>

                <TwitterShareButton
                  url={`https://inkwise-ai.vercel.app/${pathname}`}
                  title={
                    "next-share is a social share buttons for your next React apps."
                  }
                >
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <WhatsappShareButton
                  url={`https://inkwise-ai.vercel.app/${pathname}`}
                  title={
                    "next-share is a social share buttons for your next React apps."
                  }
                  separator=":: "
                >
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>

                <Copy className="cursor-pointer " onClick={copyUrl} />
              </div>
            </CardContent>
          </Card>
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
    );
  } else {
    // Edit Mode - Loading skeleton for edit mode
    if (isBlogLoading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background"
        >
          <div className="flex">
            {/*<SideBar />*/}
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
      );
    }

    // Edit Mode
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        <div className="flex">
          {/*<SideBar />*/}
          <div className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Edit Property
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Make changes to your property listing
                  </p>
                </div>
                <Badge variant="outline" className="px-3 py-1.5">
                  <Sparkles className="w-4 h-4 mr-1.5 text-primary" />
                  <span className="font-medium">
                    {currentCount} AI actions remaining
                  </span>
                </Badge>
              </div>

              <form onSubmit={createOrUpdateBlog}>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="content">
                      <FileText className="w-4 h-4 mr-2" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="media">
                      <ImageUp className="w-4 h-4 mr-2" />
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
                          <label
                            htmlFor="title"
                            className="text-sm font-medium"
                          >
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
                          <label
                            htmlFor="description"
                            className="text-sm font-medium"
                          > <FileText className="w-4 h-4 inline mr-2" />
                            Description
                          </label>
                          <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a brief description or subtitle"
                            className="min-h-[80px] resize-none"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="genre"
                            className="text-sm font-medium"
                          >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Property Type
                          </label>
                          <Select value={genre} onValueChange={setGenre}>
                            <SelectTrigger id="genre" className="h-12">
                              <SelectValue placeholder="Select a genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uncategorized">
                                Uncategorized
                              </SelectItem>
                              <SelectItem value="Technology">
                                Technology
                              </SelectItem>
                              <SelectItem value="Travel">Travel</SelectItem>
                              <SelectItem value="Food">Food</SelectItem>
                              <SelectItem value="Lifestyle">
                                Lifestyle
                              </SelectItem>
                              <SelectItem value="Health">Health</SelectItem>
                              <SelectItem value="Fitness">Fitness</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Education">
                                Education
                              </SelectItem>
                              <SelectItem value="Entertainment">
                                Entertainment
                              </SelectItem>
                              <SelectItem value="Science">Science</SelectItem>
                              <SelectItem value="Art">Art</SelectItem>
                              <SelectItem value="Fashion">Fashion</SelectItem>
                              <SelectItem value="Sports">Sports</SelectItem>
                              <SelectItem value="Politics">Politics</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="price"
                            className="text-sm font-medium"
                          >
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
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="media">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          Featured Image
                        </CardTitle>
                        <CardDescription>
                          Upload a high-quality image to represent your blog
                          post
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">
                              Upload Your Own Image
                            </h3>
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                              <div className="flex-1">
                                <label
                                  htmlFor="image-upload"
                                  className="text-sm font-medium block mb-2"
                                >
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
                              <h3 className="text-sm font-medium mb-4">
                                Uploaded Images
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {fileURLs.map((url, index) => (
                                  <div
                                    key={index}
                                    className={`relative rounded-md overflow-hidden border cursor-pointer transition-all ${
                                      url === fileURL
                                        ? "ring-2 ring-primary ring-offset-2"
                                        : "hover:opacity-90"
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
                                        <Badge
                                          variant="secondary"
                                          className="bg-background/80 backdrop-blur-sm"
                                        >
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={!name || !description || !price}
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
    );
  }
}
