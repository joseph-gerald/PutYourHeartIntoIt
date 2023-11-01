package no.dev;

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
