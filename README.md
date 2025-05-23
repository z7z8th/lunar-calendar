# Lunar Calendar 农历 (gnome shell extension)

## changelog

* Support change locale in extension settings, Mix of English and Chinese in calendar show

## install

```sh
sudo apt install gir1.2-lunardate-3.0
sudo apt install liblunar-date-3.0-1

# gen locales for zh_*.UTF-8
sudo sed -i -E '/# zh_.*\.UTF-8/s/^# //g' /etc/locale.gen
sudo locale-gen

cd lunar-calendar
make && make install

```

## Screenshot

![lunar lang](./img/lunar-lang.png)

Compat with GNOME 46, source code originally from gnome-shell-extension uuid [lunarcal@ailin.nemui](https://extensions.gnome.org/extension/675/lunar-calendar/)

## Maintain

Everytime Gnome major version updates, extensions break, and extension authors are too busy to fix them.
I'm trying to maintain some gnome extensions myself.


## Install method

`make -j1 pack install`