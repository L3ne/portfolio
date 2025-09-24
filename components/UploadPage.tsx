// components/UploadPage.tsx
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Progress, 
  HStack,
  Spinner,
  Center,
  Container,
  Badge,
  Flex,
  Input
} from "@chakra-ui/react"
import { useState } from 'react'

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadResults, setUploadResults] = useState([])
  const [message, setMessage] = useState({ text: '', type: '' })

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )
    
    if (validFiles.length !== files.length) {
      showMessage(`${files.length - validFiles.length} fichier(s) ignoré(s) (non-image ou > 10MB)`, 'warning')
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setProgress(0)
    setUploadResults([])
    setMessage({ text: '', type: '' })

    const results = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          results.push({ file: file.name, success: true, url: result.fileUrl })
        } else {
          const error = await response.json()
          results.push({ file: file.name, success: false, error: error.error })
        }
      } catch (error) {
        results.push({ file: file.name, success: false, error: 'Network error' })
      }

      setProgress(((i + 1) / selectedFiles.length) * 100)
    }

    setUploadResults(results)
    setUploading(false)
    setSelectedFiles([])
    
    // Résumé final
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    if (failed === 0) {
      showMessage(`🎉 ${successful} image(s) uploadée(s) avec succès !`, 'success')
    } else {
      showMessage(`Upload terminé: ${successful} succès, ${failed} échec(s)`, 'warning')
    }
  }

  const handleDrag = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(type === 'enter' || type === 'over')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFileSelect(files)
  }

  const successCount = uploadResults.filter(r => r.success).length
  const errorCount = uploadResults.filter(r => !r.success).length

  return (
    <Box minH="100vh" bg="gray.900" color="white" p={8}>
      <Container maxW="4xl">
        <VStack gap={8} align="stretch">
          
          {/* Header */}
          <Center>
            <VStack gap={4}>
              <Heading 
                size="4xl" 
                bgGradient="linear(to-r, blue.400, purple.500)" 
                bgClip="text"
                textAlign="center"
              >
                📸 Upload Images
              </Heading>
              <Text color="gray.400" textAlign="center" fontSize="lg">
                Glissez-déposez vos images ou sélectionnez-les
              </Text>
            </VStack>
          </Center>

          {/* Message */}
          {message.text && (
            <Box
              p={4}
              borderRadius="md"
              bg={
                message.type === 'success' ? 'green.600' :
                message.type === 'warning' ? 'orange.600' :
                message.type === 'error' ? 'red.600' :
                'blue.600'
              }
              color="white"
              textAlign="center"
            >
              {message.text}
            </Box>
          )}

          {/* Drop Zone */}
          <Box>
            <Input
              type="file"
              accept="image/*"
              multiple
              display="none"
              id="file-input"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            
            <Box
              border="2px dashed"
              borderColor={dragActive ? "blue.400" : "gray.600"}
              borderRadius="xl"
              p={12}
              textAlign="center"
              bg={dragActive ? "blue.900" : "gray.800"}
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ 
                borderColor: "blue.500",
                bg: "gray.750",
                transform: "scale(1.02)"
              }}
              onDrop={handleDrop}
              onDragOver={(e) => handleDrag(e, 'over')}
              onDragEnter={(e) => handleDrag(e, 'enter')}
              onDragLeave={(e) => handleDrag(e, 'leave')}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <VStack gap={4}>
                <Text fontSize="6xl" filter="drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))">
                  {dragActive ? "📥" : "🖼️"}
                </Text>
                <Text fontSize="xl" fontWeight="medium">
                  {dragActive ? "Déposez vos images ici !" : "Drag and drop files here"}
                </Text>
                <Text color="gray.500" fontSize="md">
                  .png, .jpg, .gif, .webp up to 10MB
                </Text>
                <Button variant="outline" size="md" colorScheme="blue">
                  Ou cliquez pour sélectionner
                </Button>
              </VStack>
            </Box>
          </Box>
            
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <Box>
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                Fichiers sélectionnés ({selectedFiles.length})
              </Text>
              <VStack gap={2} align="stretch">
                {selectedFiles.map((file, index) => (
                  <Flex
                    key={index}
                    p={3}
                    bg="gray.700"
                    borderRadius="md"
                    justify="space-between"
                    align="center"
                  >
                    <HStack gap={3}>
                      <Text color="green.400" fontSize="lg">✓</Text>
                      <Text fontSize="sm">{file.name}</Text>
                      <Badge colorScheme="blue">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </Badge>
                    </HStack>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                    >
                      ✕
                    </Button>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && !uploading && (
            <Center>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleUpload}
                px={8}
              >
                📤 Uploader {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''}
              </Button>
            </Center>
          )}

          {/* Progress */}
          {uploading && (
            <Box>
              <HStack mb={4} justify="center" gap={4}>
                <Spinner color="blue.400" />
                <Text>Upload en cours...</Text>
                <Badge colorScheme="blue" fontSize="md">
                  {Math.round(progress)}%
                </Badge>
              </HStack>
              <Progress 
                value={progress} 
                colorScheme="blue" 
                size="lg" 
                borderRadius="full"
                bg="gray.700"
              />
            </Box>
          )}

          {/* Results */}
          {uploadResults.length > 0 && (
            <VStack gap={4}>
              {successCount > 0 && (
                <Box
                  p={4}
                  bg="green.600"
                  borderRadius="md"
                  w="100%"
                  textAlign="center"
                  color="white"
                >
                  <Text fontWeight="bold" mb={1}>✅ Succès!</Text>
                  <Text fontSize="sm">
                    {successCount} image{successCount > 1 ? 's' : ''} uploadée{successCount > 1 ? 's' : ''} avec succès
                  </Text>
                </Box>
              )}
              
              {errorCount > 0 && (
                <Box
                  p={4}
                  bg="red.600"
                  borderRadius="md"
                  w="100%"
                  textAlign="center"
                  color="white"
                >
                  <Text fontWeight="bold" mb={1}>❌ Erreurs</Text>
                  <Text fontSize="sm">
                    {errorCount} échec{errorCount > 1 ? 's' : ''} lors de l'upload
                  </Text>
                </Box>
              )}
            </VStack>
          )}

          {/* Navigation */}
          <HStack gap={4} justify="center" pt={4}>
            <Button
              as="a"
              href="/api/gallery"
              colorScheme="green"
              size="lg"
              disabled={uploading}
            >
              🖼️ Voir la galerie
            </Button>
            <Button
              as="a"
              href="/api"
              variant="outline"
              size="lg"
              disabled={uploading}
            >
              ← Retour API
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}