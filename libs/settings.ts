import {definePluginSettings} from "@api/Settings";
import {OptionType} from "@utils/types";
import {Platforms} from "../types/Platforms";

const settings = definePluginSettings({
    platform: {
        type: OptionType.SELECT,
        description: "Platform to spoof to",
        options: [
            {label: "Console (Embedded Platform)", value: Platforms.console},
            {label: "Android (Discord Android)", value: Platforms.android, default: true},
        ],
    }
})

export {settings}
