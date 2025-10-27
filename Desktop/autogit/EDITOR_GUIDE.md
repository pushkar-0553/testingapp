# 📝 Rich Text Editor & Markdown Guide

## 🎯 Overview

AutoGit now includes a **powerful rich text editor** with Markdown support, similar to VS Code and Medium. You can write formatted notes, preview them in real-time, and export as `.md` files.

---

## 🚀 Features

### ✨ Rich Text Editing
- **Bold**, *Italic*, ~~Strikethrough~~, `Inline Code`
- Headings (H1-H6)
- Bullet lists and numbered lists
- Block quotes
- Code blocks with syntax highlighting
- Links and images
- Text colors
- Undo/Redo

### 📄 Markdown Support
- Write in rich text, export as Markdown
- Real-time preview (split-screen)
- Syntax highlighting for code blocks
- GitHub Flavored Markdown (GFM) support

### 📁 Folder Upload
- Upload entire folders with structure preserved
- Batch file upload
- Progress tracking

---

## 🎨 How to Use the Rich Text Editor

### 1. **Open the Editor**
- Go to "Add Task" page
- Click **"Open Rich Text Editor"** button next to "Additional Notes"
- Full-screen distraction-free editor opens

### 2. **Write Your Content**
Use the toolbar buttons:

| Button | Function | Shortcut |
|--------|----------|----------|
| **B** | Bold | Ctrl+B |
| *I* | Italic | Ctrl+I |
| ~~S~~ | Strikethrough | - |
| `<>` | Inline Code | - |
| H1/H2/H3 | Headings | - |
| • | Bullet List | - |
| 1. | Numbered List | - |
| " | Block Quote | - |
| {} | Code Block | - |
| 🔗 | Insert Link | - |
| 🖼️ | Insert Image | - |
| 🎨 | Text Color | - |
| ↶/↷ | Undo/Redo | Ctrl+Z/Y |

### 3. **Preview Your Content**
- Click **"Show Preview"** button at bottom
- Split-screen view: Editor (left) + Preview (right)
- See exactly how your Markdown will look

### 4. **Save as Markdown**
- Click **"Save as Markdown"** button
- Content is converted to `.md` file
- File is automatically attached to your task
- Uploaded to GitHub with your task

---

## 📖 How Markdown Works (Like VS Code)

### What is Markdown?
Markdown is a lightweight markup language that converts plain text to formatted HTML. It's used by:
- GitHub README files
- VS Code documentation
- Medium articles
- Discord, Slack, Reddit

### VS Code Markdown Workflow

**In VS Code:**
1. Create a `.md` file
2. Write Markdown syntax
3. Press `Ctrl+Shift+V` to preview
4. VS Code renders HTML in preview pane

**In AutoGit:**
1. Click "Open Rich Text Editor"
2. Write using visual toolbar (no syntax needed!)
3. Click "Show Preview" to see rendered output
4. Save as `.md` file automatically

---

## 🔤 Markdown Syntax Reference

### Headings
```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`
```

### Lists
```markdown
- Bullet point 1
- Bullet point 2

