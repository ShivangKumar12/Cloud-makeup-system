# Face-API.js Models

This folder needs to contain the face-api.js model files for the makeup application to work.

## Required Models

You need to download the following models:

1. **tiny_face_detector** - For face detection
2. **face_landmark_68** - For facial landmark detection

## How to Get the Models

### Option 1: Download from GitHub
Download the models from the official face-api.js repository:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

### Option 2: Copy from node_modules
After installing face-api.js, you can copy the models from:
`node_modules/face-api.js/weights/`

## File Structure

Your `/public/models/` folder should contain:

```
/public/models/
  ├── tiny_face_detector_model-weights_manifest.json
  ├── tiny_face_detector_model-shard1
  ├── face_landmark_68_model-weights_manifest.json
  ├── face_landmark_68_model-shard1
  └── README.md (this file)
```

## Quick Setup

Run these commands from your project root:

```bash
# Create the models directory if it doesn't exist
mkdir -p public/models

# Copy the model files from node_modules
cp node_modules/face-api.js/weights/tiny_face_detector* public/models/
cp node_modules/face-api.js/weights/face_landmark_68* public/models/
```

Once the models are in place, the application will automatically load them and enable the makeup features!
