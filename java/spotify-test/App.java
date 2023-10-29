package no.dev;

import no.dev.utils.WebUtils;

/**
 * Hello world!
 *
 */
public class App 
{
    private static App instance;
    private Spotify spotify;
    public static App getInstance() {
        return instance;
    }
    public App() {
        spotify = new Spotify();
    }

    public static void init()
    {
        instance = new App();
    }
}
