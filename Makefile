NAME = "Lunar Calendar 农历"
UUID = "lunar-calendar@z7z8th"
ZIP = $(UUID).shell-extension.zip

default pack: msgfmt
	@rm -rfv $(ZIP)
	find . -type f -regextype egrep -iregex ".*\.(js|json|mo|typelib|xml|css|ui)|.*/holiday.dat" -not \( -path "./.vscode*" -o -path "./test*" \) | zip $(ZIP) -@
	ls *.zip
	[ -d /opt/VM/share ] && rsync -rltvp *.zip /opt/VM/share/

copy: msgfmt
	glib-compile-schemas schemas/
	rsync -rltvp --checksum --delete --exclude='.git' --exclude='.vscode' --exclude='test' --exclude='*.zip' --exclude='*.gir' . ~/.local/share/gnome-shell/extensions/$(UUID)

install:
	gnome-extensions install --force $(ZIP)
	ls -la ~/.local/share/gnome-shell/extensions/$(UUID)

uninstall:
	gnome-extensions uninstall $(UUID) || \
	rm -rfv ~/.local/share/gnome-shell/extensions/$(UUID)

#	export SHELL_DEBUG=all; \
#	export G_MESSAGES_DEBUG=all; \
#	export MUTTER_DEBUG_DUMMY_MODE_SPECS=1366x768; \

run:
	set -e; \
	\
	dbus-run-session -- gnome-shell --nested --wayland

msgunfmt:
	@set -e; \
	for f in $$(find . -name "*.mo"); do \
		echo $@ $$f; \
		msgunfmt $$f > $${f%.mo}.po; \
	done

msgfmt:
	@set -e; \
	for f in $$(find . -name "*.po"); do \
		echo $@ $$f; \
		msgfmt $$f > $${f%.po}.mo; \
	done

.ONESHELL:
gjs:
	set -e; \
	oldir=$$HOME/.local/share/gnome-shell/gnome-shell-overlay; \
	mkdir -p $$oldir; \
	for lib in /usr/lib/x86_64-linux-gnu/libgjs.so.0 /usr/lib/gnome-shell/libshell-*.so; do \
		for f in $$(gresource list $$lib); do \
			mkdir -p $$(dirname $$oldir/$${f#/org/gnome/}); \
			gresource extract $$lib $$f > $$oldir/$${f#/org/gnome/}; \
		done \
	done; \
	grep -E -o -q "^[^#]+G_RESOURCE_OVERLAYS" $$HOME/.profile || \
	cat <<EOF >>$$HOME/.profile
	export G_RESOURCE_OVERLAYS="/org/gnome=$$HOME/.local/share/gnome-shell/gnome-shell-overlay"

GIR_NS_VERSION=1

# girs:
# 	g-ir-scanner -L /usr/lib/x86_64-linux-gnu/ -lc -n libc --nsversion=$(GIR_NS_VERSION) \
# 		--accept-unprefixed --warn-all \
# 		-I /usr/include -I /usr/include/x86_64-linux-gnu \
# 		-o libc.gir --include=GObject-2.0 \
# 		/usr/include/locale.h /usr/include/x86_64-linux-gnu/bits/types/__locale_t.h /usr/include/x86_64-linux-gnu/bits/types/locale_t.h

girs:
	g-ir-scanner -L /usr/lib/x86_64-linux-gnu/ -lc -n libc --nsversion=$(GIR_NS_VERSION) \
		--accept-unprefixed --warn-all \
		\
		-o libc-1.gir \
		locale.h

girc:
	g-ir-compiler --verbose --output libc-$(GIR_NS_VERSION).typelib libc-gint64.gir --includedir=/usr/include
	sudo cp -v libc-$(GIR_NS_VERSION).typelib /usr/lib/x86_64-linux-gnu/girepository-1.0/

# /usr/include/x86_64-linux-gnu/bits/types/__locale_t.h /usr/include/x86_64-linux-gnu/bits/types/locale_t.h

ltest:
	gcc -O2 -Wall -g -o locale-test locale-test.c
	./locale-test

clean:
	rm -rfv *.zip