1. Numbered item 1
2. Numbered item 2
```

### Links & Images
```markdown
[Link text](https://example.com)
![Image alt text](https://example.com/image.png)
```

### Code Blocks
````markdown
```javascript
function hello() {
  console.log("Hello World!");
}
```
````

### Block Quotes
```markdown
> This is a quote
> Multiple lines
```

### Tables
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

---

## 💡 How AutoGit Replicates VS Code Functionality

### VS Code Features → AutoGit Implementation

| VS Code Feature | AutoGit Implementation |
|-----------------|------------------------|
| `.md` file editing | Rich text editor (TipTap) |
| Markdown preview | React-Markdown with live preview |
| Syntax highlighting | Lowlight + Highlight.js |
| Split-screen view | Editor + Preview side-by-side |
| Auto-save | Save as `.md` on button click |
| Extensions | Built-in TipTap extensions |

### Technical Stack

**Editor:** TipTap (ProseMirror-based)
- Modern, extensible rich text editor
- Used by companies like GitLab, Substack
- Better than Quill for complex formatting

**Markdown Conversion:** Turndown
- Converts HTML → Markdown
- Preserves formatting perfectly

**Preview:** React-Markdown
- Renders Markdown → HTML
- GitHub Flavored Markdown support
- Syntax highlighting with Highlight.js

**Code Highlighting:** Lowlight
- VS Code-like syntax highlighting
- Supports 100+ languages
- Dark theme (GitHub Dark)

---

## 📁 Folder Upload Feature

### How It Works

1. **Click "Upload Folder"** in Add Task page
2. **Select a folder** from your computer
3. **Preview files** before uploading
4. **Folder structure is preserved** in GitHub

### Example

**Your folder:**
```
my-project/
├── src/
│   ├── index.js
│   └── App.js
├── public/
│   └── index.html
└── package.json
```

**Uploaded to GitHub:**
```
autogit-uploads/2025-10-20/my-project/
├── src/
│   ├── index.js
│   └── App.js
├── public/
│   └── index.html
└── package.json
```

### Use Cases
- Upload entire project folders
- Backup code repositories
- Share folder structures
- Document project organization

---

## 🎯 Workflow Examples

### Example 1: Daily Learning Log

1. Go to "Add Task"
2. Title: "Learned React Hooks"
3. Click "Open Rich Text Editor"
4. Write notes with:
   - Headings for each hook
   - Code blocks for examples
   - Links to documentation
5. Click "Show Preview" to check formatting
6. Click "Save as Markdown"
7. Select repository
8. Upload!

**Result:** Beautiful `.md` file in your GitHub repo with formatted notes.

### Example 2: Project Upload

1. Go to "Add Task"
2. Title: "Completed Todo App"
3. Description: "Built with React and Firebase"
4. Click "Upload Folder"
5. Select your project folder
6. Preview all files
7. Click "Upload Folder"

**Result:** Entire project uploaded to GitHub with structure intact.

### Example 3: Code Snippet Collection

1. Open Rich Text Editor
2. Add heading: "Useful JavaScript Snippets"
3. Add code blocks for each snippet
4. Add explanations between blocks
5. Save as `snippets.md`
6. Upload to your "learning-notes" repo

**Result:** Organized code snippet library in GitHub.

---

## 🔧 Technical Details

### File Processing

**Rich Text → Markdown:**
```javascript
// TipTap editor content (HTML)
const html = editor.getHTML();

// Convert to Markdown
const turndownService = new TurndownService();
const markdown = turndownService.turndown(html);

// Create .md file
const blob = new Blob([markdown], { type: 'text/markdown' });
const file = new File([blob], 'notes.md');
```

**Folder Upload:**
```javascript
// HTML5 File API
<input type="file" webkitdirectory directory multiple />

// Preserves folder structure
file.webkitRelativePath // "my-folder/subfolder/file.js"
```

### Markdown Rendering

**Preview Component:**
```jsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}        // GitHub Flavored Markdown
  rehypePlugins={[rehypeHighlight]}  // Syntax highlighting
>
  {markdown}
</ReactMarkdown>
```

### Code Block Highlighting

**Languages Supported:**
- JavaScript, TypeScript, Python, Java, C++, C#
- HTML, CSS, SCSS, JSON, YAML
- Bash, PowerShell, SQL
- And 100+ more!

---

## 🎓 Best Practices

### 1. **Use Headings for Structure**
```markdown
# Main Topic
## Subtopic 1
### Detail
```

### 2. **Code Blocks for Examples**
````markdown
```javascript
// Always specify language for syntax highlighting
const example = "code";
```
````

### 3. **Links for References**
```markdown
[React Docs](https://react.dev)
```

### 4. **Images for Diagrams**
```markdown
![Architecture Diagram](https://example.com/diagram.png)
```

### 5. **Lists for Steps**
```markdown
1. First step
2. Second step
3. Third step
```

---

## 🆚 Editor Comparison

| Feature | TipTap (AutoGit) | Quill | Lexical | Toast UI |
|---------|------------------|-------|---------|----------|
| Modern | ✅ | ⚠️ | ✅ | ✅ |
| Extensible | ✅✅ | ✅ | ✅✅ | ✅ |
| Markdown | ✅ | ❌ | ⚠️ | ✅ |
| TypeScript | ✅ | ❌ | ✅ | ✅ |
| File Size | Small | Medium | Small | Large |
| Learning Curve | Easy | Easy | Hard | Medium |

**Why TipTap?**
- Modern (2021+)
- Best Markdown support
- Highly extensible
- Great documentation
- Used by major companies

---

## 🐛 Troubleshooting

### Editor not loading?
- Check browser console for errors
- Ensure all dependencies installed: `npm install`
- Clear browser cache

### Preview not showing?
- Click "Show Preview" button
- Check if Markdown is valid
- Try toggling preview off/on

### Folder upload not working?
- Use Chrome/Edge (best support)
- Check folder size (max 100MB)
- Ensure repository is selected

### Syntax highlighting missing?
- Specify language in code blocks
- Check internet connection (loads highlight.js)
- Try different code block language

---

## 📚 Resources

### Learn Markdown
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown](https://guides.github.com/features/mastering-markdown/)
- [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

### TipTap Documentation
- [TipTap Docs](https://tiptap.dev/)
- [Extensions](https://tiptap.dev/extensions)
- [Examples](https://tiptap.dev/examples)

### VS Code Markdown
- [VS Code Markdown](https://code.visualstudio.com/docs/languages/markdown)
- [Markdown Preview](https://code.visualstudio.com/docs/languages/markdown#_markdown-preview)

---

## 🎉 Summary

AutoGit's rich text editor provides:
- ✅ **VS Code-like** Markdown editing
- ✅ **Real-time preview** with syntax highlighting
- ✅ **Easy export** to `.md` files
- ✅ **Folder upload** with structure preservation
- ✅ **GitHub integration** for automatic commits

**No more manual git commands!** Just write, preview, and upload! 🚀
