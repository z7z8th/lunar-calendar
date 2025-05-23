
import Gio from 'gi://Gio'
import Gtk from 'gi://Gtk'

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

import LunarDate from './backend-selector.js'

export default class LunarCalendarPreferences extends ExtensionPreferences {
  fillPreferencesWindow (win) {
    const ui = Gtk.Builder.new_from_file(this.dir.get_path() + "/prefs.ui")
    win.add(ui.get_object('content-table'))
    const hasBazi = LunarDate.backend != 'ytliu0'
    const hasLang = LunarDate.backend == 'ytliu0'

    // Make sure the win doesn't outlive the settings object
    win._settings = this.getSettings()

    win._settings.bind('show-date', ui.get_object('show-date'), 'active', Gio.SettingsBindFlags.DEFAULT)
    win._settings.bind('show-time', ui.get_object('show-time'), 'active', Gio.SettingsBindFlags.DEFAULT)
    win._settings.bind('show-calendar', ui.get_object('show-calendar'), 'active', Gio.SettingsBindFlags.DEFAULT)
    win._settings.bind('jrrilinei', ui.get_object('jrrilinei'), 'active', Gio.SettingsBindFlags.DEFAULT)
    if (hasBazi)
      win._settings.bind('ba-zi',   ui.get_object('ba-zi'),     'active', Gio.SettingsBindFlags.DEFAULT)
    win._settings.bind('gen-zhi',   ui.get_object('gen-zhi'),   'active', Gio.SettingsBindFlags.DEFAULT)
    win._settings.bind('jieri',     ui.get_object('jieri'),     'active', Gio.SettingsBindFlags.DEFAULT)
    if (hasLang)
      win._settings.bind('yuyan',   ui.get_object('yuyan'),     'selected', Gio.SettingsBindFlags.DEFAULT)
    else {
      const m = ui.get_object('yuyan').model
      const l = LunarDate.lang === 1 ? '繁體字' : LunarDate.lang === 2 ? '简体字' : 'Pīnyīn'
      m.splice(0, m.get_n_items(), [l])
      ui.get_object('yuyan').title = _('系统语言')
    }

    // using <span> on the calendar day buttons does not work anymore :-(

    const zti_min = 2
    const zti_max = 6

    let zti_inhibitor = false
    for (let i = zti_min; i <= zti_max; ++i) {
      const cl = i
      ui.get_object('zti-' + i).connect('toggled', function(object) {
        if (zti_inhibitor) { return }
        zti_inhibitor = true
        for (let j = zti_min; j <= zti_max; ++j) {
          ui.get_object('zti-' + j).set_active(j <= cl)
        }
        win._settings.set_enum('zti-dx', cl)
        zti_inhibitor = false
      })
    }
    const fontsizeFromSetting = function() {
      const num = Math.min(Math.max(win._settings.get_enum('zti-dx'), zti_min), zti_max)
      ui.get_object('zti-' + num).toggled()
    }
    win._settings.connect('changed::zti-dx', fontsizeFromSetting)
    fontsizeFromSetting()

    ui.get_object('ba-zi').sensitive = hasBazi

    ui.get_object('yuyan').sensitive = hasLang

    let sl = ui.get_object('yuyan').model
    ui.get_object('cxk').label = `github.com/${LunarDate.backend}`

    return win
  }
}
