const { Gtk, Gio } = imports.gi;

function getSettings() {
    //return new Gio.Settings({ schema_id: 'org.gnome.shell.extensions.jam-indo' });
    const GioSSS = Gio.SettingsSchemaSource.get_default();
    const schemaObj = GioSSS.lookup('org.gnome.shell.extensions.jam-indo', true);
    if (!schemaObj){
      log('gsetting not found');
      return null;
    }
    return new Gio.Settings({ settings_schema: schemaObj });
    
}


function init() {}
export default function buildPrefsWidget() {
    const settings = getSettings();

    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 12,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    // Pilihan format tanggal
    const dateFormatLabel = new Gtk.Label({ label: "Pilih Format Tanggal", halign: Gtk.Align.START });
    const dateFormatCombo = new Gtk.ComboBoxText();
    ['dd-MMM-yy', 'dd/MM/yyyy', 'yyyy-MM-dd'].forEach(format => dateFormatCombo.append_text(format));
    dateFormatCombo.set_active_id(settings.get_string('date-format'));
    dateFormatCombo.connect('changed', () => {
        settings.set_string('date-format', dateFormatCombo.get_active_text());
    });

    // Format jam
    const clockFormatLabel = new Gtk.Label({ label: "Pilih Format Jam", halign: Gtk.Align.START });
    const clockFormatCombo = new Gtk.ComboBoxText();
    ['default', '12h', '24h'].forEach(format => clockFormatCombo.append_text(format));
    clockFormatCombo.set_active_id(settings.get_string('clock-format'));
    clockFormatCombo.connect('changed', () => {
        settings.set_string('clock-format', clockFormatCombo.get_active_text());
    });
    
    try {
      const currentClockFormat = settings.get_string('clock-format');
      clockFormatCombo.set_active_id(currentClockFormat);
      
    } catch (e) {
        log(`Failed to get clock Format: ${e}`);
        clockFormatCombo.set_active_id('default');
      }
    clockFormatCombo.connect('changed', () => {
      settings.set_string('clock-format', clockFormatCombo.get_active_text());
    });
    

    box.append(dateFormatLabel);
    box.append(dateFormatCombo);
    box.append(clockFormatLabel);
    box.append(clockFormatCombo);

    return box;
}


