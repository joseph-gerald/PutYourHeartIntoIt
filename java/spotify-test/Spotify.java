package no.dev;

import no.dev.utils.WebUtils;

import java.io.*;
import java.net.*;
import java.util.Arrays;
import java.util.Base64;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

public class Spotify {
    private String accessToken;
    private final String appScope = String.join(",", Arrays.asList(
            "user-modify-playback-state", // skip, play, and pause songs
            "user-read-currently-playing", // get queue and current track
            "playlist-read-private" // read users playlist
    ));
    private final App app = new App(
            "3b7da2d08baa4247a0a7a1e52220305f",
            "a054563ac4fa45dea7f7e657a9da142b",
            appScope,
            "http://localhost:8888"
    );;

    public Spotify() {
        requestAuthorization();
    }

    // https://developer.spotify.com/documentation/web-api/tutorials/code-flow
    public void requestAuthorization() {
        WebUtils.openInBrowser(app.generateURL());
        final Map<String, String> params = waitForCallback();
        final String code = params.get("code");
        final String accessToken = app.requestAccessToken(code);

        System.out.println(accessToken);
    }
    public Map<String, String> waitForCallback() {
        final int portNumber = 8888;

        try (
                ServerSocket serverSocket = new ServerSocket(portNumber);
                Socket clientSocket = serverSocket.accept();
                PrintWriter ignored = new PrintWriter(clientSocket.getOutputStream(), true);
                BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        ) {
            String requestLine = in.readLine();
            String[] requestParts = requestLine.split(" ");
            String url = requestParts[1];

            return WebUtils.getQueryParams(url);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public class App {
        private final String clientId;
        private final String clientSecret;
        private final String scope;
        private final String redirectUri;
        private final String state = Long.toHexString((long) (Math.random() * System.currentTimeMillis()));
        public App(String clientId, String clientSecret, String scope, String redirectUri) {
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.scope = scope;
            this.redirectUri = redirectUri;
        }

        public String generateURL() {
            final String authEndpoint = "https://accounts.spotify.com/authorize";
            return String.join("", Arrays.asList(
                    authEndpoint,
                    "?response_type=code",
                    "&client_id=" + app.clientId,
                    "&redirect_uri=" + WebUtils.encodeURIComponent(app.redirectUri),
                    "&scope=" + WebUtils.encodeURIComponent(app.scope),
                    "&state=" + state
            ));
        }

        public String requestAccessToken(String code) {
            try {
                URL url = new URL("https://accounts.spotify.com/api/token");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();

                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
                String credentials = this.clientId + ":" + this.clientSecret;
                String basicAuth = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());
                conn.setRequestProperty("Authorization", basicAuth);

                conn.setDoOutput(true);
                String urlParameters = "code=" + URLEncoder.encode(code, "UTF-8")
                        + "&redirect_uri=" + URLEncoder.encode(this.redirectUri, "UTF-8")
                        + "&grant_type=authorization_code";
                try (DataOutputStream wr = new DataOutputStream(conn.getOutputStream())) {
                    wr.writeBytes(urlParameters);
                    wr.flush();
                }

                try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    String line;
                    StringBuilder content = new StringBuilder();
                    while ((line = in.readLine()) != null) {
                        content.append(line);
                    }
                    conn.disconnect();

                    ObjectMapper objectMapper = new ObjectMapper();

                    return content.toString();
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }
}
