/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated, Samu and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import definePlugin, {StartAt} from "@utils/types";
import {settings} from "./libs/settings";
import {Platforms} from "./types/Platforms";
import {IdentifyPacket} from "./types/IdentifyPacket";
import {pack, unpack} from "./libs/erlpack";

export default definePlugin({
    name: "StatusSpoof",
    description: "Spoofs your device platform.",
    authors: [
        {
            id: 973926908276400198n,
            name: "Aggelos",
        },
    ],
    startAt: StartAt.DOMContentLoaded /* Init, DOMContentLoaded*/,
    settings: settings,
    start() {
        const pluginName = this.name;

        const oldWebsocket = WebSocket;
        oldWebsocket.prototype.send = new Proxy(oldWebsocket.prototype.send, {
            apply(
                target: (
                    data: string | ArrayBufferLike | Blob | ArrayBufferView
                ) => void,
                thisArg: WebSocket,
                argArray: any[]
            ): any {
                if (thisArg.url.includes("wss://gateway.discord.gg")) {
                    let data!: IdentifyPacket
                    let isETF: boolean = false
                    if (thisArg.url.includes("?encoding=etf")) {
                        console.warn(`[${pluginName}]: Client is using ETF Encoding (External Term Format). Utilizing decoder/encoder`)
                        isETF = true
                        data = unpack(argArray[0])
                    } else if (thisArg.url.includes("?encoding=json")) {
                        console.warn(`[${pluginName}]: Client is using JSON Encoding (Javascript Object Notation). Utilizing parser`)
                        data = JSON.parse(argArray[0])
                    }
                    console.info(`[${pluginName}] [${thisArg.url}] Hooked send function`);

                    try {
                        if (data.op === 2) {
                            console.info(`[${pluginName}] Hooking IDENTIFY packet`);
                            if (settings.store.platform == Platforms.android) {
                                data.d.properties["os"] = "Android";
                                data.d.properties["browser"] = "Discord Android";
                                data.d.properties["device"] = "Samsung Galaxy";
                                data.d.properties["browser_user_agent"] =
                                    "Mozilla/5.0 (Linux; Android 12; SM-G998U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36";
                                data.d.properties["browser_version"] = "108.0";
                                data.d.properties["os_version"] = "12";
                            } else if (settings.store.platform == Platforms.console) {
                                data.d.properties["os"] = "Embedded";
                                data.d.properties["browser"] = "Discord Embedded";
                                data.d.properties["device"] = "Xbox";
                                data.d.properties["browser_user_agent"] =
                                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) PlayStation Chrome/48.0.2564.82 Safari/537.36 Edge/20.02";
                                data.d.properties["browser_version"] = "108.0";
                                data.d.properties["os_version"] = "";
                            }

                            if (isETF) {
                                argArray[0] = pack(data);
                            } else {
                                argArray[0] = JSON.stringify(data);
                            }

                        }
                    } catch (e) {
                        console.error(
                            `[HOOK] [${thisArg.url}] Could not parse JSON data. Probably `
                        );
                    }
                }
                return Reflect.apply(target, thisArg, argArray);
            },
        });
    },
    stop() {
    },
});
