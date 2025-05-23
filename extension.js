
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

const LunarCalendarMessage = GObject.registerClass({
  Signals: {
    'close': {},
  },
}, class LunarCalendarMessage extends St.Button {

  constructor (rlt, rl, bzt, bz, gzt, gz, jrt, jr) {
    super({
      style_class: 'message events-button',
      can_focus: true,
      x_expand: true,
      y_expand: false,
    })

    const contentBox = new St.BoxLayout({
      style_class: 'events-box',
      vertical: true,
      x_expand: true,
    })

    this._rltLabel = new St.Label({
      style_class: 'events-title',
      y_align: Clutter.ActorAlign.END,
      text: rlt,
    })
    contentBox.add_child(this._rltLabel)

    this._rlLabel = new St.Label({
      style_class: 'events-list',
      text: rl,
    })
    contentBox.add_child(this._rlLabel)

    this._bztLabel = new St.Label({
      style_class: 'events-title',
      style: 'padding-top:2ex',
      y_align: Clutter.ActorAlign.END,
      text: bzt,
    })
    contentBox.add_child(this._bztLabel)

    this._bzLabel = new St.Label({
      style_class: 'events-list',
      text: bz,
    })
    contentBox.add_child(this._bzLabel)

    this._gztLabel = new St.Label({
      style_class: 'events-title',
      style: 'padding-top:2ex',
      y_align: Clutter.ActorAlign.END,
      text: gzt,
    })
    contentBox.add_child(this._gztLabel)

    this._gzLabel = new St.Label({
      style_class: 'events-list',
      text: gz,
    })
    contentBox.add_child(this._gzLabel)

    this._jrtLabel = new St.Label({
      style_class: 'events-title',
      style: 'padding-top:2ex',
      y_align: Clutter.ActorAlign.END,
      text: jrt,
    })
    contentBox.add_child(this._jrtLabel)

    this._jrLabel = new St.Label({
      style_class: 'events-list',
      text: jr,
    })
    contentBox.add_child(this._jrLabel)

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
    this._bzLabel.hide()
    this._bztLabel.hide()
  }

  gzHide () {
    this.gzVisible = false
    this._gzLabel.hide()
    this._gztLabel.hide()
  }

  jrHide () {
    this.jrVisible = false
    this._jrLabel.hide()
    this._jrtLabel.hide()
  }

  bzShow () {
    this.bzVisible = true
    this._bzLabel.show()
    this._bztLabel.show()
  }

  gzShow () {
    this.gzVisible = true
    this._gzLabel.show()
    this._gztLabel.show()
  }

  jrShow () {
    this.jrVisible = true
    this._jrLabel.show()
    this._jrtLabel.show()
  }

  canClear () { return false }

  canClose () { return false }
})

const LunarCalendarSection = GObject.registerClass(
class LunarCalendarSection extends MessageList.MessageListSection {

  _init (settings, ld) {
    super._init('Lunar Calendar')

    this._settings = settings
    this._ld = ld

    this._message = new LunarCalendarMessage(
      this._tl("农历"), this._ld.strftimex("%(NIAN)年%(YUE)月%(RI)日"),
      this._tl("八字"), this._ld.strftime("%(Y8)年%(M8)月%(D8)日"),
      this._tl("干支"), this._ld.strftime("%(Y60)年%(M60)月%(D60)日"),
      this._tl("节日"), this._ld.get_jieri("\n"))
    this._currentLang = this._ld._lang

    this.addMessage(this._message, false)

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

  get allowed () { return true }

  _reloadEvents () {
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
    this._sync()
  }

  setDate (date) {
    this._ld.setDateNoon(date)
    let cny = this._ld.strftime("%(shengxiao)")
    this._reloadEvents()
  }

  _shouldShow () { return true }

  _sync () {
    if (this._reloading)
      return

    super._sync()
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
    ml._addSection(ml._lunarCalendarSection)
    ml._sectionList.set_child_at_index(ml._lunarCalendarSection, 1)
    ml._lunarCalendarSection._sync()
    ml._sync()

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
