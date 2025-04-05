from google_images_download import google_images_download

response = google_images_download.googleimagesdownload()

arguments = {
    "keywords": "your search query",
    "limit": 10,
    "output_directory": "path/to/save/images",
    "prefix": "custom_name_"
}

response.download(arguments)
