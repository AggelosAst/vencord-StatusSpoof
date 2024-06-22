export type IdentifyPacket = {
    op: number,
    d: {
        properties: {
            os: string,
            browser: string,
            device: string,
            browser_user_agent: string,
            browser_version: string,
            os_version: string
        }
    }
}
