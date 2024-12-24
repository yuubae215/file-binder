# 📚 Binder - File Organization Made Simple

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with SvelteKit](https://img.shields.io/badge/Made%20with-SvelteKit-FF3E00.svg)](https://kit.svelte.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Version](https://img.shields.io/badge/version-0.0.2-blue.svg)](https://github.com/yuubae215/file-binder/releases)

🔗 [Live Demo](https://yuubae215.github.io/file-binder/)

Binder is a modern, efficient file organization tool built with SvelteKit and Tailwind CSS. It helps you manage, combine, and process multiple files and directories with ease, perfect for developers working with complex codebases.

## ✨ Features

- 🗂️ **Drag & Drop Interface**: Intuitive file and folder handling
- 🔍 **Smart File Filtering**: Built-in `.loadignore` support for customized file processing
- 📝 **File Preview**: Instant preview of file contents
- 🔄 **File Combination**: Merge multiple files into a single markdown document
- 📊 **Visual File Structure**: Automatically generated Mermaid diagrams for directory structure
- 🌓 **Dark/Light Mode**: Built-in theme switching for comfortable viewing
- 📊 **Progress Tracking**: Real-time progress indicators for file operations
- 📋 **Debug Logging**: Detailed operation logs for transparency
- 🎨 **Syntax Highlighting**: Language-specific syntax highlighting in generated markdown
- 🌳 **Directory Visualization**: Tree structure visualization of your project files

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
- **Diagram Generation**: [Mermaid](https://mermaid.js.org/)
- **File Handling**: File System API
- **Type Safety**: TypeScript

## 📝 Usage

1. **File Upload**: Drag and drop files or folders into the upload area
2. **File Preview**: Click on any file in the list to preview its contents
3. **File Combination**: Click "Combine files" to merge all files into one markdown document
4. **Download**: Download the combined markdown file with:
   - Visual directory structure diagram
   - Language-specific syntax highlighting
   - Organized file contents

### .loadignore Support

Create a `.loadignore` file in any directory to exclude specific files or patterns. The `.loadignore` file supports various pattern matching syntax similar to `.gitignore`:

- `*` - Matches any string except path separator
- `**` - Matches any string including path separator
- `?` - Matches any single character except path separator
- `[abc]` - Matches any character in the brackets
- `[!abc]` - Matches any character not in the brackets
- `{foo,bar}` - Matches any of the patterns separated by commas

Examples:

```plaintext
# Comments start with #
*.log                   # All log files
**/node_modules        # node_modules directory at any level
{temp,tmp}*/           # Directories starting with temp or tmp
**/*{test,spec}.js    # Files ending with test.js or spec.js
[abc]*.txt            # Files starting with a, b, or c
[!0-9]*.js           # Files not starting with a number
?cache/              # Single character + cache directory
dist/                # dist directory
build/               # build directory
.DS_Store            # macOS system files
```

## 📝 Changelog

### v0.0.2 - 2024-12-25
#### Added
- Enhanced file combination with markdown formatting
- Automatic Mermaid diagram generation for directory structure
- Language-specific syntax highlighting in combined output
- Changed output format from .txt to .md
- Visual representation of project structure in combined files

### v0.0.1 - 2024-12-23
#### Initial Release
- Basic file and folder drag & drop functionality
- File preview capabilities
- .loadignore support
- Progress tracking
- Debug logging
- Light/Dark mode support
- Basic file combination feature

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) for the amazing framework
- [Skeleton](https://www.skeleton.dev/) for the UI components
- [Mermaid](https://mermaid.js.org/) for diagram generation
- All our [contributors](https://github.com/yourusername/binder/graphs/contributors)