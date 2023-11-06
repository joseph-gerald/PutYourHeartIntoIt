const authEndpoint = "https://accounts.spotify.com/authorize"

class SpotifyActions {
    constructor(app) {
        this.app = app;
    }

    async fetchUser() {
        // https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
        const res = await this.app.sendGET("me");

        console.log(res)
    }
}

class SpotifyApp {



    constructor(clientId, clientSecret, scope, redirectUri) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scope = scope;
        this.redirectUri = redirectUri;
        this.state = btoa((Date.now() * Math.random()).toString(26)).replaceAll("=", "");
        this.url = this.getURL();

        this.accessToken = "";
        this.refreshToken = ""; // uh todo: make it refresh access token with this from storage

        this.actions = new SpotifyActions(this);
    }

    getURL() {
        return authEndpoint.concat(
            "?response_type=code",
            "&client_id=" + this.clientId,
            "&redirect_uri=" + encodeURI(this.redirectUri),
            "&scope=" + encodeURI(this.scope),
            "&state=" + this.state
        )
    }

    async sendGET(path) {
        const base = "https://api.spotify.com/v1/";
        const url = base + path;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${app.accessToken}`
            }
        });

        const json = await res.json();

        return {
            response: res,
            code: res.status,
            json: json
        };
    }
}

const appScope = [
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private"
].join(",")
const app = new SpotifyApp(
    "3b7da2d08baa4247a0a7a1e52220305f",
    "a054563ac4fa45dea7f7e657a9da142b",
    appScope,
    `https://${this.location.hostname}/callback` // 
);
const age = 15;
const max_hr = 220 - age;

const link = async () => {
    const code = await fetch_code();
    const tokens = await fetch_access_token(code);
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in; // 3600 but could change so yes

    console.log(code)
    console.log(accessToken)

    app.accessToken = accessToken;
    app.refreshToken = refreshToken;
}

const fetch_code = async () => {
    const win = window.open(app.url);

    const res = await fetch("/fetch_code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            state: app.state
        }),
    });

    const json = await res.json();
    const code = json.code;

    win.close();

    return code;
}

const fetch_access_token = async (code) => {
    var details = {
        code: code,
        redirect_uri: app.redirectUri,
        grant_type: "authorization_code"
    };

    var formBody = [];

    for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }

    formBody = formBody.join("&");

    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Authorization": `Basic ${btoa(app.clientId + ":" + app.clientSecret)}`
        },
        body: formBody,
    });

    const json = await res.json();

    return json;
}

const zone_thresholds = {
    1: max_hr * 0.65,
    2: max_hr * 0.75,
    3: max_hr * 0.85,
    4: max_hr * 0.88,
    5: max_hr * 0.9
}

const zone_descriptors = {
    1: "recovery/easy",
    2: "aerobic/base",
    3: "tempo",
    4: "lactate threshold",
    5: "anaerobic"
}

const get_zone = (hr) => {
    const zones = Object.keys(zone_thresholds);
    let highest_zone = 1;
    for (zone of zones) {
        if (hr > zone_thresholds[zone]) {
            highest_zone = zone
        }
    }

    return highest_zone
}

const update_info = () => {
    const zone = get_zone(heart_rate);
    const bpm_range = get_bpm_range(heart_rate);
    counter.innerText = `${heart_rate}♡`
    current_zone.innerText = `Zone: ${zone} - ${zone_descriptors[zone]}`
    music_bpm.innerText = `music bpm range: ${bpm_range.low}-${bpm_range.high}`
}

const get_bpm_range = (n) => {
    const low = n - n % 20;
    return { low: low, high: low + 20 };
}

