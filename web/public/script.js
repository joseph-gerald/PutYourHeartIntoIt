const authEndpoint = "https://accounts.spotify.com/authorize"
let loading = true;
let playlistToPlay = "none";

class SpotifyActions {
    constructor(app) {
        this.app = app;
    }

    async fetchUser() {
        // https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
        return (await this.app.proxy("me", "GET", null)).json;
    }

    async fetchPlaylists() {
        // https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
        return (await this.app.send("me/playlists")).json;
    }

    async playback(uri) {
        // https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
        const res = (await this.app.send("me/player/play", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${app.accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                context_uri: uri
            })
        }));

        if (res.code != 200) {
            alert(res.json.error.message);
        }

        return res.json;
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

        this.user = null;
        this.playlists = null;
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

    async proxy(path, method, proxied_body, body = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    }) {
        const url = "spotify/proxy/";

        body.body ??= {};

        body.body.body = proxied_body;
        body.body.method = method;
        body.body.path = path;
        body.body.token = app.accessToken;

        body.body = JSON.stringify(body.body);

        const res = await fetch(url, body);

        const json = await res.json();

        return {
            response: res,
            code: res.status,
            status: res.statusText,
            json: json
        };
    }

    async send(path, body = {
        method: "GET",
        headers: {
            "mode": "cors", // no-cors, *cors, same-origin
            "Authorization": `Bearer ${app.accessToken}`
        }
    }) {
        const base = "https://api.spotify.com/v1/";
        const url = base + path;

        const res = await fetch(url, body);

        const json = await res.json();

        return {
            response: res,
            code: res.status,
            status: res.statusText,
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
    const expiresIn = tokens.expires_in; // 3600 seconds but could change so yes
    const expirationDate = Date.now() + expiresIn * 1000; // current unix time + token duration

    localStorage.setItem("expirationDate", expirationDate);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    link_from_cache(); // stored in cache ok
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
    current_playlist.innerText = `Current Playlist: ${playlistToPlay.name ?? "..."}`

    app.actions.playback(playlistToPlay.uri);
}

const get_bpm_range = (n) => {
    if (!app.playlists) {
        const low = n - n % 20;
        return { low: low, high: low + 20 };
    }

    for (playlist of app.playlists) {
        const split = playlist.description.split("-");
        if (split.length != 2) continue;
        const low = parseInt(split[0]);
        const high = parseInt(split[1]);

        playlistToPlay = playlist;
        if (n >= low && n <= high) return { low: low, high: high }
    }
}

async function link_from_cache() {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expirationDate = localStorage.getItem("expirationDate");

    if (!accessToken || !refreshToken || !expirationDate) {
        setTimeout(() => {
            link_status.innerText = "Click to Link";
            loading = false;
        }, 500);
        return;
    }

    app.accessToken = accessToken;
    app.refreshToken = refreshToken;

    if (Date.now() > expirationDate) {
        loading = false;
        return link(); // if linked before then why not link again
    }

    app.user = await app.actions.fetchUser();
    app.playlists = (await app.actions.fetchPlaylists()).items;

    loading = false;
    link_status.innerText = "Logged in as " + app.user.display_name;
    update_info();
}

link_from_cache();