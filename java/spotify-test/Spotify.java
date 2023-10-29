package no.dev;

import no.dev.utils.WebUtils;

import java.util.Arrays;
import java.util.stream.Collectors;

public class Spotify {
    private String accessToken;
    private final String appScope = String.join(" ", Arrays.asList(
            "user-modify-playback-state", // skip, play, and pause songs
            "user-read-currently-playing", // get queue and current track
            "playlist-read-private" // read users playlist
    ));
    private final App app = new App(
            "3b7da2d08baa4247a0a7a1e52220305f",
            appScope,
            "localhost:8888"
    );;

    public Spotify() {
        WebUtils.openInBrowser(generateURL());
    }

    // https://developer.spotify.com/documentation/web-api/tutorials/code-flow
    public void requestAuthorization() {

    }

    public String generateURL() {
        final String authEndpoint = "https://accounts.spotify.com/authorize";
        return String.join("", Arrays.asList(
                authEndpoint,
                "?show_dialog=true",
                "&show_dialog=true",
                "&response_type=code",
                "&client_id=" + app.clientId,
                "&redirect_uri=" + app.redirectUri,
                "&scope=" + app.scope
        ));
    }

    public class App {
        private String clientId;
        private String scope;
        private String redirectUri;
        public App(String clientId, String scope, String redirectUri) {
            this.clientId = clientId;
            this.scope = scope;
            this.redirectUri = redirectUri;
        }


    }
}
