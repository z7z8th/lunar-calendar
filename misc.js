/* exported clearTimeout clearInterval setTimeout setInterval */

/**
 * Copyright 2020 Dafne Kiyui
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import GLib from 'gi://GLib';

var clearTimeout, clearInterval;
clearTimeout = clearInterval = GLib.Source.remove;

export function setTimeout(func, delay, ...args) {
    const wrappedFunc = () => {
        func.apply(this, args);
    };
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, wrappedFunc);
}

export function setInterval(func, delay, ...args) {
    const wrappedFunc = () => {
        return func.apply(this, args) || true;
    };
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, wrappedFunc);
}

export function getThisExtensionPath() {
    let this_ext_path = GLib.canonicalize_filename(
        GLib.build_pathv('/', [GLib.filename_from_uri(import.meta.url)[0], '..']),
        null
    );
    console.log('getThisExtensionPath', this_ext_path);
    return this_ext_path;
}
