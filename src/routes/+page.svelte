<script lang="ts">
	import { onMount, afterUpdate } from "svelte";
	import fileSaver from "file-saver";
	import { AppShell, AppBar, ProgressBar } from "@skeletonlabs/skeleton";
	const { saveAs } = fileSaver;

	let files = [];
	let isLoading = false;
	let progress = 0;
	let estimatedTotalFiles = 0;
	let processedFiles = 0;
	let error = null;
	let dropZone;
	let selectedFile = null;
	let fileContent = "";
	let combinedContent = "";
	let isCombining = false;

	let ignorePatterns: Set<string> = new Set();
	let debugLog: string[] = [];

	let logContainer: HTMLElement;

	function log(message: string) {
		//console.log(message);
		debugLog = [...debugLog, message];
	}

	onMount(() => {
		if (dropZone) {
			dropZone.addEventListener("dragover", preventDefault);
			dropZone.addEventListener("drop", handleDrop);
		}

		return () => {
			if (dropZone) {
				dropZone.removeEventListener("dragover", preventDefault);
				dropZone.removeEventListener("drop", handleDrop);
			}
		};
	});

	afterUpdate(() => {
		if (logContainer) {
			logContainer.scrollTop = logContainer.scrollHeight;
		}
	});

	function preventDefault(e) {
		e.preventDefault();
	}

	// .loadignoreファイルを解析する関数
	async function parseLoadIgnore(file: File): Promise<Set<string>> {
		const content = await file.text();
		const patterns = new Set(
			content
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line && !line.startsWith("#")),
		);
		log(
			`Parsed .loadignore file: ${file.name}, patterns: ${Array.from(patterns).join(", ")}`,
		);
		return patterns;
	}

	function convertPatternToRegExp(pattern: string): RegExp {
		// エスケープが必要な特殊文字をエスケープ
		const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");

		// **/ パターンを一時的なトークンに置換
		let converted = escaped.replace(/\*\*/g, "GLOBSTAR");

		// 各種パターンを正規表現に変換
		converted = converted
			// ? を任意の1文字に
			.replace(/\?/g, "[^/]")
			// * を任意の文字列（ただし/は除く）に
			.replace(/\*/g, "[^/]*")
			// GLOBSTAR を任意のパス（/を含む）に戻す
			.replace(/GLOBSTAR/g, ".*");

		// 文字クラスと否定文字クラスはそのまま正規表現として有効
		// [abc], [!abc] は有効な正規表現なのでそのまま使える

		// {pattern1,pattern2} 形式を (pattern1|pattern2) に変換
		converted = converted.replace(
			/\{([^{}]*)\}/g,
			(_, contents) => `(${contents.split(",").join("|")})`,
		);

		// パスの先頭と末尾の任意性を考慮
		return new RegExp(`^(.*\\/)?${converted}(\\/.*)?$`);
	}

	// ファイルがignoreパターンにマッチするかチェックする関数
	function shouldIgnoreFile(
		filePath: string,
		ignorePatterns: Set<string>,
	): boolean {
		log(`Checking if ${filePath} should be ignored`);

		for (const pattern of ignorePatterns) {
			if (pattern.startsWith("#") || pattern.trim() === "") continue;

			const regex = convertPatternToRegExp(pattern.trim());
			log(`  Checking against pattern: ${pattern} (regex: ${regex})`);

			if (regex.test(filePath)) {
				log(`  Matched! File will be ignored.`);
				return true;
			}
		}

		log(`  No match found. File will be included.`);
		return false;
	}

	// 正規表現のメタ文字をエスケープする関数
	function escapeRegExp(string: string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	function updateProgress() {
		// 推定ファイル数を動的に更新
		estimatedTotalFiles = Math.max(
			estimatedTotalFiles,
			processedFiles * 1.1,
		);
		progress = Math.min(
			Math.round((processedFiles / estimatedTotalFiles) * 100),
			100,
		);
	}

	async function processEntry(
		entry,
		path = "",
		currentIgnorePatterns: Set<string> = new Set(),
		rootPath = "",
	) {
		const fullPath = rootPath + path + entry.name;
		log(`Processing entry: ${fullPath}`);
		if (entry.isFile) {
			return new Promise((resolve) => {
				entry.file(async (file) => {
					processedFiles++;
					updateProgress();
					if (file.name === ".loadignore") {
						log(`Found .loadignore file: ${fullPath}`);
						const newIgnorePatterns = await parseLoadIgnore(file);
						currentIgnorePatterns = new Set([
							...currentIgnorePatterns,
							...newIgnorePatterns,
						]);
						ignorePatterns = new Set([
							...ignorePatterns,
							...currentIgnorePatterns,
						]);
						log(
							`Updated ignore patterns: ${Array.from(ignorePatterns).join(", ")}`,
						);
						resolve(null);
					} else if (!shouldIgnoreFile(fullPath, ignorePatterns)) {
						log(`Including file: ${fullPath}`);
						resolve({ path: fullPath, file });
					} else {
						log(`Ignoring file: ${fullPath}`);
						resolve(null);
					}
				});
			});
		} else if (entry.isDirectory) {
			// ディレクトリの場合、推定ファイル数を増やす
			estimatedTotalFiles += 10; // ディレクトリごとに10ファイルと仮定
			updateProgress();
			const dirPath = path + entry.name + "/";
			log(`Processing directory: ${fullPath}/`);
			if (shouldIgnoreFile(fullPath + "/", ignorePatterns)) {
				log(`Ignoring directory: ${fullPath}/`);
				return Promise.resolve([]);
			}
			const dirReader = entry.createReader();
			return new Promise((resolve) => {
				const readEntries = async () => {
					dirReader.readEntries(async (entries) => {
						const loadIgnoreEntry = entries.find(
							(e) => e.name === ".loadignore",
						);
						if (loadIgnoreEntry) {
							await processEntry(
								loadIgnoreEntry,
								dirPath,
								currentIgnorePatterns,
								rootPath,
							);
						}

						if (entries.length === 0) {
							resolve([]);
						} else {
							const results = await Promise.all(
								entries
									.filter((e) => e.name !== ".loadignore")
									.map((e) =>
										processEntry(
											e,
											dirPath,
											currentIgnorePatterns,
											rootPath,
										),
									),
							);
							resolve(results.flat().filter(Boolean));
						}
					});
				};
				readEntries();
			});
		}
	}

	async function handleDrop(e) {
		e.preventDefault();
		isLoading = true;
		progress = 0;
		processedFiles = 0;
		estimatedTotalFiles = 0;
		error = null;
		ignorePatterns.clear();
		debugLog = [];
		log("Starting file processing");

		const items = e.dataTransfer.items;

		try {
			const filePromises = [];

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item.kind === "file") {
					const entry = item.webkitGetAsEntry();
					if (entry) {
						estimatedTotalFiles += entry.isDirectory ? 10 : 1; // ディレクトリの場合は10、ファイルの場合は1と仮定
						filePromises.push(
							processEntry(entry, "", new Set(), ""),
						);
					}
				}
			}

			updateProgress(); // 初期進捗を表示

			const fileArrays = await Promise.all(filePromises);
			const allFiles = fileArrays.flat().filter(Boolean);

			files = allFiles;
			log(`Processed ${files.length} files`);

			progress = 100; // 最終的に100%にする
		} catch (err) {
			error = "ファイルの処理中にエラーが発生しました: " + err.message;
			log(`Error: ${error}`);
		} finally {
			isLoading = false;
		}
	}

	async function handleFileSelect(file) {
		selectedFile = file;
		try {
			const text = await file.file.text();
			fileContent = text;
		} catch (err) {
			console.error("ファイル処理エラー:", err);
			fileContent =
				"ファイルの読み込み中にエラーが発生しました: " + err.message;
		}
	}

	// ファイルパスからツリー構造を構築する関数
	function buildFileTree(files: { path: string }[]) {
		const tree = {};

		for (const file of files) {
			const parts = file.path.split("/");
			let current = tree;

			for (const part of parts.slice(0, -1)) {
				if (!current[part]) {
					current[part] = {};
				}
				current = current[part];
			}

			const fileName = parts[parts.length - 1];
			current[fileName] = null;
		}

		return tree;
	}

	// ツリー構造からMermaid記法を生成する関数
	function generateMermaidDiagram(
		tree: object,
		parentId: string = "root",
	): string {
		let mermaidCode = "";
		let nodeId = 0;

		const generateNodes = (
			tree: object,
			parentId: string = "root",
		): string => {
			let code = "";

			for (const [name, subtree] of Object.entries(tree)) {
				const currentId = `node${nodeId++}`;
				const isDirectory = subtree !== null;

				// ノードの形状を設定（ディレクトリは六角形、ファイルは長方形）
				if (isDirectory) {
					code += `  ${currentId}[/${name}/]\n`;
				} else {
					code += `  ${currentId}[${name}]\n`;
				}

				// 親ノードとの接続を設定
				code += `  ${parentId} --> ${currentId}\n`;

				// サブディレクトリを再帰的に処理
				if (isDirectory) {
					code += generateNodes(subtree, currentId);
				}
			}

			return code;
		};

		mermaidCode = "graph TD\n";
		mermaidCode += "  root[/Project Root/]\n";
		mermaidCode += generateNodes(tree);

		return mermaidCode;
	}

	async function combineFiles() {
		isCombining = true;

		// ヘッダーとファイル構造図を追加
		combinedContent = "# Combined Files\n\n";
		combinedContent += "## File Structure\n\n";
		combinedContent += "```mermaid\n";

		// ファイルツリーを構築してMermaidダイアグラムを生成
		const tree = buildFileTree(files);
		combinedContent += generateMermaidDiagram(tree);
		combinedContent += "```\n\n";

		// 各ファイルの内容を追加
		combinedContent += "## File Contents\n\n";
		for (const file of files) {
			try {
				const text = await file.file.text();
				const fileName = file.path;
				combinedContent += `### ${fileName}\n\`\`\`${getFileExtension(fileName)}\n${text}\n\`\`\`\n\n`;
			} catch (err) {
				console.error(`Error processing file ${file.path}:`, err);
				combinedContent += `### Error: ${file.path}\n\`\`\`\nError: ${err.message}\n\`\`\`\n\n`;
			}
		}

		isCombining = false;
	}

	function getFileExtension(fileName: string): string {
		const ext = fileName.split(".").pop()?.toLowerCase();
		const extensionMap = {
			js: "javascript",
			ts: "typescript",
			jsx: "javascript",
			tsx: "typescript",
			yml: "yaml",
			json: "json",
			md: "markdown",
			css: "css",
			html: "html",
			svelte: "svelte",
		};
		return extensionMap[ext] || "";
	}

	function downloadCombinedFile() {
		const blob = new Blob([combinedContent], {
			type: "text/markdown;charset=utf-8",
		});
		saveAs(blob, "base-code.md");
	}
