# 📚 Binder - File Organization Made Simple

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with SvelteKit](https://img.shields.io/badge/Made%20with-SvelteKit-FF3E00.svg)](https://kit.svelte.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Binder is a modern, efficient file organization tool built with SvelteKit and Tailwind CSS. It helps you manage, combine, and process multiple files and directories with ease, perfect for developers working with complex codebases.

## ✨ Features

- 🗂️ **Drag & Drop Interface**: Intuitive file and folder handling
- 🔍 **Smart File Filtering**: Built-in `.loadignore` support for customized file processing
- 📝 **File Preview**: Instant preview of file contents
- 🔄 **File Combination**: Merge multiple files into a single document
- 🌓 **Dark/Light Mode**: Built-in theme switching for comfortable viewing
- 📊 **Progress Tracking**: Real-time progress indicators for file operations
- 📋 **Debug Logging**: Detailed operation logs for transparency

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yuubae215/file-binder.git
cd file-binder
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3041` to see the application in action!

## 🛠️ Building for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🧩 Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Skeleton](https://www.skeleton.dev/)
- **File Handling**: File System API
- **Type Safety**: TypeScript

## 📝 Usage

1. **File Upload**: Drag and drop files or folders into the upload area
2. **File Preview**: Click on any file in the list to preview its contents
3. **File Combination**: Click "Combine files" to merge all files into one
4. **Download**: Download the combined file for further use

### .loadignore Support

Create a `.loadignore` file in any directory to exclude specific files or patterns:

```plaintext
node_modules
*.log
.DS_Store
```

## 🤝 Contributing

Contributions are always welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) for the amazing framework
- [Skeleton](https://www.skeleton.dev/) for the UI components
- All our [contributors](https://github.com/yourusername/binder/graphs/contributors)
