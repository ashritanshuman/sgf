import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Image, Link, Download, Share2, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const resources = [
    { name: "Calculus Notes.pdf", type: "PDF", size: "2.4 MB", category: "Mathematics", shared: "2 hours ago" },
    { name: "Physics Formulas.png", type: "Image", size: "856 KB", category: "Physics", shared: "1 day ago" },
    { name: "Study Guide - Chapter 5", type: "Link", size: "-", category: "Biology", shared: "3 days ago" },
    { name: "Programming Basics.pdf", type: "PDF", size: "5.1 MB", category: "Computer Science", shared: "1 week ago" },
  ];

  return (
    <div className="min-h-screen pt-32 px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-6xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Resource Library</h1>
          <p className="text-xl text-muted-foreground">
            Share and access study materials with your group
          </p>
        </div>

        {/* Upload Section */}
        <Card className="glass-card mb-8 p-8">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">Upload Resources</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here or click to browse
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button variant="outline" size="sm">
                <File className="mr-2 h-4 w-4" />
                Documents
              </Button>
              <Button variant="outline" size="sm">
                <Image className="mr-2 h-4 w-4" />
                Images
              </Button>
              <Button variant="outline" size="sm">
                <Link className="mr-2 h-4 w-4" />
                Links
              </Button>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        {/* Resources Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card glow-hover hover:scale-[1.01] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        {resource.type === "PDF" && <File className="h-6 w-6 text-primary-foreground" />}
                        {resource.type === "Image" && <Image className="h-6 w-6 text-primary-foreground" />}
                        {resource.type === "Link" && <Link className="h-6 w-6 text-primary-foreground" />}
                      </div>
                      <div>
                        <h3 className="font-bold">{resource.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{resource.category}</Badge>
                          <span className="text-sm text-muted-foreground">{resource.size}</span>
                          <span className="text-sm text-muted-foreground">• {resource.shared}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="documents">
            <p className="text-center text-muted-foreground py-12">Document resources will appear here</p>
          </TabsContent>

          <TabsContent value="images">
            <p className="text-center text-muted-foreground py-12">Image resources will appear here</p>
          </TabsContent>

          <TabsContent value="links">
            <p className="text-center text-muted-foreground py-12">Link resources will appear here</p>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Resources;
