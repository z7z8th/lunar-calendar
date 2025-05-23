let LunarDate
try {
  ;({default: LunarDate} = await import('./backend/ytliu0.js'))
} catch (e0) {
  try {
    ;({default: LunarDate} = await import('./backend/yetist.js'))
  } catch {
    throw new Error(`
=======================================================================
Missing dependency: ChineseCalendar by ytliu0:
https://gitlab.gnome.org/Nei/ChineseCalendar/-/archive/20250205/ChineseCalendar-20250205.tar.gz

Please check your installation!
=======================================================================`)
  }
}
export default LunarDate
