import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ZoomIn, 
  Download, 
  Calendar, 
  Image as ImageIcon, 
  Sparkles,
  Trash2,
  Edit
} from 'lucide-react';

interface ArtistImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  generatedAt: Date;
  isPrimary?: boolean;
  tags?: string[];
}

interface ArtistGalleryProps {
  images: ArtistImage[];
  onImageSelect?: (image: ArtistImage) => void;
  onSetPrimary?: (imageId: string) => void;
  onDeleteImage?: (imageId: string) => void;
  onEditImage?: (image: ArtistImage) => void;
  canEdit?: boolean;
  isLoading?: boolean;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

const imageVariants: Variants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
};

const ArtistGallery: React.FC<ArtistGalleryProps> = ({
  images,
  onImageSelect,
  onSetPrimary,
  onDeleteImage,
  onEditImage,
  canEdit = false,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-square bg-neutral-800 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 to-blue-900/20 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-cyan-500/50" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-cyan-900/30 rounded w-3/4"></div>
              <div className="h-3 bg-cyan-900/20 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Images Generated Yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Create your AI artist and generate unique images to build their visual identity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Artist Gallery</h3>
          <p className="text-sm text-gray-400">
            {images.length} image{images.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        {canEdit && (
          <Badge variant="secondary" className="bg-cyan-900/30 text-cyan-300 border-cyan-700/50">
            Edit Mode
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            layout
          >
            <Card className="group overflow-hidden border-cyan-900/20 hover:border-cyan-500/30 transition-all duration-300">
              <div className="relative aspect-square overflow-hidden">
                <motion.img
                  src={image.url}
                  alt={`Generated artist image ${index + 1}`}
                  variants={imageVariants}
                  className="w-full h-full object-cover"
                  onClick={() => onImageSelect?.(image)}
                />
                
                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-green-500/90 text-white border-green-500 hover:bg-green-600">
                      Primary
                    </Badge>
                  </div>
                )}
                
                {/* Edit Overlay */}
                {canEdit && (
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageSelect?.(image);
                          }}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <ImageIcon className="h-5 w-5" />
                            <span>Generated Image</span>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <img
                              src={image.url}
                              alt="Generated artist image"
                              className="w-full rounded-lg"
                            />
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  // Implement download functionality
                                  const link = document.createElement('a');
                                  link.href = image.url;
                                  link.download = `artist-image-${image.id}.jpg`;
                                  link.click();
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              {image.isPrimary ? (
                                <Button
                                  variant="outline"
                                  disabled
                                >
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Primary
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() => onSetPrimary?.(image.id)}
                                >
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Set Primary
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-sm">Generation Details</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-300">
                                    {new Date(image.generatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <ImageIcon className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-300">
                                    Model: {image.model}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-sm">Prompt</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-gray-300 font-mono bg-neutral-800 p-3 rounded">
                                  {image.prompt}
                                </p>
                              </CardContent>
                            </Card>
                            
                            {image.tags && image.tags.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Tags</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex flex-wrap gap-1">
                                    {image.tags.map((tag, tagIndex) => (
                                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => onEditImage?.(image)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDeleteImage?.(image.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetPrimary?.(image.id);
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteImage?.(image.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium truncate">
                    Image #{index + 1}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {image.model}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ArtistGallery;