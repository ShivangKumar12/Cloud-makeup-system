# Virtual Makeup Studio

<div align="center">
  <img src="logo.png" alt="Virtual Makeup Studio Logo" width="200" height="200">
  
  <p>
    <strong>Virtual Makeup Studio is a web application that allows users to apply virtual makeup using real-time face landmark detection. It leverages React.js for the frontend, Node.js for the backend, and Google Cloud Storage for image storage with full CRUD operations.</strong>
  </p>
  
  <p>
    <a href="https://github.com/{username}/Virtual-Makeup-Studio/stargazers"><img src="https://img.shields.io/github/stars/{username}/Virtual-Makeup-Studio" alt="Stars Badge"/></a>
    <a href="https://github.com/{username}/Virtual-Makeup-Studio/network/members"><img src="https://img.shields.io/github/forks/{username}/Virtual-Makeup-Studio" alt="Forks Badge"/></a>
    <a href="https://github.com/{username}/Virtual-Makeup-Studio/pulls"><img src="https://img.shields.io/github/issues-pr/{username}/Virtual-Makeup-Studio" alt="Pull Requests Badge"/></a>
    <a href="https://github.com/{username}/Virtual-Makeup-Studio/issues"><img src="https://img.shields.io/github/issues/{username}/Virtual-Makeup-Studio" alt="Issues Badge"/></a>
    <a href="https://github.com/{username}/Virtual-Makeup-Studio/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/{username}/Virtual-Makeup-Studio?color=2b9348"></a>
    <a href="https://github.com/{username}/Virtual-Makeup-Studio/blob/main/LICENSE"><img src="https://img.shields.io/github/license/{username}/Virtual-Makeup-Studio?color=2b9348" alt="License Badge"/></a>
  </p>
</div>

## 🌟 Overview

Virtual Makeup Studio is a web application applying virtual makeup in real-time using advanced face landmark detection models. It solves the problem of interactive and realistic virtual makeup try-on by providing precise face detection along with seamless cloud-based image storage and management via Google Cloud Storage.

## ✨ Features

- 🚀 **Fast Performance** — Real-time face landmark detection for instant feedback  
- 🛡️ **Secure** — Backend API with Google Cloud Storage authentication for secure image CRUD  
- 🔧 **Customizable** — Easily extendable React components with Tailwind CSS styling  
- 📱 **Responsive** — Works smoothly across devices including mobile and desktop  
- 🌐 **Cross-platform** — Compatible with modern browsers and platforms  
- 📖 **Well Documented** — Comprehensive README and configuration instructions  

## 🎯 Quick Start

### Prerequisites

- Node.js (v14 or higher)  
- npm or yarn package manager  
- Git  

### Installation

1. **Clone the repository**  
git clone https://github.com/{username}/Virtual-Makeup-Studio.git
cd Virtual-Makeup-Studio

2. **Install frontend dependencies and run development server**  
cd client
npm install
npm run dev

text

3. **Set up backend environment and install dependencies**  
cd ../server
npm install
npm start

5. **Configure environment variables in `server/.env`**  
GCLOUD_PROJECT_ID=your-project-id
GCLOUD_BUCKET_NAME=your-bucket-name
GCLOUD_CLIENT_EMAIL=your-service-account-email
GCLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
PORT=5001

text

5. **Start backend server**  
npm start

text

## 📚 Documentation

- [Installation Guide](docs/installation.md)  
- [User Guide](docs/user-guide.md)  
- [API Reference](docs/api.md)  
- [Contributing Guidelines](CONTRIBUTING.md)  
- [FAQ](docs/faq.md)  

## 🏗️ Project Structure

Virtual-Makeup-Studio/
├── client # React frontend application
│   ├── public # Static assets including face detection models
│   │   └── models # Machine learning models (face landmark, tiny face detector)
│   ├── src # Source code (components, hooks, pages, utils)
│   ├── package.json
├── server # Node.js backend server
│   ├── index.js # Server entry point
│   ├── .env # Environment config for Google Cloud credentials
│   ├── package.json
├── README.md # Project documentation
└── .gitignore

text

## 🤖 Machine Learning Integration

- Uses pre-trained face landmark detection models to identify 68 face points accurately for makeup mapping.  
- Tiny face detector model provides efficient face detection as a primary step.  
- ML inference is done client-side using models stored in `/client/public/models` allowing real-time detection and makeup application without server load.

## ☁️ Cloud Integration

- Uses Google Cloud Storage to securely upload, update, retrieve, and delete makeup-related images.  
- Backend (Node.js) API handles all CRUD operations with Google Cloud Storage using service account authentication.  
- Requires environment variables with project-specific Google Cloud credentials to operate.  
- Ensures scalable and reliable image storage while keeping user data secure.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.  
You can contribute by:  
- 🐛 Reporting bugs  
- 💡 Suggesting new features  
- 📝 Improving documentation  
- 🔧 Submitting pull requests  

## 📊 Roadmap

- [ ] Add user authentication  
- [ ] Enhance makeup options and styles  
- [ ] Mobile app integration  
- [x] ~~Initial face detection and makeup application~~

See [open issues](https://github.com/{username}/Virtual-Makeup-Studio/issues) for more features and bug tracking.

## 🏆 Contributors

Thanks to all contributors who helped build this project!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Face-api.js for face detection models integration  
- Google Cloud for cloud storage solutions  
- Tailwind CSS for styling framework  

## 📞 Support



---

<div align="center">
  Made with ❤️ by <a href="https://github.com/{username}">@{username}</a>
</div>
