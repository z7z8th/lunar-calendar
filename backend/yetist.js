
import Gettext      from 'gettext'

import GObject      from 'gi://GObject'
import LunarDate    from 'gi://LunarDate'

const _ld = Gettext.domain('lunar-date').gettext

const diZhi = "Zǐ, Chǒu, Yín, Mǎo, Chén, Sì, Wǔ, Wèi, Shēn, Yǒu, Xū, Hài"
      .split(", ")
const holidayFormat = LunarDate.DATE_MAJOR_VERSION >= 3 ||
      LunarDate.DATE_MAJOR_VERSION == 2 && LunarDate.DATE_MINOR_VERSION >= 9 ?
      "%(holiday)" : "%(jieri)"
const run = _ld("Rùn")

const LunarDateX = GObject.registerClass(
class LunarDateX extends LunarDate.Date {

  constructor () {
    super()
    this._lang = LunarDateX.lang
  }

  setDate (date) {
    this.set_solar_date(date.getFullYear(), 1 + date.getMonth(), date.getDate(), date.getHours())
  }

  setDateNoon (date) {
    this.set_solar_date(date.getFullYear(), 1 + date.getMonth(), date.getDate(), 12)
  }

  getShi () {
    return _ld(diZhi[~~((+this.strftime("%(hour)") + 1) / 2) % 12])
  }

  strftimex (str) {
    return this.strftime(str).replace("月月", "月")
  }

  getHoliday () {
    return this.strftime(holidayFormat)
  }

  setLang (lang) {
    this._lang = LunarDateX.lang = lang
  }

  setHoliday (holidayRegion) {
    Gettext.setlocale(Gettext.LocaleCategory.ALL, holidayRegion+".UTF-8");
  }
}
)
// LunarDateX.lang = run == "閏" ? 1 : run == "闰" ? 2 : 0
LunarDateX.backend = 'yetist'

console.log('importing backend', LunarDateX.backend, 'lang', LunarDateX.lang)

export default LunarDateX
