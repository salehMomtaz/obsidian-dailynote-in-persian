import {
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile
} from "obsidian";

interface ShamsiDailyNoteSettings {
	folderPath: string;
	openOnStartup: boolean;
	openOnMobile: boolean;
}

const DEFAULT_SETTINGS: ShamsiDailyNoteSettings = {
	folderPath: "dailyNotes",
	openOnStartup: true,
	openOnMobile: true
};

function div(a: number, b: number): number {
	return Math.floor(a / b);
}

function gregorianToJalali(gy: number, gm: number, gd: number) {
	const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	let jy: number;

	if (gy > 1600) {
		jy = 979;
		gy -= 1600;
	} else {
		jy = 0;
		gy -= 621;
	}

	const gy2 = gm > 2 ? gy + 1 : gy;

	let days =
		365 * gy +
		div(gy2 + 3, 4) -
		div(gy2 + 99, 100) +
		div(gy2 + 399, 400) -
		80 +
		gd +
		g_d_m[gm - 1];

	jy += 33 * div(days, 12053);
	days %= 12053;

	jy += 4 * div(days, 1461);
	days %= 1461;

	if (days > 365) {
		jy += div(days - 1, 365);
		days = (days - 1) % 365;
	}

	const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
	const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

	return { jy, jm, jd };
}

function formatJalaliDate(jy: number, jm: number, jd: number): string {
	return `${jy}${String(jm).padStart(2, "0")}${String(jd).padStart(2, "0")}`;
}

function getPersianWeekday(date: Date): string {
	const weekdays = [
		"یکشنبه",
		"دوشنبه",
		"سه‌شنبه",
		"چهارشنبه",
		"پنج‌شنبه",
		"جمعه",
		"شنبه"
	];

	return weekdays[date.getDay()];
}

export default class ShamsiDailyNotePlugin extends Plugin {
	settings: ShamsiDailyNoteSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "open-today-shamsi-daily-note",
			name: "Open today's Shamsi daily note",
			callback: async () => {
				await this.openTodayShamsiDailyNote();
			}
		});

		this.addSettingTab(new ShamsiDailyNoteSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(async () => {
			if (!this.settings.openOnStartup) return;
			if (this.app.isMobile && !this.settings.openOnMobile) return;

			await this.openTodayShamsiDailyNote();
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async ensureFolderExists(folderPath: string) {
		if (!folderPath) return;

		const parts = folderPath.split("/").filter(Boolean);
		let currentPath = "";

		for (const part of parts) {
			currentPath = currentPath ? `${currentPath}/${part}` : part;

			const existing = this.app.vault.getAbstractFileByPath(currentPath);

			if (!existing) {
				await this.app.vault.createFolder(currentPath);
			}
		}
	}

	async openTodayShamsiDailyNote() {
		try {
			const now = new Date();

			const jalali = gregorianToJalali(
				now.getFullYear(),
				now.getMonth() + 1,
				now.getDate()
			);

			const title = formatJalaliDate(jalali.jy, jalali.jm, jalali.jd);
			const weekday = getPersianWeekday(now);

			const folder = this.settings.folderPath
				.trim()
				.replace(/^\/+|\/+$/g, "");

			const filePath = folder ? `${folder}/${title}.md` : `${title}.md`;

			await this.ensureFolderExists(folder);

			let file = this.app.vault.getAbstractFileByPath(filePath);
			let createdNow = false;

			if (!file) {
				const content = `${weekday}\n\n`;
				file = await this.app.vault.create(filePath, content);
				createdNow = true;
			}

			if (!(file instanceof TFile)) {
				new Notice("Could not open today's Shamsi daily note.");
				return;
			}

			const leaf =
				this.app.workspace.getMostRecentLeaf() ||
				this.app.workspace.getLeaf(true);

			await leaf.openFile(file);

			await new Promise((resolve) => setTimeout(resolve, 100));

			const view = leaf.view;

			if (view instanceof MarkdownView) {
				const editor = view.editor;

				if (createdNow) {
					editor.setCursor({ line: 1, ch: 0 });
				} else {
					const lastLine = Math.max(editor.lineCount() - 1, 0);
					const lastLineText = editor.getLine(lastLine);

					editor.setCursor({
						line: lastLine,
						ch: lastLineText.length
					});
				}

				editor.focus();
			}
		} catch (error) {
			console.error(error);
			new Notice("Error opening today's Shamsi daily note.");
		}
	}
}

class ShamsiDailyNoteSettingTab extends PluginSettingTab {
	plugin: ShamsiDailyNotePlugin;

	constructor(app: any, plugin: ShamsiDailyNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Shamsi Daily Note Settings"
		});

		new Setting(containerEl)
			.setName("Daily notes folder")
			.setDesc("Vault-relative folder path. Default: dailyNotes")
			.addText((text) =>
				text
					.setPlaceholder("dailyNotes")
					.setValue(this.plugin.settings.folderPath)
					.onChange(async (value) => {
						this.plugin.settings.folderPath =
							value.trim() || "dailyNotes";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Open on startup")
			.setDesc("Always open today's Shamsi daily note when Obsidian starts.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.openOnStartup = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Open on mobile")
			.setDesc("Allow automatic opening on Android/mobile.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openOnMobile)
					.onChange(async (value) => {
						this.plugin.settings.openOnMobile = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
