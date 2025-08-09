import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

// Kamus terjemahan hari dan bulan
const day_id = {
    "Sunday": "Minggu",
    "Monday": "Senin",
    "Tuesday": "Selasa",
    "Wednesday": "Rabu",
    "Thursday": "Kamis",
    "Friday": "Jumat",
    "Saturday": "Sabtu"
};

const month_id = {
    "January": "Januari",
    "February": "Februari",
    "March": "Maret",
    "April": "April",
    "May": "Mei",
    "June": "Juni",
    "July": "Juli",
    "August": "Agustus",
    "September": "September",
    "October": "Oktober",
    "November": "November",
    "December": "Desember"
};

export default class jamindo extends Extension {
    enable() {
        const dateMenu = Main.panel.statusArea.dateMenu;

        const clockDisplayBox = dateMenu
            .get_children()
            .find((x) => x.style_class === "clock-display-box");

        this.label = clockDisplayBox?.get_children().find(
            (x) =>
                x.style_class === "clock" &&
                x.text?.includes("\u2236")
        );

        if (!this.label) {
            console.error("No clock label? Aborting.");
            return;
        }

        const gnomeSettings = Gio.Settings.new("org.gnome.desktop.interface");
        this.gnomeCalendar = Gio.Settings.new("org.gnome.desktop.calendar");

        const override = () => {
            if (this.newClock == this.label.get_text()) {
                return;
            }

            let day, date, week, time;

            // Ambil hari dan bulan dalam bahasa Indonesia
            const now = GLib.DateTime.new_now_local();
            const weekday = now.format("%A");  // Nama hari dalam bahasa Inggris
            const month = now.format("%B");  // Nama bulan dalam bahasa Inggris

            // Terjemahkan nama hari dan bulan
            day = day_id[weekday] || weekday;  // Cek terjemahan hari
            let monthName = month_id[month] || month;  // Cek terjemahan bulan

            // Format Tanggal dan Bulan
            if (gnomeSettings.get_boolean("clock-show-date")) {
                date = `%d-${monthName.slice(0, 3)}-%y`; // Format: 20-Jun-25
            }

            // Format Jam (12 Jam dengan AM/PM)
            if (gnomeSettings.get_string("clock-format") === '24h') {
                time = "%H:%M";
            } else {
                time = "%I:%M %p";  // Format: 10:40 PM
            }

            if (gnomeSettings.get_boolean("clock-show-seconds")) {
                time = time.replace("%M", "%M:%S");
            }

            const format = [day, date, time].filter(v => v).join("   ");

            this.defaultClock = this.label.get_text();
            this.newClock = now.format(format);
            this.label.set_text(this.newClock);
        };

        this.labelHandleId = this.label.connect("notify::text", override);

        this.calendarHandleId = this.gnomeCalendar.connect("changed::show-weekdate", () => {
            this.label.set_text(this.defaultClock);
        })
        
        override();
    }

    disable() {
        if (this.calendarHandleId) {
            this.gnomeCalendar.disconnect(this.calendarHandleId);
            this.calendarHandleId = null;
        }

        if (this.labelHandleId) {
            this.label.disconnect(this.labelHandleId);
            this.labelHandleId = null;
        }

        if (this.defaultClock) {
            this.label.set_text(this.defaultClock);
        }

        this.gnomeCalendar = null;
        this.label = null;
        this.newClock = null;
        this.defaultClock = null;
    }
}

