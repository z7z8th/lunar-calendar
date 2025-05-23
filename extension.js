
import Clutter      from 'gi://Clutter'
import GObject      from 'gi://GObject'
import GLib         from 'gi://GLib'
import GnomeDesktop from 'gi://GnomeDesktop'
import St           from 'gi://St'

import * as Main          from 'resource:///org/gnome/shell/ui/main.js'
import * as MessageList   from 'resource:///org/gnome/shell/ui/messageList.js'
import {EventSourceBase}  from 'resource:///org/gnome/shell/ui/calendar.js'

import {Extension}        from 'resource:///org/gnome/shell/extensions/extension.js'
import {InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js'

import tl           from './lang.js'
import LunarDate    from './backend-selector.js'

const _make_new_with_args = (my_class, args) => new (Function.prototype.bind.apply(
  my_class, [null].concat(Array.prototype.slice.call(args))))()

const LunarCalendarMessage = GObject.registerClass(
class LunarCalendarMessage extends St.Button {

  constructor (rlt, rl, bzt, bz, gzt, gz, jrt, jr) {
    super({
      style_class: 'message lunar-message',
      can_focus: true,
      x_expand: true,
      y_expand: false,
    })

    const contentBox = new St.BoxLayout({
      style_class: 'lunar-message-group message-notification-group',
      vertical: true,
      x_expand: true,
    })

    const _titleLabel = (text) => new St.Label({
      style_class: 'message-source-title',
      y_align: Clutter.ActorAlign.END,
      text,
    })

    const _contentLabel = (text) => new St.Label({
      style_class: 'message-content',
      text,
    })

    const _header = (child) => new St.Bin({
      style_class: 'message-header',
      child: new St.Bin({
        style_class: 'message-header-content',
        child,
      }),
      x_align: Clutter.ActorAlign.START,
    })

    const _box = (child) => new St.Bin({
      style_class: 'message-box',
      child,
      x_align: Clutter.ActorAlign.START,
    })

    const _group = (title, content) => {
      const box = new St.BoxLayout({
        vertical: true,
        x_expand: true,
      })
      box.add_child(_header(title))
      box.add_child(_box(content))
      return box
    }

    this._rltLabel = _titleLabel(rlt)
    this._rlLabel = _contentLabel(rl)
    this._rlGroup = _group(this._rltLabel, this._rlLabel)
    contentBox.add_child(this._rlGroup)

    this._bztLabel = _titleLabel(bzt)
    this._bzLabel = _contentLabel(bz)
    this._bzGroup = _group(this._bztLabel, this._bzLabel)
    contentBox.add_child(this._bzGroup)

    this._gztLabel = _titleLabel(gzt)
    this._gzLabel = _contentLabel(gz)
    this._gzGroup = _group(this._gztLabel, this._gzLabel)
    contentBox.add_child(this._gzGroup)

    this._jrtLabel = _titleLabel(jrt)
    this._jrLabel = _contentLabel(jr)
    this._jrGroup = _group(this._jrtLabel, this._jrLabel)
    contentBox.add_child(this._jrGroup)

    this.bzVisible = true
    this.gzVisible = true
    this.jrVisible = true

    this.set_child(contentBox)
  }

  set rl (rlt) {
    this._rlLabel.text = rlt
  }

  set bz (bzt) {
    this._bzLabel.text = bzt
  }

  set gz (gzt) {
    this._gzLabel.text = gzt
  }

  set jr (jrt) {
    this._jrLabel.text = jrt
  }

  bzHide () {
    this.bzVisible = false
    this._bzGroup.hide()
  }

  gzHide () {
    this.gzVisible = false
    this._gzGroup.hide()
  }

  jrHide () {
    this.jrVisible = false
    this._jrGroup.hide()
  }

  bzShow () {
    this.bzVisible = true
    this._bzGroup.show()
  }

  gzShow () {
    this.gzVisible = true
    this._gzGroup.show()
  }

  jrShow () {
    this.jrVisible = true
    this._jrGroup.show()
  }

})

const LunarCalendarSection = GObject.registerClass(
class LunarCalendarSection extends St.Bin {

  constructor (settings, ld) {
    super({
      style_class: 'message-view'
    })

    this._settings = settings
    this._ld = ld

    this._message = new LunarCalendarMessage(
      this._tl("农历"), this._ld.strftimex("%(NIAN)年%(YUE)月%(RI)日"),
      this._tl("八字"), this._ld.strftime("%(Y8)年%(M8)月%(D8)日"),
      this._tl("干支"), this._ld.strftime("%(Y60)年%(M60)月%(D60)日"),
      this._tl("节日"), this._ld.get_jieri("\n"))
    this._currentLang = this._ld._lang

    this.set_child(this._message)

    if (!this._settings.get_boolean('ba-zi') || LunarDate.backend != 'ytliu0')
      this._message.bzHide()
    if (!this._settings.get_boolean('gen-zhi'))
      this._message.gzHide()
    const jr = this._settings.get_boolean('jieri') ? this._ld.getHoliday() : ""
    if (jr == "")
      this._message.jrHide()
  }

  updateTl () {
    if (this._currentLang !== this._ld._lang) {
      this._currentLang = this._ld._lang
      this._message._rltLabel.text = this._tl("农历")
      this._message._bztLabel.text = this._tl("八字")
      this._message._gztLabel.text = this._tl("干支")
      this._message._jrtLabel.text = this._tl("节日")
    }
  }

  _tl (str) {
    return tl(this._ld._lang, str)
  }

  _reload () {
    this._reloading = true

    const bzv = this._message.bzVisible
    const gzv = this._message.gzVisible
    const jrv = this._message.jrVisible

    this._message.rl = this._ld.strftimex("%(NIAN)年%(YUE)月%(RI)日")

    if (this._settings.get_boolean('ba-zi') && LunarDate.backend != 'ytliu0') {
      this._message.bz = this._ld.strftime("%(Y8)年%(M8)月%(D8)日")
      if (!bzv) {
        this._message.bzShow()
      }
    } else if (bzv) {
      this._message.bzHide()
    }

    if (this._settings.get_boolean('gen-zhi')) {
      this._message.gz = this._ld.strftime("%(Y60)年%(M60)月%(D60)日")
      if (!gzv) {
        this._message.gzShow()
      }
    } else if (gzv) {
      this._message.gzHide()
    }

    const jr = this._settings.get_boolean('jieri') ? this._ld.getHoliday() : ""
    if (jr != "") {
      const jrs = this._ld.get_jieri("\n").split("\n")
      const jrs2 = this._settings.get_boolean('jrrilinei') && this._settings.get_boolean('show-calendar') ? jrs.splice(1) : jrs
      if (jrs2.length) {
        this._message.jr = jrs2.join("\n")
        if (!jrv) {
          this._message.jrShow()
        }
      } else if (jrv) {
        this._message.jrHide()
      }
    } else if (jrv) {
      this._message.jrHide()
    }

    this._reloading = false
  }

  setDate (date) {
    this._ld.setDateNoon(date)
    let cny = this._ld.strftime("%(shengxiao)")
    this._reload()
  }

})

const LunarEventSource = GObject.registerClass(
class LunarEventSource extends EventSourceBase {

  constructor (settings, ld, wrapped) {
    super()

    this._settings = settings
    this._ld = ld
    this._wrapped = wrapped
  }

  get isLoading () {
    return this._wrapped.isLoading
  }

  get hasCalendars () {
    return true
  }

  requestRange (begin, end) {
    this._wrapped.requestRange(begin, end)
  }

  getEvents (begin, end) {
    return this._wrapped.getEvents(begin, end)
  }

  hasEvents (day) {
    this._ld.setDateNoon(day)
    const wr = this._wrapped.hasEvents(day)
    const jr = this._settings.get_boolean('jieri') ? this._ld.getHoliday() : ""
    if (jr != "") {
      const jr1 = this._settings.get_boolean('jrrilinei') && this._settings.get_boolean('show-calendar')
      if (jr1) {
        const jrs = this._ld.get_jieri("\n").split("\n")
        return wr || jrs.length > 1
      }
      return true
    }
    return wr
  }
})

export default class LunarCalendarExtension extends Extension {

  constructor (metadata) {
    super(metadata)

    this._settingsChanged = {}
    this._replacementFunc = {}
  }

  _tl (str) {
    return tl(this._ld._lang, str)
  }

  _getLunarClockDisplay () {
    const show_date = this._settings.get_boolean('show-date')
    const show_time = this._settings.get_boolean('show-time')
    let shi_tl = show_time ? this._tl("%(SHI)时").replace("%(SHI)", `${this._ld.getShi()}`) : ""
    return ((show_date ? "\u2001" + this._ld.strftimex("%(YUE)月%(RI)日") : "") +
            (show_time ? (show_date && this._ld._lang > 0 ? "" : "\u2000") + shi_tl : ""))
  }

  enable () {
    this._ld = new LunarDate()
    console.log(`lunarcal: using backend ${LunarDate.backend}`)
    this._settings = this.getSettings()
    this._injectionManager = new InjectionManager()

    const self = this

    const dm = Main.panel.statusArea.dateMenu

    const cal = dm._calendar
    const ml = dm._messageList

    this._settings.connect('changed', () => {
      for (let x in self._settingsChanged) {
        self._settingsChanged[x]()
      }
    })

    const sysLang = GLib.get_language_names()
    const prefLang = sysLang[0].replace(/[.@].*$/, '')
    this._settingsChanged.switchLang = () => {
      const yy = this._settings.get_int('yuyan')
      let holiday = prefLang

      let lang = 0
      if (prefLang === 'zh_CN')
        lang = 2
      else if (prefLang.startsWith('zh_'))
        lang = 1
      else if (prefLang.startsWith('de_'))
        lang = -3
      else if (prefLang.startsWith('en_'))
        lang = -1

      if (yy === 0) {
        lang = 2
        holiday = 'zh_CN'
      } else if (yy === 1) {
        lang = 1
        holiday = 'zh_HK'
      } else if (yy === 2) {
        lang = 1
        holiday = 'zh_TW'
      } else if (yy === 4) {
        if (lang < 0)
          lang += 1
        else
          lang = 0
      } else if (yy === 5) {
        if (lang >= 0)
          lang = -1
      }

      this._ld.setLang(lang)
      this._ld.setHoliday(holiday)
      if (ml._lunarCalendarSection)
        ml._lunarCalendarSection.updateTl()
    }
    this._settingsChanged.switchLang()

    this._replacementFunc.originalMonthHeader = cal._headerFormat
    let rebuild_in_progress = false
    let update_in_progress = false

    // look up headerFormat translation in global gettext
    let fixupHeader = globalThis._("%OB %Y").match(/%Y[^%]+%/)
    if (fixupHeader)
      cal._headerFormat = cal._headerFormat.replace(/%Y.%/, fixupHeader)

    // avoid replacing WallClock with a custom Object inheriting from
    // GObject due to bgo#734071

    dm._clock = new GnomeDesktop.WallClock()
    this._settingsChanged.refreshClock = () => {
      self._ld.setDate(new Date())
      dm._clockDisplay.text = dm._clock.clock + this._getLunarClockDisplay()
    }

    this._replacementFunc.clockId = dm._clock.connect('notify::clock', this._settingsChanged.refreshClock)
    this._settingsChanged.refreshClock()

    const lunarButton = (orig_button, iter_date, oargs) => {
      if (+oargs[0].label == +iter_date.getDate().toString()) {
        iter_date._lunar_iter_found = true
        self._ld.setDateNoon(iter_date)

        const yd = self._settings.get_boolean('show-calendar') ? self._ld.strftime("%(ri)") : ""
        const dx = self._settings.get_string('zti-dx')
        const jrn = self._settings.get_boolean('jrrilinei')
        const cal = jrn ? self._ld.get_calendar(3) : self._ld.strftimex(yd == "1" ? "%(YUE)月" : "%(RI)")
        const dxs = dx != "none" ? ` size='${dx}'` : ''

        let l = oargs[0].label
        if (yd != "")
          l += `\n${cal}`
        l = `<span${dxs}>${l}</span>`

        oargs[0].label = l
      }
      let new_button = _make_new_with_args(orig_button, oargs)
      new_button.child.use_markup = true

      return new_button
    }

    const updateYear = (that) => {
      self._ld.setDate(new Date())
      const cny_now = self._ld.strftime("%(shengxiao)")
      self._ld.setDateNoon(that._selectedDate)
      const cny = self._ld.strftime("%(shengxiao)")
      if (cny != cny_now)
        that._monthLabel.text = that._monthLabel.text + " / " + cny
    }

    this._injectionManager.overrideMethod(
      cal, '_rebuildCalendar', originalMethod => function () {
        if (rebuild_in_progress) {
          console.log("lunarcal: stopped nested calendar._rebuildCalendar")
          return
        }
        rebuild_in_progress = true

        const orig_button = St.Button
        const orig_date = Date
        let iter_date = new orig_date()

        Date = function () {
          let new_date = _make_new_with_args(orig_date, arguments)
          if (!iter_date._lunar_iter_found &&
              arguments.length > 0 && arguments[0] instanceof orig_date) {
            iter_date = new_date
          }
          return new_date
        }

        St.Button = function () {
          return lunarButton(orig_button, iter_date, arguments)
        }

        let tempInjectionManager = new InjectionManager()
        tempInjectionManager.overrideMethod(
          cal.layout_manager, 'attach', originalMethod => function (child, left, top, width, height) {
            originalMethod.apply(this, [child, left, top, width, height])
          }
        )

        const orig_source = this._eventSource
        if (!(orig_source instanceof LunarEventSource))
          this._eventSource = new LunarEventSource(self._settings, self._ld, orig_source)

        originalMethod.apply(this, arguments)

        this._eventSource = orig_source
        St.Button = orig_button
        Date = orig_date
        tempInjectionManager.clear()

        let cal_style_class = cal.style_class.split(' ')
            .filter(e => e.length && e != 'lunar-calendar' && !e.startsWith('lunar-calendar-'))
        if (self._settings.get_boolean('show-calendar')) {
          cal_style_class.push('lunar-calendar')
          const dx = self._settings.get_string('zti-dx')
          cal_style_class.push('lunar-calendar-' + dx)
        }
        cal.style_class = cal_style_class.join(' ')

        rebuild_in_progress = false
      })

    this._injectionManager.overrideMethod(
      cal, '_update', originalMethod => function () {
        if (update_in_progress) {
          console.log("lunarcal: stopped nested calendar._update")
          return
        }
        update_in_progress = true

        originalMethod.apply(this, arguments)
        updateYear(cal)
        if (ml._lunarCalendarSection && cal._selectedDate)
          ml._lunarCalendarSection.setDate(cal._selectedDate)

        update_in_progress = false
      })

    this._settingsChanged.rebuildCal = () => {
      cal._rebuildCalendar()
      if (ml._lunarCalendarSection && cal._selectedDate)
        cal._update()
    }

    ml._lunarCalendarSection = new LunarCalendarSection(this._settings, this._ld)
    const mlBox = ml._scrollView.get_parent()
    mlBox.insert_child_at_index(ml._lunarCalendarSection, 0)

    const updateDate = () => {
      self._ld.setDate(new Date())
      const cny_now = self._ld.strftime("%(shengxiao)")
      let date_label = dm._date._dateLabel
      date_label.text = date_label.text + (date_label.text.match(/[.,]/) ? ", " : "\u2001") + cny_now
    }

    this._replacementFunc.openMenuId = dm.menu.connect('open-state-changed', (menu, isOpen) => {
      if (isOpen)
        updateDate()
    })

    this._settingsChanged.rebuildCal()
    this._ld._notifyHoliday = this._settingsChanged.rebuildCal
  }

  disable() {
    const dm = Main.panel.statusArea.dateMenu

    let restore_style = dm._calendar.style_class.split(' ')
        .filter(e => e.length && e != 'lunar-calendar' && !e.startsWith('lunar-calendar-'))
        .join(' ')
    dm._calendar.style_class = restore_style

    this._injectionManager.clear()
    this._injectionManager = null

    dm._calendar._headerFormat = this._replacementFunc.originalMonthHeader
    delete this._replacementFunc.originalMonthHeader

    dm._messageList._lunarCalendarSection.destroy()
    delete dm._messageList._lunarCalendarSection

    dm._clock.disconnect(this._replacementFunc.clockId)
    delete this._replacementFunc.clockId
    dm._clock = new GnomeDesktop.WallClock()

    dm.menu.disconnect(this._replacementFunc.openMenuId)
    delete this._replacementFunc.openMenuId

    dm._clock.bind_property('clock', dm._clockDisplay, 'text', GObject.BindingFlags.SYNC_CREATE)
    this._ld._notifyHoliday = null
    this._settingsChanged.rebuildCal()

    this._settingsChanged = {}
    this._settings = null

    this._ld = null
  }
}