</script>

<div class="flex flex-col h-[calc(100vh-64px)">
	<header class="p-4 bg-surface-200-700-token">
		<strong class="text-xl uppercase">Binder</strong>
	</header>

	<main class="flex-1 overflow-hidden p-4 bg-surface-50-900-token">
		<div
			bind:this={dropZone}
			class="border-2 border-dashed border-primary-500 rounded-lg p-4 text-center cursor-pointer bg-primary-100 dark:bg-primary-900 mb-4"
		>
			{#if isLoading}
				<div class="w-full">
					<ProgressBar value={progress} max={100} />
					<p class="mt-2">Loading... {progress}%</p>
				</div>
			{:else}
				Drag & Drop folders or files here
			{/if}
		</div>

		{#if error}
			<div
				class="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 rounded"
			>
				<strong>Error:</strong>
				{error}
			</div>
		{/if}

		<div
			class="card p-4 h-[calc(86vh-230px)] overflow-auto bg-surface-100-800-token"
		>
			{#if files.length > 0}
				<div
					class="mb-4 p-2 bg-secondary-100 dark:bg-secondary-900 rounded"
				>
					<h3 class="h4 mb-2">Actions</h3>
					<button
						class="btn variant-filled-primary mr-2"
						on:click={combineFiles}
						disabled={isCombining}
					>
						{isCombining ? "Combining files..." : "Combine files"}
					</button>
					{#if combinedContent}
						<button
							class="btn variant-filled-secondary"
							on:click={downloadCombinedFile}
						>
							Download a combined file
						</button>
					{/if}
				</div>
			{/if}

			<div class="flex space-x-4">
				{#if files.length > 0}
					<div
						class="w-1/3 flex flex-col p-2 bg-tertiary-100 dark:bg-tertiary-900 rounded"
					>
						<h2 class="h3 mb-4">File List</h2>
						<ul
							class="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)]"
						>
							{#each files as file, index (index)}
								<li>
									<button
										class="text-sm cursor-pointer hover:bg-tertiary-200 dark:hover:bg-tertiary-800 p-1 rounded w-full text-left"
										on:click={() => handleFileSelect(file)}
									>
										{file.path}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<div
					class="w-2/3 flex flex-col p-2 bg-surface-200-700-token rounded"
				>
					{#if selectedFile}
						<h2 class="h3 mb-4">
							File Content: {selectedFile.path}
						</h2>
						<pre
							class="bg-surface-300-600-token p-4 rounded overflow-y-auto max-h-[calc(100vh-400px)]"><code
								>{fileContent}</code
							></pre>
					{:else if combinedContent}
						<h2 class="h3 mb-4">Combined Files</h2>
						<pre
							class="bg-surface-300-600-token p-4 rounded overflow-y-auto max-h-[calc(100vh-400px)]"><code
								>{combinedContent}</code
							></pre>
					{/if}
				</div>
			</div>
		</div>
	</main>

	<footer class="p-2 bg-surface-200-700-token text-sm">
		<summary class="cursor-pointer font-semibold">Log</summary>
		<pre
			bind:this={logContainer}
			class="mt-2 bg-surface-300-600-token p-2 rounded overflow-y-auto h-20 text-xs">
		  {debugLog.join("\n")}
		</pre>
	</footer>
</div>

<style>
	:global(html, body) {
		height: 100%;
	}

	:global(body) {
		display: flex;
		flex-direction: column;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	pre {
		scrollbar-width: thin;
		scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
	}

	pre::-webkit-scrollbar {
		width: 8px;
	}

	pre::-webkit-scrollbar-track {
		background: transparent;
	}

	pre::-webkit-scrollbar-thumb {
		background-color: rgba(155, 155, 155, 0.5);
		border-radius: 20px;
		border: transparent;
	}
</style>
