import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Upload, Database, FileText, Download, Trash2, Loader2, CheckCircle } from 'lucide-react'

interface Dataset {
  id: string
  name: string
  type: string
  file_path: string | null
  size: number | null
  created_at: string
}

const PREDEFINED_DATASETS = [
  {
    name: 'Wikipedia Articles',
    type: 'wikipedia',
    description: 'Collection of Wikipedia articles for text analysis',
    size: '2.5 MB',
    icon: FileText
  },
  {
    name: 'News Headlines',
    type: 'news',
    description: 'Recent news headlines from various sources',
    size: '1.8 MB',
    icon: Database
  },
  {
    name: 'Research Papers',
    type: 'research',
    description: 'Academic research paper abstracts',
    size: '3.2 MB',
    icon: FileText
  }
]

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    loadDatasets()
  }, [])

  const loadDatasets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDatasets(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['text/plain', 'text/csv', 'application/csv']
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only text (.txt) or CSV (.csv) files",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadError) throw uploadError

      // Save dataset metadata
      const { error: dbError } = await supabase
        .from('datasets')
        .insert({
          user_id: user.id,
          name: file.name,
          type: 'uploaded',
          file_path: fileName,
          size: file.size
        })

      if (dbError) throw dbError

      toast({
        title: "Success",
        description: "Dataset uploaded successfully!",
        className: "slide-in-up"
      })

      loadDatasets()
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      event.target.value = ''
    }
  }

  const selectPredefinedDataset = async (dataset: typeof PREDEFINED_DATASETS[0]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('datasets')
        .insert({
          user_id: user.id,
          name: dataset.name,
          type: dataset.type,
          file_path: null,
          size: null
        })

      if (error) throw error

      toast({
        title: "Dataset Added",
        description: `${dataset.name} has been added to your datasets`,
        className: "slide-in-up"
      })

      loadDatasets()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const deleteDataset = async (datasetId: string) => {
    try {
      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', datasetId)

      if (error) throw error

      toast({
        title: "Dataset Deleted",
        description: "Dataset has been removed from your collection"
      })

      loadDatasets()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-secondary">
        <Card className="card-professional">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading datasets...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-secondary py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dataset Management</h1>
          <p className="text-muted-foreground">Upload and manage your datasets for analysis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="card-professional animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-primary" />
                  Upload Dataset
                </CardTitle>
                <CardDescription>
                  Upload your own text or CSV files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click to upload or drag and drop
                    <br />
                    <span className="text-xs">Supports: .txt, .csv (Max 10MB)</span>
                  </p>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      disabled={uploading}
                      className="btn-professional cursor-pointer"
                      asChild
                    >
                      <span>
                        {uploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Choose File'
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                
                {uploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Predefined Datasets */}
            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5 text-primary" />
                  Predefined Datasets
                </CardTitle>
                <CardDescription>
                  Select from our curated collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PREDEFINED_DATASETS.map((dataset, index) => {
                  const Icon = dataset.icon
                  const isSelected = datasets.some(d => d.type === dataset.type)
                  
                  return (
                    <div
                      key={dataset.type}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{dataset.name}</p>
                          <p className="text-xs text-muted-foreground">{dataset.description}</p>
                          <p className="text-xs text-muted-foreground">Size: {dataset.size}</p>
                        </div>
                      </div>
                      
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectPredefinedDataset(dataset)}
                          className="btn-professional text-xs"
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* My Datasets */}
          <div>
            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>My Datasets</CardTitle>
                <CardDescription>
                  Your uploaded and selected datasets ({datasets.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {datasets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No datasets yet</p>
                    <p className="text-sm">Upload a file or select a predefined dataset</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {datasets.map((dataset) => (
                      <div
                        key={dataset.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{dataset.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Type: {dataset.type} • 
                              {dataset.size ? ` Size: ${(dataset.size / 1024).toFixed(1)} KB` : ' Predefined'} • 
                              Added: {new Date(dataset.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteDataset(dataset.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}